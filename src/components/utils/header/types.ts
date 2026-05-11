import type { MenuItemWithChildren, MenuWithItems, SiteConfig } from "@/db/types";

/**
 * Canonical data contract for the `header` registry category.
 *
 * All variants (header/default, header/centered, header/stacked, ...)
 * accept this shape. The resolver owns DB access and enrichment; components
 * only render typed data.
 */

export type HeaderLinkKind = "link" | "button" | "dropdown" | "mega-menu" | "divider";
export type HeaderTarget = "_self" | "_blank" | "_parent" | "_top";

export interface HeaderMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface HeaderIcon {
  readonly name: string;
  readonly label?: string;
}

export interface HeaderBadge {
  readonly label: string;
  readonly color?: string;
}

export interface HeaderLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind: HeaderLinkKind;
  readonly description?: string;
  readonly target?: HeaderTarget;
  readonly rel?: string;
  readonly icon?: HeaderIcon;
  readonly badge?: HeaderBadge;
  readonly media?: HeaderMedia;
  readonly isActive?: boolean;
  readonly isExternal: boolean;
  readonly isCta: boolean;
  readonly children: readonly HeaderLink[];
}

export interface HeaderBrand {
  readonly name: string;
  readonly href: string;
  readonly tagline?: string;
  readonly logo?: HeaderMedia;
}

export type HeaderStyle = "default" | "minimal" | "bordered" | "floating" | "solid" | "transparent";
export type HeaderWidth = "container" | "wide" | "full";
export type HeaderAlign = "left" | "center" | "split";

export interface HeaderAppearance {
  readonly style: HeaderStyle;
  readonly width: HeaderWidth;
  readonly align: HeaderAlign;
  readonly sticky: boolean;
  readonly showTagline: boolean;
  readonly showBadges: boolean;
  readonly showIcons: boolean;
  readonly showImages: boolean;
  readonly className?: string;
  readonly navClassName?: string;
  readonly brandClassName?: string;
}

export interface HeaderBlockData {
  readonly brand: HeaderBrand;
  readonly links: readonly HeaderLink[];
  readonly menuHandle: string;
  readonly menuLabel: string;
  readonly appearance: HeaderAppearance;
  readonly attrs: Record<string, unknown>;
}

export type HeaderMenuItem = MenuItemWithChildren;
export type HeaderMenu = MenuWithItems;
export type HeaderSiteConfig = SiteConfig;

export interface HeaderItemEnhancement {
  readonly description?: string;
  readonly icon?: string | HeaderIcon;
  readonly badge?: string | HeaderBadge;
  readonly media?: string | HeaderMedia;
  readonly image?: string | HeaderMedia;
  readonly kind?: HeaderLink["kind"];
  readonly href?: string;
}

export type HeaderItemEnhancements =
  | Record<string, HeaderItemEnhancement>
  | readonly HeaderItemEnhancement[];

export interface HeaderResolveOptions {
  readonly menuHandle?: string;
  readonly currentPath?: string;
  readonly brandHref?: string;
  readonly brandName?: string;
  readonly logo?: string | HeaderMedia | null;
  readonly items?: HeaderItemEnhancements;
  readonly style?: HeaderStyle;
  readonly width?: HeaderWidth;
  readonly align?: HeaderAlign;
  readonly sticky?: boolean;
  readonly showTagline?: boolean;
  readonly showBadges?: boolean;
  readonly showIcons?: boolean;
  readonly showImages?: boolean;
  readonly className?: string;
  readonly navClassName?: string;
  readonly brandClassName?: string;
}

export interface ResolvedHeaderInput {
  readonly site: HeaderSiteConfig;
  readonly menu: HeaderMenu | null;
  readonly options: HeaderResolveOptions;
  readonly attrs: Record<string, unknown>;
}
