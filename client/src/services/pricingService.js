/**
 * Pricing Service
 * 
 * A centralized service for handling all pricing logic consistently throughout the application.
 * This service maintains pricing state to ensure the same prices are displayed at every step
 * of the order process.
 */

// Global state to store pricing configuration
let pricingState = {
  kitchenLocation: null, // Either "Thessaloniki" or "Mykonos"
  menuItems: [],         // Cache of all menu items
  selectedItems: [],     // Currently selected items with consistent pricing
  subtotal: 0,           // Calculated subtotal in cents
  deliveryFee: 0,        // Delivery fee in cents
  total: 0               // Total price in cents
};

/**
 * Set the kitchen location for pricing calculations
 */
export function setKitchenLocation(location) {
  // Only accept valid locations
  if (location !== "Thessaloniki" && location !== "Mykonos") {
    console.error(`Invalid kitchen location: ${location}. Using default: Thessaloniki`);
    location = "Thessaloniki";
  }
  
  pricingState.kitchenLocation = location;
  console.log(`[PricingService] Kitchen location set to: ${location}`);
  
  // Update delivery fee when location changes
  updateDeliveryFee();
  
  // Recalculate prices if we have items
  if (pricingState.selectedItems.length > 0) {
    recalculateItemPrices();
  }
  
  return pricingState;
}

/**
 * Set the menu items cache
 */
export function setMenuItems(items) {
  if (!items || !Array.isArray(items)) {
    console.error("[PricingService] Invalid menu items provided");
    return;
  }
  
  pricingState.menuItems = items;
  console.log(`[PricingService] Menu items cache updated with ${items.length} items`);
  
  // Recalculate prices if we have selected items
  if (pricingState.selectedItems.length > 0) {
    recalculateItemPrices();
  }
  
  return pricingState;
}

/**
 * Get the menu item by ID
 */
export function getMenuItem(menuItemId) {
  return pricingState.menuItems.find(item => item.id === menuItemId);
}

/**
 * Get the correct location-based price for a menu item in cents
 */
export function getItemPrice(menuItemId) {
  const item = getMenuItem(menuItemId);
  if (!item) {
    console.warn(`[PricingService] Menu item not found: ${menuItemId}`);
    return 0;
  }
  
  // Return location-specific price
  if (pricingState.kitchenLocation === "Mykonos") {
    return item.priceMykonos;
  } else {
    return item.priceThessaloniki;
  }
}

/**
 * Update the delivery fee based on kitchen location
 */
export function updateDeliveryFee() {
  // Set the appropriate delivery fee based on kitchen location
  pricingState.deliveryFee = pricingState.kitchenLocation === "Mykonos" ? 15000 : 10000; // €150 or €100
  
  // Update the total price
  pricingState.total = pricingState.subtotal + pricingState.deliveryFee;
  
  console.log(`[PricingService] Delivery fee updated to ${formatPrice(pricingState.deliveryFee)} for ${pricingState.kitchenLocation}`);
  
  return pricingState.deliveryFee;
}

/**
 * Recalculate prices for all selected items
 */
function recalculateItemPrices() {
  // Ensure we have a kitchen location set
  if (!pricingState.kitchenLocation) {
    console.error("[PricingService] Cannot calculate prices - kitchen location not set");
    return pricingState;
  }
  
  // Apply location-based pricing to each item
  pricingState.selectedItems = pricingState.selectedItems.map(item => {
    const price = getItemPrice(item.menuItemId);
    return { ...item, price };
  });
  
  // Recalculate the subtotal
  calculateSubtotal();
  
  return pricingState;
}

/**
 * Format a price from cents to euros with € symbol
 */
export function formatPrice(cents) {
  const euros = cents / 100;
  return `€${euros.toFixed(2)}`;
}

/**
 * Calculate the subtotal from selected items
 */
export function calculateSubtotal() {
  pricingState.subtotal = pricingState.selectedItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Update the total price
  pricingState.total = pricingState.subtotal + pricingState.deliveryFee;
  
  console.log(`[PricingService] Subtotal calculated: ${formatPrice(pricingState.subtotal)}`);
  
  return pricingState.subtotal;
}

/**
 * Set the selected items and apply consistent pricing
 */
export function setSelectedItems(items) {
  if (!items || !Array.isArray(items)) {
    console.error("[PricingService] Invalid items provided");
    return;
  }
  
  // Clone the items to avoid reference issues
  pricingState.selectedItems = JSON.parse(JSON.stringify(items));
  
  // Apply location-based pricing to each item
  recalculateItemPrices();
  
  console.log(`[PricingService] Selected items updated: ${items.length} items`);
  console.log("[PricingService] Current state:", {
    location: pricingState.kitchenLocation,
    itemCount: pricingState.selectedItems.length,
    subtotal: formatPrice(pricingState.subtotal),
    deliveryFee: formatPrice(pricingState.deliveryFee),
    total: formatPrice(pricingState.total)
  });
  
  return pricingState;
}

/**
 * Get all current pricing information
 */
export function getPricingState() {
  return {
    ...pricingState,
    subtotalFormatted: formatPrice(pricingState.subtotal),
    deliveryFeeFormatted: formatPrice(pricingState.deliveryFee),
    totalFormatted: formatPrice(pricingState.total)
  };
}

/**
 * Reset the pricing state
 */
export function resetPricingState() {
  pricingState = {
    kitchenLocation: null,
    menuItems: [],
    selectedItems: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0
  };
  
  console.log("[PricingService] Pricing state reset");
  
  return pricingState;
}