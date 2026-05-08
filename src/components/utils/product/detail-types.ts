/**
 * Product Detail Page — type definitions
 *
 * Same conventions as ProductList: every user-visible string is typed,
 * stock state is a discriminated union, copy is overridable per-key.
 */

import type {
  CurrencyCode,
  MinorUnits,
  Product,
  ProductBadge,
  ProductId,
  ProductImage,
  ProductPrice,
  ProductRating,
  ProductStockState,
} from "./types";

export type {
  CurrencyCode, MinorUnits, ProductBadge, ProductId, ProductImage,
  ProductPrice, ProductRating, ProductStockState,
};

/* -------------------------------------------------------------------------- */
/*                              Product variants                              */
/* -------------------------------------------------------------------------- */

/** A single selectable option (e.g. "Small", "Onyx Black"). */
export interface ProductOptionValue {
  readonly id: string;
  readonly label: string;
  /** When the option type is "color", a CSS color used for the swatch. */
  readonly swatchColor?: string;
  /** When the option type is "image", a thumbnail URL. */
  readonly swatchImage?: string;
  /** Disabled values are shown but not selectable. */
  readonly disabled?: boolean;
}

export type ProductOptionKind = "swatch" | "chip" | "select";

/** A dimension a product varies along (e.g. Size, Color, Material). */
export interface ProductOption {
  readonly id: string;
  /** Visible label, e.g. "Color". */
  readonly label: string;
  /** UI rendering hint. */
  readonly kind: ProductOptionKind;
  readonly values: readonly ProductOptionValue[];
}

/** A specific purchasable SKU produced by combining option values. */
export interface ProductVariant {
  readonly id: string;
  /** SKU code, surfaced in the buy box. Optional. */
  readonly sku?: string;
  /**
   * Map of option id -> selected value id.
   * Every option in the parent ProductDetail.options must have a key here.
   */
  readonly selection: Readonly<Record<string, string>>;
  readonly price: ProductPrice;
  readonly stock: ProductStockState;
  /** Optional variant-specific image. */
  readonly image?: ProductImage;
}

/* -------------------------------------------------------------------------- */
/*                                 Reviews                                    */
/* -------------------------------------------------------------------------- */

export interface ReviewBreakdown {
  /** Average value. */
  readonly average: number;
  /** Total review count. */
  readonly total: number;
  /** Counts per star (index 0 = 1 star, … index 4 = 5 stars). */
  readonly histogram: readonly [number, number, number, number, number];
}

