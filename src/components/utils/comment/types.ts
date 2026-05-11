export type CommentStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type CommentLayout = "standard" | "compact" | "wide" | "split";
export type CommentAlign = "left" | "center" | "right";

export interface CommentMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface CommentIcon {
  readonly name: string;
  readonly label?: string;
}

export interface CommentLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: CommentIcon;
  readonly media?: CommentMedia;
}

export interface CommentAppearance {
  readonly style: CommentStyle;
  readonly layout: CommentLayout;
  readonly align: CommentAlign;
  readonly className?: string;
}

export interface CommentItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: CommentMedia;
  readonly icon?: CommentIcon;
  readonly links?: readonly CommentLink[];
}

export interface CommentBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: CommentMedia;
  readonly icon?: CommentIcon;
  readonly links: readonly CommentLink[];
  readonly items: readonly CommentItem[];
  readonly appearance: CommentAppearance;
  readonly attrs: Record<string, unknown>;
}
