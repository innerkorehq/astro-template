export type BlogCardStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type BlogCardLayout = "standard" | "compact" | "wide" | "split";
export type BlogCardAlign = "left" | "center" | "right";

export interface BlogCardMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface BlogCardIcon {
  readonly name: string;
  readonly label?: string;
}

export interface BlogCardLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: BlogCardIcon;
  readonly media?: BlogCardMedia;
}

export interface BlogCardAppearance {
  readonly style: BlogCardStyle;
  readonly layout: BlogCardLayout;
  readonly align: BlogCardAlign;
  readonly className?: string;
}

export interface BlogCardItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: BlogCardMedia;
  readonly icon?: BlogCardIcon;
  readonly links?: readonly BlogCardLink[];
}

export interface BlogCardBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: BlogCardMedia;
  readonly icon?: BlogCardIcon;
  readonly links: readonly BlogCardLink[];
  readonly items: readonly BlogCardItem[];
  readonly appearance: BlogCardAppearance;
  readonly attrs: Record<string, unknown>;
}
