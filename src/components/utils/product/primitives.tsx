import * as React from "react";
import { cn, template, formatPrice, formatCompareAt, discountPercent } from "./format";
import type {
  Product,
  ProductBadge,
  ProductBadgeKind,
  ProductListCopy,
  ProductPrice,
  ProductRating,
  ProductStockState,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                   Badge                                    */
/* -------------------------------------------------------------------------- */

const BADGE_TONE: Record<ProductBadgeKind, string> = {
  "new": "bg-foreground text-background",
  "sale": "bg-destructive text-destructive-foreground",
  "bestseller": "bg-amber-500 text-white",
  "limited": "bg-violet-600 text-white",
  "low-stock": "bg-orange-500 text-white",
};

export interface ProductBadgeProps {
  readonly badge: ProductBadge;
  readonly className?: string;
}

export function ProductBadgeChip({ badge, className }: ProductBadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        BADGE_TONE[badge.kind],
        className
      )}
    >
      {badge.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Button                                   */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", size = "md", className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          BUTTON_VARIANT[variant],
          BUTTON_SIZE[size],
          className
        )}
        {...rest}
      />
    );
  }
);

/* -------------------------------------------------------------------------- */
/*                                RatingStars                                 */
/* -------------------------------------------------------------------------- */

export interface RatingStarsProps {
  readonly rating: ProductRating;
  readonly copy: Pick<ProductListCopy, "ratingAriaTemplate" | "ratingCountTemplate">;
  readonly size?: number;
  readonly tone?: "default" | "inverted";
  readonly showCount?: boolean;
  readonly className?: string;
}

export function RatingStars({
  rating,
  copy,
  size = 14,
  tone = "default",
  showCount = true,
  className,
}: RatingStarsProps): React.ReactElement {
  const pct = Math.max(0, Math.min(5, rating.value)) / 5;
  const fillColor = tone === "inverted" ? "rgb(250 204 21)" : "rgb(245 158 11)";
  const trackColor =
    tone === "inverted" ? "rgba(255,255,255,0.35)" : "rgb(228 228 231)";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={template(copy.ratingAriaTemplate, { value: rating.value.toFixed(1) })}
    >
      <span className="relative inline-block leading-none" style={{ height: size }}>
        <Stars size={size} color={trackColor} />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct * 100}%` }}
          aria-hidden
        >
          <Stars size={size} color={fillColor} />
        </span>
      </span>
      {showCount && (
        <span
          className={cn(
            "text-xs tabular-nums",
            tone === "inverted" ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {rating.value.toFixed(1)}{" "}
          {template(copy.ratingCountTemplate, { count: rating.count.toLocaleString() })}
        </span>
      )}
    </span>
  );
}

function Stars({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={color}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 1.5l2.7 5.5 6 .9-4.4 4.2 1 6L10 15.3l-5.4 2.8 1-6L1.4 7.9l6-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Price                                    */
/* -------------------------------------------------------------------------- */

export interface PriceProps {
  readonly price: ProductPrice;
  readonly copy: Pick<ProductListCopy, "compareAtTemplate" | "saveTemplate">;
  readonly tone?: "default" | "inverted";
  readonly showSavings?: boolean;
  readonly className?: string;
}

export function Price({
  price,
  copy,
  tone = "default",
  showSavings = false,
  className,
}: PriceProps): React.ReactElement {
  const compareAt = formatCompareAt(price);
  const pct = discountPercent(price);
  const isInverted = tone === "inverted";

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          isInverted ? "text-white" : "text-foreground"
        )}
      >
        {formatPrice(price)}
      </span>
      {compareAt && (
        <span
          className={cn(
            "text-sm line-through tabular-nums",
            isInverted ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {template(copy.compareAtTemplate, { price: compareAt })}
        </span>
      )}
      {showSavings && pct != null && (
        <span
          className={cn(
            "text-xs font-medium",
            isInverted ? "text-emerald-300" : "text-emerald-600"
          )}
        >
          {template(copy.saveTemplate, { percent: pct })}
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                              WishlistButton                                */
/* -------------------------------------------------------------------------- */

export interface WishlistButtonProps {
  readonly product: Pick<Product, "name">;
  readonly active: boolean;
  readonly onToggle: () => void;
  readonly copy: Pick<ProductListCopy, "wishlistAddAriaTemplate" | "wishlistRemoveAriaTemplate">;
  readonly tone?: "default" | "inverted";
  readonly className?: string;
}

export function WishlistButton({
  product,
  active,
  onToggle,
  copy,
  tone = "default",
  className,
}: WishlistButtonProps): React.ReactElement {
  const aria = template(
    active ? copy.wishlistRemoveAriaTemplate : copy.wishlistAddAriaTemplate,
    { name: product.name }
  );
  const isInverted = tone === "inverted";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-label={aria}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isInverted
          ? "bg-black/40 text-white hover:bg-black/60 backdrop-blur"
          : "bg-background/90 text-foreground hover:bg-background border border-border shadow-sm",
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              StockIndicator                                */
/* -------------------------------------------------------------------------- */

export interface StockIndicatorProps {
  readonly stock: ProductStockState;
  readonly copy: Pick<
    ProductListCopy,
    "inStockLabel" | "outOfStockLabel" | "lowStockTemplate" | "preorderTemplate"
  >;
  readonly className?: string;
}

export function StockIndicator({
  stock,
  copy,
  className,
}: StockIndicatorProps): React.ReactElement {
  let dot = "bg-emerald-500";
  let label = copy.inStockLabel;
  if (stock.kind === "out-of-stock") {
    dot = "bg-zinc-400";
    label = copy.outOfStockLabel;
  } else if (stock.kind === "low-stock") {
    dot = "bg-orange-500";
    label = template(copy.lowStockTemplate, { count: stock.remaining });
  } else if (stock.kind === "preorder") {
    dot = "bg-sky-500";
    label = template(copy.preorderTemplate, { date: stock.shipsOn });
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Swatches                                  */
/* -------------------------------------------------------------------------- */

export interface SwatchesProps {
  readonly swatches: NonNullable<Product["swatches"]>;
  readonly tone?: "default" | "inverted";
  readonly className?: string;
}

export function Swatches({
  swatches,
  tone = "default",
  className,
}: SwatchesProps): React.ReactElement | null {
  if (!swatches.length) return null;
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} role="list">
      {swatches.slice(0, 5).map((sw) => (
        <span
          key={sw.id}
          role="listitem"
          aria-label={sw.label}
          title={sw.label}
          className={cn(
            "h-3.5 w-3.5 rounded-full border",
            tone === "inverted" ? "border-white/40" : "border-border"
          )}
          style={{ background: sw.color }}
        />
      ))}
      {swatches.length > 5 && (
        <span
          className={cn(
            "text-[11px] tabular-nums",
            tone === "inverted" ? "text-white/70" : "text-muted-foreground"
          )}
        >
          +{swatches.length - 5}
        </span>
      )}
    </div>
  );
}
