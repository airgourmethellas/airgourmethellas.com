/**
 * Price Store - Central pricing solution for consistent prices across screens
 * 
 * This module ensures the same prices are used throughout the order flow,
 * solving the issue where prices appear differently on different screens
 * (e.g. Bagels showing €9.00 on one screen and €5.00 on another)
 */

// Cache to store fixed prices by menu item ID
const priceCache = new Map();

/**
 * Store a price for a menu item to ensure it stays consistent
 * throughout the entire order flow
 */
export function storeMenuItemPrice(menuItemId, price) {
  priceCache.set(menuItemId, price);
  console.log(`[PriceStore] Stored consistent price for item #${menuItemId}: ${price} cents (€${(price/100).toFixed(2)})`);
}

/**
 * Get a consistent price for a menu item
 * If previously stored, returns the stored price
 * Otherwise calculates and stores it based on location
 */
export function getMenuItemPrice(menuItemId, menuItem = null, location = null) {
  // Return stored price if available to ensure consistency
  if (priceCache.has(menuItemId)) {
    return priceCache.get(menuItemId);
  }
  
  // If menuItem and location provided, calculate and store price
  if (menuItem && location) {
    const price = location === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
      
    storeMenuItemPrice(menuItemId, price);
    return price;
  }
  
  // Default to 0 if no price information available
  return 0;
}

/**
 * Apply consistent prices to all order items
 */
export function applyConsistentPrices(orderItems, menuItems = null, location = null) {
  if (!orderItems || !orderItems.length) return orderItems;
  
  return orderItems.map(item => {
    // Find matching menu item if available
    const menuItem = menuItems ? 
      menuItems.find(mi => mi.id === item.menuItemId) : 
      null;
    
    // Get consistent price
    const price = getMenuItemPrice(item.menuItemId, menuItem, location);
    
    // Return item with consistent price
    return {
      ...item,
      price
    };
  });
}

/**
 * Calculate subtotal using consistent prices
 */
export function calculateSubtotal(orderItems) {
  return orderItems.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (itemPrice * quantity);
  }, 0);
}

/**
 * Calculate delivery fee based on location
 */
export function getDeliveryFee(location) {
  return location === "Mykonos" ? 15000 : 10000; // €150 or €100
}

/**
 * Calculate total with delivery fee
 */
export function calculateTotal(orderItems, location) {
  const subtotal = calculateSubtotal(orderItems);
  const deliveryFee = getDeliveryFee(location);
  return subtotal + deliveryFee;
}

/**
 * Format price from cents to euros
 */
export function formatEuros(cents) {
  if (cents === undefined || cents === null) return "€0.00";
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Clear price cache (use when changing locations)
 */
export function clearPriceCache() {
  priceCache.clear();
  console.log("[PriceStore] Price cache cleared");
}