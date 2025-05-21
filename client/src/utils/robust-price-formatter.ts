/**
 * Robust Price Formatter
 * 
 * This utility provides consistent price formatting across the application
 * ensuring correct handling of prices stored in cents vs euros.
 */

/**
 * Smart price formatter that handles multiple types of input:
 * - Detects whether price is likely in cents or euros
 * - Returns a properly formatted string with € symbol
 */
export function smartFormatPrice(price: number): string {
  // Check if price is likely in cents (value > 100 euros)
  if (price > 100 && Number.isInteger(price)) {
    return formatPriceFromCents(price);
  }
  // Otherwise format as euros
  return formatPriceInEuros(price);
}

/**
 * Format a price from cents to euros with proper symbol and formatting
 * @param cents Price in cents (integer)
 * @returns Formatted price string with Euro symbol (€)
 */
export function formatPriceFromCents(cents: number): string {
  // Convert cents to euros (divide by 100)
  const euros = cents / 100;
  return `€${euros.toFixed(2)}`;
}

/**
 * Format a price that's already in euros
 * @param euros Price in euros (decimal)
 * @returns Formatted price string with Euro symbol (€)
 */
export function formatPriceInEuros(euros: number): string {
  return `€${euros.toFixed(2)}`;
}

/**
 * Format a price that could be in either cents or euros
 * Based on magnitude (if > 100, assumed to be cents)
 * @param price Price value
 * @returns Formatted price string with Euro symbol (€)
 */
export function formatPrice(price: number): string {
  // Check if price is likely in cents (value > 100 euros)
  // This heuristic works for most menu items where prices
  // are unlikely to be over €100
  if (price > 100) {
    return formatPriceFromCents(price);
  }
  // Otherwise format as euros
  return formatPriceInEuros(price);
}

/**
 * Ensures a price value is in euros, converting from cents if needed
 * @param price Price that could be in cents or euros
 * @returns Price in euros (decimal)
 */
export function ensureEuros(price: number): number {
  // If value is likely in cents (large integer), convert to euros
  if (price > 100 && Number.isInteger(price)) {
    return price / 100;
  }
  // Otherwise return as is (already in euros)
  return price;
}

/**
 * Calculate a proper subtotal from a list of items with prices in cents
 * @param items Array of items with price (in cents) and quantity
 * @returns Subtotal in euros (decimal)
 */
export function calculateSubtotalFromCents(
  items: Array<{ price: number; quantity: number }>
): number {
  const subtotalInCents = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return subtotalInCents / 100; // Convert to euros
}

/**
 * Get a properly formatted price string for a menu item
 * @param menuItem Menu item with priceThessaloniki or priceMykonos in cents
 * @param location "Thessaloniki" or "Mykonos"
 * @returns Formatted price string
 */
export function getFormattedMenuItemPrice(
  menuItem: { priceThessaloniki: number; priceMykonos: number } | undefined,
  location: "Thessaloniki" | "Mykonos" = "Thessaloniki"
): string {
  if (!menuItem) return "€0.00";
  
  const priceInCents = 
    location === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
      
  return formatPriceFromCents(priceInCents);
}

/**
 * Get the numeric price in euros for a menu item
 * @param menuItem Menu item with priceThessaloniki or priceMykonos in cents
 * @param location "Thessaloniki" or "Mykonos"
 * @returns Price in euros (decimal)
 */
export function getMenuItemPriceInEuros(
  menuItem: { priceThessaloniki: number; priceMykonos: number } | undefined,
  location: "Thessaloniki" | "Mykonos" = "Thessaloniki"
): number {
  if (!menuItem) return 0;
  
  const priceInCents = 
    location === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
      
  return priceInCents / 100;
}