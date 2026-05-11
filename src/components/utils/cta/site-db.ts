import type { CtaBlockData, CtaAppearance, CtaLink, CtaItem, CtaMedia, CtaIcon } from "./types";

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function media(value: unknown): CtaMedia | undefined {
  if (typeof value === "string") return { src: value, alt: "" };
  if (typeof value === "object" && value !== null && "src" in value) {
    return value as CtaMedia;
  }
  return undefined;
}

export function resolveCtaData(attrs: Record<string, unknown>, dbContext: any): CtaBlockData {
  const appearance: CtaAppearance = {
    style: (text(attrs.style) as any) ?? "default",
    layout: (text(attrs.layout) as any) ?? "standard",
    align: (text(attrs.align) as any) ?? "left",
    className: text(attrs.className),
  };

  const links: CtaLink[] = Array.isArray(attrs.links) ? attrs.links : [];
  const items: CtaItem[] = Array.isArray(attrs.items) ? attrs.items : [];

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
