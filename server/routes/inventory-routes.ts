import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { 
  insertInventoryItemSchema, 
  insertVendorSchema, 
  insertMenuItemIngredientSchema,
  insertInventoryTransactionSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema
} from "@shared/schema";

const router = Router();

// Inventory Items routes
router.get("/inventory-items", async (req, res) => {
  try {
    const { location } = req.query;
    const items = await storage.getInventoryItems(location as string);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve inventory items: ${error.message}` });
  }
});

router.get("/inventory-items/low-stock", async (req, res) => {
  try {
    const { location } = req.query;
    const items = await storage.getLowStockItems(location as string);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve low stock items: ${error.message}` });
  }
});

router.get("/inventory-items/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { location } = req.query;
    const items = await storage.getInventoryItemsByCategory(category, location as string);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve inventory items by category: ${error.message}` });
  }
});

router.get("/inventory-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getInventoryItem(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve inventory item: ${error.message}` });
  }
});

router.post("/inventory-items", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const itemData = insertInventoryItemSchema.parse(req.body);
    const newItem = await storage.createInventoryItem(itemData);

    // Log activity
    await storage.createActivityLog({
      userId: req.user.id,
      action: "inventory_item_created",
      details: `Created inventory item: ${newItem.name}`,
      resourceId: newItem.id,
      resourceType: "inventory_item"
    });

    res.status(201).json(newItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create inventory item: ${error.message}` });
  }
});

router.patch("/inventory-items/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const id = parseInt(req.params.id);
    const itemData = req.body;
    const updatedItem = await storage.updateInventoryItem(id, itemData);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Log activity
    await storage.createActivityLog({
      userId: req.user.id,
      action: "inventory_item_updated",
      details: `Updated inventory item: ${updatedItem.name}`,
      resourceId: updatedItem.id,
      resourceType: "inventory_item"
    });

    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update inventory item: ${error.message}` });
  }
});

router.delete("/inventory-items/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getInventoryItem(id);
    
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    const deleted = await storage.deleteInventoryItem(id);
    
    if (deleted) {
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        action: "inventory_item_deleted",
        details: `Deleted inventory item: ${item.name}`,
        resourceId: id,
        resourceType: "inventory_item"
      });
      
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete inventory item: ${error.message}` });
  }
});

// Vendor routes
router.get("/vendors", async (req, res) => {
  try {
    const vendors = await storage.getVendors();
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve vendors: ${error.message}` });
  }
});

router.get("/vendors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vendor = await storage.getVendor(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve vendor: ${error.message}` });
  }
});

router.post("/vendors", async (req, res) => {
  try {
    const vendorData = insertVendorSchema.parse(req.body);
    const newVendor = await storage.createVendor(vendorData);

    // Log activity
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "vendor_created",
      details: `Created vendor: ${newVendor.name}`,
      resourceId: newVendor.id,
      resourceType: "vendor"
    });

    res.status(201).json(newVendor);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create vendor: ${error.message}` });
  }
});

router.patch("/vendors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vendorData = req.body;
    const updatedVendor = await storage.updateVendor(id, vendorData);
    
    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Log activity
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "vendor_updated",
      details: `Updated vendor: ${updatedVendor.name}`,
      resourceId: updatedVendor.id,
      resourceType: "vendor"
    });

    res.json(updatedVendor);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update vendor: ${error.message}` });
  }
});

router.delete("/vendors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vendor = await storage.getVendor(id);
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    
    const deleted = await storage.deleteVendor(id);
    
    if (deleted) {
      // Log activity
      await storage.createActivityLog({
        userId: req.user?.id,
        action: "vendor_deleted",
        details: `Deleted vendor: ${vendor.name}`,
        resourceId: id,
        resourceType: "vendor"
      });
      
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete vendor: ${error.message}` });
  }
});

// Menu Item Ingredients routes
router.get("/menu-ingredients/:menuItemId", async (req, res) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);
    const ingredients = await storage.getMenuItemIngredients(menuItemId);
    res.json(ingredients);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve menu item ingredients: ${error.message}` });
  }
});

router.post("/menu-ingredients", async (req, res) => {
  try {
    const ingredientData = insertMenuItemIngredientSchema.parse(req.body);
    const newIngredient = await storage.createMenuItemIngredient(ingredientData);
    res.status(201).json(newIngredient);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid menu item ingredient data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create menu item ingredient: ${error.message}` });
  }
});

router.patch("/menu-ingredients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ingredientData = req.body;
    const updatedIngredient = await storage.updateMenuItemIngredient(id, ingredientData);
    
    if (!updatedIngredient) {
      return res.status(404).json({ message: "Menu item ingredient not found" });
    }
    
    res.json(updatedIngredient);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update menu item ingredient: ${error.message}` });
  }
});

router.delete("/menu-ingredients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteMenuItemIngredient(id);
    
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Menu item ingredient not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete menu item ingredient: ${error.message}` });
  }
});

// Inventory Transactions routes
router.get("/inventory-transactions", async (req, res) => {
  try {
    const { inventoryItemId, location } = req.query;
    const transactions = await storage.getInventoryTransactions(
      inventoryItemId ? parseInt(inventoryItemId as string) : undefined,
      location as string
    );
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve inventory transactions: ${error.message}` });
  }
});

