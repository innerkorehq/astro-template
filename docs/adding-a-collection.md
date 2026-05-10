# Adding a Content Collection

Collections are SQLite-backed Astro content collections. Data lives in `site.db`; Astro reads it at build time through a custom loader, validates it through a Zod schema, and exposes it via `getCollection()`.

The existing collections are **products**, **categories**, and **services** — follow the same pattern for any new one.

---

## 1. Add the table to the schema

Edit `src/db/schema.sql`. Every table uses `CREATE TABLE IF NOT EXISTS` so the file is safe to re-apply.

```sql
-- src/db/schema.sql

CREATE TABLE IF NOT EXISTS testimonials (
  id           TEXT PRIMARY KEY,
  author_name  TEXT NOT NULL,
  author_role  TEXT,
  company      TEXT,
  avatar_url   TEXT,
  text         TEXT NOT NULL,
  rating       REAL,
  is_featured  INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  product_id   TEXT REFERENCES products(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
```

**Column conventions**
- UUIDs → `TEXT PRIMARY KEY` (generated via `crypto.randomUUID()` in application code)
- Booleans → `INTEGER NOT NULL DEFAULT 0` (0 / 1)
- Nested objects / arrays → `TEXT NOT NULL DEFAULT '{}'` or `'[]'` (stored as JSON, parsed in the loader)
- Timestamps → `TEXT NOT NULL DEFAULT (datetime('now'))` (ISO-8601 UTC)

---

## 2. Add seed data

Edit `src/db/seed.sql`. Use `INSERT OR IGNORE` so running the seed multiple times is safe.

```sql
-- src/db/seed.sql

INSERT OR IGNORE INTO testimonials (id, author_name, author_role, company, text, rating, is_featured, sort_order, status)
VALUES
  ('t-1', 'Priya Sharma',   'Founder', 'Bloom Studio',     'Transformed our entire design workflow.', 5.0, 1, 0, 'active'),
  ('t-2', 'Rahul Verma',    'CTO',     'BuildMart Pvt Ltd','Best tooling decision we made this year.', 4.5, 0, 1, 'active');
```

Then run:

```bash
npm run db:reset   # wipes site.db and re-applies schema + seed
```

---

## 3. Write the row mapper

Add a mapper function in `src/lib/catalog/loaders.ts`. It converts a raw SQLite row (all values are `string | number | null`) into the shape the Zod schema expects.

```typescript
// src/lib/catalog/loaders.ts

function testimonialRowToData(row: Record<string, unknown>) {
  return {
    author_name:  String(row.author_name),
    author_role:  row.author_role  ? String(row.author_role)  : undefined,
    company:      row.company      ? String(row.company)      : undefined,
    avatar_url:   row.avatar_url   ? String(row.avatar_url)   : undefined,
    text:         String(row.text),
    rating:       row.rating       != null ? Number(row.rating)      : undefined,
    is_featured:  Boolean(row.is_featured),
    sort_order:   Number(row.sort_order ?? 0),
    product_id:   row.product_id   ? String(row.product_id)   : undefined,
    status:       String(row.status ?? 'active'),
  };
}
```

**Key rules**
- All numeric SQLite values arrive as `number` — cast with `Number()`.
- Boolean columns (0/1) → `Boolean(row.col)`.
- Nullable text → `row.col ? String(row.col) : undefined`.
- JSON columns → `j(row.col, [])` where `j` is the helper already in `loaders.ts`:
  ```typescript
  function j<T>(raw: unknown, fallback: T): T {
    if (raw == null) return fallback;
    try { return JSON.parse(String(raw)) as T; } catch { return fallback; }
  }
  ```

---

## 4. Write the loader

Add an Astro loader in the same file:

```typescript
// src/lib/catalog/loaders.ts

export function sqliteTestimonialLoader(): Loader {
  return {
    name: 'catalog-sqlite-testimonials',
    async load({ store, parseData, logger }) {
      const db   = getDb();
      const rows = db
        .prepare("SELECT * FROM testimonials WHERE status = 'active' ORDER BY sort_order ASC")
        .all() as Record<string, unknown>[];

      store.clear();
      let loaded = 0;

      for (const row of rows) {
        const id = String(row.id);
        try {
          const data = await parseData({ id, data: testimonialRowToData(row) });
          store.set({ id, data });
          loaded++;
        } catch (err) {
          logger.warn(`[catalog] Skipping testimonial "${id}": ${(err as Error).message}`);
        }
      }

      logger.info(`[catalog] Loaded ${loaded}/${rows.length} testimonials from SQLite`);
    },
  };
}
```

---

## 5. Define the Zod schema and register the collection

Edit `src/content.config.ts`:

```typescript
// src/content.config.ts

import { sqliteTestimonialLoader } from './lib/catalog/loaders.js';

const testimonials = defineCollection({
  loader: sqliteTestimonialLoader(),
  schema: z.object({
    author_name: z.string(),
    author_role: z.string().optional(),
    company:     z.string().optional(),
    avatar_url:  z.string().optional(),
    text:        z.string(),
    rating:      z.number().min(1).max(5).optional(),
    is_featured: z.boolean().default(false),
    sort_order:  z.number().default(0),
    product_id:  z.string().optional(),
    status:      z.enum(['active', 'archived']).default('active'),
  }),
});

export const collections = { products, categories, services, testimonials };
```

The Zod schema is validated at build time. Any row that fails validation is skipped with a warning — the build does not fail.

---

## 6. Use it in a page or component

```astro
---
// src/pages/testimonials.astro
import { getCollection } from 'astro:content';

const testimonials = await getCollection('testimonials', (e) => e.data.is_featured);
---

{testimonials.map((t) => (
  <blockquote>
    <p>{t.data.text}</p>
    <cite>{t.data.author_name}, {t.data.company}</cite>
  </blockquote>
))}
```

The entry id is the table's `id` column value (e.g. `t.id === "t-1"`).

---

## Quick reference checklist

```
1.  src/db/schema.sql          ← CREATE TABLE IF NOT EXISTS
2.  src/db/seed.sql            ← INSERT OR IGNORE
3.  src/lib/catalog/loaders.ts ← rowToData() + sqliteXxxLoader()
4.  src/content.config.ts      ← defineCollection() + Zod schema + export
5.  npm run db:reset            ← apply schema + seed
6.  Use getCollection('xxx')    ← in pages / resolvers
```
