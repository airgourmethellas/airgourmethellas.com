import { pgTable, text, serial, integer, boolean, timestamp, json, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  role: text("role").notNull().default("client"), // 'client', 'admin', 'kitchen'
  created: timestamp("created").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  phone: true,
  role: true,
});

// Aircraft Types
export const aircraftTypes = pgTable("aircraft_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertAircraftTypeSchema = createInsertSchema(aircraftTypes);

// Airports
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const insertAirportSchema = createInsertSchema(airports);

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'breads', 'breakfast', 'fruits', 'salad', 'starter', 'main', 'dessert', 'beverage'
  dietaryOptions: text("dietary_options").array(), // 'regular', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'keto'
  priceThessaloniki: integer("price_thessaloniki").notNull(), // Price in EUR cents for Thessaloniki
  priceMykonos: integer("price_mykonos").notNull(), // Price in EUR cents for Mykonos
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  unit: text("unit"), // e.g., "per piece", "100g", etc.
});

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const updateMenuItemSchema = insertMenuItemSchema.partial().extend({
  id: z.number()
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  aircraftType: text("aircraft_type").notNull(),
  tailNumber: text("tail_number").notNull(),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  departureAirport: text("departure_airport").notNull(),
  arrivalAirport: text("arrival_airport"),
  passengerCount: integer("passenger_count").notNull(),
  crewCount: integer("crew_count").notNull(),
  dietaryRequirements: text("dietary_requirements").array(),
  specialNotes: text("special_notes"),
  deliveryLocation: text("delivery_location").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  documents: text("documents").array(), // file paths or URLs
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'processing', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'
  kitchenLocation: text("kitchen_location").notNull(), // 'Thessaloniki', 'Mykonos'
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
  totalPrice: integer("total_price").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  created: true,
  updated: true,
});

// Order Items (line items for an order)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  specialInstructions: text("special_instructions"),
  price: integer("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Order Templates feature has been removed

// Activity Log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  orderId: integer("order_id"),
  action: text("action").notNull(),
  details: text("details"),
  resourceId: integer("resource_id"),
  resourceType: text("resource_type"),
  created: timestamp("created").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  created: true,
});

// Order Annotations for team collaboration
export const orderAnnotations = pgTable("order_annotations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(true), // True for team-only, false if visible to clients
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertOrderAnnotationSchema = createInsertSchema(orderAnnotations).omit({
  id: true,
  created: true,
  updated: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OrderAnnotation = typeof orderAnnotations.$inferSelect;
export type InsertOrderAnnotation = z.infer<typeof insertOrderAnnotationSchema>;

export type AircraftType = typeof aircraftTypes.$inferSelect;
export type InsertAircraftType = z.infer<typeof insertAircraftTypeSchema>;

export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'protein', 'vegetable', 'fruit', 'dairy', 'grain', 'seasoning', 'other'
  unit: text("unit").notNull(), // 'kg', 'g', 'l', 'ml', 'each', etc.
  inStock: real("in_stock").notNull().default(0),
  reorderPoint: real("reorder_point").notNull().default(0),
  idealStock: real("ideal_stock").notNull().default(0),
  location: text("location").notNull(), // 'Thessaloniki', 'Mykonos'
  lastRestockDate: date("last_restock_date"),
  lastCheckedDate: date("last_checked_date"),
  cost: integer("cost").notNull(), // Cost in EUR cents per unit
  vendorId: integer("vendor_id"),
  isActive: boolean("is_active").notNull().default(true),
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  created: true,
  updated: true,
});

// Vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  preferredPaymentMethod: text("preferred_payment_method"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  created: true,
  updated: true,
});

// Menu Item Ingredients
export const menuItemIngredients = pgTable("menu_item_ingredients", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  quantity: real("quantity").notNull(), // Quantity of inventory item used in this menu item
});

export const insertMenuItemIngredientSchema = createInsertSchema(menuItemIngredients).omit({
  id: true,
});

// Inventory Transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  userId: integer("user_id").notNull(),
  transactionType: text("transaction_type").notNull(), // 'restock', 'order_consumption', 'adjust', 'waste', 'transfer'
  quantity: real("quantity").notNull(), // Positive for additions, negative for removals
  orderId: integer("order_id"), // If transaction is related to an order
  notes: text("notes"),
  location: text("location").notNull(), // 'Thessaloniki', 'Mykonos'
  created: timestamp("created").defaultNow().notNull(),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  created: true,
});

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  userId: integer("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("draft"), // 'draft', 'submitted', 'confirmed', 'delivered', 'cancelled'
  deliveryDate: date("delivery_date"),
  totalCost: integer("total_cost"), // In EUR cents
  notes: text("notes"),
  location: text("location").notNull(), // 'Thessaloniki', 'Mykonos'
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  orderNumber: true,
  created: true,
  updated: true,
});

// Purchase Order Items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  quantity: real("quantity").notNull(),
  unitCost: integer("unit_cost").notNull(), // In EUR cents
  received: real("received").default(0), // How much has been received
  notes: text("notes"),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

// Export inventory types
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type MenuItemIngredient = typeof menuItemIngredients.$inferSelect;
export type InsertMenuItemIngredient = z.infer<typeof insertMenuItemIngredientSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

// Integration Settings
export const integrationSettings = pgTable("integration_settings", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // 'zapier', 'slack', 'mailchimp', etc.
  key: text("key").notNull(), // Setting name
  value: text("value").notNull(), // Setting value (stored as string, can be JSON)
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertIntegrationSettingSchema = createInsertSchema(integrationSettings).omit({
  id: true,
  created: true,
  updated: true,
});

export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSetting = z.infer<typeof insertIntegrationSettingSchema>;

// Concierge Service Requests
export const conciergeRequests = pgTable("concierge_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestType: text("request_type").notNull(),
  description: text("description").notNull(),
  deliveryDate: text("delivery_date").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  specialInstructions: text("special_instructions"),
  urgentRequest: boolean("urgent_request").default(false).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'reviewed', 'quoted', 'confirmed', 'completed', 'cancelled'
  price: real("price"), // Set by admin
  priceNotes: text("price_notes"), // Admin notes about pricing
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertConciergeRequestSchema = createInsertSchema(conciergeRequests).omit({
  id: true,
  status: true,
  price: true,
  priceNotes: true,
  created: true,
  updated: true,
});

export type ConciergeRequest = typeof conciergeRequests.$inferSelect;
export type InsertConciergeRequest = z.infer<typeof insertConciergeRequestSchema>;

// Order Status History table - for tracking detailed status changes with timestamps
export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: text("status").notNull(), // Same status values as in orders table
  notes: text("notes"), // Optional notes about the status change
  performedBy: integer("performed_by"), // User ID who changed the status
  performedByName: text("performed_by_name"), // Name of user who changed status
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({
  id: true,
  timestamp: true,
});

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;

// Order status types and helper constants
export type OrderStatus = 
  | "pending"    // Order submitted, awaiting confirmation
  | "confirmed"  // Order confirmed by operations
  | "processing" // Order is being processed by the kitchen
  | "preparing"  // Food preparation in progress
  | "ready"      // Order is ready for pickup/delivery
  | "in_transit" // Order is being delivered
  | "delivered"  // Order has been delivered
  | "cancelled"; // Order has been cancelled

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Order Submitted",
  confirmed: "Order Confirmed",
  processing: "Processing",
  preparing: "Preparing",
  ready: "Ready for Delivery",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export const orderStatusSteps: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "preparing",
  "ready",
  "in_transit",
  "delivered"
];
