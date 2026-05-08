import * as React from "react";
import {
  Button,
  Price,
  ProductBadgeChip,
  RatingStars,
  StockIndicator,
  Swatches,
  WishlistButton,
} from "./primitives";
import { cn, template } from "./format";
import type {
  Product,
  ProductCardVariant,
  ProductListCopy,
  ProductId,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                              Shared card props                             */
/* -------------------------------------------------------------------------- */

export interface ProductCardProps {
  readonly product: Product;
  readonly copy: ProductListCopy;
  readonly wishlisted: boolean;
  readonly onToggleWishlist: (id: ProductId) => void;
  readonly onAddToCart: (id: ProductId) => void;
  /** When true (default), the card has a border + card background. */
  readonly bordered?: boolean;
  readonly className?: string;
}

function frameClass(bordered: boolean): string {
  return bordered
    ? "border border-border bg-card hover:shadow-md"
    : "bg-transparent";
}
function padClass(bordered: boolean): string {
  return bordered ? "p-4" : "pt-3";
}

function isOutOfStock(p: Product): boolean {
  return p.stock?.kind === "out-of-stock";
}

function ctaLabel(p: Product, copy: ProductListCopy): string {
  return isOutOfStock(p) ? copy.notifyMeLabel : copy.addToCartLabel;
}

/* -------------------------------------------------------------------------- */
/*                            Variant: grid (classic)                         */
/* -------------------------------------------------------------------------- */

export function ProductCardGrid({
  product,
  copy,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  className,
}: ProductCardProps): React.ReactElement {
  const ratio = product.image.aspectRatio ?? 1;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-md",
        className
      )}
    >
      <a
        href={product.href}
        aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
        className="relative block overflow-hidden bg-muted"
        style={{ aspectRatio: ratio }}
      >
        <img
          src={product.image.src}
          alt={product.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton
            product={product}
            active={wishlisted}
            onToggle={() => onToggleWishlist(product.id)}
            copy={copy}
          />
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand && (
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </span>
        )}
        <h3 className="text-sm font-medium leading-snug text-foreground">
          <a href={product.href} className="after:absolute after:inset-0">
            {product.name}
          </a>
        </h3>
        {product.rating && (
          <RatingStars rating={product.rating} copy={copy} />
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price price={product.price} copy={copy} />
          {product.swatches && <Swatches swatches={product.swatches} />}
        </div>
        {product.stock && product.stock.kind !== "in-stock" && (
          <StockIndicator stock={product.stock} copy={copy} />
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Variant: horizontal (row)                        */
/* -------------------------------------------------------------------------- */

export function ProductCardHorizontal({
  product,
  copy,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  className,
}: ProductCardProps): React.ReactElement {
  const oos = isOutOfStock(product);
  return (
    <article
      className={cn(
        "group relative flex gap-5 overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground transition-shadow hover:shadow-md",
        className
      )}
    >
      <a
        href={product.href}
        aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
        className="relative block w-40 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48"
        style={{ aspectRatio: 1 }}
      >
        <img
          src={product.image.src}
          alt={product.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {product.brand && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </span>
            )}
            <h3 className="text-base font-medium leading-snug text-foreground">
              <a href={product.href}>{product.name}</a>
            </h3>
          </div>
          <WishlistButton
            product={product}
            active={wishlisted}
            onToggle={() => onToggleWishlist(product.id)}
            copy={copy}
          />
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {product.rating && <RatingStars rating={product.rating} copy={copy} />}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex flex-col gap-1.5">
            <Price price={product.price} copy={copy} showSavings />
            {product.stock && <StockIndicator stock={product.stock} copy={copy} />}
            {product.swatches && <Swatches swatches={product.swatches} className="mt-1" />}
          </div>
          <Button
            variant={oos ? "outline" : "primary"}
            size="md"
            onClick={() => onAddToCart(product.id)}
            disabled={oos && product.stock?.kind === "out-of-stock" && false /* notify still allowed */}
          >
            {ctaLabel(product, copy)}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Variant: editorial (overlay)                      */
/* -------------------------------------------------------------------------- */

export function ProductCardEditorial({
  product,
  copy,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  className,
}: ProductCardProps): React.ReactElement {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl bg-zinc-900 text-white",
        className
      )}
      style={{ aspectRatio: "4 / 5" }}
    >
      <a
        href={product.href}
        aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
        className="absolute inset-0 block"
      >
        <img
          src={product.image.src}
          alt={product.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
        />
      </a>

      {product.badges && product.badges.length > 0 && (
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
        </div>
      )}
      <div className="absolute right-4 top-4">
        <WishlistButton
          product={product}
          active={wishlisted}
          onToggle={() => onToggleWishlist(product.id)}
          copy={copy}
          tone="inverted"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
        {product.brand && (
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            {product.brand}
          </span>
        )}
        <h3 className="text-lg font-semibold leading-tight">
          <a href={product.href}>{product.name}</a>
        </h3>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Price price={product.price} copy={copy} tone="inverted" />
          {product.rating && (
            <RatingStars
              rating={product.rating}
              copy={copy}
              tone="inverted"
              showCount={false}
            />
          )}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Variant: action (CTA-forward)                     */
/* -------------------------------------------------------------------------- */

export function ProductCardAction({
  product,
  copy,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
  className,
}: ProductCardProps): React.ReactElement {
  const oos = isOutOfStock(product);
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-md",
        className
      )}
    >
      <a
        href={product.href}
        aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
        className="relative block overflow-hidden bg-muted"
        style={{ aspectRatio: 4 / 3 }}
      >
        <img
          src={product.image.src}
          alt={product.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton
            product={product}
            active={wishlisted}
            onToggle={() => onToggleWishlist(product.id)}
            copy={copy}
          />
        </div>
      </a>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            {product.brand && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </span>
            )}
            <h3 className="truncate text-sm font-medium text-foreground">
              <a href={product.href}>{product.name}</a>
            </h3>
            {product.rating && (
              <RatingStars rating={product.rating} copy={copy} className="mt-0.5" />
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Price price={product.price} copy={copy} />
            {product.stock && product.stock.kind !== "in-stock" && (
              <StockIndicator stock={product.stock} copy={copy} />
            )}
          </div>
          <Button
            variant={oos ? "outline" : "primary"}
            size="sm"
            onClick={() => onAddToCart(product.id)}
          >
            {ctaLabel(product, copy)}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Variant: minimal                              */
/* -------------------------------------------------------------------------- */

export function ProductCardMinimal({
  product, copy, wishlisted, onToggleWishlist, bordered = false, className,
}: ProductCardProps): React.ReactElement {
  return (
    <article className={cn("group relative flex flex-col gap-3", bordered && "rounded-xl border border-border bg-card p-3", className)}>
      <a href={product.href}
         aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
         className="relative block overflow-hidden rounded-lg bg-muted"
         style={{ aspectRatio: 4 / 5 }}>
        <img src={product.image.src} alt={product.image.alt} loading="lazy"
             className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-2.5 top-2.5"><ProductBadgeChip badge={product.badges[0]} /></div>
        )}
        <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <WishlistButton product={product} active={wishlisted} onToggle={() => onToggleWishlist(product.id)} copy={copy} />
        </div>
      </a>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="truncate text-sm text-foreground"><a href={product.href}>{product.name}</a></h3>
          {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
        </div>
        <Price price={product.price} copy={copy} className="text-sm" />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Variant: compact                              */
/* -------------------------------------------------------------------------- */

export function ProductCardCompact({
  product, copy, wishlisted, onToggleWishlist, onAddToCart, bordered = true, className,
}: ProductCardProps): React.ReactElement {
  const oos = isOutOfStock(product);
  return (
    <article className={cn("group relative flex items-center gap-3 transition-colors",
      bordered ? "rounded-lg border border-border bg-card p-2.5 hover:bg-muted/40" : "rounded-md px-2 py-2 hover:bg-muted/40", className)}>
      <a href={product.href}
         aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
         className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <img src={product.image.src} alt={product.image.alt} loading="lazy" className="h-full w-full object-cover" />
      </a>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground"><a href={product.href}>{product.name}</a></h3>
          {product.badges?.[0] && <ProductBadgeChip badge={product.badges[0]} />}
        </div>
        {product.brand && <span className="truncate text-xs text-muted-foreground">{product.brand}</span>}
        {product.rating && <RatingStars rating={product.rating} copy={copy} size={11} className="mt-0.5" />}
      </div>
      <div className="flex items-center gap-3">
        <Price price={product.price} copy={copy} className="text-sm" />
        <Button variant={oos ? "outline" : "primary"} size="sm" onClick={() => onAddToCart(product.id)}>
          {oos ? copy.notifyMeLabel : copy.addToCartLabel}
        </Button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Variant: quickshop                             */
/* -------------------------------------------------------------------------- */

export function ProductCardQuickshop({
  product, copy, wishlisted, onToggleWishlist, onAddToCart, bordered = true, className,
}: ProductCardProps): React.ReactElement {
  const oos = isOutOfStock(product);
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-xl text-card-foreground transition-shadow", frameClass(bordered), className)}>
      <a href={product.href}
         aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
         className="relative block overflow-hidden bg-muted" style={{ aspectRatio: 1 }}>
        <img src={product.image.src} alt={product.image.alt} loading="lazy"
             className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton product={product} active={wishlisted} onToggle={() => onToggleWishlist(product.id)} copy={copy} />
        </div>
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <Button variant={oos ? "outline" : "primary"} size="md"
                  onClick={(e) => { e.preventDefault(); onAddToCart(product.id); }}
                  className="w-full bg-background text-foreground hover:bg-background/90 shadow-lg">
            {oos ? copy.notifyMeLabel : copy.addToCartLabel}
          </Button>
        </div>
      </a>
      <div className={cn("flex flex-col gap-1", padClass(bordered))}>
        {product.brand && <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</span>}
        <h3 className="text-sm font-medium text-foreground"><a href={product.href}>{product.name}</a></h3>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Price price={product.price} copy={copy} />
          {product.swatches && <Swatches swatches={product.swatches} />}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Variant: spotlight                             */
/* -------------------------------------------------------------------------- */

export function ProductCardSpotlight({
  product, copy, wishlisted, onToggleWishlist, bordered = true, className,
}: ProductCardProps): React.ReactElement {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <a href={product.href}
         aria-label={template(copy.viewProductAriaTemplate, { name: product.name })}
         className={cn("relative block overflow-hidden rounded-2xl bg-muted", bordered && "ring-1 ring-border")}
         style={{ aspectRatio: 4 / 5 }}>
        <img src={product.image.src} alt={product.image.alt} loading="lazy"
             className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton product={product} active={wishlisted} onToggle={() => onToggleWishlist(product.id)} copy={copy} />
        </div>
      </a>
      <div className={cn("relative -mt-6 mx-3 flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-sm",
        bordered ? "border border-border bg-card" : "bg-card")}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground"><a href={product.href}>{product.name}</a></h3>
          {product.brand && <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{product.brand}</span>}
        </div>
        <Price price={product.price} copy={copy} className="shrink-0" />
      </div>
      {product.rating && <div className="mt-2 px-4"><RatingStars rating={product.rating} copy={copy} /></div>}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ProductCard                                 */
/* -------------------------------------------------------------------------- */

export interface ProductCardVariantProps extends ProductCardProps {
  readonly variant: ProductCardVariant;
}

const VARIANT_MAP: Record<ProductCardVariant, React.ComponentType<ProductCardProps>> = {
  grid: ProductCardGrid,
  horizontal: ProductCardHorizontal,
  editorial: ProductCardEditorial,
  action: ProductCardAction,
  minimal: ProductCardMinimal,
  compact: ProductCardCompact,
  quickshop: ProductCardQuickshop,
  spotlight: ProductCardSpotlight,
};

export function ProductCard({
  variant,
  ...rest
}: ProductCardVariantProps): React.ReactElement {
  const Cmp = VARIANT_MAP[variant];
  return <Cmp {...rest} />;
}
