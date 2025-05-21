/**
 * Price Consistency Utility
 * 
 * This utility ensures the same prices are used consistently throughout 
 * the entire order flow process.
 */

// Store cached prices by menu item ID to ensure consistency
const itemPriceCache = new Map();

// Store the selected location for consistent pricing
let selectedLocation = "Thessaloniki"; // Default

/**
 * Set the kitchen/delivery location
 * @param {string} location - "Thessaloniki" or "Mykonos"
 */
export function setLocation(location) {
  if (location === "Thessaloniki" || location === "Mykonos") {
    console.log(`[PriceConsistency] Setting location to: ${location}`);
    selectedLocation = location;
    return true;
  }
  return false;
}

/**
 * Get current location
 * @returns {string} Current location
 */
export function getLocation() {
  return selectedLocation;
}

/**
 * Store a price for a menu item to ensure it's used consistently
 * @param {number} menuItemId - Menu item ID
 * @param {number} price - Price in cents
 */
export function cacheItemPrice(menuItemId, price) {
  itemPriceCache.set(menuItemId, price);
  console.log(`[PriceConsistency] Cached price for item #${menuItemId}: ${price} cents (€${(price/100).toFixed(2)})`);
}

/**
 * Get cached price for a menu item (if available)
 * @param {number} menuItemId - Menu item ID
 * @param {object|null} menuItem - Optional menu item object with location prices
 * @returns {number} Price in cents
 */
export function getItemPrice(menuItemId, menuItem = null) {
  // If price is already cached, use it for consistency
  if (itemPriceCache.has(menuItemId)) {
    return itemPriceCache.get(menuItemId);
  }
  
  // Otherwise calculate fresh price based on location
  if (menuItem) {
    const price = selectedLocation === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
    
    // Cache it for future use
    cacheItemPrice(menuItemId, price);
    return price;
  }
  
  console.warn(`[PriceConsistency] No price found for item #${menuItemId}`);
  return 0;
}

/**
 * Get delivery fee based on location
 * @returns {number} Delivery fee in cents
 */
export function getDeliveryFee() {
  return selectedLocation === "Mykonos" ? 15000 : 10000; // €150 or €100
}

/**
 * Reset price cache (use when starting new order)
 */
export function resetPriceCache() {
  itemPriceCache.clear();
  console.log("[PriceConsistency] Price cache has been reset");
}

/**
 * Format price from cents to euros
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price with € symbol
 */
export function formatPrice(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}