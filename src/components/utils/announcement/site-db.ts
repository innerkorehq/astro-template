import type { AnnouncementBlockData, AnnouncementAppearance, AnnouncementLink, AnnouncementItem, AnnouncementMedia, AnnouncementIcon } from "./types";

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function media(value: unknown): AnnouncementMedia | undefined {
  if (typeof value === "string") return { src: value, alt: "" };
  if (typeof value === "object" && value !== null && "src" in value) {
    return value as AnnouncementMedia;
  }
  return undefined;
}

export function resolveAnnouncementData(attrs: Record<string, unknown>, dbContext: any): AnnouncementBlockData {
  const appearance: AnnouncementAppearance = {
    style: (text(attrs.style) as any) ?? "default",
    layout: (text(attrs.layout) as any) ?? "standard",
    align: (text(attrs.align) as any) ?? "left",
    className: text(attrs.className),
  };

  const links: AnnouncementLink[] = Array.isArray(attrs.links) ? attrs.links : [];
  const items: AnnouncementItem[] = Array.isArray(attrs.items) ? attrs.items : [];

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
