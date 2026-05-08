/**
 * Product listing — type definitions
 *
 * Every field surfaced to the user is part of the public type contract.
 * Strings that appear visually (labels, ARIA, formatted prices) are typed
 * as branded primitives where it adds safety; everything else is plain TS.
 */

/** ISO 4217 currency code (e.g. "USD", "EUR", "GBP"). */
export type CurrencyCode = string;

/** A monetary amount expressed in the currency's MINOR unit (cents, pence). */
export type MinorUnits = number;

/** A 0–5 floating-point rating value. */
export type RatingValue = number;

/** Stable identifier for a product. */
export type ProductId = string;

/** Status badges that can appear on a product card. */
export type ProductBadgeKind = "new" | "sale" | "bestseller" | "limited" | "low-stock";

export interface ProductBadge {
  /** Discriminant used to apply default styling. */
  readonly kind: ProductBadgeKind;
  /** Display label (e.g. "New", "-30%", "Bestseller"). */
  readonly label: string;
}

export interface ProductImage {
  /** Image URL. Use a CDN-resized variant when possible. */
  readonly src: string;
  /** Alt text — REQUIRED. Describe the product, not "image of...". */
  readonly alt: string;
  /** Optional aspect-ratio hint (width / height). Defaults to 1. */
  readonly aspectRatio?: number;
}

export interface ProductPrice {
  /** Current price in minor units. */
  readonly amount: MinorUnits;
  /** Original price if discounted; omit when not on sale. */
  readonly compareAt?: MinorUnits;
  /** ISO 4217 currency code. */
  readonly currency: CurrencyCode;
  /** BCP-47 locale used to format the price. Defaults to "en-US". */
  readonly locale?: string;
}

export interface ProductRating {
  /** Average rating, 0–5. */
  readonly value: RatingValue;
  /** Total number of reviews. */
  readonly count: number;
}

/** Stock state — drives availability copy and the primary action. */
export type ProductStockState =
  | { readonly kind: "in-stock" }
  | { readonly kind: "low-stock"; readonly remaining: number }
  | { readonly kind: "out-of-stock" }
  | { readonly kind: "preorder"; readonly shipsOn: string };

export interface Product {
  readonly id: ProductId;
  /** Product display name. */
  readonly name: string;
  /** Brand or vendor — optional secondary line. */
  readonly brand?: string;
  /** Short marketing description. Keep under ~120 chars for cards. */
  readonly description?: string;
  /** Primary image. Required. */
  readonly image: ProductImage;
  /** Pricing. */
  readonly price: ProductPrice;
  /** Rating, if reviews exist. */
  readonly rating?: ProductRating;
  /** Status badges. Order is preserved in the UI. */
  readonly badges?: readonly ProductBadge[];
  /** Stock state. Defaults to "in-stock" when omitted. */
  readonly stock?: ProductStockState;
  /** Color/variant swatches to show as dots under the card. */
  readonly swatches?: readonly ProductSwatch[];
  /** Detail page URL (used as the card's primary link). */
  readonly href: string;
}

export interface ProductSwatch {
  readonly id: string;
  /** Visible label (e.g. "Onyx Black"). */
  readonly label: string;
  /** CSS color value. */
  readonly color: string;
}

/** Card layout variants supported by ProductList. */
export type ProductCardVariant =
  | "grid"           // image on top, info below — classic e-commerce
  | "horizontal"     // image left, info right — list view
  | "editorial"      // full-bleed image with overlay text
  | "action"         // image top, inline CTA button
  | "minimal"        // image-led, no chrome
  | "compact"        // dense row for catalogs/search
  | "quickshop"      // hover-revealed inline CTA over image
  | "spotlight";     // floating info chip overlapping image

/**
 * All user-visible copy used by the components.
 * Centralized so it can be translated or A/B tested without forking the UI.
 */
export interface ProductListCopy {
  /** Currency-prefix-style "starting from" — currently unused, reserved. */
  readonly fromLabel?: string;
  /** Suffix for compare-at price, e.g. "was {price}". `{price}` is replaced. */
  readonly compareAtTemplate: string;
  /** Stock copy. */
  readonly inStockLabel: string;
  readonly outOfStockLabel: string;
  /** Template with `{count}` placeholder, e.g. "Only {count} left". */
  readonly lowStockTemplate: string;
  /** Template with `{date}` placeholder, e.g. "Ships {date}". */
  readonly preorderTemplate: string;
  /** Primary CTA label when in stock. */
  readonly addToCartLabel: string;
  /** Primary CTA label when out of stock. */
  readonly notifyMeLabel: string;
  /** Aria-label template for rating, e.g. "Rated {value} out of 5". */
  readonly ratingAriaTemplate: string;
  /** Suffix shown after rating value, e.g. "(1,204)" — `{count}` placeholder. */
  readonly ratingCountTemplate: string;
  /** Aria-label template for the wishlist toggle. */
  readonly wishlistAddAriaTemplate: string;
  readonly wishlistRemoveAriaTemplate: string;
  /** Aria-label for the "view product" link wrapping the card. */
  readonly viewProductAriaTemplate: string;
  /** Sale-discount suffix, e.g. "Save {percent}%". */
  readonly saveTemplate: string;
}

/** Sensible English defaults so the component is usable without configuring copy. */
export const defaultProductListCopy: ProductListCopy = {
  compareAtTemplate: "was {price}",
  inStockLabel: "In stock",
  outOfStockLabel: "Out of stock",
  lowStockTemplate: "Only {count} left",
  preorderTemplate: "Ships {date}",
  addToCartLabel: "Add to cart",
  notifyMeLabel: "Notify me",
  ratingAriaTemplate: "Rated {value} out of 5",
  ratingCountTemplate: "({count})",
  wishlistAddAriaTemplate: "Add {name} to wishlist",
  wishlistRemoveAriaTemplate: "Remove {name} from wishlist",
  viewProductAriaTemplate: "View {name}",
  saveTemplate: "Save {percent}%",
};
