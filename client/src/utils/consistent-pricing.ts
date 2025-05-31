/**
 * Consistent Pricing Utility
 * 
 * Simple cache-based system to ensure prices remain consistent
 * throughout the entire order flow
 */

import { MenuItem } from "@shared/schema";

// Cache to store prices by menu item ID
const priceCache = new Map<number, number>();

/**
 * Get price for location (Thessaloniki or Mykonos)
 */
export function getLocationPrice(menuItem: MenuItem, location: string): number {
  if (!menuItem) return 0;
  return location === "Thessaloniki" 
    ? menuItem.priceThessaloniki 
    : menuItem.priceMykonos;
}

/**
 * Cache a price for consistent reference
 */
export function cachePrice(menuItemId: number, price: number): void {
  priceCache.set(menuItemId, price);
  console.log(`[PriceFix] Cached price for #${menuItemId}: ${price} cents`);
}

/**
 * Get a cached price (or calculate and cache if not available)
 */
export function getConsistentPrice(
  menuItemId: number, 
  menuItem: MenuItem | null = null, 
  location: string | null = null
): number {
  // Return cached price if available
  if (priceCache.has(menuItemId)) {
    return priceCache.get(menuItemId) || 0;
  }
  
  // Calculate and cache if we have the menu item and location
  if (menuItem && location) {
    const price = getLocationPrice(menuItem, location);
    cachePrice(menuItemId, price);
    return price;
  }
  
  return 0;
}

/**
 * Calculate order subtotal
 */
export function calculateSubtotal(items: any[]): number {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Format price in cents to euros
 */
export function formatEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Clear price cache (useful when changing locations)
 */
export function clearPriceCache(): void {
  priceCache.clear();
  console.log("[PriceFix] Price cache cleared");
}

/**
 * Return delivery fee based on location
 */
export function getDeliveryFee(location: string): number {
  return 15000; // €150 for both locations
}