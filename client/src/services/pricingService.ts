/**
 * Pricing Service
 * 
 * A centralized service for handling all pricing logic throughout the application.
 * This ensures consistent pricing across all steps of the order flow.
 */
import { MenuItem } from "@shared/schema";

export type KitchenLocation = "Thessaloniki" | "Mykonos";
export type OrderItem = {
  menuItemId: number;
  quantity: number;
  price?: number;
  specialInstructions?: string | null;
  name?: string;
};

// Cache for menu items to avoid refetching
let menuItemsCache: MenuItem[] | null = null;

// Store currently selected kitchen location
let currentKitchenLocation: KitchenLocation = "Thessaloniki";

// Set the active kitchen location
export function setKitchenLocation(location: KitchenLocation) {
  console.log(`[PricingService] Setting kitchen location to: ${location}`);
  currentKitchenLocation = location;
}

// Get the active kitchen location
export function getKitchenLocation(): KitchenLocation {
  return currentKitchenLocation;
}

// Set the menu items cache
export function setMenuItems(items: MenuItem[]) {
  menuItemsCache = items;
}

// Get menu item by ID
export function getMenuItem(menuItemId: number): MenuItem | undefined {
  return menuItemsCache?.find(item => item.id === menuItemId);
}

// Get menu item name by ID
export function getMenuItemName(menuItemId: number): string {
  const item = getMenuItem(menuItemId);
  return item?.name || `Item #${menuItemId}`;
}

/**
 * Get the raw price in cents for a menu item based on the current kitchen location
 */
export function getMenuItemPrice(menuItemId: number): number {
  const item = getMenuItem(menuItemId);
  if (!item) return 0;
  
  return currentKitchenLocation === "Thessaloniki" 
    ? item.priceThessaloniki 
    : item.priceMykonos;
}

/**
 * Format a price from cents to euros with € symbol
 */
export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return `€${euros.toFixed(2)}`;
}

/**
 * Get a formatted price string for a menu item
 */
export function getFormattedPrice(menuItemId: number): string {
  const price = getMenuItemPrice(menuItemId);
  return formatPrice(price);
}

/**
 * Calculate subtotal for an order in cents
 */
export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    // If item has a predefined price, use it
    if (item.price) {
      return total + (item.price * item.quantity);
    }
    
    // Otherwise get fresh price from service
    const price = getMenuItemPrice(item.menuItemId);
    return total + (price * item.quantity);
  }, 0);
}

/**
 * Get the delivery fee in cents based on kitchen location
 */
export function getDeliveryFee(): number {
  return 15000; // €150 for both locations
}

/**
 * Calculate the total order price in cents
 */
export function calculateTotal(items: OrderItem[]): number {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = getDeliveryFee();
  return subtotal + deliveryFee;
}

/**
 * Ensure consistent pricing for all items in an order
 * This applies the correct location-based price to each item
 */
export function applyConsistentPricing(items: OrderItem[]): OrderItem[] {
  return items.map(item => {
    if (item.price) return item; // Already has a price
    
    const price = getMenuItemPrice(item.menuItemId);
    return {
      ...item,
      price
    };
  });
}

/**
 * Debug current pricing state
 */
export function currentPricing() {
  return {
    kitchenLocation: currentKitchenLocation,
    deliveryFee: getDeliveryFee(),
    deliveryFeeFormatted: formatPrice(getDeliveryFee()),
    menuItemsLoaded: menuItemsCache ? menuItemsCache.length : 0
  };
}