export type ArticleBodyStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type ArticleBodyLayout = "standard" | "compact" | "wide" | "split";
export type ArticleBodyAlign = "left" | "center" | "right";

export interface ArticleBodyMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ArticleBodyIcon {
  readonly name: string;
  readonly label?: string;
}

export interface ArticleBodyLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: ArticleBodyIcon;
  readonly media?: ArticleBodyMedia;
}

export interface ArticleBodyAppearance {
  readonly style: ArticleBodyStyle;
  readonly layout: ArticleBodyLayout;
  readonly align: ArticleBodyAlign;
  readonly className?: string;
}

export interface ArticleBodyItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: ArticleBodyMedia;
  readonly icon?: ArticleBodyIcon;
  readonly links?: readonly ArticleBodyLink[];
}

export interface ArticleBodyBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: ArticleBodyMedia;
  readonly icon?: ArticleBodyIcon;
  readonly links: readonly ArticleBodyLink[];
  readonly items: readonly ArticleBodyItem[];
  readonly appearance: ArticleBodyAppearance;
  readonly attrs: Record<string, unknown>;
}
