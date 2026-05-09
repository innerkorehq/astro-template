"use client";

import React, { useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductBadge = "new" | "sale" | "hot" | "limited" | "bestseller";
export type CardVariant =
  | "default"
  | "minimal"
  | "editorial"
  | "luxury"
  | "neon"
  | "retro"
  | "magazine"
  | "glass";
export type ViewMode = "grid" | "list" | "masonry";

export interface ProductImage {
  src: string;
  alt: string;
  hoverSrc?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  color?: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: ProductImage[];
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  tags: string[];
  isNew: boolean;
  inStock: boolean;
  freeShipping: boolean;
}

export interface ProductGridProps {
  products: Product[];
  defaultVariant?: CardVariant;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onWishlistToggle?: (productId: string, wishlisted: boolean) => void;
  onQuickView?: (product: Product) => void;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price: number, currency: string): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);

const discountPercent = (original: number, current: number): number =>
  Math.round(((original - current) / original) * 100);

const StarRating: React.FC<{ rating: number; count: number; compact?: boolean }> = ({
  rating,
  count,
  compact = false,
}) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <svg
            key={i}
            className={cn(
              compact ? "w-3 h-3" : "w-3.5 h-3.5",
              filled ? "text-amber-400" : partial ? "text-amber-400/50" : "text-stone-300"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
    {!compact && (
      <span className="text-xs text-stone-500">({count.toLocaleString()})</span>
    )}
  </div>
);

// ─── Badge Config ─────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<ProductBadge, { label: string; className: string }> = {
  new: { label: "New", className: "bg-sky-500 text-white" },
  sale: { label: "Sale", className: "bg-rose-500 text-white" },
  hot: { label: "🔥 Hot", className: "bg-orange-500 text-white" },
  limited: { label: "Limited", className: "bg-violet-600 text-white" },
  bestseller: { label: "Bestseller", className: "bg-emerald-600 text-white" },
};

// ─── WishlistButton ───────────────────────────────────────────────────────────

const WishlistButton: React.FC<{
  productId: string;
  wishlisted: boolean;
  onToggle: (id: string, val: boolean) => void;
  className?: string;
}> = ({ productId, wishlisted, onToggle, className }) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimate(true);
    onToggle(productId, !wishlisted);
    setTimeout(() => setAnimate(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "group relative flex items-center justify-center w-8 h-8 rounded-full",
        "bg-white/90 backdrop-blur-sm shadow-sm border border-stone-100",
        "transition-all duration-200 hover:scale-110 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
        className
      )}
    >
      <svg
        className={cn(
          "w-4 h-4 transition-all duration-300",
          wishlisted
            ? "fill-rose-500 stroke-rose-500"
            : "fill-transparent stroke-stone-400 group-hover:stroke-rose-400",
          animate && "scale-125"
        )}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
};

// ─── QuickViewButton ──────────────────────────────────────────────────────────

const QuickViewButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
      "bg-white/90 backdrop-blur-sm text-stone-700 border border-stone-200",
      "transition-all duration-200 hover:bg-stone-900 hover:text-white hover:border-stone-900",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400",
      className
    )}
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    Quick View
  </button>
);

// ─── ProductImage with hover swap ────────────────────────────────────────────

const ProductImageSlot: React.FC<{
  images: ProductImage[];
  name: string;
  badge?: ProductBadge;
  discount?: number;
  className?: string;
}> = ({ images, name, badge, discount, className }) => {
  const [hovered, setHovered] = useState(false);
  const primary = images[0];
  const secondary = images[1] ?? images[0];

  return (
    <div
      className={cn("relative overflow-hidden bg-stone-50", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Primary image */}
      <img
        src={primary.src}
        alt={primary.alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
          hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
      />
      {/* Hover image */}
      <img
        src={secondary.hoverSrc ?? secondary.src}
        alt={secondary.alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
          hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      />
      {/* Spacer */}
      <div className="pt-[125%]" />

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
            BADGE_CONFIG[badge].className
          )}
        >
          {BADGE_CONFIG[badge].label}
        </span>
      )}
      {/* Discount */}
      {discount && discount > 0 && (
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white">
          −{discount}%
        </span>
      )}
    </div>
  );
};

