import type { MenuItemWithChildren, MenuWithItems, SiteConfig } from "@/db/types";

export type FooterLinkKind = "link" | "social" | "divider";
export type FooterTarget = "_self" | "_blank" | "_parent" | "_top";

export interface FooterMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface FooterIcon {
  readonly name: string;
  readonly label?: string;
}

export interface FooterBadge {
  readonly label: string;
  readonly color?: string;
}

export interface FooterLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind: FooterLinkKind;
  readonly description?: string;
  readonly target?: FooterTarget;
  readonly rel?: string;
  readonly icon?: FooterIcon;
  readonly badge?: FooterBadge;
  readonly media?: FooterMedia;
  readonly isExternal: boolean;
  readonly children: readonly FooterLink[];
}

export interface FooterBrand {
  readonly name: string;
  readonly href: string;
  readonly tagline?: string;
  readonly description?: string;
  readonly logo?: FooterMedia;
}

export type FooterStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type FooterLayout = "short" | "standard" | "long";
export type FooterWidth = "container" | "wide" | "full";
export type FooterAlign = "left" | "center" | "split";

export interface FooterAppearance {
  readonly style: FooterStyle;
  readonly layout: FooterLayout;
  readonly width: FooterWidth;
  readonly align: FooterAlign;
  readonly showTagline: boolean;
  readonly showIcons: boolean;
  readonly showImages: boolean;
  readonly showSocials: boolean;
  readonly className?: string;
  readonly brandClassName?: string;
}

export interface FooterBlockData {
  readonly brand: FooterBrand;
  readonly links: readonly FooterLink[];
  readonly secondaryLinks: readonly FooterLink[];
  readonly menuHandle: string;
  readonly menuLabel: string;
  readonly secondaryMenuHandle: string;
  readonly secondaryMenuLabel: string;
  readonly appearance: FooterAppearance;
  readonly attrs: Record<string, unknown>;
}

export type FooterMenuItem = MenuItemWithChildren;
export type FooterMenu = MenuWithItems;
export type FooterSiteConfig = SiteConfig;

export interface FooterItemEnhancement {
  readonly description?: string;
  readonly icon?: string | FooterIcon;
  readonly badge?: string | FooterBadge;
  readonly media?: string | FooterMedia;
  readonly image?: string | FooterMedia;
  readonly kind?: FooterLink["kind"];
  readonly href?: string;
}

export type FooterItemEnhancements =
  | Record<string, FooterItemEnhancement>
  | readonly FooterItemEnhancement[];

export interface FooterResolveOptions {
  readonly menuHandle?: string;
  readonly secondaryMenuHandle?: string;
  readonly brandHref?: string;
  readonly brandName?: string;
  readonly brandDescription?: string;
  readonly logo?: string | FooterMedia | null;
  readonly items?: FooterItemEnhancements;
  readonly style?: FooterStyle;
  readonly layout?: FooterLayout;
  readonly width?: FooterWidth;
  readonly align?: FooterAlign;
  readonly showTagline?: boolean;
  readonly showIcons?: boolean;
  readonly showImages?: boolean;
  readonly showSocials?: boolean;
  readonly className?: string;
  readonly brandClassName?: string;
}

export interface ResolvedFooterInput {
  readonly site: FooterSiteConfig;
  readonly menu: FooterMenu | null;
  readonly secondaryMenu: FooterMenu | null;
  readonly options: FooterResolveOptions;
  readonly attrs: Record<string, unknown>;
}
