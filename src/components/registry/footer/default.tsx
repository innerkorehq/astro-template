import * as React from "react";
import { cn } from "@/lib/utils";
import type { FooterBlockData, FooterLink } from "@/components/utils/footer/types";

export interface FooterDefaultProps {
  readonly data: FooterBlockData;
  readonly className?: string;
}

const STYLE_CLASS = {
  default: "border-t border-border bg-background text-foreground",
  minimal: "bg-background text-foreground",
  bordered: "border-t border-border bg-card text-card-foreground",
  solid: "bg-foreground text-background",
  transparent: "bg-transparent",
} as const;

const WIDTH_CLASS = {
  container: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
} as const;

function LinkIcon({ link, visible }: { readonly link: FooterLink; readonly visible: boolean }): React.ReactElement | null {
  if (!visible || !link.icon?.name) return null;
  return (
    <span className="inline-grid size-4 place-items-center rounded-md text-[10px] opacity-70" aria-hidden="true">
      {link.icon.name.slice(0, 2)}
    </span>
  );
}

function LinkBadge({ link }: { readonly link: FooterLink }): React.ReactElement | null {
  if (!link.badge?.label) return null;
  return (
    <span
      className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground"
      style={link.badge.color ? { backgroundColor: link.badge.color, color: "#fff" } : undefined}
    >
      {link.badge.label}
    </span>
  );
}

function FooterAnchor({
  link,
  showIcons,
  className,
}: {
  readonly link: FooterLink;
  readonly showIcons: boolean;
  readonly className?: string;
}): React.ReactElement {
  return (
    <a
      href={link.href}
      target={link.target}
      rel={link.rel}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <LinkIcon link={link} visible={showIcons} />
      <span>{link.label}</span>
      <LinkBadge link={link} />
    </a>
  );
}

function BrandSection({ data }: { readonly data: FooterBlockData }): React.ReactElement {
  const { brand, appearance } = data;

  return (
    <div className={cn("flex flex-col gap-4", appearance.brandClassName)}>
      <a href={brand.href} className="flex items-center gap-3">
        {brand.logo && appearance.showImages && (
          <img src={brand.logo.src} alt={brand.logo.alt} className="size-8 object-contain" />
        )}
        <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
      </a>
      {appearance.showTagline && brand.tagline && (
        <p className="text-sm font-medium">{brand.tagline}</p>
      )}
      {brand.description && (
        <p className="max-w-xs text-sm text-muted-foreground">{brand.description}</p>
      )}
    </div>
  );
}

function ShortNav({ data }: { readonly data: FooterBlockData }): React.ReactElement | null {
  if (!data.links.length) return null;

  return (
    <nav aria-label={data.menuLabel} className="flex flex-wrap items-center gap-x-6 gap-y-4">
      {data.links.map((link) => (
        <FooterAnchor key={link.id} link={link} showIcons={data.appearance.showIcons} />
      ))}
    </nav>
  );
}

function LongNav({ data }: { readonly data: FooterBlockData }): React.ReactElement | null {
  if (!data.links.length) return null;

  return (
    <nav aria-label={data.menuLabel} className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
      {data.links.map((group) => (
        <div key={group.id} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">{group.label}</h3>
          {group.children.length > 0 && (
            <ul className="flex flex-col gap-2">
              {group.children.map((child) => (
                <li key={child.id}>
                  <FooterAnchor link={child} showIcons={data.appearance.showIcons} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}

export function FooterDefault({ data, className }: FooterDefaultProps): React.ReactElement {
  const { appearance, secondaryLinks } = data;
  const isLong = appearance.layout === "long";

  return (
    <footer className={cn(STYLE_CLASS[appearance.style], appearance.className, className)}>
      <div className={cn(WIDTH_CLASS[appearance.width], "py-12 md:py-16")}>
        <div className={cn("flex flex-col gap-8", isLong ? "lg:flex-row lg:justify-between lg:gap-16" : "md:flex-row md:items-center md:justify-between")}>
          <BrandSection data={data} />
          {isLong ? <LongNav data={data} /> : <ShortNav data={data} />}
        </div>

        {(secondaryLinks.length > 0 || appearance.showSocials) && (
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {data.brand.name}. All rights reserved.
            </p>
            {secondaryLinks.length > 0 && (
              <nav aria-label={data.secondaryMenuLabel} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {secondaryLinks.map((link) => (
                  <FooterAnchor key={link.id} link={link} showIcons={appearance.showIcons} className="text-xs" />
                ))}
              </nav>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

export default FooterDefault;