router.get("/inventory-transactions/order/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const transactions = await storage.getInventoryTransactionsByOrder(orderId);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve inventory transactions for order: ${error.message}` });
  }
});

router.post("/inventory-transactions", async (req, res) => {
  try {
    const transactionData = insertInventoryTransactionSchema.parse(req.body);
    const newTransaction = await storage.createInventoryTransaction(transactionData);

    // Log activity
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "inventory_transaction_created",
      details: `Created inventory transaction: ${newTransaction.transactionType} (${newTransaction.quantity})`,
      resourceId: newTransaction.id,
      resourceType: "inventory_transaction"
    });

    res.status(201).json(newTransaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid inventory transaction data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create inventory transaction: ${error.message}` });
  }
});

// Purchase Orders routes
router.get("/purchase-orders", async (req, res) => {
  try {
    const { location } = req.query;
    const orders = await storage.getPurchaseOrders(location as string);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve purchase orders: ${error.message}` });
  }
});

router.get("/purchase-orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getPurchaseOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve purchase order: ${error.message}` });
  }
});

router.post("/purchase-orders", async (req, res) => {
  try {
    const orderData = insertPurchaseOrderSchema.parse(req.body);
    const newOrder = await storage.createPurchaseOrder(orderData);

    // Log activity
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "purchase_order_created",
      details: `Created purchase order: ${newOrder.orderNumber}`,
      resourceId: newOrder.id,
      resourceType: "purchase_order"
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid purchase order data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create purchase order: ${error.message}` });
  }
});

router.patch("/purchase-orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const orderData = req.body;
    const updatedOrder = await storage.updatePurchaseOrder(id, orderData);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    // Log activity
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "purchase_order_updated",
      details: `Updated purchase order: ${updatedOrder.orderNumber}`,
      resourceId: updatedOrder.id,
      resourceType: "purchase_order"
    });

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update purchase order: ${error.message}` });
  }
});

router.delete("/purchase-orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getPurchaseOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    
    const deleted = await storage.deletePurchaseOrder(id);
    
    if (deleted) {
      // Log activity
      await storage.createActivityLog({
        userId: req.user?.id,
        action: "purchase_order_deleted",
        details: `Deleted purchase order: ${order.orderNumber}`,
        resourceId: id,
        resourceType: "purchase_order"
      });
      
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete purchase order: ${error.message}` });
  }
});

// Purchase Order Items routes
router.get("/purchase-orders/:id/items", async (req, res) => {
  try {
    const purchaseOrderId = parseInt(req.params.id);
    const items = await storage.getPurchaseOrderItems(purchaseOrderId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve purchase order items: ${error.message}` });
  }
});

router.post("/purchase-order-items", async (req, res) => {
  try {
    const itemData = insertPurchaseOrderItemSchema.parse(req.body);
    const newItem = await storage.createPurchaseOrderItem(itemData);
    res.status(201).json(newItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid purchase order item data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create purchase order item: ${error.message}` });
  }
});

router.patch("/purchase-order-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemData = req.body;
    const updatedItem = await storage.updatePurchaseOrderItem(id, itemData);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Purchase order item not found" });
    }
    
    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update purchase order item: ${error.message}` });
  }
});

router.delete("/purchase-order-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deletePurchaseOrderItem(id);
    
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Purchase order item not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete purchase order item: ${error.message}` });
  }
});

// Utility endpoints
router.post("/inventory/order-consumption", async (req, res) => {
  try {
    const { orderId, location } = req.body;
    
    if (!orderId || !location) {
      return res.status(400).json({ message: "orderId and location are required" });
    }
    
    // Get all order items
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const orderItems = await storage.getOrderItems(orderId);
    
    // Create inventory transactions for each menu item in the order
    for (const orderItem of orderItems) {
      // Get the menu item
      const menuItem = await storage.getMenuItem(orderItem.menuItemId);
      if (!menuItem) continue;
      
      // Get all ingredients for this menu item
      const ingredients = await storage.getMenuItemIngredients(orderItem.menuItemId);
      
      // Create inventory transactions for each ingredient
      for (const ingredient of ingredients) {
        await storage.createInventoryTransaction({
          inventoryItemId: ingredient.inventoryItemId,
          userId: req.user?.id || order.userId,
          transactionType: "order_consumption",
          quantity: -(ingredient.quantity * orderItem.quantity), // Negative because we're consuming
          orderId,
          location,
        });
      }
    }
    
    await storage.createActivityLog({
      userId: req.user?.id,
      orderId,
      action: "inventory_order_consumption",
      details: `Consumed inventory for order: ${order.orderNumber}`,
      resourceId: orderId,
      resourceType: "order"
    });
    
    res.status(200).json({ message: "Inventory consumption recorded" });
  } catch (error: any) {
    res.status(500).json({ message: `Failed to record inventory consumption: ${error.message}` });
  }
});

export default router;