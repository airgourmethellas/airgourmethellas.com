/**
 * Consistent Location-Based Pricing Utility
 * 
 * This utility ensures that the same location-based prices are used
 * consistently throughout the entire order flow process.
 */
import { MenuItem } from "@shared/schema";

// Kitchen location type
export type KitchenLocation = "Thessaloniki" | "Mykonos";

/**
 * Get the price in cents for a menu item based on kitchen location
 */
export function getItemPriceByLocation(
  item: MenuItem | undefined,
  kitchenLocation: KitchenLocation
): number {
  if (!item) return 0;
  
  // Get price from the correct location
  return kitchenLocation === "Thessaloniki" 
    ? item.priceThessaloniki 
    : item.priceMykonos;
}

/**
 * Get menu item price by ID from a list of menu items
 */
export function getMenuItemPriceByLocation(
  menuItemId: number,
  menuItems: MenuItem[] | undefined,
  kitchenLocation: KitchenLocation
): number {
  if (!menuItems) return 0;
  
  const menuItem = menuItems.find(item => item.id === menuItemId);
  return getItemPriceByLocation(menuItem, kitchenLocation);
}

/**
 * Format price from cents to euros with € symbol
 */
export function formatPriceInEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate subtotal for order items using consistent location-based pricing
 */
export function calculateSubtotalByLocation(
  orderItems: { menuItemId: number; quantity: number; price?: number }[],
  menuItems: MenuItem[] | undefined,
  kitchenLocation: KitchenLocation
): number {
  if (!menuItems || !orderItems.length) return 0;
  
  return orderItems.reduce((total, item) => {
    // If item already has a consistent price, use it directly
    if (item.price) {
      return total + (item.price * item.quantity);
    }
    
    // Otherwise get fresh price from menu items based on location
    const price = getMenuItemPriceByLocation(item.menuItemId, menuItems, kitchenLocation);
    return total + (price * item.quantity);
  }, 0);
}

/**
 * Get delivery fee in cents based on kitchen location
 */
export function getDeliveryFeeByLocation(kitchenLocation: KitchenLocation): number {
  return kitchenLocation === "Mykonos" ? 15000 : 10000; // €150 or €100
}

/**
 * Calculate total order amount (subtotal + delivery fee) in cents
 */
export function calculateTotalByLocation(
  orderItems: { menuItemId: number; quantity: number; price?: number }[],
  menuItems: MenuItem[] | undefined,
  kitchenLocation: KitchenLocation
): number {
  const subtotal = calculateSubtotalByLocation(orderItems, menuItems, kitchenLocation);
  const deliveryFee = getDeliveryFeeByLocation(kitchenLocation);
  return subtotal + deliveryFee;
}

/**
 * Applies consistent location-based pricing to all order items
 * This ensures the same prices are used throughout the entire order flow
 */
export function applyConsistentLocationPrices(
  orderItems: { menuItemId: number; quantity: number; price?: number }[],
  menuItems: MenuItem[] | undefined,
  kitchenLocation: KitchenLocation
): { menuItemId: number; quantity: number; price: number }[] {
  if (!menuItems) return orderItems as any;
  
  return orderItems.map(item => {
    const price = getMenuItemPriceByLocation(item.menuItemId, menuItems, kitchenLocation);
    
    return {
      ...item,
      price
    };
  });
}