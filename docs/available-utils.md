# Available Utilities

Reference for every utility layer in the project. Grouped by domain.

---

## Site DB — `src/db/`

Single SQLite database (`site.db` at project root). All helpers are **synchronous** (better-sqlite3).

### Import

```typescript
import {
  getSiteConfig, getPageByPath, getPageTree, getChildPages,
  getMenu, getSeoMeta,
  getDocument, getDocumentBySlug, listDocuments, listContentCards,
  getContentCollection, listContentCollections,
  getContentAuthor, listContentAuthors,
} from '@/db/index';
```

### Site layer

| Function | Signature | Returns |
|---|---|---|
| `getSiteConfig()` | `()` | `SiteConfig` — throws if missing |
| `getPageByPath(path, locale?)` | `(string, string)` | `PageWithContent \| null` |
| `getPageTree()` | `()` | `Page[]` — all non-deleted, ordered by position |
| `getChildPages(parentId)` | `(string \| null)` | `Page[]` — published children only |
| `getMenu(handle)` | `(string)` | `MenuWithItems \| null` — tree pre-built |
| `getSeoMeta(pageId, locale?)` | `(string, string)` | `SeoMeta \| null` |

### Content document layer

| Function | Signature | Returns |
|---|---|---|
| `getDocument(id)` | `(string)` | `ContentDocument \| null` |
| `getDocumentBySlug(slug, locale?)` | `(string, string)` | `ContentDocument \| null` — published only |
| `listDocuments(opts?)` | `(ListDocumentsOptions)` | `ContentDocument[]` |
| `listContentCards(opts?)` | `(ListDocumentsOptions)` | `ContentCard[]` — lightweight, for feeds |
| `getContentCollection(id)` | `(string)` | `ContentCollection \| null` |
| `listContentCollections(type?)` | `(ContentType?)` | `ContentCollection[]` |
| `getContentAuthor(id)` | `(string)` | `ContentAuthor \| null` |
| `listContentAuthors()` | `()` | `ContentAuthor[]` |

`ListDocumentsOptions`:
```typescript
{
  content_type?: ContentType;  // 'blog_post' | 'doc_page' | ...
  status?:       ContentStatus; // default: 'published'
  locale?:       string;
  is_featured?:  boolean;
  limit?:        number;        // default: 20
  offset?:       number;
}
```

### Key types (`src/db/types.ts`)

```typescript
SiteConfig      // id, name, domain, locale, timezone, meta, tagline, ...
Page            // id, parent_id, slug, path, type, template, ref_id, ref_type, status, ...
PageContent     // id, page_id, locale, version, is_current, title, description, body[]
PageWithContent // Page & { content: PageContent | null }
SeoMeta         // meta_title, meta_description, og_*, canonical_url, noindex, nofollow
Menu            // id, handle, name, locale
MenuItem        // id, menu_id, parent_id, position, label, page_id, url, type, icon, badge, ...
MenuWithItems   // Menu & { items: MenuItemWithChildren[] }
ContentDocument // Full CMS document — all 50+ fields from document.py
ContentCard     // Lightweight projection for listing views
ContentCollection
ContentAuthor
```

### `Astro.locals.siteConfig`

Available in every `.astro` page and component — injected by middleware:

```astro
---
const site = Astro.locals.siteConfig;
// site.name, site.locale, site.logo_url, site.social_github, ...
---
```

---

## Catalog DB — `src/lib/catalog/`

Transactional tables (cart, orders, inquiry, catalog_config) live in the same `site.db` but are accessed through dedicated helpers here. **Not** Astro content collections.

### Import

```typescript
import {
  getCatalogConfig,
  getCart, getActiveCart, createCart,
  addCartItem, updateCartItemQty, removeCartItem, computeCartTotals,
  getOrder, getOrderByNumber, listOrders,
  getInquiry, createInquiry, listInquiries, updateInquiryStatus,
} from '@/lib/catalog/index';
```

### Catalog config

```typescript
getCatalogConfig(): CatalogConfig | null
// Returns mode, currency, features flags, branding, social, business info, etc.
```

### Cart

```typescript
createCart({ customer_id?, session_id?, currency? }): Cart
getCart(id: string): Cart | null          // includes items[]
getActiveCart({ customer_id? | session_id? }): Cart | null

addCartItem(cartId, item): CartItem       // merges quantity if same ref_id + variant
updateCartItemQty(itemId, qty): void      // pass 0 to remove
removeCartItem(itemId): void
computeCartTotals(cart): CartTotals       // subtotal, tax, discount, total, counts
```

