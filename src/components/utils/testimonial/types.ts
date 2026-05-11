export type TestimonialStyle = "default" | "minimal" | "bordered" | "solid" | "transparent";
export type TestimonialLayout = "standard" | "compact" | "wide" | "split";
export type TestimonialAlign = "left" | "center" | "right";

export interface TestimonialMedia {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface TestimonialIcon {
  readonly name: string;
  readonly label?: string;
}

export interface TestimonialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind?: "link" | "button" | "social";
  readonly target?: "_self" | "_blank";
  readonly icon?: TestimonialIcon;
  readonly media?: TestimonialMedia;
}

export interface TestimonialAppearance {
  readonly style: TestimonialStyle;
  readonly layout: TestimonialLayout;
  readonly align: TestimonialAlign;
  readonly className?: string;
}

export interface TestimonialItem {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly media?: TestimonialMedia;
  readonly icon?: TestimonialIcon;
  readonly links?: readonly TestimonialLink[];
}

export interface TestimonialBlockData {
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly media?: TestimonialMedia;
  readonly icon?: TestimonialIcon;
  readonly links: readonly TestimonialLink[];
  readonly items: readonly TestimonialItem[];
  readonly appearance: TestimonialAppearance;
  readonly attrs: Record<string, unknown>;
}
