/**
 * Price Consistency Utilities
 * 
 * Ensures prices remain consistent throughout the order flow
 */

import { MenuItem } from "@shared/schema";

// Cache to store consistent prices
const priceCache = new Map<number, number>();

/**
 * Get price for an item based on location
 */
export function getLocationBasedPrice(
  menuItem: MenuItem, 
  location: string
): number {
  if (!menuItem) return 0;
  return location === "Thessaloniki" 
    ? menuItem.priceThessaloniki 
    : menuItem.priceMykonos;
}

/**
 * Save price to cache for consistent reference
 */
export function saveConsistentPrice(menuItemId: number, price: number): void {
  priceCache.set(menuItemId, price);
  console.log(`[Price Consistency] Saved price for item #${menuItemId}: ${price} cents`);
}

/**
 * Retrieve consistent price for a menu item 
 */
export function getConsistentPrice(
  menuItemId: number, 
  menuItem?: MenuItem | null, 
  location?: string
): number {
  // Use cached price if available (for consistency)
  if (priceCache.has(menuItemId)) {
    return priceCache.get(menuItemId) || 0;
  }
  
  // Calculate and cache price if menu item and location provided
  if (menuItem && location) {
    const price = getLocationBasedPrice(menuItem, location);
    saveConsistentPrice(menuItemId, price);
    return price;
  }
  
  return 0;
}

/**
 * Format price from cents to euros
 */
export function formatEuroPrice(cents: number): string {
  // Handle undefined or null values
  if (cents === undefined || cents === null) {
    return "€0.00";
  }
  
  // Ensure we're dealing with a number
  const numericValue = typeof cents === 'string' ? parseInt(cents, 10) : cents;
  
  // Convert from cents to euros and format with 2 decimal places
  return `€${(numericValue / 100).toFixed(2)}`;
}

/**
 * Get delivery fee based on location
 */
export function getDeliveryFee(location: string): number {
  return location === "Mykonos" ? 15000 : 10000; // €150 or €100
}

/**
 * Calculate subtotal from order items
 */
export function calculateSubtotal(items: any[]): number {
  return items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (itemPrice * quantity);
  }, 0);
}

/**
 * Calculate total with delivery fee
 */
export function calculateTotal(items: any[], location: string): number {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = getDeliveryFee(location);
  return subtotal + deliveryFee;
}

/**
 * Apply consistent prices to all items
 */
export function applyConsistentPrices(
  items: any[], 
  menuItems: MenuItem[] | null, 
  location: string
): any[] {
  if (!items || !items.length || !menuItems || !menuItems.length) {
    return items;
  }
  
  return items.map(item => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    const consistentPrice = getConsistentPrice(item.menuItemId, menuItem, location);
    
    return {
      ...item,
      price: consistentPrice
    };
  });
}