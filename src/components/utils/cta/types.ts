export type CtaStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type CtaLayout = "standard" | "compact" | "wide" | "split";
export type CtaAlign = "left" | "center" | "right";

export interface CtaMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface CtaIcon {
  readonly name: string;
  readonly label?: string;
}

export interface CtaLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: CtaIcon;
  readonly media?: CtaMedia;
}

export interface CtaAppearance {
  readonly style: CtaStyle;
  readonly layout: CtaLayout;
  readonly align: CtaAlign;
  readonly className?: string;
}

export interface CtaItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: CtaMedia;
  readonly icon?: CtaIcon;
  readonly links?: readonly CtaLink[];
}

export interface CtaBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: CtaMedia;
  readonly icon?: CtaIcon;
  readonly links: readonly CtaLink[];
  readonly items: readonly CtaItem[];
  readonly appearance: CtaAppearance;
  readonly attrs: Record<string, unknown>;
}
