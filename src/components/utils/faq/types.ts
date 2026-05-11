export type FaqStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type FaqLayout = "standard" | "compact" | "wide" | "split";
export type FaqAlign = "left" | "center" | "right";

export interface FaqMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface FaqIcon {
  readonly name: string;
  readonly label?: string;
}

export interface FaqLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: FaqIcon;
  readonly media?: FaqMedia;
}

export interface FaqAppearance {
  readonly style: FaqStyle;
  readonly layout: FaqLayout;
  readonly align: FaqAlign;
  readonly className?: string;
}

export interface FaqItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: FaqMedia;
  readonly icon?: FaqIcon;
  readonly links?: readonly FaqLink[];
}

export interface FaqBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: FaqMedia;
  readonly icon?: FaqIcon;
  readonly links: readonly FaqLink[];
  readonly items: readonly FaqItem[];
  readonly appearance: FaqAppearance;
  readonly attrs: Record<string, unknown>;
}
