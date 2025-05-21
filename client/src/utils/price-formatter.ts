/**
 * Utility functions to handle price formatting consistently across the application
 * 
 * IMPORTANT: All prices in the database are stored as integer cents
 * Example: 300 cents in the database = €3.00 displayed to the user
 */

/**
 * Convert cents to euros (without formatting)
 * Example: 
 *   300 cents → 3.00 euros
 *   1250 cents → 12.50 euros
 *   5000 cents → 50.00 euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Format a price in cents to a euros string with 2 decimal places (no symbol)
 * Example: 
 *   300 → "3.00"
 *   1250 → "12.50"
 *   5000 → "50.00"
 */
export function formatPrice(cents: number): string {
  const euros = centsToEuros(cents);
  return euros.toFixed(2);
}

/**
 * Format a price in cents to a euros string with the € symbol
 * Example: 
 *   300 → "€3.00"
 *   1250 → "€12.50"
 *   5000 → "€50.00"
 */
export function formatPriceWithSymbol(cents: number): string {
  return `€${formatPrice(cents)}`;
}

/**
 * DEBUGGING FUNCTION - helps identify if price values might be incorrectly formatted
 * Pass any price value from the app to help determine if it's already in euros or still in cents
 */
export function debugPrice(value: number): string {
  let result = `Original value: ${value}\n`;
  
  // If it's likely already in euros (has decimal or is very small)
  if (value < 100 || !Number.isInteger(value)) {
    result += `Appears to be in EUROS already: €${value.toFixed(2)}\n`;
    result += `As cents would be: €${(value/100).toFixed(2)} (probably wrong)\n`;
  } else {
    // Likely in cents
    result += `Appears to be in CENTS: €${(value/100).toFixed(2)}\n`;
    result += `As euros would be: €${value.toFixed(2)} (probably wrong)\n`;
  }
  
  return result;
}