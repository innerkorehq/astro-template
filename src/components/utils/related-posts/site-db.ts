import type { RelatedPostsBlockData, RelatedPostsAppearance, RelatedPostsLink, RelatedPostsItem, RelatedPostsMedia, RelatedPostsIcon } from "./types";

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function media(value: unknown): RelatedPostsMedia | undefined {
  if (typeof value === "string") return { src: value, alt: "" };
  if (typeof value === "object" && value !== null && "src" in value) {
    return value as RelatedPostsMedia;
  }
  return undefined;
}

export function resolveRelatedPostsData(attrs: Record<string, unknown>, dbContext: any): RelatedPostsBlockData {
  const appearance: RelatedPostsAppearance = {
    style: (text(attrs.style) as any) ?? "default",
    layout: (text(attrs.layout) as any) ?? "standard",
    align: (text(attrs.align) as any) ?? "left",
    className: text(attrs.className),
  };

  const links: RelatedPostsLink[] = Array.isArray(attrs.links) ? attrs.links : [];
  const items: RelatedPostsItem[] = Array.isArray(attrs.items) ? attrs.items : [];

  return {
    title: text(attrs.title),
    subtitle: text(attrs.subtitle),
    description: text(attrs.description),
    media: media(attrs.media),
    links,
    items,
    appearance,
    attrs,
  };
}
