export type MapStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type MapLayout = "standard" | "compact" | "wide" | "split";
export type MapAlign = "left" | "center" | "right";

export interface MapMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface MapIcon {
  readonly name: string;
  readonly label?: string;
}

export interface MapLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: MapIcon;
  readonly media?: MapMedia;
}

export interface MapAppearance {
  readonly style: MapStyle;
  readonly layout: MapLayout;
  readonly align: MapAlign;
  readonly className?: string;
}

export interface MapItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: MapMedia;
  readonly icon?: MapIcon;
  readonly links?: readonly MapLink[];
}

export interface MapBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: MapMedia;
  readonly icon?: MapIcon;
  readonly links: readonly MapLink[];
  readonly items: readonly MapItem[];
  readonly appearance: MapAppearance;
  readonly attrs: Record<string, unknown>;
}