// ─── DEFAULT CARD ─────────────────────────────────────────────────────────────

const DefaultCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.[0]?.id
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <Card className="group relative overflow-hidden border border-stone-200/70 bg-white shadow-none hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-300 rounded-2xl">
      {/* Image */}
      <div className="relative">
        <ProductImageSlot
          images={product.images}
          name={product.name}
          badge={product.badge}
          discount={discount}
          className="rounded-t-2xl"
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex justify-end">
            <WishlistButton
              productId={product.id}
              wishlisted={wishlisted}
              onToggle={onWishlistToggle}
            />
          </div>
          <div className="flex justify-center pb-1">
            <QuickViewButton onClick={(e) => { e.stopPropagation(); onQuickView(product); }} />
          </div>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-t-2xl">
            <span className="text-xs font-semibold text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Brand + name */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            {product.brand}
          </p>
          <h3 className="text-sm font-semibold text-stone-900 leading-snug mt-0.5 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <StarRating rating={product.rating} count={product.reviewCount} />

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v.id); }}
                disabled={!v.inStock}
                title={v.label}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-150 focus-visible:outline-none",
                  selectedVariant === v.id
                    ? "border-stone-900 scale-110"
                    : "border-stone-200 hover:border-stone-400",
                  !v.inStock && "opacity-30 cursor-not-allowed"
                )}
                style={v.color ? { backgroundColor: v.color } : undefined}
                aria-label={v.label}
              />
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-base font-bold text-stone-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="ml-1.5 text-xs text-stone-400 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={cn(
              "rounded-full text-xs font-semibold px-4 transition-all duration-300",
              addedToCart
                ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                : "bg-stone-900 hover:bg-stone-700 text-white"
            )}
          >
            {addedToCart ? "✓ Added" : "Add to Cart"}
          </Button>
        </div>

        {product.freeShipping && (
          <p className="text-[11px] text-emerald-600 font-medium">✦ Free shipping</p>
        )}
      </CardContent>
    </Card>
  );
};

// ─── MINIMAL CARD ─────────────────────────────────────────────────────────────

const MinimalCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const [hovered, setHovered] = useState(false);
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl bg-stone-100">
        <ProductImageSlot
          images={product.images}
          name={product.name}
          badge={product.badge}
          discount={discount}
          className="rounded-xl"
        />
        {/* Wishlist only, always visible */}
        <div className="absolute top-2.5 right-2.5">
          <WishlistButton
            productId={product.id}
            wishlisted={wishlisted}
            onToggle={onWishlistToggle}
          />
        </div>
        {/* Slide-up Add to Cart */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300",
            hovered ? "translate-y-0" : "translate-y-full"
          )}
        >
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full rounded-lg text-xs font-semibold bg-white text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-200 shadow-sm"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* Info — clean and sparse */}
      <div className="mt-3 space-y-0.5">
        <div className="flex items-start justify-between">
          <h3 className="text-sm text-stone-800 font-medium leading-snug line-clamp-1 flex-1 mr-2">
            {product.name}
          </h3>
          <span className="text-sm font-bold text-stone-900 whitespace-nowrap">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        <p className="text-xs text-stone-400">{product.brand}</p>
        <StarRating rating={product.rating} count={product.reviewCount} compact />
      </div>
    </div>
  );
};

// ─── EDITORIAL CARD ───────────────────────────────────────────────────────────

const EditorialCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
  featured?: boolean;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView, featured }) => {
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl bg-stone-900 cursor-pointer h-full", featured && "col-span-2 row-span-2")}>
      {/* Full bleed image */}
      <div className="absolute inset-0">
        <img
          src={product.images[0].src}
          alt={product.images[0].alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
      </div>

      {/* Actions top */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        {product.badge && (
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide",
              BADGE_CONFIG[product.badge].className
            )}
          >
            {BADGE_CONFIG[product.badge].label}
          </span>
        )}
        <div className="ml-auto">
          <WishlistButton
            productId={product.id}
            wishlisted={wishlisted}
            onToggle={onWishlistToggle}
          />
        </div>
      </div>

      {/* Content bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-1">
          {product.brand}
        </p>
        <h3 className={cn("font-bold leading-tight mb-2", featured ? "text-2xl" : "text-base")}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn("font-bold", featured ? "text-xl" : "text-base")}>
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-white/40 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="rounded-full text-xs font-semibold bg-white text-stone-900 hover:bg-white/90 border-0"
          >
            {product.inStock ? "Shop Now" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── LUXURY CARD ──────────────────────────────────────────────────────────────

const LuxuryCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thin decorative border that reveals on hover */}
      <div
        className={cn(
          "absolute -inset-px rounded-2xl border transition-all duration-500",
          hovered ? "border-amber-300/60" : "border-transparent"
        )}
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200/60">
        {/* Image area */}
        <div className="relative overflow-hidden">
          <ProductImageSlot
            images={product.images}
            name={product.name}
            className="rounded-t-2xl"
          />
          {/* Sheen overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-tr from-amber-100/0 to-white/20 transition-opacity duration-500",
              hovered ? "opacity-100" : "opacity-0"
            )}
          />
          {/* Top actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <WishlistButton
              productId={product.id}
              wishlisted={wishlisted}
              onToggle={onWishlistToggle}
            />
          </div>
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-800 border border-amber-200">
                {BADGE_CONFIG[product.badge].label}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className={cn(
            "mx-4 h-px transition-all duration-300",
            hovered ? "bg-amber-200" : "bg-stone-200"
          )}
        />

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[10px] tracking-[0.25em] font-semibold uppercase text-stone-400">
                {product.brand}
              </p>
              <h3 className="text-sm font-semibold text-stone-800 mt-0.5 line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </div>
          </div>

          <StarRating rating={product.rating} count={product.reviewCount} compact />

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-stone-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && (
                <span className="ml-1.5 text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              disabled={!product.inStock}
              className={cn(
                "text-[11px] font-semibold tracking-widest uppercase px-3 py-2",
                "border rounded-lg transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                product.inStock
                  ? "border-stone-800 text-stone-800 hover:bg-stone-900 hover:text-white"
                  : "border-stone-200 text-stone-300 cursor-not-allowed"
              )}
            >
              {product.inStock ? "Add" : "N/A"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── NEON CARD ────────────────────────────────────────────────────────────────
// Dark background, electric accent lines, cyberpunk/tech aesthetic

const NeonCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Deterministic accent color per product
  const ACCENTS = [
    { glow: "#00F5FF", text: "text-cyan-400", border: "border-cyan-400", bg: "bg-cyan-400", ring: "ring-cyan-400/30" },
    { glow: "#FF00C8", text: "text-fuchsia-400", border: "border-fuchsia-400", bg: "bg-fuchsia-400", ring: "ring-fuchsia-400/30" },
    { glow: "#AAFF00", text: "text-lime-400", border: "border-lime-400", bg: "bg-lime-400", ring: "ring-lime-400/30" },
    { glow: "#FF6B00", text: "text-orange-400", border: "border-orange-400", bg: "bg-orange-400", ring: "ring-orange-400/30" },
  ];
  const accent = ACCENTS[parseInt(product.id.replace(/\D/g, ""), 10) % ACCENTS.length];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-zinc-950 border transition-all duration-300 cursor-pointer",
        hovered ? `border-current ${accent.text} shadow-lg` : "border-zinc-800"
      )}
      style={hovered ? { boxShadow: `0 0 24px ${accent.glow}33, 0 0 2px ${accent.glow}66` } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Scanline texture overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 3px)",
        }}
      />

      {/* Corner brackets */}
      {hovered && (
        <>
          <span className={cn("absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 z-20 transition-all", accent.border)} />
          <span className={cn("absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 z-20 transition-all", accent.border)} />
          <span className={cn("absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 z-20 transition-all", accent.border)} />
          <span className={cn("absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 z-20 transition-all", accent.border)} />
        </>
      )}

      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="relative pt-[110%] bg-zinc-900">
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700",
              hovered ? "scale-105 opacity-70" : "scale-100 opacity-50"
            )}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(${accent.glow}22 1px, transparent 1px), linear-gradient(90deg, ${accent.glow}22 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id, !wishlisted); }}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded border transition-all duration-200",
              wishlisted
                ? `${accent.border} ${accent.text}`
                : "border-zinc-600 text-zinc-600 hover:border-zinc-400 hover:text-zinc-400"
            )}
            aria-label="Wishlist"
          >
            <svg className={cn("w-3.5 h-3.5", wishlisted ? "fill-current" : "fill-transparent stroke-current")} viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className={cn("text-[9px] font-black tracking-[0.2em] uppercase px-2 py-1 border", accent.border, accent.text)}>
              {BADGE_CONFIG[product.badge].label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2.5 relative z-10">
        {/* Brand line */}
        <div className="flex items-center gap-2">
          <div className={cn("h-px flex-1 opacity-40", `bg-gradient-to-r from-transparent via-current to-transparent`, accent.text)} />
          <span className={cn("text-[9px] font-black tracking-[0.3em] uppercase", accent.text)}>
            {product.brand}
          </span>
          <div className={cn("h-px flex-1 opacity-40", `bg-gradient-to-r from-transparent via-current to-transparent`, accent.text)} />
        </div>

        <h3 className="text-sm font-bold text-zinc-100 leading-snug line-clamp-2 font-mono">
          {product.name}
        </h3>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} count={product.reviewCount} compact />
          </div>
          {product.freeShipping && (
            <span className={cn("text-[9px] font-bold tracking-widest uppercase", accent.text)}>
              ◈ FREE SHIP
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className={cn("text-lg font-black font-mono", accent.text)}>
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="ml-1.5 text-xs text-zinc-600 line-through font-mono">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              "text-[10px] font-black tracking-widest uppercase px-3 py-1.5 border transition-all duration-300",
              product.inStock && !addedToCart
                ? cn(accent.border, accent.text, "hover:bg-current hover:text-zinc-950")
                : addedToCart
                ? "border-emerald-500 text-emerald-500"
                : "border-zinc-700 text-zinc-700 cursor-not-allowed"
            )}
          >
            {addedToCart ? "✓ OK" : product.inStock ? "ADD" : "N/A"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── RETRO CARD ───────────────────────────────────────────────────────────────
// Brutalist/newspaper aesthetic: bold borders, offset shadows, stark typography

const RetroCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const [hovered, setHovered] = useState(false);
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  return (
    <div
      className={cn(
        "group relative bg-[#F5F0E4] border-2 border-stone-900 cursor-pointer transition-all duration-150",
        hovered ? "translate-x-[-3px] translate-y-[-3px]" : ""
      )}
      style={hovered ? { boxShadow: "5px 5px 0 #1C1917" } : { boxShadow: "2px 2px 0 #1C1917" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden border-b-2 border-stone-900">
        <div className="relative pt-[115%] bg-stone-200">
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-500 grayscale",
              hovered ? "grayscale-0 scale-105" : "grayscale scale-100"
            )}
          />
        </div>

        {/* Diagonal badge */}
        {product.badge && (
          <div className="absolute top-0 left-0 bg-stone-900 text-[#F5F0E4] text-[9px] font-black tracking-widest uppercase px-3 py-1.5">
            {BADGE_CONFIG[product.badge].label}
          </div>
        )}
        {discount && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-2 py-1.5">
            −{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id, !wishlisted); }}
          className={cn(
            "absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center border-2 border-stone-900 transition-all",
            wishlisted ? "bg-red-600 text-white" : "bg-[#F5F0E4] text-stone-900 hover:bg-stone-900 hover:text-[#F5F0E4]"
          )}
          aria-label="Wishlist"
        >
          <svg className={cn("w-3.5 h-3.5", wishlisted ? "fill-current" : "fill-transparent stroke-current")} viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Brand tag */}
        <div className="inline-block bg-stone-900 text-[#F5F0E4] text-[8px] font-black tracking-[0.25em] uppercase px-2 py-0.5 mb-2">
          {product.brand}
        </div>

        <h3 className="text-sm font-black text-stone-900 leading-tight uppercase tracking-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Thick rule */}
        <div className="mt-2 mb-2 h-0.5 bg-stone-900" />

        {/* Stars + reviews */}
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={product.rating} count={product.reviewCount} compact />
          {product.freeShipping && (
            <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">
              ✦ Free Ship
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-black text-stone-900 leading-none">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="block text-[10px] font-bold text-stone-400 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={!product.inStock}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-2 border-2 border-stone-900 transition-all duration-150",
              product.inStock
                ? "bg-stone-900 text-[#F5F0E4] hover:bg-red-600 hover:border-red-600"
                : "bg-stone-200 text-stone-400 cursor-not-allowed border-stone-300"
            )}
          >
            {product.inStock ? "Buy" : "N/A"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAGAZINE CARD ────────────────────────────────────────────────────────────
// Landscape/horizontal layout, editorial pull-quotes, bold typography

const MagazineCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
  index: number;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView, index }) => {
  const [hovered, setHovered] = useState(false);
  const isEven = index % 2 === 0;
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  // Alternating accent colors per row
  const PALETTE = ["#E8F4FD", "#FEF3C7", "#F0FDF4", "#FFF1F2", "#F5F3FF", "#FFF7ED"];
  const bg = PALETTE[index % PALETTE.length];

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-stone-200/80 cursor-pointer transition-all duration-300",
        hovered && "shadow-2xl shadow-stone-200/80 -translate-y-0.5",
        isEven ? "flex-row" : "flex-row-reverse"
      )}
      style={{ background: bg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — 45% width */}
      <div className="relative w-[45%] flex-shrink-0 overflow-hidden">
        <img
          src={product.images[0].src}
          alt={product.images[0].alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            hovered ? "scale-110" : "scale-100"
          )}
        />
        {/* Angled cut */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: isEven
              ? "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)"
              : "polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)",
          }}
        >
          <img
            src={product.images[0].src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Wishlist on image */}
        <div className={cn("absolute top-3", isEven ? "right-4" : "left-4")}>
          <WishlistButton
            productId={product.id}
            wishlisted={wishlisted}
            onToggle={onWishlistToggle}
          />
        </div>
      </div>

      {/* Content — 55% */}
      <div className={cn("flex-1 p-5 flex flex-col justify-between", isEven ? "pl-6" : "pr-6")}>
        {/* Top section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.badge && (
              <span className={cn("text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1 rounded-full", BADGE_CONFIG[product.badge].className)}>
                {BADGE_CONFIG[product.badge].label}
              </span>
            )}
            {discount && (
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-wide">
                {discount}% off
              </span>
            )}
          </div>

          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-1">
            {product.brand}
          </p>
          <h3 className="text-lg font-black text-stone-900 leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Pull quote — description excerpt */}
          <p className="mt-2 text-xs text-stone-500 leading-relaxed line-clamp-3 italic border-l-2 border-stone-300 pl-2.5">
            "{product.description}"
          </p>
        </div>

        {/* Bottom section */}
        <div className="mt-4 space-y-2.5">
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-stone-600 border border-stone-200/60 font-medium">
                {tag}
              </span>
            ))}
            {product.freeShipping && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                Free shipping
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xl font-black text-stone-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <QuickViewButton onClick={(e) => { e.stopPropagation(); onQuickView(product); }} />
              <Button
                size="sm"
                disabled={!product.inStock}
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                className="rounded-full text-xs font-bold bg-stone-900 text-white hover:bg-stone-700 px-4"
              >
                {product.inStock ? "Add" : "Sold Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── GLASS CARD ───────────────────────────────────────────────────────────────
// Frosted glass morphism on gradient backdrop, floating depth layers

const GlassCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
  index: number;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView, index }) => {
  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Background gradient blobs per card
  const GRADIENTS = [
    "radial-gradient(ellipse at 20% 30%, #818CF855 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #F472B655 0%, transparent 60%), linear-gradient(135deg, #1E1B4B, #4C1D95)",
    "radial-gradient(ellipse at 70% 20%, #34D39955 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, #60A5FA55 0%, transparent 60%), linear-gradient(135deg, #064E3B, #1E3A5F)",
    "radial-gradient(ellipse at 40% 60%, #FB923C55 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, #F9A8D455 0%, transparent 60%), linear-gradient(135deg, #7C2D12, #831843)",
    "radial-gradient(ellipse at 60% 40%, #A78BFA55 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #67E8F955 0%, transparent 60%), linear-gradient(135deg, #1E1B4B, #164E63)",
  ];
  const gradientBg = GRADIENTS[index % GRADIENTS.length];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ background: gradientBg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating orb behind image */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl opacity-40 transition-all duration-700"
        style={{ background: "rgba(255,255,255,0.3)", transform: hovered ? "scale(1.4) translateX(-36%)" : "scale(1) translateX(-50%)" }}
      />

      {/* Image — circular/floating */}
      <div className="relative pt-6 pb-2 flex justify-center">
        <div
          className={cn(
            "relative w-36 h-36 rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl",
            hovered ? "scale-105 rotate-1" : "scale-100 rotate-0"
          )}
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" }}
        >
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Badge floating over image */}
        {product.badge && (
          <div className="absolute top-4 right-4">
            <span className={cn("text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm", BADGE_CONFIG[product.badge].className)}>
              {BADGE_CONFIG[product.badge].label}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-4 left-4">
          <button
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id, !wishlisted); }}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-sm border border-white/20 transition-all",
              wishlisted ? "bg-rose-500/80 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            <svg className={cn("w-3.5 h-3.5", wishlisted ? "fill-current" : "fill-transparent stroke-current")} viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Glass content panel */}
      <div
        className="m-3 mt-0 rounded-xl p-4 space-y-3"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Brand */}
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 text-center">
          {product.brand}
        </p>
        <h3 className="text-sm font-bold text-white text-center leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Rating centered */}
        <div className="flex justify-center">
          <StarRating rating={product.rating} count={product.reviewCount} compact />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-black text-white">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="ml-1 text-xs text-white/40 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300",
              "backdrop-blur-sm border",
              addedToCart
                ? "bg-emerald-500/80 border-emerald-400/50 text-white"
                : product.inStock
                ? "bg-white/15 border-white/25 text-white hover:bg-white/25"
                : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            {addedToCart ? "✓ Added" : product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        </div>

        {product.freeShipping && (
          <p className="text-[10px] text-center text-emerald-300/80 font-medium">
            ✦ Free shipping included
          </p>
        )}
      </div>
    </div>
  );
};

