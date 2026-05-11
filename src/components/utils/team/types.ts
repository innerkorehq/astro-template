export type TeamStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type TeamLayout = "standard" | "compact" | "wide" | "split";
export type TeamAlign = "left" | "center" | "right";

export interface TeamMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface TeamIcon {
  readonly name: string;
  readonly label?: string;
}

export interface TeamLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: TeamIcon;
  readonly media?: TeamMedia;
}

export interface TeamAppearance {
  readonly style: TeamStyle;
  readonly layout: TeamLayout;
  readonly align: TeamAlign;
  readonly className?: string;
}

export interface TeamItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: TeamMedia;
  readonly icon?: TeamIcon;
  readonly links?: readonly TeamLink[];
}

export interface TeamBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: TeamMedia;
  readonly icon?: TeamIcon;
  readonly links: readonly TeamLink[];
  readonly items: readonly TeamItem[];
  readonly appearance: TeamAppearance;
  readonly attrs: Record<string, unknown>;
}
