/**
 * Fallback content section — used when no registered component matches
 * the requested category/variant.
 *
 * Accepts the standard *BlockData contract so it is compatible with the
 * code-generation pipeline:
 *   data.title        → section heading
 *   data.description  → prose body
 *   data.media        → primary product image (right column on wide screens)
 *   data.items        → spec rows (rendered as a definition table)
 *   data.links        → CTA buttons
 *   data.subtitle     → badge / price hint
 */
import React from 'react';

interface Media {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface Link {
  id: string;
  label: string;
  href: string;
  kind?: string;
  isCta?: boolean;
}

interface Item {
  id: string;
  title?: string;
  description?: string;
  media?: Media;
}

interface Appearance {
  style?: string;
  layout?: string;
  align?: string;
}

interface BlockData {
  title?: string;
  subtitle?: string;
  description?: string;
  media?: Media | null;
  links?: Link[];
  items?: Item[];
  appearance?: Appearance;
  attrs?: Record<string, unknown>;
}

interface Props {
  /** Standard *BlockData shape passed by generator */
  data?: BlockData;
  /** Legacy props — kept for backwards compatibility */
  content?: string;
  structured?: Record<string, unknown>;
  images?: Array<{ src: string; alt: string }>;
  className?: string;
}

export default function FallbackContent({ data, content, className = '' }: Props) {
  // Support both new data prop and legacy content prop
  const title      = data?.title       || '';
  const subtitle   = data?.subtitle    || '';
  const desc       = data?.description || content || '';
  const media      = data?.media       || null;
  const items      = data?.items       || [];
  const links      = data?.links       || [];
  const hasSpecs   = items.length > 0;
  const hasMedia   = Boolean(media?.src);
  const hasLinks   = links.length > 0;

  return (
    <section className={`py-12 px-4 bg-background ${className}`}>
      <div className="mx-auto max-w-5xl">

        {/* ── Header ── */}
        {(title || subtitle) && (
          <div className="mb-8">
            {subtitle && (
              <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* ── Two-column layout when media present ── */}
        <div className={`flex flex-col gap-8 ${hasMedia && hasSpecs ? 'lg:flex-row' : ''}`}>

          {/* Specs table */}
          {hasSpecs && (
            <div className={`flex-1 ${hasMedia ? 'lg:order-1' : ''}`}>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id} className={i % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                        <td className="px-4 py-3 font-medium text-foreground border-r border-border w-2/5">
                          {item.title}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Primary image */}
          {hasMedia && (
            <div className={`flex-shrink-0 ${hasSpecs ? 'lg:w-96 lg:order-2' : 'w-full'}`}>
              <img
                src={media!.src}
                alt={media!.alt || title}
                width={media!.width}
                height={media!.height}
                className="w-full rounded-xl object-contain border border-border bg-muted/20 p-2"
                loading="lazy"
              />
            </div>
          )}

          {/* Plain prose fallback when no items */}
          {!hasSpecs && desc && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{desc}</p>
            </div>
          )}
        </div>

        {/* ── CTA links ── */}
        {hasLinks && (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map(link => (
              <a
                key={link.id}
                href={link.href}
                className={
                  link.isCta || link.kind === 'button'
                    ? 'inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors'
                    : 'inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors'
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
