import { Router, Express } from 'express';
import { sendInvoice } from '../invoice-handler';

/**
 * Register invoice routes with the Express app
 */
export function registerInvoiceRoutes(app: Express): void {
  const router = Router();

  /**
   * Route to request an invoice for an order
   * POST /api/invoices/request
   */
  router.post('/request', async (req, res) => {
    try {
      const { orderId, sendEmail = true } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order ID is required' 
        });
      }
      
      // Generate and potentially email the invoice
      const result = await sendInvoice(parseInt(orderId), sendEmail);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate invoice',
          error: result.error
        });
      }
      
      return res.status(200).json({
        success: true,
        message: result.emailSent 
          ? 'Invoice generated and emailed successfully'
          : 'Invoice generated successfully',
        filePath: result.filePath,
        emailSent: result.emailSent
      });
      
    } catch (error: any) {
      console.error('Invoice request error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing the invoice request',
        error: error.message
      });
    }
  });

  /**
   * Route to download an invoice
   * GET /api/invoices/download/:orderId
   */
  router.get('/download/:orderId', async (req, res) => {
    try {
      const orderId = req.params.orderId;
      
      if (!orderId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order ID is required' 
        });
      }
      
      // Generate invoice if it doesn't exist
      const result = await sendInvoice(parseInt(orderId), false);
      
      if (!result.success || !result.filePath) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate invoice',
          error: result.error
        });
      }
      
      // Send the file for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${orderId}-AirGourmetHellas.pdf`);
      
      // Stream the file to the client
      res.download(result.filePath);
      
    } catch (error: any) {
      console.error('Invoice download error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while downloading the invoice',
        error: error.message
      });
    }
  });

  // Register the routes
  app.use('/api/invoices', router);
}