/**
 * Price Consistency Utility
 * 
 * Ensures the same price is used throughout the entire order flow
 * Fixes the issue where an item shows different prices on different screens
 */

// Cache to store prices by menu item ID to ensure they stay consistent
const priceCache = new Map();

/**
 * Store a price for a menu item to ensure consistency
 */
export function storePriceForItem(menuItemId, price) {
  priceCache.set(menuItemId, price);
  console.log(`[PriceConsistency] Stored price for item #${menuItemId}: ${price} cents (€${(price/100).toFixed(2)})`);
}

/**
 * Get the stored consistent price for a menu item
 * If not stored, calculate based on location
 */
export function getConsistentPrice(menuItemId, menuItem = null, location = null) {
  // If we have a cached price, use it for consistency
  if (priceCache.has(menuItemId)) {
    return priceCache.get(menuItemId);
  }
  
  // Calculate and store price if possible
  if (menuItem && location) {
    const price = location === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
      
    storePriceForItem(menuItemId, price);
    return price;
  }
  
  // Default to 0 if no price info available
  return 0;
}

/**
 * Apply consistent prices to all items in the order
 */
export function ensureConsistentPrices(orderItems, menuItems = null, location = null) {
  if (!orderItems || !orderItems.length) return orderItems;
  
  return orderItems.map(item => {
    const menuItem = menuItems ? 
      menuItems.find(mi => mi.id === item.menuItemId) : 
      null;
    
    const price = getConsistentPrice(item.menuItemId, menuItem, location);
    
    return {
      ...item,
      price
    };
  });
}

/**
 * Format price from cents to euros
 */
export function formatCurrency(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate subtotal from order items
 */
export function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Clear price cache (useful when changing location)
 */
export function clearPriceCache() {
  priceCache.clear();
  console.log("[PriceConsistency] Price cache cleared");
}