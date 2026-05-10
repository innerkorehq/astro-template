-- ─────────────────────────────────────────────────────────────────────────────
-- Site DB schema  (master spec + useful fields from previous schema)
--
-- Conventions
--   TEXT PRIMARY KEY  → UUID (crypto.randomUUID()) or fixed string ('main')
--   INTEGER (0|1)     → boolean
--   TEXT              → JSON columns for complex/nested values
--   datetime('now')   → UTC ISO-8601 timestamp
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user ─────────────────────────────────────────────────────────────────────
-- Defined first so page_content.created_by FK resolves.

CREATE TABLE IF NOT EXISTS user (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor'
                  CHECK(role IN ('admin','editor','viewer')),
  -- extra: from previous schema
  name          TEXT,
  avatar_url    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── site_config ──────────────────────────────────────────────────────────────
-- Single row (id = 'main').  Core fields from master spec; extended with
-- branding, social, and contact fields from previous schema.

CREATE TABLE IF NOT EXISTS site_config (
  id            TEXT PRIMARY KEY DEFAULT 'main',
  -- master spec core
  name          TEXT NOT NULL,
  domain        TEXT,
  locale        TEXT NOT NULL DEFAULT 'en',
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK(status IN ('active','maintenance','inactive')),
  meta          TEXT NOT NULL DEFAULT '{}',   -- JSON catch-all (features, analytics, rss, etc.)
  -- extra: from previous schema — useful scalar fields
  tagline       TEXT,
  description   TEXT,
  base_url      TEXT,
  theme         TEXT NOT NULL DEFAULT 'light',
  primary_color TEXT,
  secondary_color TEXT,
  logo_url      TEXT,
  favicon_url   TEXT,
  -- extra: social links
  social_twitter    TEXT,
  social_linkedin   TEXT,
  social_github     TEXT,
  social_youtube    TEXT,
  social_instagram  TEXT,
  social_facebook   TEXT,
  -- extra: JSON blobs for complex objects
  contact       TEXT NOT NULL DEFAULT '{}',   -- ContactInfo
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── media ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL DEFAULT 0,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  -- extra: from previous schema
  width       INTEGER,
  height      INTEGER,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── page ──────────────────────────────────────────────────────────────────────
-- Hierarchical page tree with materialised path for O(1) lookups.

CREATE TABLE IF NOT EXISTS page (
  id           TEXT PRIMARY KEY,
  parent_id    TEXT REFERENCES page(id) ON DELETE SET NULL,
  slug         TEXT NOT NULL,
  path         TEXT NOT NULL UNIQUE,
  -- master spec types + 'doc'/'blog' from previous schema
  type         TEXT NOT NULL DEFAULT 'page'
                 CHECK(type IN ('page','post','landing','redirect','doc','blog')),
  -- Registry block template e.g. 'product/detail', 'product/list', 'landing'
  template     TEXT,
  -- Reference to a catalog entity (product, service, content_document, category)
  ref_type     TEXT,   -- 'product' | 'service' | 'document' | 'category'
  ref_id       TEXT,   -- slug / id of the referenced entity
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK(status IN ('draft','published','archived')),
  position     INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_path   ON page(path);
CREATE INDEX IF NOT EXISTS idx_page_parent ON page(parent_id);
CREATE INDEX IF NOT EXISTS idx_page_status ON page(status);

-- ── page_content ─────────────────────────────────────────────────────────────
-- Versioned, locale-aware content blocks for each page.

CREATE TABLE IF NOT EXISTS page_content (
  id          TEXT PRIMARY KEY,
  page_id     TEXT NOT NULL REFERENCES page(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL DEFAULT 'en',
  version     INTEGER NOT NULL DEFAULT 1,
  is_current  INTEGER NOT NULL DEFAULT 1,
  title       TEXT NOT NULL,
  description TEXT,
  body        TEXT NOT NULL DEFAULT '[]',   -- JSON: ContentBlock[]
  -- extra: from previous schema
  body_format TEXT NOT NULL DEFAULT 'richtext'
                CHECK(body_format IN ('markdown','html','mdx','richtext','plain')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  created_by  TEXT REFERENCES user(id) ON DELETE SET NULL,
  UNIQUE(page_id, locale, version)
);

CREATE INDEX IF NOT EXISTS idx_page_content_current ON page_content(page_id, locale, is_current);

-- ── seo_meta ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seo_meta (
  id               TEXT PRIMARY KEY,
  page_id          TEXT NOT NULL REFERENCES page(id) ON DELETE CASCADE,
  locale           TEXT NOT NULL DEFAULT 'en',
  meta_title       TEXT,
  meta_description TEXT,
  canonical_url    TEXT,
  og_title         TEXT,
  og_description   TEXT,
  og_image         TEXT,
  noindex          INTEGER NOT NULL DEFAULT 0,
  nofollow         INTEGER NOT NULL DEFAULT 0,
  -- extra: from previous schema
  schema_org       TEXT,   -- JSON-LD blob
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(page_id, locale)
);

-- ── menu ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menu (
  id         TEXT PRIMARY KEY,
  handle     TEXT NOT NULL UNIQUE,
  -- extra: from previous schema
  name       TEXT NOT NULL DEFAULT '',
  locale     TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── menu_item ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menu_item (
  id              TEXT PRIMARY KEY,
  menu_id         TEXT NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  parent_id       TEXT REFERENCES menu_item(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL DEFAULT 0,
  label           TEXT NOT NULL,
  page_id         TEXT REFERENCES page(id) ON DELETE SET NULL,
  url             TEXT,
  target          TEXT,
  -- extra: from previous schema
  type            TEXT NOT NULL DEFAULT 'link'
                    CHECK(type IN ('link','doc','collection','dropdown','mega_menu','divider','button')),
  icon            TEXT,
  badge           TEXT,
  badge_color     TEXT,
  is_external     INTEGER NOT NULL DEFAULT 0,
  open_in_new_tab INTEGER NOT NULL DEFAULT 0,
  is_cta          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menu_item_menu   ON menu_item(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_parent ON menu_item(parent_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- Content layer  (document.py)
-- Separate from the site page tree — these are the actual CMS documents:
-- blog posts, docs, news, landing pages, changelogs, legal pages, etc.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── content_author ────────────────────────────────────────────────────────────
-- Maps Author from base.py. Created before content_document for FK resolution.

CREATE TABLE IF NOT EXISTS content_author (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  bio             TEXT,
  avatar          TEXT,              -- JSON: MediaAsset
  role            TEXT,              -- "Editor", "Technical Writer"
  social_twitter  TEXT,
  social_linkedin TEXT,
  social_github   TEXT,
  website         TEXT,
  is_external     INTEGER NOT NULL DEFAULT 0,
  contact         TEXT NOT NULL DEFAULT '{}', -- JSON: ContactInfo
  meta            TEXT NOT NULL DEFAULT '{}',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── content_collection ────────────────────────────────────────────────────────
-- Maps ContentCollection from document.py.
-- Groupings: blog categories, doc sections, news desks, KB sections. Nestable.

CREATE TABLE IF NOT EXISTS content_collection (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT,
  description   TEXT,
  parent_id     TEXT REFERENCES content_collection(id) ON DELETE SET NULL,
  -- NULL = accepts any content type
  content_type  TEXT,
  icon          TEXT,
  cover         TEXT,               -- JSON: MediaAsset
  color         TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  path          TEXT,               -- materialised e.g. "docs/api/auth"
  depth         INTEGER NOT NULL DEFAULT 0,
  seo           TEXT NOT NULL DEFAULT '{}', -- JSON: SEOMeta
  meta          TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_collection_slug   ON content_collection(slug);
CREATE INDEX IF NOT EXISTS idx_collection_parent ON content_collection(parent_id);
CREATE INDEX IF NOT EXISTS idx_collection_type   ON content_collection(content_type);

-- ── content_document ─────────────────────────────────────────────────────────
-- Maps ContentDocument from document.py.
-- Universal: blog post, news, doc page, guide, tutorial, KB, case study,
-- changelog, legal page, landing page, podcast, video, event, job listing, etc.
-- Complex nested objects stored as JSON columns; scalar fields are columns.

CREATE TABLE IF NOT EXISTS content_document (
  id                  TEXT PRIMARY KEY,

  -- Core identity
  content_type        TEXT NOT NULL DEFAULT 'blog_post',
  title               TEXT NOT NULL,
  subtitle            TEXT,
  excerpt             TEXT,
  slug                TEXT,
  locale              TEXT NOT NULL DEFAULT 'en',

  -- Body
  body                TEXT,                             -- raw markdown / html / plain
  body_format         TEXT NOT NULL DEFAULT 'markdown'
                        CHECK(body_format IN ('markdown','html','mdx','richtext','plain')),
  blocks              TEXT NOT NULL DEFAULT '[]',       -- JSON: ContentBlock[]
  word_count          INTEGER,
  reading_time_mins   INTEGER,

  -- Media
  cover_image         TEXT,                             -- JSON: MediaAsset
  og_image            TEXT,                             -- JSON: MediaAsset

  -- Taxonomy (JSON arrays — avoids junction tables for simple list access)
  collection_ids      TEXT NOT NULL DEFAULT '[]',       -- JSON: string[]
  tags                TEXT NOT NULL DEFAULT '[]',       -- JSON: Tag[]
  topics              TEXT NOT NULL DEFAULT '[]',       -- JSON: string[]
  content_series      TEXT,
  series_order        INTEGER,

  -- Authorship (full objects stored for denormalised reads; use content_author for management)
  authors             TEXT NOT NULL DEFAULT '[]',       -- JSON: Author[]
  reviewers           TEXT NOT NULL DEFAULT '[]',       -- JSON: Author[]
  organization        TEXT,

  -- Audience
  audience_level      TEXT NOT NULL DEFAULT 'all',
  target_roles        TEXT NOT NULL DEFAULT '[]',       -- JSON: string[]
  target_industries   TEXT NOT NULL DEFAULT '[]',       -- JSON: string[]

  -- Status & visibility
  status              TEXT NOT NULL DEFAULT 'draft',
  is_featured         INTEGER NOT NULL DEFAULT 0,
  is_pinned           INTEGER NOT NULL DEFAULT 0,
  is_premium          INTEGER NOT NULL DEFAULT 0,
  is_sponsored        INTEGER NOT NULL DEFAULT 0,
  noindex             INTEGER NOT NULL DEFAULT 0,
  password            TEXT,

  -- Scheduling
  published_at        TEXT,
  updated_at_display  TEXT,
  expires_at          TEXT,
  scheduled_at        TEXT,

  -- Versioning (docs)
  version             TEXT,
  versions            TEXT NOT NULL DEFAULT '[]',       -- JSON: ContentVersion[]
  is_latest_version   INTEGER NOT NULL DEFAULT 1,
  deprecated          INTEGER NOT NULL DEFAULT 0,
  deprecation_notice  TEXT,
  migration_guide_url TEXT,

  -- Navigation / structure (docs & serialised content)
  breadcrumbs         TEXT NOT NULL DEFAULT '[]',       -- JSON: BreadcrumbItem[]
  toc                 TEXT NOT NULL DEFAULT '[]',       -- JSON: TOCEntry[]
  prev_doc            TEXT,                             -- JSON: ContentRef
  next_doc            TEXT,                             -- JSON: ContentRef
  parent_doc          TEXT,                             -- JSON: ContentRef

  -- Related content
  related             TEXT NOT NULL DEFAULT '[]',       -- JSON: ContentRef[]
  canonical_url       TEXT,

  -- SEO & social
  seo                 TEXT NOT NULL DEFAULT '{}',       -- JSON: SEOMeta
  social              TEXT NOT NULL DEFAULT '{}',       -- JSON: SocialMeta
  schema_org_type     TEXT,

  -- Feedback & engagement (counters updated at write time)
  feedback            TEXT NOT NULL DEFAULT '{}',       -- JSON: ContentFeedback
  allow_comments      INTEGER NOT NULL DEFAULT 1,
  allow_reactions     INTEGER NOT NULL DEFAULT 1,

  -- Source / attribution
  source_url          TEXT,
  source_name         TEXT,
  license             TEXT,

  -- Localisation
  translations        TEXT NOT NULL DEFAULT '{}',       -- JSON: {locale: doc_id}
  is_translation      INTEGER NOT NULL DEFAULT 0,
  original_id         TEXT REFERENCES content_document(id) ON DELETE SET NULL,

  -- Extension
  custom_fields       TEXT NOT NULL DEFAULT '{}',
  meta                TEXT NOT NULL DEFAULT '{}',

  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_document_slug       ON content_document(slug, locale);
CREATE INDEX IF NOT EXISTS idx_document_type       ON content_document(content_type);
CREATE INDEX IF NOT EXISTS idx_document_status     ON content_document(status);
CREATE INDEX IF NOT EXISTS idx_document_published  ON content_document(published_at);
CREATE INDEX IF NOT EXISTS idx_document_featured   ON content_document(is_featured);
CREATE INDEX IF NOT EXISTS idx_document_original   ON content_document(original_id);

-- ── redirect ─────────────────────────────────────────────────────────────────
-- URL redirect rules (from previous schema — very useful alongside page.type='redirect').

CREATE TABLE IF NOT EXISTS redirect (
  id          TEXT PRIMARY KEY,
  from_path   TEXT NOT NULL UNIQUE,
  to_path     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT '301'
                CHECK(type IN ('301','302','rewrite')),
  is_regex    INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  note        TEXT,
  hit_count   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═════════════════════════════════════════════════════════════════════════════
-- Catalog layer  (merged from catalog.db — single DB philosophy)
-- Maps: product.py, category.py, service.py, cart.py, catalog_config.py
-- ═════════════════════════════════════════════════════════════════════════════

-- ── catalog_config ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalog_config (
  id                    TEXT PRIMARY KEY DEFAULT 'main',
  site_id               TEXT NOT NULL DEFAULT 'main',
  name                  TEXT NOT NULL DEFAULT '',
  tagline               TEXT,
  description           TEXT,
  mode                  TEXT NOT NULL DEFAULT 'hybrid',
  default_currency      TEXT NOT NULL DEFAULT 'INR',
  locale                TEXT NOT NULL DEFAULT 'en-IN',
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  industry              TEXT,
  sub_industry          TEXT,
  notify_email          TEXT,
  notify_phone          TEXT,
  notify_slack_webhook  TEXT,
  custom_domain         TEXT,
  supported_currencies  TEXT NOT NULL DEFAULT '["INR"]',
  business              TEXT NOT NULL DEFAULT '{}',
  branding              TEXT NOT NULL DEFAULT '{}',
  contact               TEXT NOT NULL DEFAULT '{}',
  social                TEXT NOT NULL DEFAULT '{}',
  features              TEXT NOT NULL DEFAULT '{}',
  shipping_zones        TEXT NOT NULL DEFAULT '[]',
  tax_profiles          TEXT NOT NULL DEFAULT '[]',
  seo                   TEXT NOT NULL DEFAULT '{}',
  meta                  TEXT NOT NULL DEFAULT '{}',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── products ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  short_name        TEXT,
  tagline           TEXT,
  description       TEXT,
  short_desc        TEXT,
  sku               TEXT,
  brand             TEXT,
  model_number      TEXT,
  country_of_origin TEXT,
  product_type      TEXT NOT NULL DEFAULT 'physical',
  status            TEXT NOT NULL DEFAULT 'draft',
  is_featured       INTEGER NOT NULL DEFAULT 0,
  is_new            INTEGER NOT NULL DEFAULT 0,
  is_bestseller     INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  rating            REAL,
  review_count      INTEGER,
  vendor_name       TEXT,
  warranty          TEXT,
  pricing_note      TEXT,
  has_variants      INTEGER NOT NULL DEFAULT 0,
  category_ids      TEXT NOT NULL DEFAULT '[]',
  tags              TEXT NOT NULL DEFAULT '[]',
  collections       TEXT NOT NULL DEFAULT '[]',
  images            TEXT NOT NULL DEFAULT '[]',
  pricing           TEXT NOT NULL DEFAULT '{"price_type":"fixed","currency":"INR"}',
  variant_options   TEXT NOT NULL DEFAULT '[]',
  variants          TEXT NOT NULL DEFAULT '[]',
  inventory         TEXT NOT NULL DEFAULT '{"manage_stock":false,"stock_qty":0}',
  shipping          TEXT NOT NULL DEFAULT '{"is_free_shipping":false,"requires_shipping":true}',
  attributes        TEXT NOT NULL DEFAULT '[]',
  sections          TEXT NOT NULL DEFAULT '[]',
  highlights        TEXT NOT NULL DEFAULT '[]',
  related_ids       TEXT NOT NULL DEFAULT '[]',
  certifications    TEXT NOT NULL DEFAULT '[]',
  seo               TEXT NOT NULL DEFAULT '{}',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_type     ON products(product_type);

-- ── categories ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  parent_id   TEXT,
  type        TEXT NOT NULL DEFAULT 'product',
  icon        TEXT,
  color       TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  image       TEXT,
  display     TEXT NOT NULL DEFAULT '{}',
  seo         TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── services ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  tagline           TEXT,
  description       TEXT,
  short_desc        TEXT,
  service_type      TEXT NOT NULL DEFAULT 'one_time',
  delivery_mode     TEXT NOT NULL DEFAULT 'online',
  status            TEXT NOT NULL DEFAULT 'draft',
  is_featured       INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  published_at      TEXT,
  duration          TEXT,
  revisions         TEXT,
  is_remote         INTEGER NOT NULL DEFAULT 1,
  location_address  TEXT,
  availability_note TEXT,
  provider_id       TEXT,
  provider_name     TEXT,
  team_size         INTEGER,
  years_experience  INTEGER,
  rating            REAL,
  review_count      INTEGER,
  category_ids      TEXT NOT NULL DEFAULT '[]',
  tags              TEXT NOT NULL DEFAULT '[]',
  images            TEXT NOT NULL DEFAULT '[]',
  videos            TEXT NOT NULL DEFAULT '[]',
  pricing           TEXT,
  packages          TEXT NOT NULL DEFAULT '[]',
  addons            TEXT NOT NULL DEFAULT '[]',
  deliverables      TEXT NOT NULL DEFAULT '[]',
  process_steps     TEXT NOT NULL DEFAULT '[]',
  service_areas     TEXT NOT NULL DEFAULT '[]',
  booking           TEXT NOT NULL DEFAULT '{}',
  testimonials      TEXT NOT NULL DEFAULT '[]',
  faqs              TEXT NOT NULL DEFAULT '[]',
  certifications    TEXT NOT NULL DEFAULT '[]',
  portfolio_urls    TEXT NOT NULL DEFAULT '[]',
  attributes        TEXT NOT NULL DEFAULT '[]',
  related_ids       TEXT NOT NULL DEFAULT '[]',
  seo               TEXT NOT NULL DEFAULT '{}',
  meta              TEXT NOT NULL DEFAULT '{}',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_status   ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_type     ON services(service_type);

-- ── cart ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart (
  id           TEXT PRIMARY KEY,
  customer_id  TEXT,
  session_id   TEXT,
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK(status IN ('active','abandoned','merged','ordered')),
  currency     TEXT NOT NULL DEFAULT 'INR',
  order_note   TEXT,
  meta         TEXT NOT NULL DEFAULT '{}',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cart_customer ON cart(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_session  ON cart(session_id);

-- ── cart_item ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart_item (
  id             TEXT PRIMARY KEY,
  cart_id        TEXT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  item_type      TEXT NOT NULL DEFAULT 'product'
                   CHECK(item_type IN ('product','service','addon','fee','discount')),
  ref_id         TEXT NOT NULL,
  variant_id     TEXT,
  package_id     TEXT,
  name           TEXT NOT NULL,
  image_url      TEXT,
  sku            TEXT,
  slug           TEXT,
  unit_price     REAL NOT NULL,
  compare_at     REAL,
  currency       TEXT NOT NULL DEFAULT 'INR',
  quantity       INTEGER NOT NULL DEFAULT 1,
  tax_rate       REAL NOT NULL DEFAULT 0,
  tax_inclusive  INTEGER NOT NULL DEFAULT 1,
  custom_options TEXT NOT NULL DEFAULT '{}',
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cart_item_cart ON cart_item(cart_id);

-- ── orders ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,
  cart_id           TEXT,
  customer_id       TEXT,
  customer_email    TEXT,
  customer_phone    TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending','confirmed','processing','shipped','delivered','completed','cancelled','refunded','on_hold')),
  currency          TEXT NOT NULL DEFAULT 'INR',
  customer_note     TEXT,
  internal_note     TEXT,
  confirmed_at      TEXT,
  shipped_at        TEXT,
  delivered_at      TEXT,
  completed_at      TEXT,
  cancelled_at      TEXT,
  contact           TEXT,
  billing_address   TEXT,
  shipping_address  TEXT,
  totals            TEXT NOT NULL DEFAULT '{}',
  applied_discounts TEXT NOT NULL DEFAULT '[]',
  shipping_method   TEXT,
  payment           TEXT,
  tracking_number   TEXT,
  tracking_url      TEXT,
  meta              TEXT NOT NULL DEFAULT '{}',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);

-- ── order_item ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_item (
  id             TEXT PRIMARY KEY,
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type      TEXT NOT NULL DEFAULT 'product',
  ref_id         TEXT NOT NULL,
  variant_id     TEXT,
  package_id     TEXT,
  name           TEXT NOT NULL,
  image_url      TEXT,
  sku            TEXT,
  slug           TEXT,
  unit_price     REAL NOT NULL,
  compare_at     REAL,
  currency       TEXT NOT NULL DEFAULT 'INR',
  quantity       INTEGER NOT NULL DEFAULT 1,
  tax_rate       REAL NOT NULL DEFAULT 0,
  tax_inclusive  INTEGER NOT NULL DEFAULT 1,
  custom_options TEXT NOT NULL DEFAULT '{}',
  note           TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_item(order_id);

-- ── inquiry ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry (
  id                TEXT PRIMARY KEY,
  company           TEXT,
  gstin             TEXT,
  message           TEXT,
  budget            TEXT,
  timeline          TEXT,
  status            TEXT NOT NULL DEFAULT 'new'
                      CHECK(status IN ('new','read','replied','converted','closed','spam')),
  assigned_to       TEXT,
  source            TEXT,
  currency          TEXT NOT NULL DEFAULT 'INR',
  quoted_amount     REAL,
  responded_at      TEXT,
  quote_valid_until TEXT,
  contact           TEXT NOT NULL DEFAULT '{}',
  address           TEXT,
  requirements      TEXT NOT NULL DEFAULT '{}',
  meta              TEXT NOT NULL DEFAULT '{}',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiry_status ON inquiry(status);

-- ── inquiry_item ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry_item (
  id          TEXT PRIMARY KEY,
  inquiry_id  TEXT NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE,
  ref_type    TEXT NOT NULL,
  ref_id      TEXT NOT NULL,
  name        TEXT NOT NULL,
  quantity    INTEGER,
  note        TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiry_item_inquiry ON inquiry_item(inquiry_id);
