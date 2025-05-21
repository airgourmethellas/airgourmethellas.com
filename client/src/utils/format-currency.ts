/**
 * Format a number as currency (EUR)
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  // Use the browser's Intl.NumberFormat for proper currency formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Convert cents to euros
 * @param cents The amount in cents
 * @returns The amount in euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency (EUR)
 * @param cents The amount in cents
 * @returns Formatted currency string
 */
export function formatCentsAsCurrency(cents: number): string {
  return formatCurrency(centsToEuros(cents));
}