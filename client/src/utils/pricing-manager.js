/**
 * Pricing Manager
 * 
 * A centralized module for consistent pricing throughout the order flow.
 * This ensures prices remain the same from menu selection to final checkout.
 */

// Global state to store pricing configuration
let pricingState = {
  kitchenLocation: "Thessaloniki", // Default location
  menuItems: null,                // Cache of all menu items
  selectedItems: [],              // Items with consistent pricing
  subtotalCents: 0,               // Subtotal in cents
  deliveryFeeCents: 15000,        // Default €150.00 delivery fee
  totalCents: 0                   // Total in cents
};

/**
 * Set kitchen location (Thessaloniki or Mykonos)
 * This affects all price calculations
 */
export function setKitchenLocation(location) {
  if (location !== "Thessaloniki" && location !== "Mykonos") {
    console.warn(`Invalid location: ${location}. Using default.`);
    return;
  }
  
  pricingState.kitchenLocation = location;
  console.log(`[PricingManager] Location set: ${location}`);
  
  // Update delivery fee based on location
  pricingState.deliveryFeeCents = location === "Mykonos" ? 15000 : 10000;
  
  // Recalculate prices if we have items
  if (pricingState.selectedItems.length > 0 && pricingState.menuItems) {
    recalculateItemPrices();
  }
}

/**
 * Set the menu items data
 */
export function setMenuItems(items) {
  pricingState.menuItems = items;
  console.log(`[PricingManager] Menu items loaded: ${items?.length || 0}`);
  
  // Recalculate if we have selected items
  if (pricingState.selectedItems.length > 0) {
    recalculateItemPrices();
  }
}

/**
 * Add/update items in the order with consistent pricing
 */
export function updateOrderItems(items) {
  if (!items || !Array.isArray(items)) return;
  
  // Apply consistent pricing to items
  const updatedItems = applyConsistentPricing(items);
  pricingState.selectedItems = updatedItems;
  
  // Calculate totals
  calculateTotals();
  
  console.log(`[PricingManager] Order updated: ${items.length} items`);
  return pricingState.selectedItems;
}

/**
 * Apply consistent location-based pricing to items
 */
function applyConsistentPricing(items) {
  if (!pricingState.menuItems) return items;
  
  return items.map(item => {
    // If item already has correct price, keep it
    if (item.price) return item;
    
    // Find the menu item
    const menuItem = pricingState.menuItems.find(mi => mi.id === item.menuItemId);
    if (!menuItem) return item;
    
    // Apply location-specific price
    const price = pricingState.kitchenLocation === "Thessaloniki" 
      ? menuItem.priceThessaloniki
      : menuItem.priceMykonos;
      
    return { ...item, price };
  });
}

/**
 * Recalculate prices for all selected items
 */
function recalculateItemPrices() {
  pricingState.selectedItems = applyConsistentPricing(pricingState.selectedItems);
  calculateTotals();
}

/**
 * Calculate subtotal and total
 */
function calculateTotals() {
  // Calculate subtotal in cents
  pricingState.subtotalCents = pricingState.selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  // Calculate total with delivery fee
  pricingState.totalCents = pricingState.subtotalCents + pricingState.deliveryFeeCents;
  
  console.log(`[PricingManager] Calculated: subtotal ${formatPrice(pricingState.subtotalCents)}, total ${formatPrice(pricingState.totalCents)}`);
}

/**
 * Format price from cents to euros with € symbol
 */
export function formatPrice(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Get all pricing information
 */
export function getPricingInfo() {
  return {
    location: pricingState.kitchenLocation,
    items: pricingState.selectedItems,
    subtotalCents: pricingState.subtotalCents,
    subtotal: formatPrice(pricingState.subtotalCents),
    deliveryFeeCents: pricingState.deliveryFeeCents,
    deliveryFee: formatPrice(pricingState.deliveryFeeCents),
    totalCents: pricingState.totalCents,
    total: formatPrice(pricingState.totalCents)
  };
}

/**
 * Reset pricing state (use when starting a new order)
 */
export function resetPricing() {
  pricingState = {
    kitchenLocation: "Thessaloniki",
    menuItems: pricingState.menuItems, // Keep menu items cache
    selectedItems: [],
    subtotalCents: 0,
    deliveryFeeCents: 15000,
    totalCents: 0
  };
  console.log("[PricingManager] Pricing state reset");
}