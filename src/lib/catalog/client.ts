/**
 * src/lib/catalog/client.ts
 * Direct query helpers for transactional catalog tables (cart, orders, inquiry,
 * catalog_config). All async — uses @astrojs/db (Drizzle / libsql).
 */

import {
  db,
  CatalogConfig, Cart, CartItem as CartItemTable, Orders, OrderItem, Inquiry, InquiryItem,
  eq, and, asc, desc,
} from 'astro:db';

import type {
  CatalogConfig as CatalogConfigType,
  Cart as CartType, CartItem, CartTotals,
  Order, OrderItem as OrderItemType, OrderStatus,
  Inquiry as InquiryType, InquiryItem as InquiryItemType, InquiryStatus,
} from './types.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapCatalogConfig(row: typeof CatalogConfig.$inferSelect): CatalogConfigType {
  return {
    ...(row as unknown as CatalogConfigType),
    supported_currencies: (row.supported_currencies as string[]) ?? ['INR'],
    business:             (row.business  as Record<string, unknown>) ?? {},
    branding:             (row.branding  as Record<string, unknown>) ?? {},
    contact:              (row.contact   as Record<string, unknown>) ?? {},
    social:               (row.social    as Record<string, unknown>) ?? {},
    features:             (row.features  as Record<string, unknown>) ?? {},
    shipping_zones:       (row.shipping_zones as unknown[]) ?? [],
    tax_profiles:         (row.tax_profiles  as unknown[]) ?? [],
    seo:                  (row.seo       as Record<string, unknown>) ?? {},
    meta:                 (row.meta      as Record<string, unknown>) ?? {},
  };
}

function mapCartItem(row: typeof CartItemTable.$inferSelect): CartItem {
  return {
    ...(row as unknown as CartItem),
    tax_inclusive:  Number(row.tax_inclusive),
    custom_options: (row.custom_options as Record<string, unknown>) ?? {},
  };
}

function mapOrder(row: typeof Orders.$inferSelect, items: OrderItemType[]): Order {
  return {
    ...(row as unknown as Order),
    contact:           (row.contact           as Record<string, unknown> | null) ?? null,
    billing_address:   (row.billing_address   as Record<string, unknown> | null) ?? null,
    shipping_address:  (row.shipping_address  as Record<string, unknown> | null) ?? null,
    totals:            (row.totals            as CartTotals) ?? {} as CartTotals,
    applied_discounts: (row.applied_discounts as unknown[]) ?? [],
    shipping_method:   (row.shipping_method   as Record<string, unknown> | null) ?? null,
    payment:           (row.payment           as Order['payment']) ?? null,
    meta:              (row.meta              as Record<string, unknown>) ?? {},
    items,
  };
}

function mapInquiry(row: typeof Inquiry.$inferSelect, items: InquiryItemType[]): InquiryType {
  return {
    ...(row as unknown as InquiryType),
    contact:      (row.contact      as Record<string, unknown>) ?? {},
    address:      (row.address      as Record<string, unknown> | null) ?? null,
    requirements: (row.requirements as Record<string, unknown>) ?? {},
    meta:         (row.meta         as Record<string, unknown>) ?? {},
    items,
  };
}

// ── CatalogConfig ─────────────────────────────────────────────────────────────

