import type { Loader } from 'astro/loaders';

// NOTE: 'astro:db' is imported dynamically inside each load() function.
// A static top-level import fails during `astro sync` because the @astrojs/db
// Vite plugin's runtime handler is not yet registered at that phase.
// Dynamic import defers resolution to build-time, where the handler is ready.

// ── Row → data mappers ────────────────────────────────────────────────────────
// @astrojs/db returns column.json() values already parsed (no JSON.parse needed)
// and column.boolean() values as JS booleans.

type AnyRow = Record<string, unknown>;

function productRowToData(row: AnyRow) {
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
    product_type:      String(row.product_type ?? 'physical'),
    status:            String(row.status     ?? 'draft'),
    is_featured:       Boolean(row.is_featured),
    is_new:            Boolean(row.is_new),
    is_bestseller:     Boolean(row.is_bestseller),
    sort_order:        Number(row.sort_order ?? 0),
    rating:            row.rating       != null ? Number(row.rating)       : undefined,
    review_count:      row.review_count != null ? Number(row.review_count) : undefined,
    vendor_name:       row.vendor_name  ? String(row.vendor_name)  : undefined,
    warranty:          row.warranty     ? String(row.warranty)     : undefined,
    pricing_note:      row.pricing_note ? String(row.pricing_note) : undefined,
    has_variants:      Boolean(row.has_variants),
    category_ids:    (row.category_ids   as string[])  ?? [],
    tags:            (row.tags           as object[])  ?? [],
    collections:     (row.collections   as string[])  ?? [],
    images:          (row.images         as object[])  ?? [],
    pricing:         (row.pricing        as object)    ?? { price_type: 'fixed', currency: 'INR' },
    variant_options: (row.variant_options as object[]) ?? [],
    variants:        (row.variants       as object[])  ?? [],
    inventory:       (row.inventory      as object)    ?? {},
    shipping:        (row.shipping       as object)    ?? {},
    attributes:      (row.attributes     as object[])  ?? [],
    sections:        (row.sections       as object[])  ?? [],
    highlights:      (row.highlights     as string[])  ?? [],
    related_ids:     (row.related_ids    as string[])  ?? [],
    certifications:  (row.certifications as string[])  ?? [],
    seo:             (row.seo            as object)    ?? {},
  };
}

function categoryRowToData(row: AnyRow) {
  return {
    name:        String(row.name),
    description: row.description ? String(row.description) : undefined,
    parent_id:   row.parent_id   ? String(row.parent_id)   : undefined,
    type:        String(row.type ?? 'product'),
    icon:        row.icon  ? String(row.icon)  : undefined,
    color:       row.color ? String(row.color) : undefined,
    status:      String(row.status ?? 'active'),
    is_featured: Boolean(row.is_featured),
    sort_order:  Number(row.sort_order ?? 0),
    image:       (row.image   as object | undefined) ?? undefined,
    display:     (row.display as object) ?? {},
    seo:         (row.seo     as object) ?? {},
  };
}

function serviceRowToData(row: AnyRow) {
  return {
    name:              String(row.name),
    tagline:           row.tagline           ? String(row.tagline)           : undefined,
    description:       row.description       ? String(row.description)       : undefined,
    short_desc:        row.short_desc        ? String(row.short_desc)        : undefined,
    service_type:      String(row.service_type  ?? 'one_time'),
    delivery_mode:     String(row.delivery_mode ?? 'online'),
    status:            String(row.status        ?? 'draft'),
    is_featured:       Boolean(row.is_featured),
    sort_order:        Number(row.sort_order ?? 0),
    published_at:      row.published_at      ? String(row.published_at)      : undefined,
    duration:          row.duration          ? String(row.duration)          : undefined,
    revisions:         row.revisions         ? String(row.revisions)         : undefined,
    is_remote:         Boolean(row.is_remote ?? true),
    location_address:  row.location_address  ? String(row.location_address)  : undefined,
    availability_note: row.availability_note ? String(row.availability_note) : undefined,
    provider_id:       row.provider_id       ? String(row.provider_id)       : undefined,
    provider_name:     row.provider_name     ? String(row.provider_name)     : undefined,
    team_size:         row.team_size         != null ? Number(row.team_size)         : undefined,
    years_experience:  row.years_experience  != null ? Number(row.years_experience)  : undefined,
    rating:            row.rating            != null ? Number(row.rating)            : undefined,
    review_count:      row.review_count      != null ? Number(row.review_count)      : undefined,
    category_ids:  (row.category_ids  as string[])  ?? [],
    tags:          (row.tags          as object[])  ?? [],
    images:        (row.images        as object[])  ?? [],
    videos:        (row.videos        as object[])  ?? [],
    pricing:       (row.pricing       as object | undefined) ?? undefined,
    packages:      (row.packages      as object[])  ?? [],
    addons:        (row.addons        as object[])  ?? [],
    deliverables:  (row.deliverables  as object[])  ?? [],
    process_steps: (row.process_steps as object[])  ?? [],
    service_areas: (row.service_areas as string[])  ?? [],
    booking:       (row.booking       as object)    ?? {},
    testimonials:  (row.testimonials  as object[])  ?? [],
    faqs:          (row.faqs          as object[])  ?? [],
    certifications:(row.certifications as string[]) ?? [],
    portfolio_urls:(row.portfolio_urls as string[]) ?? [],
    attributes:    (row.attributes    as object[])  ?? [],
    related_ids:   (row.related_ids   as string[])  ?? [],
    seo:           (row.seo           as object)    ?? {},
  };
}

// ── Loaders ───────────────────────────────────────────────────────────────────

export function sqliteProductLoader(): Loader {
  return {
    name: 'astro-db-products',
    async load({ store, parseData, logger }) {
      // Dynamic import: deferred so it resolves only at build time (not during astro sync)
      const { db, Products, asc } = await import('astro:db').catch(() => null) ?? {};
      if (!db || !Products) {
        logger.warn('[catalog] Astro DB not ready — products will load during build');
        return;
      }
      const rows = (await db.select().from(Products).orderBy(asc!(Products.sort_order))) as AnyRow[];
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
      logger.info(`[catalog] Loaded ${loaded}/${rows.length} products from Astro DB`);
    },
  };
}

export function sqliteCategoryLoader(): Loader {
  return {
    name: 'astro-db-categories',
    async load({ store, parseData, logger }) {
      const { db, Categories, asc } = await import('astro:db').catch(() => null) ?? {};
      if (!db || !Categories) {
        logger.warn('[catalog] Astro DB not ready — categories will load during build');
        return;
      }
      const rows = (await db.select().from(Categories).orderBy(asc!(Categories.sort_order))) as AnyRow[];
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
      logger.info(`[catalog] Loaded ${loaded}/${rows.length} categories from Astro DB`);
    },
  };
}

export function sqliteServiceLoader(): Loader {
  return {
    name: 'astro-db-services',
    async load({ store, parseData, logger }) {
      const { db, Services, asc } = await import('astro:db').catch(() => null) ?? {};
      if (!db || !Services) {
        logger.warn('[catalog] Astro DB not ready — services will load during build');
        return;
      }
      const rows = (await db.select().from(Services).orderBy(asc!(Services.sort_order))) as AnyRow[];
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
      logger.info(`[catalog] Loaded ${loaded}/${rows.length} services from Astro DB`);
    },
  };
}
