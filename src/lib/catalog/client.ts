/**
 * src/lib/catalog/client.ts
 *
 * Direct query helpers for catalog tables that are NOT Astro content
 * collections: catalog_config, cart, orders, inquiry.
 *
 * Products, categories, and services are accessed via getCollection()
 * from astro:content (see content.config.ts).
 */

import { getDb } from '../../db/client.js';
import type {
  Cart, CartItem, CartTotals, AppliedDiscount,
  CatalogConfig, Inquiry, InquiryItem,
  InquiryStatus, Order, OrderItem, OrderStatus,
} from './types.js';

// ── JSON helper ───────────────────────────────────────────────────────────────

function j<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  try { return JSON.parse(String(raw)) as T; } catch { return fallback; }
}

// ── catalog_config ────────────────────────────────────────────────────────────

function mapCatalogConfig(row: Record<string, unknown>): CatalogConfig {
  return {
    ...(row as unknown as CatalogConfig),
    supported_currencies: j(row.supported_currencies, ['INR']),
    business:             j(row.business,             {}),
    branding:             j(row.branding,             {}),
    contact:              j(row.contact,              {}),
    social:               j(row.social,               {}),
    features:             j(row.features,             {}),
    shipping_zones:       j(row.shipping_zones,       []),
    tax_profiles:         j(row.tax_profiles,         []),
    seo:                  j(row.seo,                  {}),
    meta:                 j(row.meta,                 {}),
  };
}

/** Returns the single catalog_config row, or null if not seeded. */
export function getCatalogConfig(): CatalogConfig | null {
  const row = getDb()
    .prepare("SELECT * FROM catalog_config WHERE id = 'main'")
    .get() as Record<string, unknown> | undefined;
  return row ? mapCatalogConfig(row) : null;
}

// ── Cart helpers ──────────────────────────────────────────────────────────────

function mapCartItem(row: Record<string, unknown>): CartItem {
  return {
    ...(row as unknown as CartItem),
    custom_options: j(row.custom_options, {}),
  };
}

/** Returns a cart with its items, or null. */
export function getCart(id: string): Cart | null {
  const db   = getDb();
  const cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!cart) return null;
  const items = (db.prepare('SELECT * FROM cart_item WHERE cart_id = ? ORDER BY created_at ASC').all(id) as Record<string, unknown>[]).map(mapCartItem);
  return {
    ...(cart as unknown as Cart),
    meta: j(cart.meta, {}),
    items,
  };
}

/** Returns the active cart for a customer or session, or null. */
export function getActiveCart(opts: { customer_id?: string; session_id?: string }): Cart | null {
  const db = getDb();
  let row: Record<string, unknown> | undefined;
  if (opts.customer_id) {
    row = db.prepare("SELECT * FROM cart WHERE customer_id = ? AND status = 'active' ORDER BY updated_at DESC LIMIT 1").get(opts.customer_id) as Record<string, unknown> | undefined;
  } else if (opts.session_id) {
    row = db.prepare("SELECT * FROM cart WHERE session_id = ? AND status = 'active' ORDER BY updated_at DESC LIMIT 1").get(opts.session_id) as Record<string, unknown> | undefined;
  }
  return row ? getCart(String(row.id)) : null;
}

/** Creates a new cart and returns it. */
export function createCart(data: { customer_id?: string; session_id?: string; currency?: string }): Cart {
  const id = crypto.randomUUID();
  getDb().prepare(
    'INSERT INTO cart (id, customer_id, session_id, currency) VALUES (?, ?, ?, ?)'
  ).run(id, data.customer_id ?? null, data.session_id ?? null, data.currency ?? 'INR');
  return getCart(id)!;
}

/** Adds an item to a cart (merges quantity if ref_id + variant_id match). */
export function addCartItem(
  cartId: string,
  item: Omit<CartItem, 'id' | 'cart_id' | 'created_at'>
): CartItem {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM cart_item WHERE cart_id = ? AND ref_id = ? AND variant_id IS ?')
    .get(cartId, item.ref_id, item.variant_id ?? null) as Record<string, unknown> | undefined;

  if (existing) {
    const newQty = Number(existing.quantity) + item.quantity;
    db.prepare('UPDATE cart_item SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    db.prepare('UPDATE cart SET updated_at = datetime(\'now\') WHERE id = ?').run(cartId);
    return mapCartItem({ ...existing, quantity: newQty });
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO cart_item (id, cart_id, item_type, ref_id, variant_id, package_id, name,
      image_url, sku, slug, unit_price, compare_at, currency, quantity, tax_rate,
      tax_inclusive, custom_options, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, cartId, item.item_type, item.ref_id, item.variant_id ?? null,
    item.package_id ?? null, item.name, item.image_url ?? null,
    item.sku ?? null, item.slug ?? null, item.unit_price,
    item.compare_at ?? null, item.currency, item.quantity,
    item.tax_rate, item.tax_inclusive ? 1 : 0,
    JSON.stringify(item.custom_options ?? {}), item.note ?? null,
  );
  db.prepare('UPDATE cart SET updated_at = datetime(\'now\') WHERE id = ?').run(cartId);
  return { ...item, id, cart_id: cartId, created_at: new Date().toISOString() };
}

/** Updates the quantity of a cart item. Pass 0 to remove. */
export function updateCartItemQty(itemId: string, qty: number): void {
  const db = getDb();
  if (qty <= 0) {
    db.prepare('DELETE FROM cart_item WHERE id = ?').run(itemId);
  } else {
    db.prepare('UPDATE cart_item SET quantity = ? WHERE id = ?').run(qty, itemId);
  }
}

/** Removes a cart item by id. */
export function removeCartItem(itemId: string): void {
  getDb().prepare('DELETE FROM cart_item WHERE id = ?').run(itemId);
}

/** Computes cart totals in JS (avoids storing stale aggregates). */
export function computeCartTotals(cart: Cart): CartTotals {
  const items = cart.items ?? [];
  let subtotal = 0, tax = 0;
  for (const item of items) {
    const lineTotal = item.unit_price * item.quantity;
    subtotal += lineTotal;
    if (item.tax_inclusive) {
      tax += lineTotal - lineTotal / (1 + item.tax_rate / 100);
    } else {
      tax += lineTotal * item.tax_rate / 100;
    }
  }
  const regularItems = items.filter((i) => i.item_type !== 'fee' && i.item_type !== 'discount');
  return {
    subtotal,
    discount_amount: 0,
    shipping_amount: 0,
    tax_amount: Math.round(tax * 100) / 100,
    total: subtotal,
    currency: cart.currency,
    items_count: regularItems.length,
    units_count: regularItems.reduce((s, i) => s + i.quantity, 0),
  };
}

// ── Order helpers ─────────────────────────────────────────────────────────────

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    ...(row as unknown as OrderItem),
    custom_options: j(row.custom_options, {}),
  };
}

