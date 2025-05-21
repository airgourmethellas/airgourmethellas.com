/**
 * Order Pricing Utilities
 * 
 * Ensures consistent pricing throughout the order flow
 */

// Store cached prices by menu item ID
const itemPriceCache = new Map();

/**
 * Get the correct price for a menu item based on location
 * @param {Object} menuItem - The menu item object
 * @param {string} location - "Thessaloniki" or "Mykonos"
 * @returns {number} Price in cents
 */
export function getLocationPrice(menuItem, location) {
  if (!menuItem) return 0;
  
  // Use price from selected location
  return location === "Thessaloniki" 
    ? menuItem.priceThessaloniki 
    : menuItem.priceMykonos;
}

/**
 * Store a consistent price for a menu item
 * @param {number} menuItemId - The menu item ID
 * @param {number} price - Price in cents
 */
export function cacheItemPrice(menuItemId, price) {
  itemPriceCache.set(menuItemId, price);
  console.log(`[Price] Cached price for item #${menuItemId}: ${price} cents (€${(price/100).toFixed(2)})`);
}

/**
 * Get cached price for an item (ensures consistent pricing)
 * @param {number} menuItemId - The menu item ID
 * @param {Object} menuItem - Optional menu item to calculate price if not cached
 * @param {string} location - Optional location if calculating price
 * @returns {number} Price in cents
 */
export function getConsistentPrice(menuItemId, menuItem = null, location = null) {
  // Return cached price if available to ensure consistency
  if (itemPriceCache.has(menuItemId)) {
    return itemPriceCache.get(menuItemId);
  }
  
  // Calculate price if menu item provided
  if (menuItem && location) {
    const price = getLocationPrice(menuItem, location);
    cacheItemPrice(menuItemId, price);
    return price;
  }
  
  return 0;
}

/**
 * Get delivery fee based on location
 * @param {string} location - "Thessaloniki" or "Mykonos"
 * @returns {number} Fee in cents
 */
export function getDeliveryFee(location) {
  return location === "Mykonos" ? 15000 : 10000; // €150 or €100
}

/**
 * Apply consistent prices to all items in an order
 * @param {Array} items - Order items array
 * @param {Array} menuItems - Available menu items
 * @param {string} location - "Thessaloniki" or "Mykonos"
 * @returns {Array} Items with consistent prices
 */
export function applyConsistentPricing(items, menuItems, location) {
  if (!menuItems || !menuItems.length) return items;
  
  return items.map(item => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    
    // Use cached price if available, or calculate and cache new price
    const price = getConsistentPrice(item.menuItemId, menuItem, location);
    
    return { ...item, price };
  });
}

/**
 * Calculate subtotal for items
 * @param {Array} items - Order items with prices
 * @returns {number} Subtotal in cents
 */
export function calculateSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Format price from cents to euros string
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price with euro symbol
 */
export function formatPrice(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}