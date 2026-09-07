import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_PROVIDER_SECRET;
  if (!key) throw new Error("Stripe secret key is not configured.");
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

// Currencies that do not use 2 minor units (1 unit / no decimals).
export const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

// Convert a major-unit amount (e.g. 50 for $50) into the currency's minor units.
export function toMinorUnits(amount: number, currency: string): number {
  const factor = ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 1 : 100;
  return Math.round(amount * factor);
}

// The donation currencies CLAN accepts. All are supported by Stripe.
export const SUPPORTED_CURRENCIES = new Set([
  "USD", "GBP", "NGN", "EUR", "CAD", "GHS",
]);

// Donation amount bounds (in major units, applied before any provider call) so
// garbage/overflow input never reaches the payment provider or the DB.
export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 10_000_000;

export function validateDonationInput(
  amount: number,
  currency: string
): { ok: true; amount: number; currency: string } | { ok: false; error: string } {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "A valid donation amount is required." };
  }
  if (amount < MIN_DONATION_AMOUNT || amount > MAX_DONATION_AMOUNT) {
    return {
      ok: false,
      error: `Donation amounts must be between ${MIN_DONATION_AMOUNT} and ${MAX_DONATION_AMOUNT.toLocaleString()}.`,
    };
  }
  const normalized = currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return { ok: false, error: "Please choose a valid currency." };
  }
  return { ok: true, amount, currency: normalized };
}