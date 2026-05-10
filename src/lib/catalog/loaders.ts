import type { Loader } from "astro/loaders";
import { getDb } from "../../db/client.js";

// ── JSON column helper ────────────────────────────────────────────────────────

function j<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  try { return JSON.parse(String(raw)) as T; } catch { return fallback; }
}

// ── Row → collection data mappers ────────────────────────────────────────────

function productRowToData(row: Record<string, unknown>) {
  return {
    name:              String(row.name),
    short_name:        row.short_name        ? String(row.short_name)        : undefined,
    tagline:           row.tagline           ? String(row.tagline)           : undefined,
    description:       row.description       ? String(row.description)       : undefined,
    short_desc:        row.short_desc        ? String(row.short_desc)        : undefined,
    sku:               row.sku               ? String(row.sku)               : undefined,
    brand:             row.brand             ? String(row.brand)             : undefined,
    model_number:      row.model_number      ? String(row.model_number)      : undefined,
    country_of_origin: row.country_of_origin ? String(row.country_of_origin) : undefined,
    product_type:      String(row.product_type ?? "physical"),
    status:            String(row.status ?? "draft"),
    is_featured:       Boolean(row.is_featured),
    is_new:            Boolean(row.is_new),
    is_bestseller:     Boolean(row.is_bestseller),
    sort_order:        Number(row.sort_order ?? 0),
    rating:            row.rating      != null ? Number(row.rating)       : undefined,
    review_count:      row.review_count != null ? Number(row.review_count) : undefined,
    vendor_name:       row.vendor_name  ? String(row.vendor_name)  : undefined,
    warranty:          row.warranty     ? String(row.warranty)     : undefined,
    pricing_note:      row.pricing_note ? String(row.pricing_note) : undefined,
    has_variants:      Boolean(row.has_variants),
    // JSON columns
    category_ids:    j(row.category_ids,   []),
    tags:            j(row.tags,           []),
    collections:     j(row.collections,    []),
    images:          j(row.images,         []),
    pricing:         j(row.pricing,        { price_type: "fixed", currency: "INR" }),
    variant_options: j(row.variant_options,[]),
    variants:        j(row.variants,       []),
    inventory:       j(row.inventory,      {}),
    shipping:        j(row.shipping,       {}),
    attributes:      j(row.attributes,     []),
    sections:        j(row.sections,       []),
    highlights:      j(row.highlights,     []),
    related_ids:     j(row.related_ids,    []),
    certifications:  j(row.certifications, []),
    seo:             j(row.seo,            {}),
  };
}

function categoryRowToData(row: Record<string, unknown>) {
  return {
    name:        String(row.name),
    description: row.description ? String(row.description) : undefined,
    parent_id:   row.parent_id   ? String(row.parent_id)   : undefined,
    type:        String(row.type ?? "product"),
    icon:        row.icon        ? String(row.icon)         : undefined,
    color:       row.color       ? String(row.color)        : undefined,
    status:      String(row.status ?? "active"),
    is_featured: Boolean(row.is_featured),
    sort_order:  Number(row.sort_order ?? 0),
    image:       j(row.image,   undefined),
    display:     j(row.display, {}),
    seo:         j(row.seo,     {}),
  };
}

