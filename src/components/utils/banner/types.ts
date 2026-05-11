export type BannerStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type BannerLayout = "standard" | "compact" | "wide" | "split";
export type BannerAlign = "left" | "center" | "right";

export interface BannerMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface BannerIcon {
  readonly name: string;
  readonly label?: string;
}

export interface BannerLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: BannerIcon;
  readonly media?: BannerMedia;
}

export interface BannerAppearance {
  readonly style: BannerStyle;
  readonly layout: BannerLayout;
  readonly align: BannerAlign;
  readonly className?: string;
}

export interface BannerItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: BannerMedia;
  readonly icon?: BannerIcon;
  readonly links?: readonly BannerLink[];
}

export interface BannerBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: BannerMedia;
  readonly icon?: BannerIcon;
  readonly links: readonly BannerLink[];
  readonly items: readonly BannerItem[];
  readonly appearance: BannerAppearance;
  readonly attrs: Record<string, unknown>;
}
