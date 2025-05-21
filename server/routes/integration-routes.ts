import { Router } from 'express';
import { z } from 'zod';
import { ZapierService } from '../services/zapier-service';
import { logger } from '../utils/logger';

const router = Router();

// Function to register routes
function registerIntegrationRoutes() {
  // Middleware for checking authentication
  const checkAuthentication = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

  const zapierService = ZapierService.getInstance();

  /**
   * Get Zapier configuration
   */
  router.get('/zapier', checkAuthentication, async (req, res) => {
    try {
      const config = await zapierService.getWebhookConfig();
      res.status(200).json(config);
    } catch (error) {
      logger.error('Error getting Zapier config', { error });
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Save Zapier configuration
   */
  router.post('/zapier', checkAuthentication, async (req, res) => {
    try {
      // Validate request body
      const schema = z.object({
        webhookUrl: z.string().url(),
        events: z.array(z.string()),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.format() });
      }

      const config = await zapierService.saveWebhookConfig(req.body);
      res.status(200).json(config);
    } catch (error) {
      logger.error('Error saving Zapier config', { error });
      res.status(500).json({ message: 'Failed to save configuration' });
    }
  });

  /**
   * Test webhook connection
   */
  router.post('/zapier/test', checkAuthentication, async (req, res) => {
    try {
      // Validate request body
      const schema = z.object({
        webhookUrl: z.string().url(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid webhook URL', errors: result.error.format() });
      }

      const success = await zapierService.testWebhook(req.body.webhookUrl);
      if (success) {
        res.status(200).json({ message: 'Test successful' });
      } else {
        res.status(500).json({ message: 'Test failed' });
      }
    } catch (error) {
      logger.error('Error testing webhook', { error });
      res.status(500).json({ message: 'Failed to test webhook' });
    }
  });
}

// Register all routes
registerIntegrationRoutes();

// Export the router as default
export default router;