function serviceRowToData(row: Record<string, unknown>) {
  return {
    name:              String(row.name),
    tagline:           row.tagline           ? String(row.tagline)           : undefined,
    description:       row.description       ? String(row.description)       : undefined,
    short_desc:        row.short_desc        ? String(row.short_desc)        : undefined,
    service_type:      String(row.service_type  ?? "one_time"),
    delivery_mode:     String(row.delivery_mode ?? "online"),
    status:            String(row.status        ?? "draft"),
    is_featured:       Boolean(row.is_featured),
    sort_order:        Number(row.sort_order ?? 0),
    published_at:      row.published_at       ? String(row.published_at)       : undefined,
    duration:          row.duration           ? String(row.duration)           : undefined,
    revisions:         row.revisions          ? String(row.revisions)          : undefined,
    is_remote:         Boolean(row.is_remote ?? 1),
    location_address:  row.location_address  ? String(row.location_address)  : undefined,
    availability_note: row.availability_note ? String(row.availability_note) : undefined,
    provider_id:       row.provider_id       ? String(row.provider_id)       : undefined,
    provider_name:     row.provider_name     ? String(row.provider_name)     : undefined,
    team_size:         row.team_size         != null ? Number(row.team_size)         : undefined,
    years_experience:  row.years_experience  != null ? Number(row.years_experience)  : undefined,
    rating:            row.rating            != null ? Number(row.rating)            : undefined,
    review_count:      row.review_count      != null ? Number(row.review_count)      : undefined,
    // JSON columns
    category_ids:  j(row.category_ids,  []),
    tags:          j(row.tags,          []),
    images:        j(row.images,        []),
    videos:        j(row.videos,        []),
    pricing:       j(row.pricing,       undefined),
    packages:      j(row.packages,      []),
    addons:        j(row.addons,        []),
    deliverables:  j(row.deliverables,  []),
    process_steps: j(row.process_steps, []),
    service_areas: j(row.service_areas, []),
    booking:       j(row.booking,       {}),
    testimonials:  j(row.testimonials,  []),
    faqs:          j(row.faqs,          []),
    certifications: j(row.certifications, []),
    portfolio_urls: j(row.portfolio_urls,  []),
    attributes:    j(row.attributes,    []),
    related_ids:   j(row.related_ids,   []),
    seo:           j(row.seo,           {}),
  };
}

// ── Loaders ───────────────────────────────────────────────────────────────────

export function sqliteProductLoader(): Loader {
  return {
    name: "catalog-sqlite-products",
    async load({ store, parseData, logger }) {
      const db = getDb();
      const rows = db
        .prepare("SELECT * FROM products ORDER BY sort_order ASC")
        .all() as Record<string, unknown>[];

      store.clear();
      let loaded = 0;

      for (const row of rows) {
        const id = String(row.id);
        try {
          const data = await parseData({ id, data: productRowToData(row) });
          store.set({ id, data });
          loaded++;
        } catch (err) {
          logger.warn(`[catalog] Skipping product "${id}": ${(err as Error).message}`);
        }
      }

      logger.info(`[catalog] Loaded ${loaded}/${rows.length} products from SQLite`);
    },
  };
}

export function sqliteCategoryLoader(): Loader {
  return {
    name: "catalog-sqlite-categories",
    async load({ store, parseData, logger }) {
      const db = getDb();
      const rows = db
        .prepare("SELECT * FROM categories ORDER BY sort_order ASC")
        .all() as Record<string, unknown>[];

      store.clear();
      let loaded = 0;

      for (const row of rows) {
        const id = String(row.id);
        try {
          const data = await parseData({ id, data: categoryRowToData(row) });
          store.set({ id, data });
          loaded++;
        } catch (err) {
          logger.warn(`[catalog] Skipping category "${id}": ${(err as Error).message}`);
        }
      }

      logger.info(`[catalog] Loaded ${loaded}/${rows.length} categories from SQLite`);
    },
  };
}

export function sqliteServiceLoader(): Loader {
  return {
    name: "catalog-sqlite-services",
    async load({ store, parseData, logger }) {
      const db = getDb();
      const rows = db
        .prepare("SELECT * FROM services ORDER BY sort_order ASC")
        .all() as Record<string, unknown>[];

      store.clear();
      let loaded = 0;

      for (const row of rows) {
        const id = String(row.id);
        try {
          const data = await parseData({ id, data: serviceRowToData(row) });
          store.set({ id, data });
          loaded++;
        } catch (err) {
          logger.warn(`[catalog] Skipping service "${id}": ${(err as Error).message}`);
        }
      }

      logger.info(`[catalog] Loaded ${loaded}/${rows.length} services from SQLite`);
    },
  };
}
