import * as React from "react";
import { ProductCard } from "../../utils/product/ProductCard";
import { cn } from "../../utils/product/format";
import {
  defaultProductListCopy,
  type Product as UtilProduct,
  type ProductCardVariant,
  type ProductId,
  type ProductListCopy,
} from "../../utils/product/types";
import type { ProductItem } from "./types.js";

// Adapter: canonical ProductItem → utils' Product (minor-unit prices)
function toUtilProduct(item: ProductItem): UtilProduct {
  return {
    id:          item.id,
    name:        item.name,
    brand:       item.brand,
    description: item.description,
    image: {
      src:         item.images[0]?.src ?? "",
      alt:         item.images[0]?.alt ?? item.name,
      aspectRatio: item.images[0]?.aspectRatio ?? 1,
    },
    price: {
      amount:    Math.round(item.price.amount * 100),
      compareAt: item.price.compareAt != null ? Math.round(item.price.compareAt * 100) : undefined,
      currency:  item.price.currency,
      locale:    item.price.locale,
    },
    rating:  item.rating != null && item.reviewCount != null
               ? { value: item.rating, count: item.reviewCount } : undefined,
    badges:  item.badges.map((b) => ({ kind: b.kind as UtilProduct["badges"][number]["kind"], label: b.label })),
    stock:   item.stock.kind === "out-of-stock"   ? { kind: "out-of-stock" }
           : item.stock.kind === "low-stock"      ? { kind: "low-stock",  remaining: item.stock.remaining }
           : item.stock.kind === "preorder"        ? { kind: "preorder",   shipsOn: item.stock.shipsOn }
           : { kind: "in-stock" },
    swatches: item.swatches?.map((s) => ({ id: s.id, label: s.label, color: s.color ?? "" })),
    href:    item.href,
  };
}

export interface ProductListProps {
  /** The products to render — accepts the canonical ProductItem contract. */
  readonly products: readonly ProductItem[];

  /** Card layout variant. Defaults to "grid". */
  readonly variant?: ProductCardVariant;

  /**
   * All user-visible strings. Spread over `defaultProductListCopy` so callers
   * can override only the keys they want to customize / translate.
   */
  readonly copy?: Partial<ProductListCopy>;

  /** IDs of currently-wishlisted products. Controlled. */
  readonly wishlistedIds?: ReadonlySet<ProductId>;

  /** Fired when a wishlist heart is toggled. */
  readonly onToggleWishlist?: (id: ProductId) => void;

  /** Fired when an Add-to-cart button is clicked. */
  readonly onAddToCart?: (id: ProductId) => void;

  /** When true (default), bordered cards show their border + bg. */
  readonly bordered?: boolean;

  /** Optional override for the grid column count at each breakpoint. */
  readonly columns?: ResponsiveColumns;

  /** Renders when `products` is empty. */
  readonly emptyState?: React.ReactNode;

  readonly className?: string;
}

export interface ResponsiveColumns {
  readonly base?: 1 | 2 | 3 | 4;
  readonly sm?: 1 | 2 | 3 | 4;
  readonly md?: 1 | 2 | 3 | 4;
  readonly lg?: 1 | 2 | 3 | 4 | 5;
  readonly xl?: 1 | 2 | 3 | 4 | 5 | 6;
}

const DEFAULT_COLUMNS: Record<ProductCardVariant, ResponsiveColumns> = {
  grid:       { base: 1, sm: 2, md: 3, lg: 4 },
  horizontal: { base: 1 },
  editorial:  { base: 1, sm: 2, md: 3 },
  action:     { base: 1, sm: 2, md: 3, lg: 4 },
  minimal:    { base: 2, sm: 3, md: 4, lg: 5 },
  compact:    { base: 1, md: 2 },
  quickshop:  { base: 1, sm: 2, md: 3, lg: 4 },
  spotlight:  { base: 1, sm: 2, md: 3 },
};

/**
 * Tailwind cannot consume dynamic class names, so we map cleanly to a fixed
 * set of `grid-cols-N` / `sm:grid-cols-N` strings that exist in the build.
 */
const COL_CLASS = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" },
  sm:   { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" },
  md:   { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" },
  lg:   { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" },
  xl:   { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" },
} as const;

function gridClasses(cols: ResponsiveColumns): string {
  const out: string[] = [];
  if (cols.base) out.push(COL_CLASS.base[cols.base]);
  if (cols.sm)   out.push(COL_CLASS.sm[cols.sm]);
  if (cols.md)   out.push(COL_CLASS.md[cols.md]);
  if (cols.lg)   out.push(COL_CLASS.lg[cols.lg]);
  if (cols.xl)   out.push(COL_CLASS.xl[cols.xl]);
  return out.join(" ");
}

export function ProductList({
  products: rawProducts,
  variant = "grid",
  bordered = true,
  copy: copyOverride,
  wishlistedIds,
  onToggleWishlist,
  onAddToCart,
  columns,
  emptyState,
  className,
}: ProductListProps): React.ReactElement {
  const copy: ProductListCopy = React.useMemo(
    () => ({ ...defaultProductListCopy, ...copyOverride }),
    [copyOverride]
  );

  // Convert canonical ProductItem[] → utils' Product[]
  const products = React.useMemo(() => rawProducts.map(toUtilProduct), [rawProducts]);

  const wishlist = wishlistedIds ?? EMPTY_SET;
  const cols = columns ?? DEFAULT_COLUMNS[variant];

  if (products.length === 0) {
    return <div className={cn("py-16", className)}>{emptyState ?? <DefaultEmptyState />}</div>;
  }

  return (
    <ul
      role="list"
      className={cn(
        "grid gap-4 sm:gap-5",
        gridClasses(cols),
        className
      )}
    >
      {products.map((product) => (
        <li key={product.id} className="contents">
          <ProductCard
            variant={variant}
            product={product}
            bordered={bordered}
            copy={copy}
            wishlisted={wishlist.has(product.id)}
            onToggleWishlist={onToggleWishlist ?? noop}
            onAddToCart={onAddToCart ?? noop}
          />
        </li>
      ))}
    </ul>
  );
}

const EMPTY_SET: ReadonlySet<ProductId> = new Set<ProductId>();
function noop(): void { /* no-op */ }

function DefaultEmptyState(): React.ReactElement {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center text-muted-foreground">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">No products found</p>
      <p className="text-sm">Try adjusting your filters or search.</p>
    </div>
  );
}

export default ProductList;
