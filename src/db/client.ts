/**
 * src/db/client.ts — Site DB client (better-sqlite3, synchronous)
 *
 * Auto-initialises schema + seed on first access when site.db doesn't exist
 * or site_config is empty.  All helpers are synchronous.
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Menu, MenuItem, MenuItemWithChildren, MenuWithItems,
  Page, PageContent, PageWithContent,
  SeoMeta, SiteConfig,
  ContentDocument, ContentCollection, ContentAuthor, ContentCard,
  ContentType, ContentStatus,
} from './types.js';

// ── Paths — always relative to project root (process.cwd()) ──────────────────
// __dirname cannot be used here because during `astro build` this module is
// bundled into dist/.prerender/chunks/ where the .sql files don't exist.

const DB_PATH     = join(process.cwd(), 'site.db');
const SCHEMA_PATH = join(process.cwd(), 'src/db/schema.sql');
const SEED_PATH   = join(process.cwd(), 'src/db/seed.sql');

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  try { return JSON.parse(String(raw)) as T; } catch { return fallback; }
}

function buildMenuTree(flat: MenuItem[]): MenuItemWithChildren[] {
  const byId = new Map(
    flat.map((item) => [item.id, { ...item, children: [] as MenuItemWithChildren[] }])
  );
  const roots: MenuItemWithChildren[] = [];
  for (const node of byId.values()) {
    if (node.parent_id) {
      byId.get(node.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// ── Connection ────────────────────────────────────────────────────────────────

let _db: Database.Database | null = null;

// Exported so catalog loaders and other modules can share the same connection.
export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Always run schema — all statements use CREATE TABLE IF NOT EXISTS, so safe on existing DBs.
  // This ensures new tables added to schema.sql are created without a full db:reset.
  _db.exec(readFileSync(SCHEMA_PATH, 'utf-8'));

  // Seed when site_config is empty
  const { n } = _db.prepare('SELECT COUNT(*) AS n FROM site_config').get() as { n: number };
  if (n === 0) {
    _db.exec(readFileSync(SEED_PATH, 'utf-8'));
  }

  return _db;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Returns the single site_config row. Throws if missing (run db:init first). */
export function getSiteConfig(): SiteConfig {
  const row = getDb()
    .prepare("SELECT * FROM site_config WHERE id = 'main'")
    .get() as Record<string, unknown> | undefined;
  if (!row) throw new Error('[site-db] site_config missing — run: npm run db:init');

  return {
    ...(row as unknown as SiteConfig),
    meta:    parseJson(row.meta,    {}),
    contact: parseJson(row.contact, {}),
  };
}

/** Returns a page with its current content by URL path, or null if not found. */
export function getPageByPath(path: string, locale = 'en'): PageWithContent | null {
  const db   = getDb();
  const page = db
    .prepare('SELECT * FROM page WHERE path = ? AND deleted_at IS NULL')
    .get(path) as Page | undefined;
  if (!page) return null;

  const raw = db
    .prepare(
      'SELECT * FROM page_content WHERE page_id = ? AND locale = ? AND is_current = 1 LIMIT 1'
    )
    .get(page.id, locale) as Record<string, unknown> | undefined;

  const content: PageContent | null = raw
    ? { ...(raw as unknown as PageContent), body: parseJson(raw.body, []) }
    : null;

  return { ...page, content };
}

/** Returns all non-deleted pages ordered by position (flat list). */
export function getPageTree(): Page[] {
  return getDb()
    .prepare('SELECT * FROM page WHERE deleted_at IS NULL ORDER BY position ASC')
    .all() as Page[];
}

/** Returns published children of a parent (pass null for root-level pages). */
export function getChildPages(parentId: string | null): Page[] {
  const db = getDb();
  const sql = parentId === null
    ? "SELECT * FROM page WHERE parent_id IS NULL AND deleted_at IS NULL AND status = 'published' ORDER BY position ASC"
    : "SELECT * FROM page WHERE parent_id = ? AND deleted_at IS NULL AND status = 'published' ORDER BY position ASC";
  return (parentId === null ? db.prepare(sql).all() : db.prepare(sql).all(parentId)) as Page[];
}

