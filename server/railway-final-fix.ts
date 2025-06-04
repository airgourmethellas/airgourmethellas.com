/**
 * Final comprehensive TypeScript compilation fix for Railway deployment
 * Addresses all remaining type errors and null safety issues
 */

// Fix for null rowCount checks
export function safeRowCount(result: { rowCount: number | null }): boolean {
  return (result.rowCount ?? 0) > 0;
}

// Fix for database insertion array issue
export function ensureOrderDataArray(orderData: any): any[] {
  return Array.isArray(orderData) ? orderData : [orderData];
}

// Fix for undefined to null type conversion
export function convertUndefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

// Type-safe property access helpers
export function getOrderProperty(order: any, property: string, defaultValue: any = null): any {
  return order && typeof order === 'object' && property in order 
    ? order[property] 
    : defaultValue;
}

export function getItemProperty(item: any, property: string, defaultValue: any = null): any {
  return item && typeof item === 'object' && property in item 
    ? item[property] 
    : defaultValue;
}

// Railway-compatible order creation helper
export function createRailwayCompatibleOrder(orderData: any): any {
  return {
    ...orderData,
    arrivalAirport: convertUndefinedToNull(orderData.arrivalAirport),
    specialNotes: convertUndefinedToNull(orderData.specialNotes),
    updated: new Date()
  };
}

// Railway-compatible menu item creation helper
export function createRailwayCompatibleMenuItem(itemData: any): any {
  return {
    ...itemData,
    imageUrl: convertUndefinedToNull(itemData.imageUrl),
    unit: convertUndefinedToNull(itemData.unit)
  };
}

// Railway-compatible activity log creation helper
export function createRailwayCompatibleActivityLog(logData: any): any {
  return {
    ...logData,
    resourceId: convertUndefinedToNull(logData.resourceId),
    resourceType: convertUndefinedToNull(logData.resourceType)
  };
}

// Railway-compatible inventory item creation helper
export function createRailwayCompatibleInventoryItem(itemData: any): any {
  return {
    ...itemData,
    description: convertUndefinedToNull(itemData.description),
    inStock: itemData.inStock ?? 0,
    reorderPoint: itemData.reorderPoint ?? 0,
    idealStock: itemData.idealStock ?? 0,
    supplier: convertUndefinedToNull(itemData.supplier),
    lastDelivery: convertUndefinedToNull(itemData.lastDelivery),
    isActive: itemData.isActive ?? true
  };
}

// Railway-compatible vendor creation helper
export function createRailwayCompatibleVendor(vendorData: any): any {
  return {
    ...vendorData,
    email: convertUndefinedToNull(vendorData.email),
    phone: convertUndefinedToNull(vendorData.phone),
    notes: convertUndefinedToNull(vendorData.notes),
    isActive: vendorData.isActive ?? true,
    contactName: convertUndefinedToNull(vendorData.contactName),
    address: convertUndefinedToNull(vendorData.address),
    preferredPaymentMethod: convertUndefinedToNull(vendorData.preferredPaymentMethod)
  };
}

// Railway-compatible inventory transaction creation helper
export function createRailwayCompatibleInventoryTransaction(transactionData: any): any {
  return {
    ...transactionData,
    orderId: convertUndefinedToNull(transactionData.orderId),
    notes: convertUndefinedToNull(transactionData.notes)
  };
}

// Railway-compatible purchase order creation helper
export function createRailwayCompatiblePurchaseOrder(orderData: any): any {
  return {
    ...orderData,
    status: orderData.status ?? "pending",
    deliveryDate: convertUndefinedToNull(orderData.deliveryDate),
    notes: convertUndefinedToNull(orderData.notes),
    totalCost: convertUndefinedToNull(orderData.totalCost)
  };
}

// Railway-compatible purchase order item creation helper
export function createRailwayCompatiblePurchaseOrderItem(itemData: any): any {
  return {
    ...itemData,
    received: convertUndefinedToNull(itemData.received),
    notes: convertUndefinedToNull(itemData.notes)
  };
}

// Date string conversion helpers
export function convertDateToString(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString();
}

// Array iteration helpers for Railway compatibility
export function mapToArray<T>(map: Map<any, T>): T[] {
  return Array.from(map.values());
}

export function mapEntriesToArray<K, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries());
}

// Type guard for order templates (removes invalid references)
export function isValidOrderData(data: any): boolean {
  return data && typeof data === 'object' && !('OrderTemplate' in data);
}

export default {
  safeRowCount,
  ensureOrderDataArray,
  convertUndefinedToNull,
  getOrderProperty,
  getItemProperty,
  createRailwayCompatibleOrder,
  createRailwayCompatibleMenuItem,
  createRailwayCompatibleActivityLog,
  createRailwayCompatibleInventoryItem,
  createRailwayCompatibleVendor,
  createRailwayCompatibleInventoryTransaction,
  createRailwayCompatiblePurchaseOrder,
  createRailwayCompatiblePurchaseOrderItem,
  convertDateToString,
  mapToArray,
  mapEntriesToArray,
  isValidOrderData
};