import { Express } from 'express';
import { storage } from '../storage';
import { orderStatusLabels, type OrderStatus, type InsertOrderStatusHistory } from '@shared/schema';
import { broadcastOrderStatusUpdate } from '../services/websocket-service';

export function registerOrderStatusRoutes(app: Express) {
  // Route to get the status history of an order
  app.get('/api/orders/:orderId/status-history', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      // Get the order to check permissions
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if the user is authorized (admin, kitchen staff, or the order owner)
      if (req.isAuthenticated()) {
        const isOwner = req.user.id === order.userId;
        const isAdmin = req.user.role === 'admin';
        const isKitchen = req.user.role === 'kitchen';
        
        if (!isOwner && !isAdmin && !isKitchen) {
          return res.status(403).json({ message: 'Not authorized to view this order' });
        }
      } else {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Get the status history for the order
      const statusHistory = await storage.getOrderStatusHistory(orderId);
      
      res.json({
        currentStatus: order.status,
        statusHistory
      });
    } catch (error) {
      console.error('Error getting order status history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Route to update the status of an order
  app.post('/api/orders/:orderId/status', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      // Validate the new status
      const { status, notes } = req.body;
      
      if (!status || !orderStatusLabels[status as OrderStatus]) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is authorized (admin or kitchen staff)
      const isAdmin = req.user.role === 'admin';
      const isKitchen = req.user.role === 'kitchen';
      
      if (!isAdmin && !isKitchen) {
        return res.status(403).json({ message: 'Not authorized to update order status' });
      }
      
      // Get the order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status as OrderStatus);
      
      // Create a status history entry
      const statusHistoryEntry: InsertOrderStatusHistory = {
        orderId,
        status: status as OrderStatus,
        notes: notes || null,
        performedBy: req.user.id,
        performedByName: `${req.user.firstName} ${req.user.lastName}`
      };
      
      const newStatusHistory = await storage.createOrderStatusHistory(statusHistoryEntry);
      
      // Get the complete status history
      const statusHistory = await storage.getOrderStatusHistory(orderId);
      
      // Broadcast the status update via WebSocket
      broadcastOrderStatusUpdate(orderId, status as OrderStatus, statusHistory);
      
      res.json({
        currentStatus: updatedOrder.status,
        statusHistory,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}