export type HeroStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type HeroLayout = "standard" | "compact" | "wide" | "split";
export type HeroAlign = "left" | "center" | "right";

export interface HeroMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface HeroIcon {
  readonly name: string;
  readonly label?: string;
}

export interface HeroLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: HeroIcon;
  readonly media?: HeroMedia;
}

export interface HeroAppearance {
  readonly style: HeroStyle;
  readonly layout: HeroLayout;
  readonly align: HeroAlign;
  readonly className?: string;
}

export interface HeroItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: HeroMedia;
  readonly icon?: HeroIcon;
  readonly links?: readonly HeroLink[];
}

export interface HeroBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: HeroMedia;
  readonly icon?: HeroIcon;
  readonly links: readonly HeroLink[];
  readonly items: readonly HeroItem[];
  readonly appearance: HeroAppearance;
  readonly attrs: Record<string, unknown>;
}