`CartItem` fields: `item_type` ('product'|'service'|'addon'|'fee'|'discount'), `ref_id`, `variant_id`, `name`, `image_url`, `sku`, `unit_price`, `quantity`, `tax_rate`, `tax_inclusive`, `currency`.

### Orders

```typescript
getOrder(id: string): Order | null              // includes items[]
getOrderByNumber(orderNumber: string): Order | null
listOrders({ customer_id?, status?, limit? }): Order[]
```

### Inquiry (quote / lead)

```typescript
createInquiry(data): Inquiry    // data: { contact, message?, budget?, items?, ... }
getInquiry(id: string): Inquiry | null          // includes items[]
listInquiries(status?, limit?): Inquiry[]
updateInquiryStatus(id, status): void
// status: 'new' | 'read' | 'replied' | 'converted' | 'closed' | 'spam'
```

---

## Block System — `src/lib/blocks/`

Resolves raw page body blocks into typed component data at build time.

### Import

```typescript
import { resolveBlock, resolveBlocks } from '@/lib/blocks/index';
import type { Block, ResolvedBlock, BlockContext } from '@/lib/blocks/index';
```

### Functions

```typescript
resolveBlock(block: Block, ctx: BlockContext): Promise<ResolvedBlock>
resolveBlocks(blocks: Block[], ctx: BlockContext): Promise<ResolvedBlock[]>
```

`BlockContext`:
```typescript
{
  page_ref_id?:   string;  // page.ref_id — product/service/document slug
  page_ref_type?: string;  // 'product' | 'service' | 'document' | 'category'
  locale:         string;
}
```

`Block` (raw from `page_content.body`):
```typescript
{
  id:       string;
  type:     string;              // "{category}/{variant}"  e.g. "product/grid"
  content?: string;              // for primitive text blocks
  attrs:    Record<string, unknown>;
  children?: Block[];
}
```

`ResolvedBlock`:
```typescript
{
  id:       string;
  type:     string;
  category: string;              // "product"
  variant:  string;              // "grid"
  data:     unknown;             // typed per-category (ProductBlockData, etc.)
  attrs:    Record<string, unknown>;
}
```

### Supported block types

| Type | Resolver | Data shape |
|---|---|---|
| `product/grid` | `resolvers/product.ts` | `ProductBlockData` |
| `product/list` | `resolvers/product.ts` | `ProductBlockData` |
| `product/detail` | `resolvers/product.ts` | `ProductBlockData` |
| `heading`, `paragraph`, `divider`, … | pass-through | `{ content, attrs }` |

Add new types — see [`adding-a-registry-item.md`](./adding-a-registry-item.md).

---

## Astro Content Collections

Backed by SQLite; queried with `getCollection()` from `astro:content`.

```typescript
import { getCollection } from 'astro:content';

const products     = await getCollection('products',     (e) => e.data.status === 'active');
const categories   = await getCollection('categories',   (e) => e.data.status === 'active');
const services     = await getCollection('services',     (e) => e.data.status === 'active');
// future collections you add follow the same pattern
```

Every entry has:
- `entry.id` — the table's primary key (the slug)
- `entry.data` — Zod-validated fields matching `src/content.config.ts`

---

## Registry — Product Category Contract (`src/components/registry/product/types.ts`)

All `product/*` variants accept types from here. **Prices are always major units** (e.g. `8999` = ₹8,999).

### Key types

```typescript
ProductItem        // for product/grid and product/list
ProductDetailItem  // for product/detail

ProductPrice       // { amount, compareAt?, currency, locale?, label?, showPrice, unitLabel? }
ProductBadge       // { kind: BadgeKind, label: string }
ProductImage       // { src, alt, hoverSrc?, aspectRatio? }
ProductSwatch      // { id, label, color?, image?, inStock }
StockState         // discriminated union: in-stock | low-stock | out-of-stock | preorder
ProductBlockData   // { products: ProductItem[], product: ProductDetailItem | null, relatedProducts, attrs }
```

---

## Product UI Primitives (`src/components/utils/product/`)

