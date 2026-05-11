export type ContactStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type ContactLayout = "standard" | "compact" | "wide" | "split";
export type ContactAlign = "left" | "center" | "right";

export interface ContactMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ContactIcon {
  readonly name: string;
  readonly label?: string;
}

export interface ContactLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: ContactIcon;
  readonly media?: ContactMedia;
}

export interface ContactAppearance {
  readonly style: ContactStyle;
  readonly layout: ContactLayout;
  readonly align: ContactAlign;
  readonly className?: string;
}

export interface ContactItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: ContactMedia;
  readonly icon?: ContactIcon;
  readonly links?: readonly ContactLink[];
}

export interface ContactBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: ContactMedia;
  readonly icon?: ContactIcon;
  readonly links: readonly ContactLink[];
  readonly items: readonly ContactItem[];
  readonly appearance: ContactAppearance;
  readonly attrs: Record<string, unknown>;
}
