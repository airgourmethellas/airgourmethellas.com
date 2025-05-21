import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { slackService } from '../services/slack-service';
import { logger } from '../utils/logger';

const router = express.Router();

// Middleware to check if user is authenticated
const checkAuthentication = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

/**
 * Register chat routes
 */
export function registerChatRoutes() {
  // Check if Slack integration is available
  router.get('/chat/status', async (_req: Request, res: Response) => {
    try {
      const isEnabled = slackService.isSlackEnabled();
      
      res.json({
        available: isEnabled,
        message: isEnabled 
          ? 'Slack integration is available' 
          : 'Slack integration is currently unavailable. Your message will still be recorded, but expect a delay in response.',
      });
    } catch (error: any) {
      logger.error('Error checking Slack status', { error });
      res.status(500).json({
        available: false,
        message: 'Unable to determine Slack availability',
      });
    }
  });
  // Create a new support request
  router.post('/chat/support', checkAuthentication, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        message: z.string().min(1, 'Message is required'),
        orderNumber: z.string().optional(),
        orderId: z.number().optional(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request body', 
          errors: result.error.format() 
        });
      }

      const { message, orderNumber, orderId } = result.data;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check if Slack is enabled
      const isSlackEnabled = slackService.isSlackEnabled();
      
      // Create support request in Slack if enabled
      const timestamp = await slackService.createSupportRequest(
        user.username,
        user.email,
        message,
        orderNumber,
        orderId
      );

      // We'll still log the request even if Slack is disabled
      logger.info('Support request received', { 
        username: user.username, 
        email: user.email,
        message,
        orderNumber,
        orderId,
        slackEnabled: isSlackEnabled,
        slackTimestamp: timestamp
      });

      // Return success response
      res.status(200).json({ 
        success: true, 
        message: isSlackEnabled ? 'Support request sent to operations team' : 'Support request recorded',
        supportId: timestamp,
        slackEnabled: isSlackEnabled,
      });

    } catch (error: any) {
      logger.error('Error creating support request', { error });
      res.status(500).json({ 
        message: 'Failed to send support request',
        error: error.message || 'Unknown error'
      });
    }
  });

  // Test Slack message from public endpoint (for development only)
  router.post('/chat/test-message', async (req: Request, res: Response) => {
    try {
      // In development, allow testing without authentication
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Endpoint not available in production' });
      }
      
      // Validate request body
      const schema = z.object({
        message: z.string().min(1, 'Message is required'),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request body', 
          errors: result.error.format() 
        });
      }
      
      const { message } = result.data;
      
      // Send test message to Slack
      const timestamp = await slackService.sendMessage(
        `🧪 TEST MESSAGE: ${message}`,
      );
      
      // Return success response
      res.status(200).json({ 
        success: true, 
        message: 'Test message sent',
        messageId: timestamp,
      });
      
    } catch (error: any) {
      logger.error('Error sending test message', { error });
      res.status(500).json({ 
        message: 'Failed to send test message', 
        error: error.message || 'Unknown error'
      });
    }
  });
  
  // Test Slack connection (admin only)
  router.get('/chat/test', checkAuthentication, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      // Test the Slack connection
      const success = await slackService.testConnection();
      
      // Return detailed information about the Slack configuration
      res.json({
        success,
        message: success ? 'Slack connection successful' : 'Slack connection failed',
        config: {
          botTokenConfigured: !!process.env.SLACK_BOT_TOKEN,
          channelIdConfigured: !!process.env.SLACK_CHANNEL_ID,
          channel: process.env.SLACK_CHANNEL_ID ? 
            `${process.env.SLACK_CHANNEL_ID.substring(0, 3)}...` : 'Not set'
        }
      });
    } catch (error: any) {
      logger.error('Error testing Slack connection', { error });
      res.status(500).json({ 
        message: 'Failed to test connection', 
        error: error.message || 'Unknown error'
      });
    }
  });
}

// Register all routes
registerChatRoutes();

// Export the router
export default router;