Internal building blocks used by `product/list` and `product/detail`. These work with **minor-unit prices** (÷100 in `formatPrice`). They are implementation details — not part of the public contract.

### `primitives.tsx`

```typescript
<Button variant="primary|secondary|ghost|outline" size="sm|md|lg" />
<RatingStars rating={ProductRating} copy={...} size? tone? showCount? />
<Price price={ProductPrice} copy={...} tone? showSavings? />
<WishlistButton product={...} active={boolean} onToggle={fn} copy={...} tone? />
<StockIndicator stock={ProductStockState} copy={...} />
<Swatches swatches={ProductSwatch[]} tone? />
```

### `format.ts`

```typescript
formatPrice(price: ProductPrice): string      // Intl.NumberFormat — divides amount by 100
formatCompareAt(price): string | null         // compare-at price or null
discountPercent(price): number | null         // 0–100 integer
template(str, vars): string                  // replaces {token} placeholders
cn(...parts): string                          // className concatenation (tailwind-merge-like)
```

### `ProductCard.tsx`

Eight card layout variants, dispatched through `ProductCard`:

```typescript
<ProductCard variant="grid|horizontal|editorial|action|minimal|compact|quickshop|spotlight"
  product={Product} copy={ProductListCopy} wishlisted={boolean}
  onToggleWishlist={fn} onAddToCart={fn} />
```

### `ProductDetail.parts.tsx`

Sub-components used by `product/detail`:

```typescript
<ProductGallery images={...} copy={...} layout="thumbs-side|thumbs-below|stack" />
<VariantPicker options={...} selection={...} onChange={fn} copy={...} />
<QuantityStepper value={n} onChange={fn} min? max? copy={...} />
<BuyBox product={...} variant={...} selection={...} ... />
<ReviewsSummary summary={...} copy={...} reviews?={...} />
<ProductSections sections={...} />
<Breadcrumbs items={...} />
findVariant(variants, selection): ProductVariant | undefined
```

---

## Shadcn UI Components (`src/components/ui/`)

```typescript
import { Badge }                       from '@/components/ui/badge';
import { Button }                      from '@/components/ui/button';
import { Card, CardContent }           from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

All styled with Tailwind v4 via CSS variables defined in `src/styles/global.css`.

---

## Styling utilities

### `cn()` — `src/lib/utils.ts`

Merges Tailwind class names, resolving conflicts:

```typescript
import { cn } from '@/lib/utils';
cn('px-4 py-2', isActive && 'bg-primary text-primary-foreground', className)
```

### CSS design tokens — `src/styles/global.css`

All colours are CSS variables mapped through Shadcn:

```css
--background, --foreground
--primary,    --primary-foreground
--secondary,  --secondary-foreground
--muted,      --muted-foreground
--accent,     --accent-foreground
--destructive
--border, --input, --ring
--card,   --card-foreground
--radius
```

Use Tailwind classes like `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`.

---

## Animation & scroll utilities

| File | What it does |
|---|---|
| `src/lib/animations.js` | GSAP-based animation helpers |
| `src/lib/smooth-scroll.js` | Lenis smooth scroll setup |
| `src/lib/transitions.js` | Swup page transition helpers |
| `src/lib/theme.js` | Dark/light theme toggling |

Import in client scripts or `<script>` tags in `.astro` files.

---

## Layouts

### `BaseLayout.astro`

Full HTML document with Navigation, head meta, footer. Used by all DB-driven pages.

```astro
<BaseLayout
  title="Page Title"
  description="..."
  canonical?="https://..."
  ogTitle? ogDescription? ogImage?
  noindex? nofollow?
>
  <slot />
</BaseLayout>
```

Reads `Astro.locals.siteConfig` automatically for site name, locale, favicon.

### `PageLayout.astro` — slot-based layout

For building rich dashboard/sidebar/holy-grail layouts without a DB page:

```astro
<PageLayout variant="dashboard|centered|sidebar-left|sidebar-right|holy-grail|full-width">
  <div slot="header">...</div>
  <nav slot="sidebar">...</nav>
  <main slot="main">...</main>
  <footer slot="footer">...</footer>
</PageLayout>
```

Collapsible sidebar via `<SidebarToggle />`. No JavaScript framework required.

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:init` | Create `site.db` from schema + seed (non-destructive) |
| `npm run db:reset` | Delete `site.db` and re-init from scratch |
