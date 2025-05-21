/**
 * Location-Based Pricing Utility
 * 
 * This utility ensures consistent pricing across all stages of the order process
 * by centralizing the price lookup logic based on the selected location.
 */
import { MenuItem } from "@shared/schema";

export type Location = "SKG" | "JMK"; // SKG = Thessaloniki, JMK = Mykonos

/**
 * Get the correct price for a menu item based on location
 */
export function getItemPriceByLocation(
  menuItem: MenuItem | undefined, 
  location: Location
): number {
  if (!menuItem) return 0;
  
  // Return the location-specific price
  if (location === "JMK") {
    return menuItem.priceMykonos / 100; // Convert cents to euros
  } else {
    return menuItem.priceThessaloniki / 100; // Convert cents to euros
  }
}

/**
 * Get the price for a menu item ID based on location and menu items list
 */
export function getMenuItemPriceByLocation(
  menuItemId: number,
  menuItems: MenuItem[] | undefined,
  location: Location
): number {
  if (!menuItems) return 0;
  const menuItem = menuItems.find(item => item.id === menuItemId);
  return getItemPriceByLocation(menuItem, location);
}

/**
 * Calculate subtotal for a list of order items based on location
 */
export function calculateOrderSubtotal(
  orderItems: { menuItemId: number; quantity: number }[],
  menuItems: MenuItem[] | undefined,
  location: Location
): number {
  if (!menuItems || !orderItems.length) return 0;
  
  return orderItems.reduce((total, item) => {
    const price = getMenuItemPriceByLocation(item.menuItemId, menuItems, location);
    return total + (price * item.quantity);
  }, 0);
}

/**
 * Get delivery fee based on location (in euros)
 */
export function getDeliveryFee(location: Location): number {
  return location === "JMK" ? 150.00 : 100.00;
}

/**
 * Calculate total order cost (subtotal + delivery fee)
 */
export function calculateOrderTotal(
  orderItems: { menuItemId: number; quantity: number }[],
  menuItems: MenuItem[] | undefined,
  location: Location
): number {
  const subtotal = calculateOrderSubtotal(orderItems, menuItems, location);
  const deliveryFee = getDeliveryFee(location);
  return subtotal + deliveryFee;
}