/** Returns a menu with its full item tree (page paths joined). */
export function getMenu(handle: string): MenuWithItems | null {
  const db   = getDb();
  const menu = db
    .prepare('SELECT * FROM menu WHERE handle = ?')
    .get(handle) as Menu | undefined;
  if (!menu) return null;

  const rows = db
    .prepare(
      `SELECT mi.*, p.path AS page_path
       FROM   menu_item mi
       LEFT   JOIN page p ON mi.page_id = p.id
       WHERE  mi.menu_id = ?
       ORDER  BY mi.parent_id NULLS FIRST, mi.position ASC`
    )
    .all(menu.id) as (MenuItem & { page_path?: string | null })[];

  return { ...menu, items: buildMenuTree(rows) };
}

/** Returns SEO meta for a page + locale, or null. */
export function getSeoMeta(pageId: string, locale = 'en'): SeoMeta | null {
  return getDb()
    .prepare('SELECT * FROM seo_meta WHERE page_id = ? AND locale = ?')
    .get(pageId, locale) as SeoMeta | null;
}

// ── Content layer helpers (content_document / content_collection / content_author) ──

function mapDocument(raw: Record<string, unknown>): ContentDocument {
  const doc = { ...(raw as unknown as ContentDocument) };
  doc.blocks           = parseJson(raw.blocks, []);
  doc.collection_ids   = parseJson(raw.collection_ids, []);
  doc.tags             = parseJson(raw.tags, []);
  doc.topics           = parseJson(raw.topics, []);
  doc.target_roles     = parseJson(raw.target_roles, []);
  doc.target_industries= parseJson(raw.target_industries, []);
  doc.authors          = parseJson(raw.authors, []);
  doc.reviewers        = parseJson(raw.reviewers, []);
  doc.versions         = parseJson(raw.versions, []);
  doc.breadcrumbs      = parseJson(raw.breadcrumbs, []);
  doc.toc              = parseJson(raw.toc, []);
  doc.related          = parseJson(raw.related, []);
  doc.translations     = parseJson(raw.translations, {});
  doc.custom_fields    = parseJson(raw.custom_fields, {});
  doc.meta             = parseJson(raw.meta, {});
  doc.seo              = parseJson(raw.seo, {});
  doc.social           = parseJson(raw.social, {});
  doc.feedback         = parseJson(raw.feedback, { helpful_count: 0, not_helpful_count: 0, view_count: 0, share_count: 0, comment_count: 0, avg_rating: null, rating_count: 0 });
  doc.cover_image      = parseJson(raw.cover_image, null);
  doc.og_image         = parseJson(raw.og_image, null);
  doc.prev_doc         = parseJson(raw.prev_doc, null);
  doc.next_doc         = parseJson(raw.next_doc, null);
  doc.parent_doc       = parseJson(raw.parent_doc, null);
  return doc;
}

function mapCollection(raw: Record<string, unknown>): ContentCollection {
  return {
    ...(raw as unknown as ContentCollection),
    cover: parseJson(raw.cover, null),
    seo:   parseJson(raw.seo,   {}),
    meta:  parseJson(raw.meta,  {}),
  };
}

function mapAuthor(raw: Record<string, unknown>): ContentAuthor {
  return {
    ...(raw as unknown as ContentAuthor),
    avatar:  parseJson(raw.avatar,  null),
    contact: parseJson(raw.contact, {}),
    meta:    parseJson(raw.meta,    {}),
  };
}