// ─── LIST ROW ──────────────────────────────────────────────────────────────────

const ListCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onWishlistToggle: (id: string, val: boolean) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onQuickView: (product: Product) => void;
}> = ({ product, wishlisted, onWishlistToggle, onAddToCart, onQuickView }) => {
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : undefined;

  return (
    <div className="group flex gap-4 p-4 rounded-2xl border border-stone-200/70 bg-white hover:shadow-lg hover:shadow-stone-100 transition-all duration-300">
      {/* Image */}
      <div className="relative w-32 flex-shrink-0 overflow-hidden rounded-xl">
        <ProductImageSlot
          images={product.images}
          name={product.name}
          badge={product.badge}
          discount={discount}
          className="rounded-xl"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">
              {product.brand}
            </p>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5 line-clamp-2">
              {product.name}
            </h3>
          </div>
          <WishlistButton
            productId={product.id}
            wishlisted={wishlisted}
            onToggle={onWishlistToggle}
            className="flex-shrink-0"
          />
        </div>

        <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <StarRating rating={product.rating} count={product.reviewCount} />

        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium"
            >
              {tag}
            </span>
          ))}
          {product.freeShipping && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
              Free Shipping
            </span>
          )}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 py-1">
        <div className="text-right">
          <p className="text-lg font-bold text-stone-900">
            {formatPrice(product.price, product.currency)}
          </p>
          {product.originalPrice && (
            <p className="text-xs text-stone-400 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-700 text-white px-5"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <QuickViewButton
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="justify-center"
          />
        </div>
      </div>
    </div>
  );
};

