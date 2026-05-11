import type {
  FooterBlockData,
  FooterItemEnhancement,
  FooterItemEnhancements,
  FooterLink,
  FooterLinkKind,
  FooterMedia,
  FooterMenuItem,
  FooterResolveOptions,
  ResolvedFooterInput,
} from "./types";

const VALID_STYLES = ["default", "minimal", "bordered", "solid", "transparent"] as const;
const VALID_LAYOUTS = ["short", "standard", "long"] as const;
const VALID_WIDTHS = ["container", "wide", "full"] as const;
const VALID_ALIGNS = ["left", "center", "split"] as const;

function oneOf<T extends readonly string[]>(value: unknown, values: T, fallback: T[number]): T[number] {
  return typeof value === "string" && values.includes(value) ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function media(value: string | FooterMedia | null | undefined, fallbackAlt: string): FooterMedia | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return { src: value, alt: fallbackAlt };
  return { ...value, alt: value.alt || fallbackAlt };
}

function normalizeEnhancements(items: FooterItemEnhancements | undefined): Record<string, FooterItemEnhancement> {
  if (!items) return {};
  if (Array.isArray(items)) {
    return Object.fromEntries(items.map((item, index) => [String(index), item]));
  }
  return items;
}

function findEnhancement(
  item: FooterMenuItem,
  enhancements: Record<string, FooterItemEnhancement>
): FooterItemEnhancement | undefined {
  return enhancements[item.id] ?? enhancements[item.label] ?? enhancements[item.url ?? ""] ?? enhancements[item.page_path ?? ""];
}

function itemHref(item: FooterMenuItem, enhancement?: FooterItemEnhancement): string {
  return enhancement?.href ?? item.url ?? item.page_path ?? "#";
}

function itemKind(item: FooterMenuItem, enhancement?: FooterItemEnhancement): FooterLinkKind {
  if (enhancement?.kind) return enhancement.kind;
  if (item.type === "divider") return "divider";
  return "link";
}

function itemRel(item: FooterMenuItem): string | undefined {
  return item.is_external || item.open_in_new_tab ? "noopener noreferrer" : undefined;
}

function toFooterLink(
  item: FooterMenuItem,
  enhancements: Record<string, FooterItemEnhancement>
): FooterLink {
  const enhancement = findEnhancement(item, enhancements);
  const href = itemHref(item, enhancement);
  const iconValue = enhancement?.icon ?? item.icon ?? undefined;
  const badgeValue = enhancement?.badge ?? item.badge ?? undefined;
  const mediaValue = enhancement?.media ?? enhancement?.image;

  return {
    id: item.id,
    label: item.label,
    href,
    kind: itemKind(item, enhancement),
    description: enhancement?.description,
    target: item.open_in_new_tab ? "_blank" : undefined,
    rel: itemRel(item),
    icon: typeof iconValue === "string" ? { name: iconValue } : iconValue,
    badge: typeof badgeValue === "string"
      ? { label: badgeValue, color: item.badge_color ?? undefined }
      : badgeValue,
    media: media(mediaValue, item.label),
    isExternal: item.is_external,
    children: item.children.map((child) => toFooterLink(child, enhancements)),
  };
}

export function footerOptionsFromAttrs(attrs: Record<string, unknown>): FooterResolveOptions {
  return {
    menuHandle: text(attrs.menu_handle) ?? text(attrs.menuHandle),
    secondaryMenuHandle: text(attrs.secondary_menu_handle) ?? text(attrs.secondaryMenuHandle),
    brandHref: text(attrs.brand_href) ?? text(attrs.brandHref),
    brandName: text(attrs.brand_name) ?? text(attrs.brandName),
    brandDescription: text(attrs.brand_description) ?? text(attrs.brandDescription),
    logo: text(attrs.logo) ?? text(attrs.logo_url) ?? text(attrs.logoUrl),
    items: attrs.items as FooterItemEnhancements | undefined,
    style: oneOf(attrs.style, VALID_STYLES, "default"),
    layout: oneOf(attrs.layout, VALID_LAYOUTS, "standard"),
    width: oneOf(attrs.width, VALID_WIDTHS, "container"),
    align: oneOf(attrs.align, VALID_ALIGNS, "split"),
    showTagline: bool(attrs.show_tagline ?? attrs.showTagline, true),
    showIcons: bool(attrs.show_icons ?? attrs.showIcons, true),
    showImages: bool(attrs.show_images ?? attrs.showImages, true),
    showSocials: bool(attrs.show_socials ?? attrs.showSocials, true),
    className: text(attrs.className) ?? text(attrs.class_name),
    brandClassName: text(attrs.brandClassName) ?? text(attrs.brand_class_name),
  };
}

export function resolveFooterDataFromSiteDb({ site, menu, secondaryMenu, options, attrs }: ResolvedFooterInput): FooterBlockData {
  const enhancements = normalizeEnhancements(options.items);
  const menuHandle = options.menuHandle ?? "footer-nav";
  const secondaryMenuHandle = options.secondaryMenuHandle ?? "footer-secondary";

  return {
    brand: {
      name: options.brandName ?? site.name,
      href: options.brandHref ?? "/",
      tagline: site.tagline ?? undefined,
      description: options.brandDescription,
      logo: media(options.logo ?? site.logo_url, site.name),
    },
    links: menu?.items.map((item) => toFooterLink(item, enhancements)) ?? [],
    secondaryLinks: secondaryMenu?.items.map((item) => toFooterLink(item, enhancements)) ?? [],
    menuHandle,
    menuLabel: menu?.name || menuHandle,
    secondaryMenuHandle,
    secondaryMenuLabel: secondaryMenu?.name || secondaryMenuHandle,
    appearance: {
      style: options.style ?? "default",
      layout: options.layout ?? "standard",
      width: options.width ?? "container",
      align: options.align ?? "split",
      showTagline: options.showTagline ?? true,
      showIcons: options.showIcons ?? true,
      showImages: options.showImages ?? true,
      showSocials: options.showSocials ?? true,
      className: options.className,
      brandClassName: options.brandClassName,
    },
    attrs,
  };
}