export async function getCatalogConfig(): Promise<CatalogConfigType | null> {
  const rows = await db.select().from(CatalogConfig).where(eq(CatalogConfig.id, 'main'));
  return rows[0] ? mapCatalogConfig(rows[0]) : null;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart(id: string): Promise<CartType | null> {
  const carts = await db.select().from(Cart).where(eq(Cart.id, id));
  const cart = carts[0];
  if (!cart) return null;
  const items = (await db.select().from(CartItemTable)
    .where(eq(CartItemTable.cart_id, id))
    .orderBy(asc(CartItemTable.created_at))).map(mapCartItem);
  return { ...(cart as unknown as CartType), meta: (cart.meta as Record<string, unknown>) ?? {}, items };
}

export async function getActiveCart(opts: { customer_id?: string; session_id?: string }): Promise<CartType | null> {
  const carts = opts.customer_id
    ? await db.select().from(Cart).where(and(eq(Cart.customer_id, opts.customer_id), eq(Cart.status, 'active')))
    : opts.session_id
    ? await db.select().from(Cart).where(and(eq(Cart.session_id, opts.session_id), eq(Cart.status, 'active')))
    : [];
  return carts[0] ? getCart(carts[0].id) : null;
}

export async function createCart(data: { customer_id?: string; session_id?: string; currency?: string }): Promise<CartType> {
  const id = crypto.randomUUID();
  await db.insert(Cart).values({
    id,
    customer_id: data.customer_id ?? null,
    session_id:  data.session_id  ?? null,
    currency:    data.currency    ?? 'INR',
    status:      'active',
  });
  return getCart(id) as Promise<CartType>;
}

export async function addCartItem(
  cartId: string,
  item: Omit<CartItem, 'id' | 'cart_id' | 'created_at'>
): Promise<CartItem> {
  const existing = await db.select().from(CartItemTable)
    .where(and(eq(CartItemTable.cart_id, cartId), eq(CartItemTable.ref_id, item.ref_id)));
  if (existing[0]) {
    const newQty = existing[0].quantity + item.quantity;
    await db.update(CartItemTable).set({ quantity: newQty }).where(eq(CartItemTable.id, existing[0].id));
    await db.update(Cart).set({ updated_at: new Date().toISOString() }).where(eq(Cart.id, cartId));
    return mapCartItem({ ...existing[0], quantity: newQty });
  }
  const id = crypto.randomUUID();
  await db.insert(CartItemTable).values({
    id, cart_id: cartId,
    item_type:     item.item_type,
    ref_id:        item.ref_id,
    variant_id:    item.variant_id    ?? null,
    package_id:    item.package_id    ?? null,
    name:          item.name,
    image_url:     item.image_url     ?? null,
    sku:           item.sku           ?? null,
    slug:          item.slug          ?? null,
    unit_price:    item.unit_price,
    compare_at:    item.compare_at    ?? null,
    currency:      item.currency,
    quantity:      item.quantity,
    tax_rate:      item.tax_rate,
    tax_inclusive: item.tax_inclusive ? true : false,
    custom_options: item.custom_options ?? null,
    note:          item.note          ?? null,
  });
  await db.update(Cart).set({ updated_at: new Date().toISOString() }).where(eq(Cart.id, cartId));
  return { ...item, id, cart_id: cartId, created_at: new Date().toISOString() };
}

export async function updateCartItemQty(itemId: string, qty: number): Promise<void> {
  if (qty <= 0) {
    await db.delete(CartItemTable).where(eq(CartItemTable.id, itemId));
  } else {
    await db.update(CartItemTable).set({ quantity: qty }).where(eq(CartItemTable.id, itemId));
  }
}

export async function removeCartItem(itemId: string): Promise<void> {
  await db.delete(CartItemTable).where(eq(CartItemTable.id, itemId));
}

export function computeCartTotals(cart: CartType): CartTotals {
  const items = cart.items ?? [];
  let subtotal = 0, tax = 0;
  for (const item of items) {
    const lineTotal = item.unit_price * item.quantity;
    subtotal += lineTotal;
    tax += item.tax_inclusive
      ? lineTotal - lineTotal / (1 + item.tax_rate / 100)
      : lineTotal * item.tax_rate / 100;
  }
  const regular = items.filter((i) => i.item_type !== 'fee' && i.item_type !== 'discount');
  return {
    subtotal, discount_amount: 0, shipping_amount: 0,
    tax_amount: Math.round(tax * 100) / 100,
    total: subtotal, currency: cart.currency as CartTotals['currency'],
    items_count: regular.length,
    units_count: regular.reduce((s, i) => s + i.quantity, 0),
  };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await db.select().from(Orders).where(eq(Orders.id, id));
  const order = orders[0];
  if (!order) return null;
  const items = (await db.select().from(OrderItem).where(eq(OrderItem.order_id, id))) as unknown as OrderItemType[];
  return mapOrder(order, items);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = await db.select().from(Orders).where(eq(Orders.order_number, orderNumber));
  return orders[0] ? getOrder(orders[0].id) : null;
}

export async function listOrders(opts: { customer_id?: string; status?: OrderStatus; limit?: number } = {}): Promise<Order[]> {
  const conditions = [];
  if (opts.customer_id) conditions.push(eq(Orders.customer_id, opts.customer_id));
  if (opts.status)      conditions.push(eq(Orders.status, opts.status));
  const rows = await db.select().from(Orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(Orders.created_at))
    .limit(opts.limit ?? 50);
  return Promise.all(rows.map((r) => getOrder(r.id) as Promise<Order>));
}

// ── Inquiry ───────────────────────────────────────────────────────────────────

export async function getInquiry(id: string): Promise<InquiryType | null> {
  const rows = await db.select().from(Inquiry).where(eq(Inquiry.id, id));
  const row = rows[0];
  if (!row) return null;
  const items = (await db.select().from(InquiryItem).where(eq(InquiryItem.inquiry_id, id))) as unknown as InquiryItemType[];
  return mapInquiry(row, items);
}

export async function createInquiry(data: Pick<InquiryType, 'contact' | 'message' | 'budget' | 'timeline' | 'source'> & {
  company?: string; gstin?: string; currency?: string;
  items?: Array<Pick<InquiryItemType, 'ref_type' | 'ref_id' | 'name' | 'quantity' | 'note'>>;
}): Promise<InquiryType> {
  const id = crypto.randomUUID();
  await db.insert(Inquiry).values({
    id,
    company:  data.company  ?? null,
    gstin:    data.gstin    ?? null,
    message:  data.message  ?? null,
    budget:   data.budget   ?? null,
    timeline: data.timeline ?? null,
    source:   data.source   ?? null,
    currency: data.currency ?? 'INR',
    contact:  data.contact ?? null,
  });
  for (const item of data.items ?? []) {
    await db.insert(InquiryItem).values({
      id: crypto.randomUUID(), inquiry_id: id,
      ref_type: item.ref_type, ref_id: item.ref_id, name: item.name,
      quantity: item.quantity ?? null, note: item.note ?? null,
    });
  }
  return getInquiry(id) as Promise<InquiryType>;
}

export async function listInquiries(status?: InquiryStatus, limit = 50): Promise<InquiryType[]> {
  const rows = await db.select().from(Inquiry)
    .where(status ? eq(Inquiry.status, status) : undefined)
    .orderBy(desc(Inquiry.created_at))
    .limit(limit);
  return Promise.all(rows.map((r) => getInquiry(r.id) as Promise<InquiryType>));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  await db.update(Inquiry).set({ status, updated_at: new Date().toISOString() }).where(eq(Inquiry.id, id));
}