export interface ProductReview {
  readonly id: string;
  readonly author: string;
  /** ISO date string. */
  readonly date: string;
  readonly rating: number;
  readonly title?: string;
  readonly body: string;
  readonly verifiedPurchase?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Specs / details                               */
/* -------------------------------------------------------------------------- */

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

export interface ProductSection {
  readonly id: string;
  /** Section heading. */
  readonly title: string;
  /** Body — plain text supported as paragraphs (split by \n\n). */
  readonly body?: string;
  /** Optional spec rows. */
  readonly specs?: readonly ProductSpec[];
  /** Whether the section starts expanded. Defaults to false. */
  readonly defaultOpen?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              ProductDetail                                 */
/* -------------------------------------------------------------------------- */

export interface ProductDetail {
  readonly id: ProductId;
  readonly name: string;
  readonly brand?: string;
  /** Short tagline shown under the product name. */
  readonly tagline?: string;
  /** Marketing description, one or more paragraphs (split by \n\n). */
  readonly description: string;
  /** Gallery — the first image is the primary. */
  readonly gallery: readonly ProductImage[];
  /** Base price shown when no variant is selected (or for single-SKU products). */
  readonly basePrice: ProductPrice;
  /** Default stock state when not driven by a variant. */
  readonly stock?: ProductStockState;
  /** Status badges in the page header. */
  readonly badges?: readonly ProductBadge[];
  /** Aggregate review summary. */
  readonly reviews?: ReviewBreakdown;
  /** Variant axes (Size, Color, …). */
  readonly options?: readonly ProductOption[];
  /** Concrete SKUs. */
  readonly variants?: readonly ProductVariant[];
  /** Bulleted highlights shown in the buy box. */
  readonly highlights?: readonly string[];
  /** Expandable sections (description, specs, shipping, returns…). */
  readonly sections?: readonly ProductSection[];
  /** Cross-sell / "you may also like" products. */
  readonly relatedProducts?: readonly Product[];
  /** Link breadcrumbs. */
  readonly breadcrumbs?: readonly Breadcrumb[];
}

export interface Breadcrumb {
  readonly label: string;
  readonly href: string;
}

/* -------------------------------------------------------------------------- */
/*                                Variants                                    */
/* -------------------------------------------------------------------------- */

/** Layout variants supported by ProductDetail. */
export type ProductDetailVariant =
  | "classic"     // gallery left, buy box right (Amazon / Shopify default)
  | "editorial"   // gallery as wide hero, buy box centered below
  | "sticky"      // gallery scrolls, buy box stays sticky on the right
  | "split";      // 50/50 hero with full-bleed gallery and full-height buy box

/* -------------------------------------------------------------------------- */
/*                                  Copy                                      */
/* -------------------------------------------------------------------------- */

export interface ProductDetailCopy {
  /** Buy-box CTAs. */
  readonly addToCartLabel: string;
  readonly addingLabel: string;
  readonly addedLabel: string;
  readonly notifyMeLabel: string;
  readonly buyNowLabel: string;
  /** Wishlist CTAs. */
  readonly wishlistAddLabel: string;
  readonly wishlistRemoveLabel: string;
  /** Quantity stepper. */
  readonly quantityLabel: string;
  readonly decreaseQuantityAriaLabel: string;
  readonly increaseQuantityAriaLabel: string;
  /** Stock copy. */
  readonly inStockLabel: string;
  readonly outOfStockLabel: string;
  readonly lowStockTemplate: string;     // {count}
  readonly preorderTemplate: string;     // {date}
  /** Pricing meta. */
  readonly compareAtTemplate: string;    // {price}
  readonly saveTemplate: string;         // {percent}
  readonly taxLabel: string;
  /** Reviews. */
  readonly reviewsHeading: string;
  readonly reviewsSummaryTemplate: string; // {value}, {count}
  readonly readReviewsLabel: string;
  readonly verifiedPurchaseLabel: string;
  readonly basedOnReviewsTemplate: string; // {count}
  /** Section headings. */
  readonly highlightsHeading: string;
  readonly relatedHeading: string;
  /** Accessibility. */
  readonly galleryThumbAriaTemplate: string; // {index}, {total}
  readonly selectOptionAriaTemplate: string; // {option}, {value}
  /** Misc. */
  readonly skuLabel: string;
  readonly shareLabel: string;
}

export const defaultProductDetailCopy: ProductDetailCopy = {
  addToCartLabel: "Add to cart",
  addingLabel: "Adding…",
  addedLabel: "Added to cart",
  notifyMeLabel: "Notify me when available",
  buyNowLabel: "Buy now",
  wishlistAddLabel: "Save",
  wishlistRemoveLabel: "Saved",
  quantityLabel: "Quantity",
  decreaseQuantityAriaLabel: "Decrease quantity",
  increaseQuantityAriaLabel: "Increase quantity",
  inStockLabel: "In stock — ready to ship",
  outOfStockLabel: "Currently out of stock",
  lowStockTemplate: "Only {count} left in stock",
  preorderTemplate: "Pre-order — ships {date}",
  compareAtTemplate: "was {price}",
  saveTemplate: "Save {percent}%",
  taxLabel: "Taxes and shipping calculated at checkout",
  reviewsHeading: "Customer reviews",
  reviewsSummaryTemplate: "{value} out of 5 — based on {count} reviews",
  readReviewsLabel: "Read all reviews",
  verifiedPurchaseLabel: "Verified purchase",
  basedOnReviewsTemplate: "{count} reviews",
  highlightsHeading: "Highlights",
  relatedHeading: "You may also like",
  galleryThumbAriaTemplate: "View image {index} of {total}",
  selectOptionAriaTemplate: "Select {option}: {value}",
  skuLabel: "SKU",
  shareLabel: "Share",
};
