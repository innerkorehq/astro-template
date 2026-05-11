export type NewsletterStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type NewsletterLayout = "standard" | "compact" | "wide" | "split";
export type NewsletterAlign = "left" | "center" | "right";

export interface NewsletterMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface NewsletterIcon {
  readonly name: string;
  readonly label?: string;
}

export interface NewsletterLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: NewsletterIcon;
  readonly media?: NewsletterMedia;
}

export interface NewsletterAppearance {
  readonly style: NewsletterStyle;
  readonly layout: NewsletterLayout;
  readonly align: NewsletterAlign;
  readonly className?: string;
}

export interface NewsletterItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: NewsletterMedia;
  readonly icon?: NewsletterIcon;
  readonly links?: readonly NewsletterLink[];
}

export interface NewsletterBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: NewsletterMedia;
  readonly icon?: NewsletterIcon;
  readonly links: readonly NewsletterLink[];
  readonly items: readonly NewsletterItem[];
  readonly appearance: NewsletterAppearance;
  readonly attrs: Record<string, unknown>;
}
