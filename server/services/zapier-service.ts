import fetch from 'node-fetch';
import { db } from '../db';
import { integrationSettings, type InsertIntegrationSetting } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

export type ZapierWebhookConfig = {
  webhookUrl: string;
  events: string[];
};

export class ZapierService {
  private static instance: ZapierService;

  /**
   * Get singleton instance of ZapierService
   */
  public static getInstance(): ZapierService {
    if (!ZapierService.instance) {
      ZapierService.instance = new ZapierService();
    }
    return ZapierService.instance;
  }

  /**
   * Get Zapier webhook configuration
   */
  public async getWebhookConfig(): Promise<ZapierWebhookConfig> {
    try {
      const settings = await db
        .select()
        .from(integrationSettings)
        .where(eq(integrationSettings.service, 'zapier'));

      const webhookUrlSetting = settings.find(s => s.key === 'webhookUrl');
      const eventsSetting = settings.find(s => s.key === 'events');

      return {
        webhookUrl: webhookUrlSetting?.value || '',
        events: eventsSetting?.value ? JSON.parse(eventsSetting.value) : [],
      };
    } catch (error) {
      logger.error('Error fetching Zapier config', { error });
      return { webhookUrl: '', events: [] };
    }
  }

  /**
   * Save Zapier webhook configuration
   */
  public async saveWebhookConfig(config: ZapierWebhookConfig): Promise<ZapierWebhookConfig> {
    try {
      // Save webhook URL
      await this.upsertSetting({
        service: 'zapier',
        key: 'webhookUrl',
        value: config.webhookUrl,
      });

      // Save events as JSON
      await this.upsertSetting({
        service: 'zapier', 
        key: 'events',
        value: JSON.stringify(config.events),
      });

      logger.info('Zapier webhook configuration saved', { config });
      return config;
    } catch (error) {
      logger.error('Error saving Zapier config', { error, config });
      throw error;
    }
  }

  /**
   * Test webhook connection by sending a test payload
   */
  public async testWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: {
            message: 'This is a test webhook from Air Gourmet Hellas',
          },
        }),
      });

      if (!response.ok) {
        logger.error('Error testing webhook', { 
          status: response.status, 
          statusText: response.statusText,
        });
        return false;
      }

      logger.info('Webhook test successful', { webhookUrl });
      return true;
    } catch (error) {
      logger.error('Exception testing webhook', { error, webhookUrl });
      return false;
    }
  }

  /**
   * Send order data to Zapier
   */
  public async notifyOrderEvent(event: string, orderId: number, orderData: any): Promise<boolean> {
    try {
      const config = await this.getWebhookConfig();
      
      // Check if this event should be sent
      if (!config.webhookUrl || !config.events.includes(event)) {
        return false;
      }

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        orderId,
        data: orderData,
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error('Error sending webhook notification', {
          event,
          orderId,
          status: response.status,
          statusText: response.statusText,
        });
        return false;
      }

      logger.info('Webhook notification sent', { event, orderId });
      return true;
    } catch (error) {
      logger.error('Exception sending webhook notification', { error, event, orderId });
      return false;
    }
  }

  /**
   * Upsert a setting (create or update)
   */
  private async upsertSetting(setting: InsertIntegrationSetting): Promise<void> {
    const existingSettings = await db
      .select()
      .from(integrationSettings)
      .where(
        and(
          eq(integrationSettings.service, setting.service),
          eq(integrationSettings.key, setting.key)
        )
      );

    if (existingSettings.length === 0) {
      // Create new setting
      await db.insert(integrationSettings).values(setting);
    } else {
      // Update existing setting
      await db
        .update(integrationSettings)
        .set({ value: setting.value })
        .where(
          and(
            eq(integrationSettings.service, setting.service),
            eq(integrationSettings.key, setting.key)
          )
        );
    }
  }
}