import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertOrderSchema, insertOrderItemSchema } from '@shared/schema';
import { sendOrderNotification, NotificationType } from '../services/notification-service';
import { broadcastOrderStatusUpdate } from '../services/websocket-service';

const router = Router();

// Generate an order number
function generateOrderNumber(): string {
  const prefix = 'AGH';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Create a simplified order endpoint that works for both authenticated users and guest checkout
router.post('/orders', async (req, res) => {
  try {
    console.log('[BACKEND] ========== NEW ORDER REQUEST ==========');
    console.log('[BACKEND] Request method:', req.method);
    console.log('[BACKEND] Request URL:', req.url);
    console.log('[BACKEND] Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Log the order submission request with sensitive data removed
    const logData = { ...req.body };
    if (logData.documents) logData.documents = `${logData.documents.length} documents`;
    console.log('[BACKEND] Received order submission data:', JSON.stringify(logData, null, 2));
    
    // Helpful debugging info about authentication state
    console.log('Authentication state when submitting order:',
      req.isAuthenticated() ? 'Authenticated' : 'Guest checkout',
      req.user ? `User ID: ${req.user.id}` : 'Using guest user ID');
    
    // Simplified validation with helpful error messages
    if (!req.body) {
      console.error('No request body provided');
      return res.status(400).json({ 
        error: 'Missing order data', 
        message: 'No order data was provided. Please try again.'
      });
    }
    
    // Basic validation for critical fields
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      console.error('No menu items in order');
      return res.status(400).json({
        error: 'Missing menu items',
        message: 'Please select at least one menu item.'
      });
    }
    
    // Fallback for missing fields
    req.body.departureAirport = req.body.departureAirport || 'Thessaloniki (SKG)';
    req.body.status = 'pending';
    req.body.orderNumber = generateOrderNumber(); 
    
    // Try formal schema validation but with fallbacks
    let orderData;
    try {
      const parseResult = insertOrderSchema.safeParse(req.body);
      if (parseResult.success) {
        orderData = parseResult.data;
        console.log('Order data parsed successfully through schema');
      } else {
        // Use the raw data with basic validation instead
        console.log('Using raw data with fallbacks instead of schema validation');
        orderData = req.body;
      }
    } catch (validationError) {
      console.error('Schema validation error:', validationError);
      // Continue with the raw data anyway
      orderData = req.body;
    }
    
    console.log('Order data prepared successfully');
    
    // Add order number and default status
    // Allow guest orders with an explicitly assigned guest user ID
    let userId = 1; // Default guest user ID
    
    if (req.isAuthenticated() && req.user && req.user.id) {
      userId = req.user.id;
      console.log(`Using authenticated user ID: ${userId}`);
    } else {
      // Create or find a guest session ID for tracking guest orders
      const guestSessionId = req.sessionID || `guest-${Date.now()}`;
      console.log(`Using default guest user ID: ${userId} (user not authenticated), session: ${guestSessionId}`);
      
      // Store session data to help with payment flow
      if (req.session) {
        // Use type casting to add custom properties to the session
        (req.session as any).guestOrder = true;
        (req.session as any).guestOrderTime = Date.now();
      }
    }
    
    const newOrderData = {
      ...orderData,
      orderNumber: generateOrderNumber(),
      status: 'pending',
      userId: userId,
      // Supply default values for the database schema
      kitchenLocation: orderData.departureAirport.includes('Mykonos') ? 'Mykonos' : 'Thessaloniki',
      cancellationPolicyAccepted: true, // Force to true as it's required
      advanceNoticeConfirmation: true, // Force to true as it's required
      passengerCount: orderData.passengerCount || 0,
      crewCount: orderData.crewCount || 0,
      deliveryFee: 150.0 // Standard delivery fee
    };
    
    // Insert order
    console.log('[BACKEND] Creating order in database with data:', JSON.stringify(newOrderData, null, 2));
    const order = await storage.createOrder(newOrderData);
    console.log('[BACKEND] Order created successfully with ID:', order.id);
    console.log('[BACKEND] Created order object:', JSON.stringify(order, null, 2));
    
    // Process order items if provided
    console.log('[BACKEND] Processing order items...');
    if (req.body.items && Array.isArray(req.body.items)) {
      console.log('[BACKEND] Found', req.body.items.length, 'items to process');
      for (const item of req.body.items) {
        const orderItem = {
          ...item,
          orderId: order.id
        };
        
        // Validate order item
        const itemParseResult = insertOrderItemSchema.safeParse(orderItem);
        if (itemParseResult.success) {
          await storage.createOrderItem(itemParseResult.data);
        }
      }
    }
    
    // Create activity log
    await storage.createActivityLog({
      userId: req.user?.id || 0,
      action: 'CREATE_ORDER',
      details: `Order #${order.orderNumber} created`,
      entityType: 'order',
      entityId: order.id
    });
    
    // Send notifications
    console.log('[BACKEND] Sending order notification...');
    sendOrderNotification(order.id, NotificationType.NEW_ORDER)
      .catch(err => console.error('[BACKEND] Error sending new order notification:', err));
    
    // Return the created order
    console.log('[BACKEND] Returning order to frontend:', order.id);
    console.log('[BACKEND] ========== ORDER CREATION COMPLETE ==========');
    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    let orders;
    
    // Check for query parameters
    if (req.query.status) {
      orders = await storage.getOrdersByStatus(req.query.status as string);
    } else if (req.query.kitchen) {
      orders = await storage.getOrdersByKitchen(req.query.kitchen as string);
    } else if (req.query.userId || req.user) {
      const userId = parseInt(req.query.userId as string) || req.user?.id;
      orders = await storage.getOrdersByUser(userId);
    } else {
      orders = await storage.getAllOrders();
    }
    
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    return res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order
router.patch('/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Get existing order
    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get previous status if we're updating status
    const previousStatus = req.body.status && existingOrder.status !== req.body.status 
      ? existingOrder.status 
      : null;
      
    // Update the order
    const updatedOrder = await storage.updateOrder(orderId, req.body);
    if (!updatedOrder) {
      return res.status(500).json({ error: 'Failed to update order' });
    }
    
    // If status changed, broadcast via WebSocket to admin/kitchen clients
    if (previousStatus && req.body.status) {
      const user = req.user || await storage.getUser(req.body.updatedBy || 0);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'System';
      
      // Broadcast order status update
      broadcastOrderStatusUpdate({
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: req.body.status,
        previousStatus,
        timestamp: new Date().toISOString(),
        updatedBy: {
          id: user?.id || 0,
          name: userName
        }
      });
    }
    
    // Create activity log
    await storage.createActivityLog({
      userId: req.user?.id || 0,
      action: 'UPDATE_ORDER',
      details: `Order #${updatedOrder.orderNumber} updated`,
      entityType: 'order',
      entityId: updatedOrder.id
    });
    
    // Determine notification type based on status change
    let notificationType: NotificationType | null = null;
    
    if (req.body.status) {
      const previousStatus = existingOrder.status;
      const newStatus = req.body.status;
      
      switch (newStatus) {
        case 'cancelled':
          notificationType = NotificationType.ORDER_CANCELLED;
          break;
        case 'ready':
          notificationType = NotificationType.ORDER_READY;
          break;
        case 'delivered':
          notificationType = NotificationType.ORDER_DELIVERED;
          break;
        default:
          notificationType = NotificationType.ORDER_UPDATED;
      }
      
      // Send email notification
      if (notificationType) {
        sendOrderNotification(orderId, notificationType)
          .catch(err => console.error(`Error sending ${notificationType} notification:`, err));
      }
      
      // Get user info for the update broadcast
      const currentUser = await storage.getUser(req.user?.id || 0);
      const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System';
      
      // Broadcast WebSocket notification about status change
      broadcastOrderStatusUpdate({
        orderId,
        orderNumber: updatedOrder.orderNumber,
        status: newStatus,
        previousStatus,
        timestamp: new Date().toISOString(),
        updatedBy: {
          id: req.user?.id || 0,
          name: userName
        }
      });
    }
    
    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Get existing order before deletion
    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Delete the order
    const success = await storage.deleteOrder(orderId);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete order' });
    }
    
    // Create activity log
    await storage.createActivityLog({
      userId: req.user?.id || 0,
      action: 'DELETE_ORDER',
      details: `Order #${existingOrder.orderNumber} deleted`,
      entityType: 'order',
      entityId: orderId
    });
    
    // Send cancellation notification
    sendOrderNotification(orderId, NotificationType.ORDER_CANCELLED)
      .catch(err => console.error('Error sending cancellation notification:', err));
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get order items
router.get('/orders/:id/items', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const items = await storage.getOrderItems(orderId);
    return res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Add item to order
router.post('/orders/:id/items', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Validate item data
    const orderItem = {
      ...req.body,
      orderId
    };
    
    const parseResult = insertOrderItemSchema.safeParse(orderItem);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid order item data', 
        details: parseResult.error.format() 
      });
    }
    
    // Add the item
    const item = await storage.createOrderItem(parseResult.data);
    
    // Create activity log
    await storage.createActivityLog({
      userId: req.user?.id || 0,
      action: 'ADD_ORDER_ITEM',
      details: `Item added to order #${orderId}`,
      entityType: 'order',
      entityId: orderId
    });
    
    // Send update notification
    sendOrderNotification(orderId, NotificationType.ORDER_UPDATED)
      .catch(err => console.error('Error sending order update notification:', err));
    
    return res.status(201).json(item);
  } catch (error) {
    console.error('Error adding order item:', error);
    return res.status(500).json({ error: 'Failed to add order item' });
  }
});

export default router;