// ─── PRODUCT GRID ─────────────────────────────────────────────────────────────

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  defaultVariant = "default",
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  className,
}) => {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [variant, setVariant] = useState<CardVariant>(defaultVariant);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [cartNotification, setCartNotification] = useState<string | null>(null);

  const handleWishlistToggle = useCallback(
    (id: string, val: boolean) => {
      setWishlist((prev) => {
        const next = new Set(prev);
        val ? next.add(id) : next.delete(id);
        return next;
      });
      onWishlistToggle?.(id, val);
    },
    [onWishlistToggle]
  );

  const handleAddToCart = useCallback(
    (product: Product, variantId?: string) => {
      onAddToCart?.(product, variantId);
      setCartNotification(product.name);
      setTimeout(() => setCartNotification(null), 2500);
    },
    [onAddToCart]
  );

  const handleQuickView = useCallback(
    (product: Product) => {
      onQuickView?.(product);
    },
    [onQuickView]
  );

  const cardProps = (product: Product) => ({
    product,
    wishlisted: wishlist.has(product.id),
    onWishlistToggle: handleWishlistToggle,
    onAddToCart: handleAddToCart,
    onQuickView: handleQuickView,
  });

  const renderCard = (product: Product, index: number) => {
    if (viewMode === "list") {
      return <ListCard key={product.id} {...cardProps(product)} />;
    }
    switch (variant) {
      case "minimal":
        return <MinimalCard key={product.id} {...cardProps(product)} />;
      case "editorial":
        return (
          <EditorialCard
            key={product.id}
            {...cardProps(product)}
            featured={index === 0}
          />
        );
      case "luxury":
        return <LuxuryCard key={product.id} {...cardProps(product)} />;
      case "neon":
        return <NeonCard key={product.id} {...cardProps(product)} />;
      case "retro":
        return <RetroCard key={product.id} {...cardProps(product)} />;
      case "magazine":
        return <MagazineCard key={product.id} {...cardProps(product)} index={index} />;
      case "glass":
        return <GlassCard key={product.id} {...cardProps(product)} index={index} />;
      default:
        return <DefaultCard key={product.id} {...cardProps(product)} />;
    }
  };

  const gridClass = (() => {
    if (viewMode === "list") return "flex flex-col gap-3";
    if (variant === "editorial")
      return "grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]";
    if (variant === "magazine")
      return "flex flex-col gap-4";
    if (viewMode === "masonry")
      return "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4";
    if (variant === "glass")
      return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";
    return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
  })();

  return (
    <div className={cn("w-full", className)}>
      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Card variant tabs */}
        <Tabs value={variant} onValueChange={(v) => setVariant(v as CardVariant)}>
          <TabsList className="bg-stone-100 rounded-full p-1 h-auto flex-wrap gap-0.5">
            {(["default", "minimal", "editorial", "luxury", "neon", "retro", "magazine", "glass"] as CardVariant[]).map((v) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-full text-xs font-semibold capitalize px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                {v}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* View mode */}
        <div className="flex items-center gap-1 bg-stone-100 rounded-full p-1">
          {(
            [
              { mode: "grid" as ViewMode, icon: "M3 3h7v7H3zM13 3h8v7h-8zM13 13h8v8h-8zM3 13h7v8H3z" },
              { mode: "list" as ViewMode, icon: "M4 6h16M4 12h16M4 18h16" },
              {
                mode: "masonry" as ViewMode,
                icon: "M3 3h8v12H3zM13 3h8v6h-8zM13 13h8v8h-8z",
              },
            ] as { mode: ViewMode; icon: string }[]
          ).map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              aria-label={`${mode} view`}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                viewMode === mode ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-700"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </button>
          ))}
        </div>

        {/* Wishlist count */}
        {wishlist.size > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
            <svg className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {wishlist.size} saved
          </div>
        )}
      </div>

      {/* ── Product Grid ── */}
      <div className={cn(
        variant === "glass" ? "rounded-2xl p-6" : "",
        variant === "neon" ? "rounded-2xl p-4 bg-zinc-950" : "",
        variant === "retro" ? "rounded-none" : ""
      )}>
        <div className={gridClass}>
          {products.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                viewMode === "masonry" && "break-inside-avoid",
                variant === "editorial" && i === 0 && "col-span-2 row-span-2"
              )}
            >
              {renderCard(product, i)}
            </div>
          ))}
        </div>
      </div>

      {/* ── Cart notification toast ── */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-stone-900 text-white text-sm font-medium shadow-xl",
          "transition-all duration-300",
          cartNotification
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span className="max-w-[200px] truncate">{cartNotification}</span>
        <span className="text-stone-400">added to cart</span>
      </div>
    </div>
  );
};

export default ProductGrid;