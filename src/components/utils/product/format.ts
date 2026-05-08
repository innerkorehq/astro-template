import type { ProductPrice } from "./types";

/** Format a ProductPrice as a localized currency string. */
export function formatPrice(price: ProductPrice): string {
  const locale = price.locale ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
  }).format(price.amount / 100);
}

/** Format the compare-at (original) price; returns null if not on sale. */
export function formatCompareAt(price: ProductPrice): string | null {
  if (price.compareAt == null || price.compareAt <= price.amount) return null;
  const locale = price.locale ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
  }).format(price.compareAt / 100);
}

/** Discount percent (0–100, integer). Returns null if not on sale. */
export function discountPercent(price: ProductPrice): number | null {
  if (price.compareAt == null || price.compareAt <= price.amount) return null;
  return Math.round(100 - (price.amount / price.compareAt) * 100);
}

/** Replace `{token}` placeholders. */
export function template(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`
  );
}

/** Tailwind-style className concatenation. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
