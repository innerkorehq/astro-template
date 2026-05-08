import * as React from "react";
import {
  BuyBox,
  Breadcrumbs,
  ProductGallery,
  ProductSections,
  ReviewsSummary,
  findVariant,
} from "../../utils/product/ProductDetail.parts";
import { ProductCard } from "../../utils/product/ProductCard";
import { cn } from "../../utils/product/format";
import { defaultProductListCopy } from "../../utils/product/types";
import {
  defaultProductDetailCopy,
  type ProductDetail,
  type ProductDetailCopy,
  type ProductDetailVariant,
  type ProductReview,
} from "../../utils/product/detail-types";

export interface ProductDetailPageProps {
  /** Full product data. */
  readonly product: ProductDetail;

  /** Layout variant. Defaults to "classic". */
  readonly variant?: ProductDetailVariant;

  /** Copy overrides — spread over `defaultProductDetailCopy`. */
  readonly copy?: Partial<ProductDetailCopy>;

  /** Optional preview reviews to render under the histogram. */
  readonly reviews?: readonly ProductReview[];

  /** Wishlist state — controlled. */
  readonly wishlisted?: boolean;
  readonly onToggleWishlist?: () => void;

  /** Add-to-cart handler. Receives the resolved variant id (or product id). */
  readonly onAddToCart?: (args: { variantId: string; quantity: number }) => void | Promise<void>;
  readonly onBuyNow?: (args: { variantId: string; quantity: number }) => void;

  readonly className?: string;
}

export function ProductDetailPage({
  product,
  variant = "classic",
  copy: copyOverride,
  reviews,
  wishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  className,
}: ProductDetailPageProps): React.ReactElement {
  const copy: ProductDetailCopy = React.useMemo(
    () => ({ ...defaultProductDetailCopy, ...copyOverride }),
    [copyOverride]
  );

  // Initial selection = first value of each option, or first variant's selection
  const initialSelection = React.useMemo<Record<string, string>>(() => {
    if (product.variants?.[0]) return { ...product.variants[0].selection };
    const out: Record<string, string> = {};
    product.options?.forEach((o) => {
      const first = o.values.find((v) => !v.disabled) ?? o.values[0];
      if (first) out[o.id] = first.id;
    });
    return out;
  }, [product]);

  const [selection, setSelection] = React.useState(initialSelection);
  const [quantity, setQuantity] = React.useState(1);
  const [addState, setAddState] = React.useState<"idle" | "adding" | "added">("idle");

  const matchedVariant = findVariant(product.variants, selection);

  const onSelectOption = (optionId: string, valueId: string) =>
    setSelection((prev) => ({ ...prev, [optionId]: valueId }));

  const handleAdd = async () => {
    if (addState !== "idle") return;
    setAddState("adding");
    try {
      await onAddToCart?.({ variantId: matchedVariant?.id ?? product.id, quantity });
    } finally {
      setAddState("added");
      setTimeout(() => setAddState("idle"), 1600);
    }
  };

  const handleBuyNow = () =>
    onBuyNow?.({ variantId: matchedVariant?.id ?? product.id, quantity });

  const buyBox = (
    <BuyBox
      product={product}
      variant={matchedVariant}
      selection={selection}
      onSelectOption={onSelectOption}
      quantity={quantity}
      onQuantityChange={setQuantity}
      onAddToCart={handleAdd}
      onBuyNow={onBuyNow ? handleBuyNow : undefined}
      wishlisted={wishlisted}
      onToggleWishlist={onToggleWishlist ?? (() => {})}
      addState={addState}
      copy={copy}
      density={variant === "sticky" ? "compact" : "comfortable"}
    />
  );

  const galleryImages = matchedVariant?.image
    ? [matchedVariant.image, ...product.gallery.slice(1)]
    : product.gallery;

  return (
    <article className={cn("flex flex-col gap-12 pb-12", className)}>
      {product.breadcrumbs && product.breadcrumbs.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={product.breadcrumbs} />
        </div>
      )}

      {/* Layout variants */}
      {variant === "classic" && (
        <div className="grid gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-12">
          <ProductGallery images={galleryImages} copy={copy} layout="thumbs-side" />
          <div>{buyBox}</div>
        </div>
      )}

      {variant === "editorial" && (
        <div className="flex flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <ProductGallery images={galleryImages} copy={copy} layout="thumbs-below" className="mx-auto w-full max-w-5xl" />
          <div className="mx-auto w-full max-w-2xl">{buyBox}</div>
        </div>
      )}

      {variant === "sticky" && (
        <div className="grid gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)] lg:gap-12">
          <ProductGallery images={galleryImages} copy={copy} layout="stack" />
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
            {buyBox}
          </aside>
        </div>
      )}

      {variant === "split" && (
        <div className="grid gap-0 lg:grid-cols-2 lg:min-h-[80vh]">
          <div className="bg-muted">
            <div className="lg:sticky lg:top-0 lg:h-screen lg:p-8">
              <ProductGallery images={galleryImages} copy={copy} layout="thumbs-below" className="h-full" />
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-12 lg:py-12">{buyBox}</div>
        </div>
      )}

      {/* Sections */}
      {product.sections && product.sections.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={cn("mx-auto", variant === "editorial" || variant === "sticky" ? "max-w-3xl" : "max-w-5xl")}>
            <ProductSections sections={product.sections} />
          </div>
        </div>
      )}

      {/* Reviews */}
      {product.reviews && (
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">{copy.reviewsHeading}</h2>
            <ReviewsSummary
              summary={product.reviews}
              copy={copy}
              reviews={reviews}
              verifiedPurchaseLabel={copy.verifiedPurchaseLabel}
            />
          </div>
        </section>
      )}

      {/* Related */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">{copy.relatedHeading}</h2>
            <ul role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {product.relatedProducts.map((p) => (
                <li key={p.id} className="contents">
                  <ProductCard
                    variant="grid"
                    product={p}
                    copy={defaultProductListCopy}
                    wishlisted={false}
                    onToggleWishlist={() => {}}
                    onAddToCart={() => {}}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
