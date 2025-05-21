import { Request, Response } from "express";
import { storage } from "../storage";

export async function setupProcessPaymentRoute(app: any) {
  app.post('/api/orders/:orderId/process-payment', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { amount, payment } = req.body;
      
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      // Get the order to verify it exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Update the order status to "confirmed"
      await storage.updateOrderStatus(orderId, "confirmed");
      
      // Record payment information by updating the order
      await storage.updateOrder(orderId, {
        paymentMethod: 'credit_card',
        paymentIntentId: `sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      });
      
      // Log the payment activity
      await storage.createActivityLog({
        action: 'payment_processed',
        details: `Payment of €${amount.toFixed(2)} processed via credit card`,
        userId: req.user?.id || null,
        orderId: orderId,
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Payment processed successfully',
        orderId: orderId
      });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return res.status(500).json({ 
        error: 'Payment processing failed', 
        message: error.message || 'An unexpected error occurred'
      });
    }
  });

  // Payment method update endpoint
  app.post('/api/orders/:orderId/payment-method', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { paymentMethod } = req.body;
      
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      if (!paymentMethod || !['invoice', 'credit_card'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Invalid payment method' });
      }
      
      // Get the order to verify it exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // If payment method is invoice, keep status as "pending" while awaiting payment
      if (paymentMethod === 'invoice') {
        await storage.updateOrderStatus(orderId, "pending");
        
        // Log the invoice request
        await storage.createActivityLog({
          action: 'invoice_requested',
          details: `Invoice requested for order #${order.orderNumber}`,
          userId: req.user?.id || null,
          orderId: orderId,
        });
      }
      
      // Update payment method
      await storage.updateOrder(orderId, {
        paymentMethod,
      });
      
      return res.status(200).json({ 
        success: true, 
        message: paymentMethod === 'invoice' ? 'Invoice has been requested' : 'Payment method updated',
        orderId: orderId
      });
    } catch (error: any) {
      console.error('Payment method update error:', error);
      return res.status(500).json({ 
        error: 'Payment method update failed', 
        message: error.message || 'An unexpected error occurred'
      });
    }
  });
}