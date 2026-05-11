# Adding a Registry Item

Registry items are the components that render page blocks. They live at `src/components/registry/{category}/{variant}.tsx` and are wired up through a block resolver.

---

## How the system works

A page's content is a JSON array of blocks stored in `page_content.body`:

```json
[
  { "id": "b1", "type": "product/grid",    "attrs": { "category_id": "power-tools", "limit": 8 } },
  { "id": "b2", "type": "testimonial/list","attrs": { "limit": 6, "featured_only": true } }
]
```

At build time, `[...slug].astro` calls `resolveBlocks()`, which dispatches each block to the correct **category resolver**. The resolver fetches data from Astro collections or the DB, shapes it to the category's data contract, and returns a `ResolvedBlock`. `BlockRenderer.astro` then renders the right component.

```
page_content.body
  └─ Block { type: "testimonial/list", attrs: {...} }
       └─ resolver.ts          → dispatches to resolveTestimonialBlock()
            └─ resolvers/testimonial.ts  → fetches + shapes TestimonialBlockData
                 └─ BlockRenderer.astro  → <TestimonialList data={...} />
                      └─ registry/testimonial/list.tsx
```

---

## Naming convention

```
{category}/{variant}
```

- **category** — the domain (`product`, `testimonial`, `service`, `content`, `media`)
- **variant** — the display style (`grid`, `list`, `detail`, `carousel`, `featured`)

All variants in the same category **share the same data contract** (defined in `registry/{category}/types.ts`). A variant uses only the fields it needs.

---

## Step-by-step: adding `testimonial/list`

### 1. Define the category data contract

Create `src/components/registry/testimonial/types.ts`:

```typescript
// src/components/registry/testimonial/types.ts

export interface TestimonialItem {
  id:          string;
  authorName:  string;
  authorRole?: string;
  company?:    string;
  avatarUrl?:  string;
  text:        string;
  rating?:     number;    // 1–5
}

/** Category-level contract — all testimonial/* variants accept this. */
export interface TestimonialBlockData {
  testimonials: TestimonialItem[];
  attrs:        Record<string, unknown>;
}
```

If `testimonial/detail` is added later, extend `TestimonialBlockData` with `testimonial: TestimonialItem | null` — all variants accept the same interface and use only what they need.

### 2. Create the component

Create `src/components/registry/testimonial/list.tsx`:

```tsx
// src/components/registry/testimonial/list.tsx
import * as React from 'react';
import type { TestimonialBlockData, TestimonialItem } from './types.js';

interface Props {
  data: TestimonialBlockData;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1,2,3,4,5].map((n) => (
        <svg key={n} className={`w-4 h-4 ${n <= value ? 'text-amber-400' : 'text-stone-200'}`}
          fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export function TestimonialList({ data }: Props) {
  const { testimonials } = data;
  if (!testimonials.length) return null;

  return (
    <section className="py-12">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {testimonials.map((t) => (
          <li key={t.id} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            {t.rating && <StarRating value={Math.round(t.rating)} />}
            <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1">
              "{t.text}"
            </blockquote>
            <div className="flex items-center gap-3">
              {t.avatarUrl && (
                <img src={t.avatarUrl} alt={t.authorName}
                  className="w-9 h-9 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{t.authorName}</p>
                {(t.authorRole || t.company) && (
                  <p className="text-xs text-muted-foreground">
                    {[t.authorRole, t.company].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Component rules**
- Accept `data: TestimonialBlockData` — never fetch data inside the component.
- No `client:load` needed unless the component has interactive state.
- Keep types imported from `./types.js` (the category contract), not from external utils.

### 3. Write the category resolver

Create `src/lib/blocks/resolvers/testimonial.ts`:

```typescript
// src/lib/blocks/resolvers/testimonial.ts
import { getCollection } from 'astro:content';
import type { Block, BlockContext, ResolvedBlock } from '../types.js';
import type { TestimonialBlockData, TestimonialItem } from '../../../components/registry/testimonial/types.js';

function entryToItem(entry: Awaited<ReturnType<typeof getCollection<'testimonials'>>>[number]): TestimonialItem {
  const d = entry.data;
  return {
    id:         entry.id,
    authorName: d.author_name,
    authorRole: d.author_role,
    company:    d.company,
    avatarUrl:  d.avatar_url,
    text:       d.text,
    rating:     d.rating,
  };
}

export async function resolveTestimonialBlock(
  block: Block,
  _ctx: BlockContext
): Promise<ResolvedBlock<TestimonialBlockData>> {
  const variant = block.type.split('/')[1] ?? 'list';
  const attrs   = block.attrs;
  const limit   = Number(attrs.limit ?? 10);
  const featured = Boolean(attrs.featured_only);

  const all = await getCollection('testimonials', (e) =>
    e.data.status === 'active' && (!featured || e.data.is_featured)
  );
  const testimonials = all
    .sort((a, b) => a.data.sort_order - b.data.sort_order)
    .slice(0, limit)
    .map(entryToItem);

  return {
    id: block.id, type: block.type,
    category: 'testimonial', variant,
    data: { testimonials, attrs },
    attrs,
  };
}
```

### 4. Register in the master resolver

Edit `src/lib/blocks/resolver.ts`:

```typescript
// src/lib/blocks/resolver.ts
import { resolveTestimonialBlock } from './resolvers/testimonial.js';

export async function resolveBlock(block: Block, ctx: BlockContext): Promise<ResolvedBlock> {
  const [category, variant = 'default'] = block.type.split('/');

  switch (category) {
    case 'product':     return resolveProductBlock(block, ctx);
    case 'testimonial': return resolveTestimonialBlock(block, ctx);  // ← add this
    default:
      return { id: block.id, type: block.type, category, variant,
               data: { content: block.content, attrs: block.attrs }, attrs: block.attrs };
  }
}
```

### 5. Register in BlockRenderer

Edit `src/components/BlockRenderer.astro`:

```astro
---
// add import
import { TestimonialList } from '@/components/registry/testimonial/list';
import type { TestimonialBlockData } from '@/lib/blocks/resolvers/testimonial';
---

{/* add rendering clause */}
{category === 'testimonial' && variant === 'list' && (
  <TestimonialList data={data as TestimonialBlockData} />
)}
```

### 6. Use it in a page

Insert a block into any page's `page_content.body` in the DB:

```sql
UPDATE page_content
SET body = '[{"id":"b1","type":"testimonial/list","attrs":{"limit":6,"featured_only":true}}]'
WHERE page_id = 'page-about';
```

Or insert it directly into `site.db` via the authoring layer or a one-off SQL script.

---

## Adding a second variant to an existing category

Adding `testimonial/carousel` requires only **steps 2 and 5** — no new resolver needed.

1. Create `src/components/registry/testimonial/carousel.tsx` — accept the same `TestimonialBlockData`.
2. Add a rendering clause in `BlockRenderer.astro`:
   ```astro
   {category === 'testimonial' && variant === 'carousel' && (
     <TestimonialCarousel data={data as TestimonialBlockData} />
   )}
   ```

The resolver already populates `testimonials[]` for any `testimonial/*` block. The variant just renders it differently.

---

## File checklist

```
New category:
  src/components/registry/{category}/types.ts    ← data contract
  src/components/registry/{category}/{variant}.tsx ← component
  src/lib/blocks/resolvers/{category}.ts          ← resolver
  src/lib/blocks/resolver.ts                      ← register in switch
  src/components/BlockRenderer.astro              ← render clause

New variant in existing category:
  src/components/registry/{category}/{variant}.tsx ← component
  src/components/BlockRenderer.astro              ← render clause
```
