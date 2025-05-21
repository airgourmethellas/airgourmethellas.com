/**
 * Server-side price formatter utilities
 */

/**
 * Convert cents to euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Format a price in cents to a euros string with 2 decimal places (no symbol)
 */
export function formatPrice(cents: number): string {
  const euros = centsToEuros(cents);
  return euros.toFixed(2);
}

/**
 * Format a price in cents to a euros string with the € symbol
 */
export function formatPriceWithSymbol(cents: number): string {
  return `€${formatPrice(cents)}`;
}