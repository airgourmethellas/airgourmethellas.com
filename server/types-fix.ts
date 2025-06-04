/**
 * Railway TypeScript compilation fix
 * Ensures all types are available during build process
 */

// Re-export all types to ensure Railway build can find them
export type {
  User, InsertUser,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  MenuItem, InsertMenuItem,
  ActivityLog, InsertActivityLog,
  Airport, InsertAirport,
  AircraftType, InsertAircraftType,
  InventoryItem, InsertInventoryItem,
  Vendor, InsertVendor,
  MenuItemIngredient, InsertMenuItemIngredient,
  InventoryTransaction, InsertInventoryTransaction,
  PurchaseOrder, InsertPurchaseOrder,
  PurchaseOrderItem, InsertPurchaseOrderItem,
  OrderAnnotation, InsertOrderAnnotation,
  ConciergeRequest, InsertConciergeRequest,
  OrderStatusHistory, InsertOrderStatusHistory,
  OrderStatus
} from "@shared/schema";