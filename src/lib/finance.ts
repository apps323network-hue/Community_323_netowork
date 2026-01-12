export const STRIPE_FEE_PERCENTAGE = 0.039; // 3.9%
export const STRIPE_FEE_FIXED = 30; // 30 cents

/**
 * Calculates the Stripe fee for a given base amount in cents.
 * @param baseAmountCents The amount in cents
 * @returns The fee in cents
 */
export function calculateStripeFee(baseAmountCents: number): number {
  return Math.round((baseAmountCents * STRIPE_FEE_PERCENTAGE) + STRIPE_FEE_FIXED);
}

/**
 * Calculates the total amount including Stripe fees for a given base amount in cents.
 * @param baseAmountCents The amount in cents
 * @returns The total in cents
 */
export function calculateTotalWithFees(baseAmountCents: number): number {
  return baseAmountCents + calculateStripeFee(baseAmountCents);
}

/**
 * Formats a cent amount to a currency string.
 */
export function formatCurrency(cents: number, currency: string = 'USD', locale: string = 'en-US'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
