export type FeatureStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type FeatureLayout = "standard" | "compact" | "wide" | "split";
export type FeatureAlign = "left" | "center" | "right";

export interface FeatureMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface FeatureIcon {
  readonly name: string;
  readonly label?: string;
}

export interface FeatureLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: FeatureIcon;
  readonly media?: FeatureMedia;
}

export interface FeatureAppearance {
  readonly style: FeatureStyle;
  readonly layout: FeatureLayout;
  readonly align: FeatureAlign;
  readonly className?: string;
}

export interface FeatureItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: FeatureMedia;
  readonly icon?: FeatureIcon;
  readonly links?: readonly FeatureLink[];
}

export interface FeatureBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: FeatureMedia;
  readonly icon?: FeatureIcon;
  readonly links: readonly FeatureLink[];
  readonly items: readonly FeatureItem[];
  readonly appearance: FeatureAppearance;
  readonly attrs: Record<string, unknown>;
}
