import * as React from "react";
import {
  Button,
  Price,
  ProductBadgeChip,
  RatingStars,
  StockIndicator,
  WishlistButton,
} from "./primitives";
import { cn, template, formatPrice, formatCompareAt, discountPercent } from "./format";
import { defaultProductListCopy, type ProductListCopy } from "./types";
import {
  defaultProductDetailCopy,
  type Breadcrumb,
  type ProductDetail,
  type ProductDetailCopy,
  type ProductDetailVariant,
  type ProductOption,
  type ProductOptionValue,
  type ProductReview,
  type ProductSection,
  type ProductVariant,
  type ReviewBreakdown,
} from "./detail-types";

/* -------------------------------------------------------------------------- */
/*                            Hooks: variant matching                         */
/* -------------------------------------------------------------------------- */

/** Look up the SKU that matches the current selection (if any). */
export function findVariant(
  variants: readonly ProductVariant[] | undefined,
  selection: Record<string, string>
): ProductVariant | undefined {
  if (!variants?.length) return undefined;
  return variants.find((v) =>
    Object.entries(v.selection).every(([k, val]) => selection[k] === val)
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Gallery                                   */
/* -------------------------------------------------------------------------- */

export interface ProductGalleryProps {
  readonly images: readonly ProductDetail["gallery"][number][];
  readonly copy: Pick<ProductDetailCopy, "galleryThumbAriaTemplate">;
  readonly layout?: "thumbs-side" | "thumbs-below" | "stack";
  readonly className?: string;
}

export function ProductGallery({
  images,
  copy,
  layout = "thumbs-side",
  className,
}: ProductGalleryProps): React.ReactElement {
  const [active, setActive] = React.useState(0);
  const main = images[active] ?? images[0];

  if (layout === "stack") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: img.aspectRatio ?? 1 }}>
            <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  const thumbs = (
    <div
      className={cn(
        layout === "thumbs-below"
          ? "flex flex-row gap-2 overflow-x-auto"
          : "flex flex-col gap-2"
      )}
      role="tablist"
    >
      {images.map((img, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={template(copy.galleryThumbAriaTemplate, { index: i + 1, total: images.length })}
          onClick={() => setActive(i)}
          className={cn(
            "relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted ring-offset-background transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            i === active ? "ring-2 ring-foreground" : "ring-1 ring-border hover:ring-muted-foreground/40"
          )}
        >
          <img src={img.src} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        layout === "thumbs-below" ? "flex flex-col gap-3" : "flex gap-3",
        className
      )}
    >
      {layout === "thumbs-side" && thumbs}
      <div className="flex-1 overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: main?.aspectRatio ?? 1 }}>
        {main && <img src={main.src} alt={main.alt} className="h-full w-full object-cover" />}
      </div>
      {layout === "thumbs-below" && thumbs}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              VariantPicker                                 */
/* -------------------------------------------------------------------------- */

export interface VariantPickerProps {
  readonly options: readonly ProductOption[];
  readonly selection: Record<string, string>;
  readonly onChange: (optionId: string, valueId: string) => void;
  readonly copy: Pick<ProductDetailCopy, "selectOptionAriaTemplate">;
  readonly className?: string;
}

export function VariantPicker({
  options,
  selection,
  onChange,
  copy,
  className,
}: VariantPickerProps): React.ReactElement {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {options.map((opt) => {
        const currentId = selection[opt.id];
        const currentLabel =
          opt.values.find((v) => v.id === currentId)?.label ?? "—";
        return (
          <div key={opt.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">
                {opt.label}
              </span>
              <span className="text-sm text-muted-foreground">{currentLabel}</span>
            </div>
            <OptionRow
              option={opt}
              currentId={currentId}
              onChange={(valueId) => onChange(opt.id, valueId)}
              ariaTemplate={copy.selectOptionAriaTemplate}
            />
          </div>
        );
      })}
    </div>
  );
}

function OptionRow({
  option,
  currentId,
  onChange,
  ariaTemplate,
}: {
  option: ProductOption;
  currentId: string | undefined;
  onChange: (valueId: string) => void;
  ariaTemplate: string;
}): React.ReactElement {
  if (option.kind === "select") {
    return (
      <select
        value={currentId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {option.values.map((v) => (
          <option key={v.id} value={v.id} disabled={v.disabled}>
            {v.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {option.values.map((v) => (
        <OptionButton
          key={v.id}
          option={option}
          value={v}
          active={v.id === currentId}
          onSelect={() => onChange(v.id)}
          ariaLabel={template(ariaTemplate, { option: option.label, value: v.label })}
        />
      ))}
    </div>
  );
}

function OptionButton({
  option, value, active, onSelect, ariaLabel,
}: {
  option: ProductOption;
  value: ProductOptionValue;
  active: boolean;
  onSelect: () => void;
  ariaLabel: string;
}): React.ReactElement {
  if (option.kind === "swatch") {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={value.disabled}
        aria-label={ariaLabel}
        aria-pressed={active}
        title={value.label}
        className={cn(
          "relative h-9 w-9 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "ring-1 ring-border hover:ring-muted-foreground/60",
          value.disabled && "opacity-40 cursor-not-allowed"
        )}
        style={{ background: value.swatchColor ?? "transparent" }}
      >
        {value.swatchImage && (
          <img src={value.swatchImage} alt="" className="h-full w-full rounded-full object-cover" />
        )}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={value.disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "h-9 min-w-[2.75rem] rounded-md border px-3 text-sm font-medium transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-background hover:border-muted-foreground/60",
        value.disabled && "opacity-40 line-through cursor-not-allowed"
      )}
    >
      {value.label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Quantity Stepper                              */
/* -------------------------------------------------------------------------- */

export interface QuantityStepperProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly copy: Pick<
    ProductDetailCopy,
    "quantityLabel" | "decreaseQuantityAriaLabel" | "increaseQuantityAriaLabel"
  >;
  readonly className?: string;
}

export function QuantityStepper({
  value, onChange, min = 1, max = 99, copy, className,
}: QuantityStepperProps): React.ReactElement {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">{copy.quantityLabel}</span>
      <div className="inline-flex h-10 items-center rounded-md border border-input bg-background">
        <button
          type="button" onClick={dec} disabled={value <= min}
          aria-label={copy.decreaseQuantityAriaLabel}
          className="grid h-full w-9 place-items-center rounded-l-md text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/></svg>
        </button>
        <span className="grid h-full w-10 place-items-center text-sm font-medium tabular-nums">{value}</span>
        <button
          type="button" onClick={inc} disabled={value >= max}
          aria-label={copy.increaseQuantityAriaLabel}
          className="grid h-full w-9 place-items-center rounded-r-md text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ReviewsSummary                                */
/* -------------------------------------------------------------------------- */

export interface ReviewsSummaryProps {
  readonly summary: ReviewBreakdown;
  readonly copy: Pick<ProductDetailCopy, "reviewsHeading" | "basedOnReviewsTemplate">;
  /** Optional preview reviews to render under the histogram. */
  readonly reviews?: readonly ProductReview[];
  readonly verifiedPurchaseLabel?: string;
  readonly className?: string;
}

export function ReviewsSummary({
  summary, copy, reviews, verifiedPurchaseLabel, className,
}: ReviewsSummaryProps): React.ReactElement {
  const max = Math.max(...summary.histogram, 1);
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight tabular-nums">{summary.average.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          <RatingStars
            rating={{ value: summary.average, count: summary.total }}
            copy={{ ratingAriaTemplate: "Rated {value} out of 5", ratingCountTemplate: "" }}
            showCount={false}
            size={16}
          />
          <span className="text-sm text-muted-foreground">
            {template(copy.basedOnReviewsTemplate, { count: summary.total.toLocaleString() })}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.histogram[star - 1];
            return (
              <div key={star} className="grid grid-cols-[2.5rem_1fr_3rem] items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">{star} star</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums text-right">{count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
      {reviews && reviews.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <RatingStars
                  rating={{ value: r.rating, count: 0 }}
                  copy={{ ratingAriaTemplate: "Rated {value} out of 5", ratingCountTemplate: "" }}
                  showCount={false}
                  size={13}
                />
                <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              {r.title && <h4 className="mt-2 text-sm font-medium">{r.title}</h4>}
              <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.author}</span>
                {r.verifiedPurchase && verifiedPurchaseLabel && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {verifiedPurchaseLabel}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Sections                                   */
/* -------------------------------------------------------------------------- */

export function ProductSections({
  sections,
  className,
}: {
  sections: readonly ProductSection[];
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {sections.map((s) => <SectionRow key={s.id} section={s} />)}
    </div>
  );
}

function SectionRow({ section }: { section: ProductSection }): React.ReactElement {
  const [open, setOpen] = React.useState(section.defaultOpen ?? false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group"
    >
      <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium text-foreground list-none [&::-webkit-details-marker]:hidden">
        <span>{section.title}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform group-open:rotate-180"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </summary>
      <div className="pb-5 text-sm text-muted-foreground">
        {section.body && (
          <div className="flex flex-col gap-3">
            {section.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
        {section.specs && (
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {section.specs.map((spec, i) => (
              <div key={i} className="flex justify-between gap-3 border-b border-border/60 py-1.5">
                <dt className="text-foreground/80">{spec.label}</dt>
                <dd className="font-medium text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   BuyBox                                   */
/* -------------------------------------------------------------------------- */

export interface BuyBoxProps {
  readonly product: ProductDetail;
  readonly variant: ProductVariant | undefined;
  readonly selection: Record<string, string>;
  readonly onSelectOption: (optionId: string, valueId: string) => void;
  readonly quantity: number;
  readonly onQuantityChange: (qty: number) => void;
  readonly onAddToCart: () => void;
  readonly onBuyNow?: () => void;
  readonly wishlisted: boolean;
  readonly onToggleWishlist: () => void;
  readonly addState: "idle" | "adding" | "added";
  readonly copy: ProductDetailCopy;
  /** Visual density. Defaults to "comfortable". */
  readonly density?: "comfortable" | "compact";
  readonly className?: string;
}

export function BuyBox({
  product, variant, selection, onSelectOption, quantity, onQuantityChange,
  onAddToCart, onBuyNow, wishlisted, onToggleWishlist, addState, copy,
  density = "comfortable", className,
}: BuyBoxProps): React.ReactElement {
  const price = variant?.price ?? product.basePrice;
  const stock = variant?.stock ?? product.stock ?? { kind: "in-stock" };
  const oos = stock.kind === "out-of-stock";
  const compareAt = formatCompareAt(price);
  const pct = discountPercent(price);
  const sku = variant?.sku;

  const ctaLabel =
    addState === "adding" ? copy.addingLabel
    : addState === "added" ? copy.addedLabel
    : oos ? copy.notifyMeLabel
    : copy.addToCartLabel;

  const gap = density === "compact" ? "gap-4" : "gap-6";

  return (
    <div className={cn("flex flex-col", gap, className)}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        {product.brand && (
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand}
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>
        {product.tagline && (
          <p className="text-base text-muted-foreground">{product.tagline}</p>
        )}
        {product.reviews && (
          <div className="flex items-center gap-2">
            <RatingStars
              rating={{ value: product.reviews.average, count: product.reviews.total }}
              copy={defaultProductListCopy}
              size={14}
            />
          </div>
        )}
        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((b, i) => <ProductBadgeChip key={i} badge={b} />)}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <Price
            price={price}
            copy={defaultProductListCopy}
            className="text-2xl"
          />
          {pct != null && (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              {template(copy.saveTemplate, { percent: pct })}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{copy.taxLabel}</span>
      </div>

      {/* Variant picker */}
      {product.options && product.options.length > 0 && (
        <VariantPicker
          options={product.options}
          selection={selection}
          onChange={onSelectOption}
          copy={copy}
        />
      )}

      {/* Stock */}
      <StockIndicator
        stock={stock}
        copy={{
          inStockLabel: copy.inStockLabel,
          outOfStockLabel: copy.outOfStockLabel,
          lowStockTemplate: copy.lowStockTemplate,
          preorderTemplate: copy.preorderTemplate,
        }}
      />

      {/* Quantity + actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <QuantityStepper value={quantity} onChange={onQuantityChange} copy={copy} />
          {sku && (
            <span className="text-xs text-muted-foreground">
              {copy.skuLabel} <span className="font-mono">{sku}</span>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            variant={oos ? "outline" : "primary"}
            onClick={onAddToCart}
            disabled={addState === "adding"}
            className={cn("flex-1", addState === "added" && "bg-emerald-600 hover:bg-emerald-600/90")}
          >
            {addState === "added" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {ctaLabel}
          </Button>
          {onBuyNow && !oos && (
            <Button size="lg" variant="outline" onClick={onBuyNow} className="flex-1">
              {copy.buyNowLabel}
            </Button>
          )}
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-pressed={wishlisted}
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-muted",
              wishlisted && "text-rose-600"
            )}
            aria-label={wishlisted ? copy.wishlistRemoveLabel : copy.wishlistAddLabel}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>

      {/* Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.highlightsHeading}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-600" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Breadcrumbs                                 */
/* -------------------------------------------------------------------------- */

export function Breadcrumbs({ items }: { items: readonly Breadcrumb[] }): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((b, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            <a href={b.href} className={cn("hover:text-foreground", i === items.length - 1 && "text-foreground")}>{b.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
