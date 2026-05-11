import type {
  HeaderBlockData,
  HeaderItemEnhancement,
  HeaderItemEnhancements,
  HeaderLink,
  HeaderLinkKind,
  HeaderMedia,
  HeaderMenuItem,
  HeaderResolveOptions,
  ResolvedHeaderInput,
} from "./types";

const VALID_STYLES = ["default", "minimal", "bordered", "floating", "solid", "transparent"] as const;
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

function media(value: string | HeaderMedia | null | undefined, fallbackAlt: string): HeaderMedia | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return { src: value, alt: fallbackAlt };
  return { ...value, alt: value.alt || fallbackAlt };
}

function normalizeEnhancements(items: HeaderItemEnhancements | undefined): Record<string, HeaderItemEnhancement> {
  if (!items) return {};
  if (Array.isArray(items)) {
    return Object.fromEntries(items.map((item, index) => [String(index), item]));
  }
  return items;
}

function findEnhancement(
  item: HeaderMenuItem,
  enhancements: Record<string, HeaderItemEnhancement>
): HeaderItemEnhancement | undefined {
  return enhancements[item.id] ?? enhancements[item.label] ?? enhancements[item.url ?? ""] ?? enhancements[item.page_path ?? ""];
}

function itemHref(item: HeaderMenuItem, enhancement?: HeaderItemEnhancement): string {
  return enhancement?.href ?? item.url ?? item.page_path ?? "#";
}

function itemKind(item: HeaderMenuItem, enhancement?: HeaderItemEnhancement): HeaderLinkKind {
  if (enhancement?.kind) return enhancement.kind;
  if (item.type === "button") return "button";
  if (item.type === "mega_menu") return "mega-menu";
  if (item.type === "dropdown" || item.children.length > 0) return "dropdown";
  if (item.type === "divider") return "divider";
  return "link";
}

function itemRel(item: HeaderMenuItem): string | undefined {
  return item.is_external || item.open_in_new_tab ? "noopener noreferrer" : undefined;
}

function isActiveHref(href: string, currentPath: string | undefined): boolean {
  if (!currentPath || href === "#") return false;
  return href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);
}

function toHeaderLink(
  item: HeaderMenuItem,
  currentPath: string | undefined,
  enhancements: Record<string, HeaderItemEnhancement>
): HeaderLink {
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
    target: item.open_in_new_tab ? "_blank" : (item.target as HeaderLink["target"] | undefined),
    rel: itemRel(item),
    icon: typeof iconValue === "string" ? { name: iconValue } : iconValue,
    badge: typeof badgeValue === "string"
      ? { label: badgeValue, color: item.badge_color ?? undefined }
      : badgeValue,
    media: media(mediaValue, item.label),
    isActive: isActiveHref(href, currentPath),
    isExternal: item.is_external,
    isCta: item.is_cta || item.type === "button",
    children: item.children.map((child) => toHeaderLink(child, currentPath, enhancements)),
  };
}

export function headerOptionsFromAttrs(attrs: Record<string, unknown>): HeaderResolveOptions {
  return {
    menuHandle: text(attrs.menu_handle) ?? text(attrs.menuHandle),
    currentPath: text(attrs.current_path) ?? text(attrs.currentPath),
    brandHref: text(attrs.brand_href) ?? text(attrs.brandHref),
    brandName: text(attrs.brand_name) ?? text(attrs.brandName),
    logo: text(attrs.logo) ?? text(attrs.logo_url) ?? text(attrs.logoUrl),
    items: attrs.items as HeaderItemEnhancements | undefined,
    style: oneOf(attrs.style, VALID_STYLES, "default"),
    width: oneOf(attrs.width, VALID_WIDTHS, "container"),
    align: oneOf(attrs.align, VALID_ALIGNS, "split"),
    sticky: bool(attrs.sticky, true),
    showTagline: bool(attrs.show_tagline ?? attrs.showTagline, false),
    showBadges: bool(attrs.show_badges ?? attrs.showBadges, true),
    showIcons: bool(attrs.show_icons ?? attrs.showIcons, true),
    showImages: bool(attrs.show_images ?? attrs.showImages, true),
    className: text(attrs.className) ?? text(attrs.class_name),
    navClassName: text(attrs.navClassName) ?? text(attrs.nav_class_name),
    brandClassName: text(attrs.brandClassName) ?? text(attrs.brand_class_name),
  };
}

export function resolveHeaderDataFromSiteDb({ site, menu, options, attrs }: ResolvedHeaderInput): HeaderBlockData {
  const enhancements = normalizeEnhancements(options.items);
  const menuHandle = options.menuHandle ?? "primary-nav";

  return {
    brand: {
      name: options.brandName ?? site.name,
      href: options.brandHref ?? "/",
      tagline: site.tagline ?? undefined,
      logo: media(options.logo ?? site.logo_url, site.name),
    },
    links: menu?.items.map((item) => toHeaderLink(item, options.currentPath, enhancements)) ?? [],
    menuHandle,
    menuLabel: menu?.name || menuHandle,
    appearance: {
      style: options.style ?? "default",
      width: options.width ?? "container",
      align: options.align ?? "split",
      sticky: options.sticky ?? true,
      showTagline: options.showTagline ?? false,
      showBadges: options.showBadges ?? true,
      showIcons: options.showIcons ?? true,
      showImages: options.showImages ?? true,
      className: options.className,
      navClassName: options.navClassName,
      brandClassName: options.brandClassName,
    },
    attrs,
  };
}