function mapOrder(row: Record<string, unknown>, items: OrderItem[]): Order {
  return {
    ...(row as unknown as Order),
    contact:           j(row.contact,           null),
    billing_address:   j(row.billing_address,   null),
    shipping_address:  j(row.shipping_address,  null),
    totals:            j(row.totals,            {} as CartTotals),
    applied_discounts: j(row.applied_discounts, []),
    shipping_method:   j(row.shipping_method,   null),
    payment:           j(row.payment,           null),
    meta:              j(row.meta,              {}),
    items,
  };
}

/** Returns an order with its items, or null. */
export function getOrder(id: string): Order | null {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const items = (db.prepare('SELECT * FROM order_item WHERE order_id = ?').all(id) as Record<string, unknown>[]).map(mapOrderItem);
  return mapOrder(row, items);
}

/** Returns an order by its human-readable order number. */
export function getOrderByNumber(orderNumber: string): Order | null {
  const row = getDb().prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as Record<string, unknown> | undefined;
  return row ? getOrder(String(row.id)) : null;
}

/** Lists orders, optionally filtered by customer or status. */
export function listOrders(opts: { customer_id?: string; status?: OrderStatus; limit?: number } = {}): Order[] {
  const db = getDb();
  const wheres: string[] = [];
  const params: unknown[] = [];
  if (opts.customer_id) { wheres.push('customer_id = ?'); params.push(opts.customer_id); }
  if (opts.status)      { wheres.push('status = ?');       params.push(opts.status); }
  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
  const rows  = db.prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ${opts.limit ?? 50}`).all(...params) as Record<string, unknown>[];
  return rows.map((row) => {
    const items = (db.prepare('SELECT * FROM order_item WHERE order_id = ?').all(String(row.id)) as Record<string, unknown>[]).map(mapOrderItem);
    return mapOrder(row, items);
  });
}

// ── Inquiry helpers ───────────────────────────────────────────────────────────

function mapInquiry(row: Record<string, unknown>, items: InquiryItem[]): Inquiry {
  return {
    ...(row as unknown as Inquiry),
    contact:      j(row.contact,      {}),
    address:      j(row.address,      null),
    requirements: j(row.requirements, {}),
    meta:         j(row.meta,         {}),
    items,
  };
}

/** Returns an inquiry with its items, or null. */
export function getInquiry(id: string): Inquiry | null {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM inquiry WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const items = db.prepare('SELECT * FROM inquiry_item WHERE inquiry_id = ?').all(id) as InquiryItem[];
  return mapInquiry(row, items);
}

/** Creates a new inquiry and returns it. */
export function createInquiry(
  data: Pick<Inquiry, 'contact' | 'message' | 'budget' | 'timeline' | 'source'> & {
    company?: string;
    gstin?: string;
    currency?: string;
    items?: Array<Pick<InquiryItem, 'ref_type' | 'ref_id' | 'name' | 'quantity' | 'note'>>;
  }
): Inquiry {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO inquiry (id, company, gstin, message, budget, timeline, source, currency, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.company ?? null, data.gstin ?? null, data.message ?? null,
    data.budget ?? null, data.timeline ?? null, data.source ?? null,
    data.currency ?? 'INR', JSON.stringify(data.contact ?? {}),
  );
  for (const item of data.items ?? []) {
    db.prepare(
      'INSERT INTO inquiry_item (id, inquiry_id, ref_type, ref_id, name, quantity, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(crypto.randomUUID(), id, item.ref_type, item.ref_id, item.name, item.quantity ?? null, item.note ?? null);
  }
  return getInquiry(id)!;
}

/** Lists inquiries filtered by status. */
export function listInquiries(status?: InquiryStatus, limit = 50): Inquiry[] {
  const db   = getDb();
  const rows = status
    ? db.prepare('SELECT * FROM inquiry WHERE status = ? ORDER BY created_at DESC LIMIT ?').all(status, limit)
    : db.prepare('SELECT * FROM inquiry ORDER BY created_at DESC LIMIT ?').all(limit);
  return (rows as Record<string, unknown>[]).map((row) => {
    const items = db.prepare('SELECT * FROM inquiry_item WHERE inquiry_id = ?').all(String(row.id)) as InquiryItem[];
    return mapInquiry(row, items);
  });
}

/** Updates the status of an inquiry. */
export function updateInquiryStatus(id: string, status: InquiryStatus): void {
  getDb().prepare("UPDATE inquiry SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
}