/** Returns a full ContentDocument by id, or null. */
export function getDocument(id: string): ContentDocument | null {
  const raw = getDb()
    .prepare('SELECT * FROM content_document WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Record<string, unknown> | undefined;
  return raw ? mapDocument(raw) : null;
}

/** Returns a published ContentDocument by slug + locale, or null. */
export function getDocumentBySlug(slug: string, locale = 'en'): ContentDocument | null {
  const raw = getDb()
    .prepare(
      "SELECT * FROM content_document WHERE slug = ? AND locale = ? AND deleted_at IS NULL AND status = 'published'"
    )
    .get(slug, locale) as Record<string, unknown> | undefined;
  return raw ? mapDocument(raw) : null;
}

export interface ListDocumentsOptions {
  content_type?: ContentType;
  status?: ContentStatus;
  locale?: string;
  collection_id?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

/** Returns a filtered list of ContentDocuments (full objects). */
export function listDocuments(opts: ListDocumentsOptions = {}): ContentDocument[] {
  const {
    content_type, status = 'published', locale,
    is_featured, limit = 20, offset = 0,
  } = opts;

  const wheres = ['deleted_at IS NULL', `status = '${status}'`];
  const params: unknown[] = [];

  if (content_type) { wheres.push('content_type = ?'); params.push(content_type); }
  if (locale)       { wheres.push('locale = ?');       params.push(locale); }
  if (is_featured)  { wheres.push('is_featured = 1'); }

  const sql = `
    SELECT * FROM content_document
    WHERE  ${wheres.join(' AND ')}
    ORDER  BY published_at DESC, created_at DESC
    LIMIT  ${limit} OFFSET ${offset}
  `;

  return (getDb().prepare(sql).all(...params) as Record<string, unknown>[]).map(mapDocument);
}

/** Returns lightweight ContentCard projections for listing views. */
export function listContentCards(opts: ListDocumentsOptions = {}): ContentCard[] {
  const {
    content_type, status = 'published', locale,
    is_featured, limit = 20, offset = 0,
  } = opts;

  const wheres = ['d.deleted_at IS NULL', `d.status = '${status}'`];
  const params: unknown[] = [];

  if (content_type) { wheres.push('d.content_type = ?'); params.push(content_type); }
  if (locale)       { wheres.push('d.locale = ?');       params.push(locale); }
  if (is_featured)  { wheres.push('d.is_featured = 1'); }

  const sql = `
    SELECT
      d.id, d.content_type, d.title, d.subtitle, d.excerpt, d.slug, d.locale,
      d.cover_image, d.status, d.is_featured, d.is_premium,
      d.published_at, d.reading_time_mins, d.word_count,
      d.tags, d.collection_ids, d.schema_org_type,
      d.authors
    FROM content_document d
    WHERE ${wheres.join(' AND ')}
    ORDER BY d.published_at DESC, d.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return (getDb().prepare(sql).all(...params) as Record<string, unknown>[]).map((raw) => {
    const cover = parseJson<{ url?: string } | null>(raw.cover_image, null);
    const authors = parseJson<{ name?: string; avatar?: { url?: string } }[]>(raw.authors, []);
    return {
      id:               String(raw.id),
      content_type:     raw.content_type as ContentDocument['content_type'],
      title:            String(raw.title),
      subtitle:         raw.subtitle ? String(raw.subtitle) : null,
      excerpt:          raw.excerpt  ? String(raw.excerpt)  : null,
      slug:             raw.slug     ? String(raw.slug)     : null,
      locale:           String(raw.locale ?? 'en'),
      cover_url:        cover?.url ?? null,
      status:           raw.status as ContentDocument['status'],
      is_featured:      Number(raw.is_featured ?? 0),
      is_premium:       Number(raw.is_premium  ?? 0),
      published_at:     raw.published_at ? String(raw.published_at) : null,
      reading_time_mins: raw.reading_time_mins != null ? Number(raw.reading_time_mins) : null,
      word_count:       raw.word_count != null ? Number(raw.word_count) : null,
      tags:             parseJson(raw.tags, []),
      collection_ids:   parseJson(raw.collection_ids, []),
      author_name:      authors[0]?.name ?? null,
      author_avatar:    authors[0]?.avatar?.url ?? null,
      schema_org_type:  raw.schema_org_type ? raw.schema_org_type as ContentDocument['schema_org_type'] : null,
    } satisfies ContentCard;
  });
}

/** Returns a ContentCollection by id, or null. */
export function getContentCollection(id: string): ContentCollection | null {
  const raw = getDb()
    .prepare('SELECT * FROM content_collection WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return raw ? mapCollection(raw) : null;
}

/** Returns all ContentCollections, optionally filtered by content_type. */
export function listContentCollections(contentType?: ContentType): ContentCollection[] {
  const db = getDb();
  const rows = contentType
    ? db.prepare('SELECT * FROM content_collection WHERE content_type = ? ORDER BY sort_order ASC').all(contentType)
    : db.prepare('SELECT * FROM content_collection ORDER BY sort_order ASC').all();
  return (rows as Record<string, unknown>[]).map(mapCollection);
}

/** Returns a ContentAuthor by id, or null. */
export function getContentAuthor(id: string): ContentAuthor | null {
  const raw = getDb()
    .prepare('SELECT * FROM content_author WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return raw ? mapAuthor(raw) : null;
}

/** Returns all ContentAuthors. */
export function listContentAuthors(): ContentAuthor[] {
  return (getDb().prepare('SELECT * FROM content_author ORDER BY name ASC').all() as Record<string, unknown>[])
    .map(mapAuthor);
}
