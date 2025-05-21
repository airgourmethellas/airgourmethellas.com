import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
import { logger } from '../utils/logger';

/**
 * Service for interacting with Slack
 */
export class SlackService {
  private static instance: SlackService;
  private client: WebClient | null = null;
  private defaultChannel: string = '';
  private isEnabled: boolean = false;

  private constructor() {
    // Check for required environment variables
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      logger.warn('Slack integration is disabled: Missing required environment variables');
      this.isEnabled = false;
      return;
    }

    try {
      this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
      this.defaultChannel = process.env.SLACK_CHANNEL_ID;
      this.isEnabled = true;
      logger.info('Slack service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Slack service', { error });
      this.isEnabled = false;
    }
  }

  /**
   * Get singleton instance of SlackService
   */
  public static getInstance(): SlackService {
    if (!SlackService.instance) {
      SlackService.instance = new SlackService();
    }
    return SlackService.instance;
  }

  /**
   * Check if Slack integration is enabled
   * @returns Boolean indicating if Slack is enabled
   */
  public isSlackEnabled(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Send a message to a Slack channel
   * @param message The message to send
   * @param channel Optional channel ID (defaults to SLACK_CHANNEL_ID)
   * @returns Promise resolving to the message timestamp or undefined if Slack is disabled
   */
  public async sendMessage(
    message: string,
    channel?: string
  ): Promise<string | undefined> {
    // Check if Slack is enabled
    if (!this.isSlackEnabled() || !this.client) {
      logger.warn('Attempted to send message but Slack integration is disabled');
      return undefined;
    }

    try {
      const result = await this.client.chat.postMessage({
        channel: channel || this.defaultChannel,
        text: message,
      });
      
      logger.info('Message sent to Slack', { channel: channel || this.defaultChannel });
      return result.ts;
    } catch (error) {
      logger.error('Error sending message to Slack', { error });
      // Don't throw the error, just return undefined
      return undefined;
    }
  }

  /**
   * Send a structured message to Slack
   * @param messageArgs Message arguments
   * @returns Promise resolving to the message timestamp
   */
  public async sendStructuredMessage(
    messageArgs: ChatPostMessageArguments
  ): Promise<string | undefined> {
    // Check if Slack is enabled
    if (!this.isSlackEnabled() || !this.client) {
      logger.warn('Attempted to send structured message but Slack integration is disabled');
      return undefined;
    }

    try {
      // Ensure channel is set
      if (!messageArgs.channel) {
        messageArgs.channel = this.defaultChannel;
      }

      const result = await this.client.chat.postMessage(messageArgs);
      logger.info('Structured message sent to Slack', { channel: messageArgs.channel });
      return result.ts;
    } catch (error) {
      logger.error('Error sending structured message to Slack', { error });
      return undefined;
    }
  }

  /**
   * Open a new direct message with a user and send an initial message
   * @param userEmail The email of the user to message
   * @param message The initial message to send
   * @returns Promise resolving to the conversation ID
   */
  public async openConversationWithUser(
    userEmail: string,
    message: string
  ): Promise<string | undefined> {
    // Check if Slack is enabled
    if (!this.isSlackEnabled() || !this.client) {
      logger.warn('Attempted to open conversation but Slack integration is disabled');
      return undefined;
    }

    try {
      // Find user by email
      const userResponse = await this.client.users.lookupByEmail({
        email: userEmail,
      });

      if (!userResponse.user || !userResponse.user.id) {
        logger.warn('User not found in Slack', { email: userEmail });
        return undefined;
      }

      // Open a direct message channel
      const conversationResponse = await this.client.conversations.open({
        users: userResponse.user.id,
      });

      if (!conversationResponse.channel || !conversationResponse.channel.id) {
        logger.warn('Failed to open conversation with user', { userId: userResponse.user.id });
        return undefined;
      }

      // Send initial message
      await this.client.chat.postMessage({
        channel: conversationResponse.channel.id,
        text: message,
      });

      logger.info('Opened conversation with user', { 
        email: userEmail, 
        channelId: conversationResponse.channel.id 
      });
      
      return conversationResponse.channel.id;
    } catch (error) {
      logger.error('Error opening conversation with user', { error, userEmail });
      return undefined;
    }
  }

  /**
   * Create a support request in the default channel
   * @param username User's name
   * @param userEmail User's email
   * @param message User's initial message
   * @param orderNumber Optional related order number
   * @param orderId Optional related order ID
   * @returns Promise resolving to the message timestamp
   */
  public async createSupportRequest(
    username: string,
    userEmail: string,
    message: string,
    orderNumber?: string,
    orderId?: number
  ): Promise<string | undefined> {
    // Check if Slack is enabled
    if (!this.isSlackEnabled() || !this.client) {
      logger.warn('Attempted to create support request but Slack integration is disabled');
      return undefined;
    }

    try {
      // Define blocks with proper typing for Slack API
      const blocks: any[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆘 New Support Request',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n${username}`,
              emoji: true
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${userEmail}`,
              emoji: true
            }
          ]
        }
      ];

      // Add order details if provided
      if (orderNumber || orderId) {
        const fields = [];
        
        if (orderNumber) {
          fields.push({
            type: 'mrkdwn',
            text: `*Order Number:*\n${orderNumber}`,
            emoji: true
          });
        }
        
        if (orderId) {
          fields.push({
            type: 'mrkdwn',
            text: `*Order ID:*\n${orderId}`,
            emoji: true
          });
        }
        
        blocks.push({
          type: 'section',
          fields: fields
        });
      }

      // Add message content
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:*\n${message}`,
            emoji: true
          }
        },
        {
          type: 'divider'
        } as any,
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `👉 Reply in thread to respond to this support request.`,
              emoji: true
            }
          ]
        }
      );

      // Need to use 'as any' because Slack's TypeScript definitions 
      // don't properly accommodate all the block types we're using
      const result = await this.client.chat.postMessage({
        channel: this.defaultChannel,
        text: `New support request from ${username}: ${message}`,
        blocks: blocks as any, // Cast to any to bypass TypeScript's incomplete Slack block type definitions
      });

      logger.info('Support request created', { username, orderNumber, orderId });
      return result.ts;
    } catch (error) {
      logger.error('Error creating support request', { error, username });
      return undefined;
    }
  }

  /**
   * Test the Slack connection
   * @returns Promise resolving to true if successful
   */
  public async testConnection(): Promise<boolean> {
    // Check if Slack is enabled
    if (!this.isSlackEnabled() || !this.client) {
      logger.warn('Attempted to test connection but Slack integration is disabled');
      return false;
    }

    try {
      const result = await this.client.auth.test();
      logger.info('Slack connection test successful', { 
        team: result.team,
        user: result.user
      });
      return true;
    } catch (error) {
      logger.error('Slack connection test failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const slackService = SlackService.getInstance();