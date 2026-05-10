/**
 * Canonical data contract for the `product` registry category.
 *
 * All variants (product/grid, product/list, product/detail) accept
 * types defined here.  Prices are always in MAJOR units matching the DB
 * (e.g. 8999 = ₹8,999 — no ×100 minor-unit conversion).
 */

// ── Shared primitives ─────────────────────────────────────────────────────────

export interface ProductPrice {
  amount:     number;          // major units  (DB representation)
  compareAt?: number;          // major units
  currency:   string;          // ISO 4217  e.g. 'INR'
  locale?:    string;          // BCP-47    e.g. 'en-IN'
  label?:     string;          // display override e.g. 'Get Quote'
  showPrice:  boolean;
  unitLabel?: string;          // 'per sq ft', 'per hour'
}

export interface ProductImage {
  src:          string;
  alt:          string;
  hoverSrc?:    string;
  aspectRatio?: number;
}

export type BadgeKind = 'new' | 'sale' | 'hot' | 'limited' | 'bestseller' | 'low-stock';

export interface ProductBadge {
  kind:  BadgeKind;
  label: string;
}

export interface ProductSwatch {
  id:       string;
  label:    string;
  color?:   string;   // CSS color
  image?:   string;   // URL for image swatches
  inStock:  boolean;
}

export type StockKind = 'in-stock' | 'low-stock' | 'out-of-stock' | 'preorder';

export type StockState =
  | { kind: 'in-stock' }
  | { kind: 'low-stock';   remaining: number }
  | { kind: 'out-of-stock' }
  | { kind: 'preorder';    shipsOn: string };

// ── Listing contract  (product/grid, product/list) ────────────────────────────

export interface ProductItem {
  id:           string;
  name:         string;
  brand?:       string;
  description?: string;
  slug:         string;
  href:         string;
  images:       ProductImage[];
  price:        ProductPrice;
  badges:       ProductBadge[];
  tags:         string[];
  stock:        StockState;
  swatches?:    ProductSwatch[];
  rating?:      number;
  reviewCount?: number;
  isNew:        boolean;
  isBestseller: boolean;
  isFeatured:   boolean;
  freeShipping: boolean;
}

// ── Detail contract  (product/detail) ────────────────────────────────────────

export interface ProductOptionValue {
  id:       string;
  label:    string;
  swatch?:  string;   // hex or image URL
  disabled: boolean;
}

export interface ProductOption {
  id:     string;
  name:   string;
  kind:   'swatch' | 'chip' | 'select';
  values: ProductOptionValue[];
}

export interface ProductVariantEntry {
  id:        string;
  sku?:      string;
  selection: Record<string, string>;
  price:     ProductPrice;
  stock:     StockState;
  image?:    ProductImage;
}

export interface ProductSection {
  id:          string;
  title:       string;
  body?:       string;
  specs?:      { label: string; value: string }[];
  defaultOpen?: boolean;
}

export interface ReviewBreakdown {
  average:   number;
  total:     number;
  histogram: [number, number, number, number, number];
}

export interface Breadcrumb {
  label: string;
  href:  string;
}

export interface ProductDetailItem {
  id:              string;
  name:            string;
  brand?:          string;
  tagline?:        string;
  description:     string;
  slug:            string;
  gallery:         ProductImage[];
  price:           ProductPrice;
  badges:          ProductBadge[];
  stock:           StockState;
  options?:        ProductOption[];
  variants?:       ProductVariantEntry[];
  highlights?:     string[];
  sections?:       ProductSection[];
  reviews?:        ReviewBreakdown;
  relatedProducts?: ProductItem[];
  breadcrumbs?:    Breadcrumb[];
}

// ── Block-level data contract for the product category ────────────────────────
// What the block resolver produces; each variant uses the relevant fields.

export interface ProductBlockData {
  products:        ProductItem[];        // for grid / list
  product:         ProductDetailItem | null;  // for detail
  relatedProducts: ProductItem[];
  attrs:           Record<string, unknown>;
}
