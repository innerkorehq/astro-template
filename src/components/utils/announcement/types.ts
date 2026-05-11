export type AnnouncementStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type AnnouncementLayout = "standard" | "compact" | "wide" | "split";
export type AnnouncementAlign = "left" | "center" | "right";

export interface AnnouncementMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface AnnouncementIcon {
  readonly name: string;
  readonly label?: string;
}

export interface AnnouncementLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: AnnouncementIcon;
  readonly media?: AnnouncementMedia;
}

export interface AnnouncementAppearance {
  readonly style: AnnouncementStyle;
  readonly layout: AnnouncementLayout;
  readonly align: AnnouncementAlign;
  readonly className?: string;
}

export interface AnnouncementItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: AnnouncementMedia;
  readonly icon?: AnnouncementIcon;
  readonly links?: readonly AnnouncementLink[];
}

export interface AnnouncementBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: AnnouncementMedia;
  readonly icon?: AnnouncementIcon;
  readonly links: readonly AnnouncementLink[];
  readonly items: readonly AnnouncementItem[];
  readonly appearance: AnnouncementAppearance;
  readonly attrs: Record<string, unknown>;
}
