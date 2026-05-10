/**
 * TypeScript interfaces for catalog DB rows.
 * Maps: product.py, category.py, pricing.py, service.py, cart.py, catalog_config.py
 *
 * Note: products, categories, and services are also exposed as Astro content
 * collections (with Zod-validated types generated from content.config.ts).
 * These interfaces cover the raw DB row shape and the transactional tables
 * (cart, orders, inquiry, catalog_config) that are not content collections.
 */

// ── Shared value types ────────────────────────────────────────────────────────

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export type PriceType =
  | 'fixed' | 'price_on_request' | 'free'
  | 'subscription' | 'tiered' | 'negotiable';

export type PublishStatus = 'draft' | 'active' | 'archived' | 'scheduled';
export type StockStatus   = 'in_stock' | 'out_of_stock' | 'backorder' | 'preorder' | 'discontinued' | 'on_request';

/** Pricing — maps Pricing from pricing.py (stored as JSON in product/service rows) */
export interface Pricing {
  price_type:    PriceType;
  currency:      CurrencyCode;
  amount?:       number;
  compare_at?:   number;
  display_label?: string;
  show_price:    boolean;
  unit_label?:   string;
  minimum_order_qty?: number;
  maximum_order_qty?: number;
  tax?: {
    tax_class:    string;
    rate_percent: number;
    inclusive:    boolean;
    hsn_sac_code?: string;
    label?:       string;
  };
  discounts?: Array<{
    type:   'percent' | 'flat' | 'buy_x_get_y';
    value:  number;
    label?: string;
    code?:  string;
    valid_from?: string;
    valid_until?: string;
  }>;
  tiers?: Array<{
    min_qty:  number;
    max_qty?: number;
    price:    { amount: number; currency: CurrencyCode };
    label?:   string;
  }>;
  subscription?: {
    interval:       string;
    interval_count: number;
    trial_days:     number;
    cancellation_policy?: string;
  };
  por_config?: {
    label:   string;
    form_fields: string[];
    notify_email?: string;
    expected_turnaround_hours?: number;
  };
}

// ── catalog_config ────────────────────────────────────────────────────────────
// Maps CatalogConfig from catalog_config.py

export type SiteMode = 'catalog_only' | 'catalog_with_cart' | 'service_only' | 'hybrid';

export interface CatalogConfig {
  id: string;
  site_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  mode: SiteMode;
  default_currency: CurrencyCode;
  locale: string;
  timezone: string;
  industry: string | null;
  sub_industry: string | null;
  notify_email: string | null;
  notify_phone: string | null;
  notify_slack_webhook: string | null;
  custom_domain: string | null;
  // parsed JSON
  supported_currencies: CurrencyCode[];
  business: {
    legal_name?: string;
    trade_name?: string;
    gstin?: string;
    pan?: string;
    address?: Record<string, unknown>;
    contact?: Record<string, unknown>;
  };
  branding: {
    logo?: { url: string; alt?: string };
    favicon?: { url: string };
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_heading?: string;
    font_body?: string;
    theme?: string;
  };
  contact: Record<string, unknown>;
  social: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  features: {
    enable_cart?: boolean;
    enable_checkout?: boolean;
    enable_wishlist?: boolean;
    show_prices?: boolean;
    enable_inquiry_form?: boolean;
    enable_whatsapp_chat?: boolean;
    enable_variants?: boolean;
    enable_service_packages?: boolean;
    enable_booking?: boolean;
    items_per_page?: number;
    [key: string]: unknown;
  };
  shipping_zones: unknown[];
  tax_profiles: unknown[];
  seo: Record<string, unknown>;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Cart ──────────────────────────────────────────────────────────────────────
// Maps Cart / CartItem / AppliedDiscount / CartTotals from cart.py

export type CartStatus   = 'active' | 'abandoned' | 'merged' | 'ordered';
export type CartItemType = 'product' | 'service' | 'addon' | 'fee' | 'discount';

export interface CartItem {
  id: string;
  cart_id: string;
  item_type: CartItemType;
  ref_id: string;
  variant_id: string | null;
  package_id: string | null;
  name: string;
  image_url: string | null;
  sku: string | null;
  slug: string | null;
  unit_price: number;
  compare_at: number | null;
  currency: CurrencyCode;
  quantity: number;
  tax_rate: number;
  tax_inclusive: number;          // 0 | 1
  custom_options: Record<string, unknown>; // parsed JSON
  note: string | null;
  created_at: string;
}

export interface Cart {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  status: CartStatus;
  currency: CurrencyCode;
  order_note: string | null;
  meta: Record<string, unknown>;  // parsed JSON
  created_at: string;
  updated_at: string;
  items?: CartItem[];             // populated by getCart()
}

export interface AppliedDiscount {
  code?: string;
  label: string;
  discount_type: 'percent' | 'flat';
  value: number;
  currency?: CurrencyCode;
  amount_saved: number;
}

export interface CartTotals {
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  currency: CurrencyCode;
  items_count: number;
  units_count: number;
}

// ── Orders ────────────────────────────────────────────────────────────────────
// Maps Order / OrderPayment from cart.py

export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'shipped'
  | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'on_hold';

export type PaymentMethod =
  | 'cod' | 'card' | 'upi' | 'net_banking' | 'wallet'
  | 'bank_transfer' | 'crypto' | 'bnpl' | 'cheque' | 'advance_partial';

export type PaymentStatus =
  | 'pending' | 'authorized' | 'captured' | 'failed'
  | 'refunded' | 'partially_refunded' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: CartItemType;
  ref_id: string;
  variant_id: string | null;
  package_id: string | null;
  name: string;
  image_url: string | null;
  sku: string | null;
  slug: string | null;
  unit_price: number;
  compare_at: number | null;
  currency: CurrencyCode;
  quantity: number;
  tax_rate: number;
  tax_inclusive: number;
  custom_options: Record<string, unknown>;
  note: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  cart_id: string | null;
  customer_id: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  currency: CurrencyCode;
  customer_note: string | null;
  internal_note: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  // parsed JSON
  contact: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  shipping_address: Record<string, unknown> | null;
  totals: CartTotals;
  applied_discounts: AppliedDiscount[];
  shipping_method: Record<string, unknown> | null;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transaction_id?: string;
    gateway?: string;
    amount_paid: number;
    currency: CurrencyCode;
    paid_at?: string;
    receipt_url?: string;
  } | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];             // populated by getOrder()
}

// ── Inquiry ───────────────────────────────────────────────────────────────────
// Maps Inquiry / InquiryItem from cart.py

export type InquiryStatus = 'new' | 'read' | 'replied' | 'converted' | 'closed' | 'spam';

export interface InquiryItem {
  id: string;
  inquiry_id: string;
  ref_type: 'product' | 'service';
  ref_id: string;
  name: string;
  quantity: number | null;
  note: string | null;
}

export interface Inquiry {
  id: string;
  company: string | null;
  gstin: string | null;
  message: string | null;
  budget: string | null;
  timeline: string | null;
  status: InquiryStatus;
  assigned_to: string | null;
  source: string | null;
  currency: CurrencyCode;
  quoted_amount: number | null;
  responded_at: string | null;
  quote_valid_until: string | null;
  // parsed JSON
  contact: Record<string, unknown>;
  address: Record<string, unknown> | null;
  requirements: Record<string, unknown>;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  items?: InquiryItem[];           // populated by getInquiry()
}
