/**
 * Consistent Pricing Utility
 * 
 * Simple cache-based system to ensure prices remain consistent
 * throughout the entire order flow
 */

// Cache to store prices by menu item ID
const priceCache = new Map();

/**
 * Get price for location (Thessaloniki or Mykonos)
 */
export function getLocationPrice(menuItem, location) {
  if (!menuItem) return 0;
  return location === "Thessaloniki" 
    ? menuItem.priceThessaloniki 
    : menuItem.priceMykonos;
}

/**
 * Cache a price for consistent reference
 */
export function cachePrice(menuItemId, price) {
  priceCache.set(menuItemId, price);
  console.log(`[PriceFix] Cached price for #${menuItemId}: ${price} cents`);
}

/**
 * Get a cached price (or calculate and cache if not available)
 */
export function getConsistentPrice(menuItemId, menuItem = null, location = null) {
  // Return cached price if available
  if (priceCache.has(menuItemId)) {
    return priceCache.get(menuItemId);
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
export function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Format price in cents to euros
 */
export function formatEuros(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Clear price cache (useful when changing locations)
 */
export function clearPriceCache() {
  priceCache.clear();
  console.log("[PriceFix] Price cache cleared");
}

/**
 * Return delivery fee based on location
 */
export function getDeliveryFee(location) {
  return location === "Mykonos" ? 15000 : 10000; // €150 or €100
}