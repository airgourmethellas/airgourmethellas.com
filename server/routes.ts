import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { setupWebSocketServer, broadcastOrderStatusUpdate } from "./services/websocket-service";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertOrderSchema, insertMenuItemSchema, updateMenuItemSchema, Order } from "@shared/schema";
import { sendOrderNotification, NotificationType } from "./services/notification-service";
import { sendTestEmail, sendEmail } from "./services/email-service";
import { 
  getStripeConfig, 
  createTestPaymentIntent, 
  createOrderPaymentIntent, 
  processWebhookEvent 
} from "./services/payment-service";
import inventoryRoutes from "./routes/inventory-routes";
import scheduleRoutes from "./routes/schedule-routes";
import gdprRoutes from "./routes/gdpr-routes";
import integrationRoutes from "./routes/integration-routes";
import { setupProcessPaymentRoute } from "./routes/process-payment-route";
import { registerInvoiceRoutes } from "./routes/invoice-routes";
import orderRoutes from "./routes/order-routes";
import chatRoutes from "./routes/chat-routes";
// Concierge routes temporarily removed for Railway deployment
import { registerPaymentRoutes } from "./routes/payment-routes";
import { registerOrderStatusRoutes } from "./routes/order-status-routes";

import { registerSimpleLoginRoute } from "./routes/simple-login";
import { registerMarkPaidRoute } from "./routes/mark-paid-route";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  setupAuth(app);
  
  // Register the special test login route
  registerSimpleLoginRoute(app);
  
  // Register the direct payment route
  registerMarkPaidRoute(app);
  
  // Register the process payment routes
  setupProcessPaymentRoute(app);
  
  // Register the new modular payment routes
  registerPaymentRoutes(app);
  
  // Register order routes
  app.use("/api", orderRoutes);
  
  // Register other modular routes  
  app.use("/api", inventoryRoutes);
  app.use("/api", scheduleRoutes);
  app.use("/api", gdprRoutes);
  app.use("/api", integrationRoutes);
  app.use("/api", chatRoutes);
  
  // Register invoice routes
  registerInvoiceRoutes(app);
  
  // Concierge routes temporarily removed for Railway deployment
  
  // Register order status routes
  registerOrderStatusRoutes(app);
  
  // Payment routes 
  app.get("/api/payments/config", (req, res) => {
    try {
      const config = getStripeConfig();
      res.json(config);
    } catch (error: any) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/payments/test-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          error: "Invalid amount",
          message: "Amount must be a positive number"
        });
      }
      
      const paymentIntent = await createTestPaymentIntent(amount);
      res.json(paymentIntent);
    } catch (error: any) {
      console.error("Error creating test payment intent:", error);
      res.status(500).json({
        error: "Failed to create payment intent",
        message: error.message || "An unexpected error occurred"
      });
    }
  });
  
  app.post("/api/payments/create-payment-intent", async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      
      if (!orderId) {
        return res.status(400).json({
          error: "Missing order ID",
          message: "Order ID is required"
        });
      }
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          error: "Invalid amount",
          message: "Amount must be a positive number"
        });
      }
      
      const paymentIntent = await createOrderPaymentIntent(orderId, amount);
      res.json(paymentIntent);
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        error: "Failed to create payment intent",
        message: error.message || "An unexpected error occurred"
      });
    }
  });
  
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const event = req.body;
      const result = await processWebhookEvent(event);
      res.json(result);
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        error: "Failed to process webhook",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Test endpoint for Stripe configuration
  app.get("/api/test-stripe", async (req, res) => {
    try {
      const config = getStripeConfig();
      res.json({
        configured: !!config,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublicKey: !!process.env.VITE_STRIPE_PUBLIC_KEY,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Stripe configuration test failed",
        message: error.message
      });
    }
  });

  // API routes
  // ========== Aircraft Types ==========
  app.get("/api/aircraft-types", async (req, res) => {
    try {
      const types = await storage.getAircraftTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve aircraft types" });
    }
  });

  // ========== Airports ==========
  app.get("/api/airports", async (req, res) => {
    try {
      const airports = await storage.getAirports();
      res.json(airports);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve airports" });
    }
  });

  // ========== Menu Items ==========
  app.get("/api/menu-items", async (req, res) => {
    try {
      const { category, dietary, kitchen } = req.query;
      
      let menuItems;
      if (category) {
        menuItems = await storage.getMenuItemsByCategory(category as string);
      } else if (dietary) {
        menuItems = await storage.getMenuItemsByDietary(dietary as string);
      } else if (kitchen) {
        menuItems = await storage.getMenuItemsByKitchen(kitchen as string);
      } else {
        menuItems = await storage.getMenuItems();
      }
      
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve menu item" });
    }
  });
  
  app.post("/api/menu-items", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to create menu items" });
    }

    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu-items/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update menu items" });
    }

    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Create a partial update schema by making all fields optional
      const updateMenuItemSchema = insertMenuItemSchema.partial();
      const menuItemData = updateMenuItemSchema.parse(req.body);
      
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete menu items" });
    }

    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      await storage.deleteMenuItem(id);
      res.status(200).json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // ========== Orders ==========
  // Get orders (with filtering)
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { status, kitchen } = req.query;
      
      let orders;
      if (req.user.role === "admin" || req.user.role === "kitchen") {
        // Admin or kitchen staff can see all orders with filters
        if (status) {
          orders = await storage.getOrdersByStatus(status as string);
        } else if (kitchen) {
          orders = await storage.getOrdersByKitchen(kitchen as string);
        } else {
          orders = Array.from((await storage.getOrdersByStatus("pending"))
            .concat(await storage.getOrdersByStatus("processing"))
            .concat(await storage.getOrdersByStatus("preparing")));
        }
      } else {
        // Regular clients can only see their own orders
        orders = await storage.getOrdersByUser(req.user.id);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to see this order
      if (req.user.role !== "admin" && req.user.role !== "kitchen" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this order" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });

  // NOTE: Order creation endpoint moved to modular order-routes.ts to avoid conflicts

  // Update order
  app.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to update this order
      if (req.user.role !== "admin" && req.user.role !== "kitchen" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
      
      // Regular users can only update orders in certain statuses
      if (req.user.role !== "admin" && req.user.role !== "kitchen" && 
          !["pending", "processing"].includes(order.status)) {
        return res.status(403).json({ message: "Order cannot be modified in its current status" });
      }
      
      const updatedOrder = await storage.updateOrder(id, req.body);
      
      // Log activity
      if (updatedOrder) {
        await storage.createActivityLog({
          userId: req.user.id,
          action: 'UPDATE_ORDER',
          details: `Order #${updatedOrder.orderNumber} updated - Status: ${updatedOrder.status}`,
          resourceType: 'order',
          resourceId: updatedOrder.id,
          orderId: updatedOrder.id
        });
      }
      
      // Determine notification type based on the new status
      let notificationType: NotificationType;
      
      if (req.body.status) {
        switch (req.body.status) {
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
        
        // Send notification in the background
        sendOrderNotification(id, notificationType)
          .catch(err => console.error(`Error sending ${notificationType} notification:`, err));
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Cancel order
  app.delete("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to delete this order
      if (req.user.role !== "admin" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this order" });
      }
      
      // Regular users can only delete orders in certain statuses
      if (req.user.role !== "admin" && !["pending", "processing"].includes(order.status)) {
        return res.status(403).json({ message: "Order cannot be cancelled in its current status" });
      }
      
      // Just update the status to cancelled instead of deleting
      const updatedOrder = await storage.updateOrder(id, { status: "cancelled" });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        action: 'CANCEL_ORDER',
        details: `Order #${order.orderNumber} cancelled`,
        resourceType: 'order',
        resourceId: order.id,
        orderId: order.id
      });
      
      // Send cancellation notification in the background
      sendOrderNotification(id, NotificationType.ORDER_CANCELLED)
        .catch(err => console.error('Error sending cancellation notification:', err));
      
      res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Order Templates feature has been removed

  // ========== Order Annotations ==========
  // Get annotations for an order
  app.get("/api/orders/:id/annotations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to see this order's annotations
      if (req.user.role !== "admin" && req.user.role !== "kitchen" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this order's annotations" });
      }
      
      // Get order annotations
      const annotations = await storage.getOrderAnnotations(orderId);
      
      // If user is not an admin or kitchen staff, filter out internal annotations
      if (req.user.role !== "admin" && req.user.role !== "kitchen") {
        const filteredAnnotations = annotations.filter(anno => !anno.isInternal);
        res.json(filteredAnnotations);
      } else {
        res.json(annotations);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order annotations" });
    }
  });

  // Create an annotation for an order
  app.post("/api/orders/:id/annotations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to see this order
      if (req.user.role !== "admin" && req.user.role !== "kitchen" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to add annotations to this order" });
      }
      
      // Only admin and kitchen staff can create internal annotations
      if (req.body.isInternal && req.user.role !== "admin" && req.user.role !== "kitchen") {
        return res.status(403).json({ message: "Not authorized to create internal annotations" });
      }
      
      const annotation = await storage.createOrderAnnotation({
        orderId,
        userId: req.user.id,
        content: req.body.content,
        isInternal: req.body.isInternal || false
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        action: 'ADD_ANNOTATION',
        details: `Annotation added to Order #${order.orderNumber}`,
        resourceType: 'order',
        resourceId: order.id,
        orderId: order.id
      });
      
      res.status(201).json(annotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order annotation" });
    }
  });

  // Update an annotation
  app.patch("/api/orders/:orderId/annotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const annotationId = parseInt(req.params.id);
      const orderId = parseInt(req.params.orderId);
      
      // Get all annotations for this order
      const annotations = await storage.getOrderAnnotations(orderId);
      const annotation = annotations.find(a => a.id === annotationId);
      
      if (!annotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      
      // Check if user is the creator of the annotation or an admin
      if (annotation.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this annotation" });
      }
      
      const updatedAnnotation = await storage.updateOrderAnnotation(annotationId, {
        content: req.body.content,
        isInternal: req.body.isInternal
      });
      
      res.json(updatedAnnotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update annotation" });
    }
  });

  // Delete an annotation
  app.delete("/api/orders/:orderId/annotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const annotationId = parseInt(req.params.id);
      const orderId = parseInt(req.params.orderId);
      
      // Get all annotations for this order
      const annotations = await storage.getOrderAnnotations(orderId);
      const annotation = annotations.find(a => a.id === annotationId);
      
      if (!annotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      
      // Check if user is the creator of the annotation or an admin
      if (annotation.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this annotation" });
      }
      
      await storage.deleteOrderAnnotation(annotationId);
      
      res.status(200).json({ message: "Annotation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete annotation" });
    }
  });

  // ========== Activity Logs ==========
  app.get("/api/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Only admin and kitchen staff can see activity logs
    if (req.user.role !== "admin" && req.user.role !== "kitchen") {
      return res.status(403).json({ message: "Not authorized to view activity logs" });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve activity logs" });
    }
  });

  // ========== System Settings ==========
  app.get("/api/admin/settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now, return empty structure until we implement settings storage
    res.json({
      general: {
        siteName: 'Air Gourmet Hellas',
        siteUrl: 'https://www.airgourmethellas.com',
        logoUrl: '',
        defaultLanguage: 'en',
        timezone: 'Europe/Athens',
      },
      company: {
        companyName: 'Air Gourmet Hellas',
        vatNumber: '',
        address: '',
        phone: '',
        email: 'info@airgourmet.gr',
        website: 'https://www.airgourmet.gr',
      },
      locations: {
        thessalonikiEnabled: true,
        mykonosEnabled: true,
        thessalonikiAddress: 'Thessaloniki International Airport',
        mykonosAddress: 'Mykonos International Airport',
        thessalonikiPhone: '',
        mykonosPhone: '',
      }
    });
  });
  
  app.post("/api/admin/settings/general", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now just log the settings and return success
    console.log("Updated general settings:", req.body);
    
    // Here we would save to database
    res.json({ success: true, message: "General settings updated successfully" });
  });
  
  app.post("/api/admin/settings/company", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now just log the settings and return success
    console.log("Updated company info:", req.body);
    
    // Here we would save to database
    res.json({ success: true, message: "Company information updated successfully" });
  });
  
  app.post("/api/admin/settings/locations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now just log the settings and return success
    console.log("Updated location settings:", req.body);
    
    // Here we would save to database
    res.json({ success: true, message: "Location settings updated successfully" });
  });

  // ========== Notification Settings ==========
  app.get("/api/admin/notification-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now, return empty structure until we implement settings storage
    res.json({
      email: {
        sendgridApiKey: "",
        fromEmail: "orders@airgourmet.gr",
        opsEmail: "ops@airgourmet.gr",
        kitchenEmailThessaloniki: "kitchen-thessaloniki@airgourmet.gr",
        kitchenEmailMykonos: "kitchen-mykonos@airgourmet.gr",
        deliveryEmail: "delivery@airgourmet.gr",
        clientsEmail: "clients@airgourmet.gr"
      },
      notifications: {
        newOrderToOps: true,
        newOrderToKitchen: true,
        orderUpdateToOps: true,
        orderUpdateToKitchen: true,
        orderUpdateToClient: true,
        orderCancelledToOps: true,
        orderCancelledToKitchen: true,
        orderCancelledToClient: true,
        orderReadyToOps: true,
        orderReadyToClient: true,
        orderDeliveredToOps: true
      }
    });
  });
  
  app.post("/api/admin/notification-settings/email", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now just log the settings and return success
    console.log("Updated email settings:", req.body);
    
    // Here we would save to database
    res.status(200).json({ message: "Email settings updated successfully" });
  });
  
  app.post("/api/admin/notification-settings/notifications", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // For now just log the settings and return success
    console.log("Updated notification settings:", req.body);
    
    // Here we would save to database
    res.status(200).json({ message: "Notification preferences updated successfully" });
  });
  
  // ========== Notification Testing ==========
  app.post("/api/test-notification", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const { email, orderId, type, recipientType } = req.body;
      
      if (email) {
        // Test email service directly
        const success = await sendTestEmail(email);
        if (success) {
          return res.status(200).json({ message: "Test email sent successfully" });
        } else {
          return res.status(500).json({ message: "Failed to send test email" });
        }
      } else if (orderId && type) {
        // Test order notification
        const notificationType = NotificationType[type as keyof typeof NotificationType];
        if (!notificationType) {
          return res.status(400).json({ message: "Invalid notification type" });
        }
        
        // Get the order
        const order = await storage.getOrder(parseInt(orderId));
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        let success = false;
        
        // Handle client-facing vs internal notifications differently
        if (recipientType === "client") {
          // For client-facing templates, we'll send to the admin's email for testing
          const clientTemplate = generateClientEmailTemplate(order, notificationType);
          const adminEmail = req.user.email;
          
          // Send a test email with the client-facing template
          success = await sendEmail({
            to: [adminEmail],
            subject: `[TEST] Client Notification: ${order.orderNumber} - ${type}`,
            html: clientTemplate
          });
        } else {
          // Regular internal team notifications
          const results = await sendOrderNotification(parseInt(orderId), notificationType);
          success = results.some(r => r === true);
        }
        
        if (success) {
          return res.status(200).json({ message: "Order notification sent successfully" });
        } else {
          return res.status(500).json({ message: "Failed to send order notification" });
        }
      } else {
        return res.status(400).json({ message: "Missing required parameters" });
      }
    } catch (error) {
      console.error("Error testing notification:", error);
      return res.status(500).json({ message: "Failed to test notification" });
    }
  });
  
  /**
   * Generate client-facing email templates for testing
   */
  function generateClientEmailTemplate(order: Order, type: NotificationType): string {
  // Determine the location based on the delivery location
  const location = order.deliveryLocation.includes("Thessaloniki") ? "Thessaloniki" : 
                 order.deliveryLocation.includes("Mykonos") ? "Mykonos" : 
                 "Our Facility";
  
  switch (type) {
    case NotificationType.NEW_ORDER:
      return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004080;">✈️ Air Gourmet Hellas</h2>
          <p>Hello <strong>Client</strong>,</p>

          <p>We have received your order for:</p>

          <ul>
            <li><strong>Flight:</strong> ${order.tailNumber}</li>
            <li><strong>Departure Date:</strong> ${order.departureDate}</li>
            <li><strong>Passengers:</strong> ${order.passengerCount}</li>
            <li><strong>Crew:</strong> ${order.crewCount}</li>
          </ul>

          <p>Your inflight catering is now being prepared with care by our team in <strong>${location}</strong>.</p>

          <p style="margin-top: 20px;">If you have any questions or last-minute changes, feel free to reply to this email or contact us at <a href="mailto:orders@airgourmet.gr">orders@airgourmet.gr</a>.</p>

          <p style="margin-top: 30px;">Thank you for flying with Air Gourmet Hellas.<br>We look forward to delighting your passengers.</p>

          <hr style="margin-top: 30px;">
          <small style="color: #888;">This is an automated message from Air Gourmet Hellas | Thessaloniki & Mykonos</small>
        </div>
      `;
    
    case NotificationType.ORDER_CANCELLED:
      return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d32f2f;">✈️ Air Gourmet Hellas - Order Cancelled</h2>
          <p>Hello <strong>Client</strong>,</p>

          <p>Your order for flight <strong>${order.tailNumber}</strong> has been cancelled as requested.</p>

          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Departure Date:</strong> ${order.departureDate}</li>
          </ul>

          <p style="margin-top: 20px;">If this cancellation was made in error or if you have any questions, please contact us immediately at <a href="mailto:orders@airgourmet.gr">orders@airgourmet.gr</a>.</p>

          <p style="margin-top: 30px;">Thank you for your understanding.</p>

          <hr style="margin-top: 30px;">
          <small style="color: #888;">This is an automated message from Air Gourmet Hellas | Thessaloniki & Mykonos</small>
        </div>
      `;
    
    case NotificationType.ORDER_READY:
      return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
          <h2 style="color: #388e3c;">✈️ Air Gourmet Hellas - Order Ready</h2>
          <p>Hello <strong>Client</strong>,</p>

          <p>Great news! Your catering order for flight <strong>${order.tailNumber}</strong> is prepared and ready for delivery.</p>

          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Departure Date:</strong> ${order.departureDate}</li>
            <li><strong>Delivery Location:</strong> ${order.deliveryLocation}</li>
          </ul>

          <p style="margin-top: 20px;">Our delivery team will ensure your order arrives at the specified location with plenty of time before your departure.</p>

          <p style="margin-top: 30px;">We wish you a pleasant flight!</p>

          <hr style="margin-top: 30px;">
          <small style="color: #888;">This is an automated message from Air Gourmet Hellas | Thessaloniki & Mykonos</small>
        </div>
      `;
      
    default:
      return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004080;">✈️ Air Gourmet Hellas</h2>
          <p>Hello <strong>Client</strong>,</p>

          <p>There has been an update to your order:</p>

          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Flight:</strong> ${order.tailNumber}</li>
            <li><strong>Departure Date:</strong> ${order.departureDate}</li>
          </ul>

          <p style="margin-top: 20px;">If you have any questions, please contact us at <a href="mailto:orders@airgourmet.gr">orders@airgourmet.gr</a>.</p>

          <hr style="margin-top: 30px;">
          <small style="color: #888;">This is an automated message from Air Gourmet Hellas | Thessaloniki & Mykonos</small>
        </div>
      `;
  }
}
  
  // ========== User Profile ==========
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Don't allow changing username or role
      const { username, role, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Mount payment routes
  // Payment routes are registered directly in the routes file above
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api', scheduleRoutes);
  
  // Mount GDPR routes
  app.use('/api/gdpr', gdprRoutes);
  // Integration routes (Zapier, etc.)
  app.use('/api/integrations', integrationRoutes);
  
  // Mount order routes
  app.use('/api', orderRoutes);
  
  // Concierge routes temporarily removed for Railway deployment
  
  // Register invoice routes
  registerInvoiceRoutes(app);
  
  // Test route for PDF generation
  app.get("/api/test-pdf", async (req, res) => {
    try {
      const { testPDFGeneration } = await import('./test-pdf');
      const result = await testPDFGeneration();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Register chat routes
  app.use('/api', chatRoutes);

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time order status notifications
  setupWebSocketServer(httpServer);
  
  console.log("[INFO] Real-time notification system initialized");

  return httpServer;
}
