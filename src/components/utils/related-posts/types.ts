export type RelatedPostsStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type RelatedPostsLayout = "standard" | "compact" | "wide" | "split";
export type RelatedPostsAlign = "left" | "center" | "right";

export interface RelatedPostsMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface RelatedPostsIcon {
  readonly name: string;
  readonly label?: string;
}

export interface RelatedPostsLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: RelatedPostsIcon;
  readonly media?: RelatedPostsMedia;
}

export interface RelatedPostsAppearance {
  readonly style: RelatedPostsStyle;
  readonly layout: RelatedPostsLayout;
  readonly align: RelatedPostsAlign;
  readonly className?: string;
}

export interface RelatedPostsItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: RelatedPostsMedia;
  readonly icon?: RelatedPostsIcon;
  readonly links?: readonly RelatedPostsLink[];
}

export interface RelatedPostsBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: RelatedPostsMedia;
  readonly icon?: RelatedPostsIcon;
  readonly links: readonly RelatedPostsLink[];
  readonly items: readonly RelatedPostsItem[];
  readonly appearance: RelatedPostsAppearance;
  readonly attrs: Record<string, unknown>;
}
