/**
 * Product category block resolver.
 *
 * Handles all product/* variants: grid, list, detail.
 * Fetches from Astro content collections (which read from site.db).
 * Returns ProductBlockData — the canonical product category contract.
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Block, BlockContext, ResolvedBlock } from '../types.js';
import type {
  ProductBlockData, ProductItem, ProductDetailItem,
  ProductPrice, ProductBadge, StockState, ProductImage,
  ProductSwatch, ProductOption, ProductVariantEntry, ProductSection,
} from '../../../components/registry/product/types.js';

// ── Collection entry → canonical types ───────────────────────────────────────

type ProductEntry  = CollectionEntry<'products'>;
type CategoryEntry = CollectionEntry<'categories'>;

function deriveStock(inventory: Record<string, unknown>): StockState {
  if (!inventory.manage_stock) return { kind: 'in-stock' };
  const qty = Number(inventory.stock_qty ?? 0);
  const threshold = inventory.low_stock_threshold as number | undefined;
  if (qty <= 0) return { kind: 'out-of-stock' };
  if (threshold && qty <= threshold) return { kind: 'low-stock', remaining: qty };
  return { kind: 'in-stock' };
}

function derivePrice(pricing: Record<string, unknown>): ProductPrice {
  return {
    amount:     Number(pricing.amount ?? 0),
    compareAt:  pricing.compare_at != null ? Number(pricing.compare_at) : undefined,
    currency:   String(pricing.currency ?? 'INR'),
    locale:     pricing.currency === 'INR' ? 'en-IN' : 'en-US',
    label:      pricing.display_label as string | undefined,
    showPrice:  pricing.show_price !== false,
    unitLabel:  pricing.unit_label as string | undefined,
  };
}

function deriveBadges(entry: ProductEntry): ProductBadge[] {
  const d      = entry.data;
  const badges: ProductBadge[] = [];
  const tags   = (d.tags ?? []).map((t: { name: string }) => t.name.toLowerCase());

  if (d.is_new)        badges.push({ kind: 'new',        label: 'New' });
  if (d.is_bestseller) badges.push({ kind: 'bestseller', label: 'Bestseller' });
  const p = d.pricing as Record<string, unknown>;
  if (p.compare_at && p.amount && Number(p.compare_at) > Number(p.amount))
    badges.push({ kind: 'sale', label: 'Sale' });
  if (tags.includes('hot'))     badges.push({ kind: 'hot',     label: '🔥 Hot' });
  if (tags.includes('limited')) badges.push({ kind: 'limited', label: 'Limited' });
  return badges;
}

function entryToProductItem(entry: ProductEntry): ProductItem {
  const d       = entry.data;
  const pricing = d.pricing as Record<string, unknown>;
  const inventory = d.inventory as Record<string, unknown>;
  const shipping  = d.shipping  as Record<string, unknown>;
  const images    = (d.images   ?? []) as Array<Record<string, unknown>>;
  const variants  = (d.variant_options ?? []) as Array<Record<string, unknown>>;

  const swatches = variants
    .find((o: Record<string, unknown>) => String(o.name).toLowerCase() === 'color')
    ?.values as Array<Record<string, unknown>> | undefined;

  return {
    id:           entry.id,
    name:         d.name,
    brand:        d.brand,
    description:  d.short_desc ?? d.description,
    slug:         entry.id,
    href:         `/products/${entry.id}`,
    images:       images.map((img) => ({
      src:         String(img.url),
      alt:         img.alt ? String(img.alt) : d.name,
      aspectRatio: img.aspect_ratio ? Number(img.aspect_ratio) : undefined,
    })) satisfies ProductImage[],
    price:        derivePrice(pricing),
    badges:       deriveBadges(entry),
    tags:         (d.tags ?? []).map((t: { name: string }) => t.name),
    stock:        deriveStock(inventory),
    swatches:     swatches
      ?.filter((v: Record<string, unknown>) => v.swatch)
      .map((v: Record<string, unknown>) => ({
        id:      String(v.value).toLowerCase(),
        label:   String(v.label ?? v.value),
        color:   v.swatch ? String(v.swatch) : undefined,
        inStock: v.in_stock !== false,
      })) satisfies ProductSwatch[],
    rating:       d.rating,
    reviewCount:  d.review_count,
    isNew:        Boolean(d.is_new),
    isBestseller: Boolean(d.is_bestseller),
    isFeatured:   Boolean(d.is_featured),
    freeShipping: Boolean((shipping as Record<string, unknown>).is_free_shipping),
  };
}

function entryToProductDetailItem(
  entry: ProductEntry,
  related: ProductEntry[]
): ProductDetailItem {
  const d        = entry.data;
  const pricing  = d.pricing  as Record<string, unknown>;
  const inventory= d.inventory as Record<string, unknown>;
  const images   = (d.images  ?? []) as Array<Record<string, unknown>>;
  const options  = (d.variant_options ?? []) as Array<Record<string, unknown>>;
  const variants = (d.variants ?? []) as Array<Record<string, unknown>>;
  const sections = (d.sections ?? []) as Array<Record<string, unknown>>;

  return {
    id:          entry.id,
    name:        d.name,
    brand:       d.brand,
    tagline:     d.tagline,
    description: d.description ?? '',
    slug:        entry.id,
    gallery:     images
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map((img) => ({
        src:         String(img.url),
        alt:         img.alt ? String(img.alt) : d.name,
        aspectRatio: img.aspect_ratio ? Number(img.aspect_ratio) : 1,
      })) satisfies ProductImage[],
    price:  derivePrice(pricing),
    badges: deriveBadges(entry),
    stock:  deriveStock(inventory),

    options: options.map((opt) => ({
      id:   String(opt.name).toLowerCase(),
      name: String(opt.name),
      kind: String(opt.name).toLowerCase() === 'color' ? 'swatch'
          : String(opt.name).toLowerCase() === 'size'  ? 'chip'
          : 'select',
      values: ((opt.values ?? []) as Array<Record<string, unknown>>).map((v) => ({
        id:       String(v.value).toLowerCase().replace(/\s+/g, '-'),
        label:    String(v.label ?? v.value),
        swatch:   v.swatch ? String(v.swatch) : undefined,
        disabled: !v.in_stock,
      })),
    })) satisfies ProductOption[],

    variants: variants.map((v) => {
      const sel: Record<string, string> = {};
      const vOpts = v.option_values as Record<string, string> ?? {};
      for (const [k, val] of Object.entries(vOpts)) {
        sel[k.toLowerCase()] = val.toLowerCase().replace(/\s+/g, '-');
      }
      const vPricing = (v.pricing ?? pricing) as Record<string, unknown>;
      return {
        id:        v.sku ? String(v.sku) : `${entry.id}-v`,
        sku:       v.sku ? String(v.sku) : undefined,
        selection: sel,
        price:     derivePrice(vPricing),
        stock:     v.stock_status === 'out_of_stock'
          ? { kind: 'out-of-stock' }
          : v.stock_qty != null && Number(v.stock_qty) <= 5 && Number(v.stock_qty) > 0
          ? { kind: 'low-stock', remaining: Number(v.stock_qty) }
          : { kind: 'in-stock' },
      } satisfies ProductVariantEntry;
    }),

    highlights: (d.highlights ?? []) as string[],

    sections: sections.map((s) => ({
      id:          String(s.id),
      title:       String(s.title),
      body:        s.body ? String(s.body) : undefined,
      specs:       (s.specs as Array<{ label: string; value: string }> | undefined),
      defaultOpen: Boolean(s.default_open),
    })) satisfies ProductSection[],

    reviews: d.rating != null && d.review_count != null ? {
      average:   d.rating,
      total:     d.review_count,
      histogram: [0, 0, 0, Math.floor(d.review_count * 0.15), Math.ceil(d.review_count * 0.85)],
    } : undefined,

    relatedProducts: related.map(entryToProductItem),

    breadcrumbs: [
      { label: 'Products', href: '/products' },
      { label: d.name,     href: `/products/${entry.id}` },
    ],
  };
}

// ── Resolver ──────────────────────────────────────────────────────────────────

export async function resolveProductBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<ProductBlockData>> {
  const variant = block.type.split('/')[1] ?? 'grid';
  const attrs   = block.attrs;
  const all     = await getCollection('products', (e) => e.data.status === 'active');

  let products:   ProductItem[]       = [];
  let product:    ProductDetailItem | null = null;
  let related:    ProductItem[]       = [];

  if (variant === 'detail') {
    // Resolve ref from block attrs OR page context
    const refId = (attrs.ref_id as string | undefined) ?? ctx.page_ref_id;
    const entry = refId ? all.find((e) => e.id === refId) : undefined;
    if (entry) {
      const relatedIds = (entry.data.related_ids ?? []) as string[];
      const relEntries = all.filter((e) => relatedIds.includes(e.id) && e.id !== entry.id).slice(0, 4);
      product = entryToProductDetailItem(entry, relEntries);
      related = relEntries.map(entryToProductItem);
    }
  } else {
    // grid / list — filter by category_id if provided
    const catId = attrs.category_id as string | undefined;
    const limit = Number(attrs.limit ?? 24);
    let filtered = catId
      ? all.filter((e) => (e.data.category_ids as string[]).includes(catId))
      : all;
    filtered = filtered.sort((a, b) => Number(a.data.sort_order ?? 0) - Number(b.data.sort_order ?? 0));
    products = filtered.slice(0, limit).map(entryToProductItem);
  }

  return { id: block.id, type: block.type, category: 'product', variant, data: { products, product, relatedProducts: related, attrs }, attrs };
}
