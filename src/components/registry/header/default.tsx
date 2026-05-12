import * as React from "react";
import { ChevronDown, ExternalLink, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeaderBlockData, HeaderLink } from "@/components/utils/header/types";

export interface HeaderDefaultProps {
  readonly data: HeaderBlockData;
  readonly className?: string;
}

const STYLE_CLASS = {
  default: "border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75",
  minimal: "bg-background",
  bordered: "border-b border-border bg-background shadow-sm",
  floating: "mx-3 mt-3 rounded-lg border border-border bg-background/90 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/75",
  solid: "border-b border-border bg-foreground text-background",
  transparent: "bg-transparent",
} as const;

const WIDTH_CLASS = {
  container: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
} as const;

const ALIGN_CLASS = {
  left: "justify-start gap-8",
  center: "justify-center gap-8",
  split: "justify-between gap-6",
} as const;

function hasChildren(link: HeaderLink): boolean {
  return link.children.length > 0;
}

function LinkIcon({ link, visible }: { readonly link: HeaderLink; readonly visible: boolean }): React.ReactElement | null {
  if (!visible || !link.icon?.name) return null;
  return (
    <span className="inline-grid size-5 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground" aria-hidden="true">
      {link.icon.name.slice(0, 2)}
    </span>
  );
}

function LinkBadge({ link, visible }: { readonly link: HeaderLink; readonly visible: boolean }): React.ReactElement | null {
  if (!visible || !link.badge?.label) return null;
  return (
    <span
      className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground"
      style={link.badge.color ? { backgroundColor: link.badge.color, color: "#fff" } : undefined}
    >
      {link.badge.label}
    </span>
  );
}

function NavAnchor({
  link,
  showBadges,
  showIcons,
  className,
}: {
  readonly link: HeaderLink;
  readonly showBadges: boolean;
  readonly showIcons: boolean;
  readonly className?: string;
}): React.ReactElement {
  return (
    <a
      href={link.href}
      target={link.target}
      rel={link.rel}
      aria-current={link.isActive ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        link.isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
        link.isCta && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        className
      )}
    >
      <LinkIcon link={link} visible={showIcons} />
      <span>{link.label}</span>
      <LinkBadge link={link} visible={showBadges} />
      {link.isExternal && <ExternalLink className="size-3.5" aria-hidden="true" />}
    </a>
  );
}

function DropdownPanel({
  link,
  showBadges,
  showIcons,
  showImages,
}: {
  readonly link: HeaderLink;
  readonly showBadges: boolean;
  readonly showIcons: boolean;
  readonly showImages: boolean;
}): React.ReactElement | null {
  if (!hasChildren(link)) return null;

  const isMega = link.kind === "mega-menu";
  return (
    <div
      className={cn(
        "invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
        isMega ? "w-[min(42rem,calc(100vw-2rem))]" : "w-64"
      )}
    >
      <div className={cn("rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl", isMega && "grid gap-2 sm:grid-cols-2")}>
        {link.children.map((child) => (
          <a
            key={child.id}
            href={child.href}
            target={child.target}
            rel={child.rel}
            className="flex min-w-0 gap-3 rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {showImages && child.media ? (
              <img src={child.media.src} alt={child.media.alt} className="size-12 shrink-0 rounded-md object-cover" />
            ) : (
              <LinkIcon link={child} visible={showIcons} />
            )}
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                {child.label}
                <LinkBadge link={child} visible={showBadges} />
              </span>
              {child.description && (
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                  {child.description}
                </span>
              )}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DesktopNav({ data }: { readonly data: HeaderBlockData }): React.ReactElement {
  const { appearance } = data;

  return (
    <nav aria-label={data.menuLabel} className={cn("hidden items-center gap-1 lg:flex", appearance.navClassName)}>
      {data.links.map((link) => (
        <div key={link.id} className="group relative">
          <NavAnchor link={link} showBadges={appearance.showBadges} showIcons={appearance.showIcons} />
          {hasChildren(link) && (
            <>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <DropdownPanel
                link={link}
                showBadges={appearance.showBadges}
                showIcons={appearance.showIcons}
                showImages={appearance.showImages}
              />
            </>
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileLink({ link, data }: { readonly link: HeaderLink; readonly data: HeaderBlockData }): React.ReactElement {
  if (!hasChildren(link)) {
    return (
      <NavAnchor
        link={link}
        showBadges={data.appearance.showBadges}
        showIcons={data.appearance.showIcons}
        className="w-full justify-start"
      />
    );
  }

  return (
    <details className="group/mobile">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
        <span className="inline-flex items-center gap-2">
          <LinkIcon link={link} visible={data.appearance.showIcons} />
          {link.label}
        </span>
        <ChevronDown className="size-4 transition-transform group-open/mobile:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-1 space-y-1 pl-3">
        {link.children.map((child) => (
          <MobileLink key={child.id} link={child} data={data} />
        ))}
      </div>
    </details>
  );
}

function Brand({ data }: { readonly data: HeaderBlockData }): React.ReactElement {
  const { brand, appearance } = data;

  return (
    <a href={brand.href} className={cn("flex min-w-0 items-center gap-3", appearance.brandClassName)}>
      {brand.logo && (
        <img src={brand.logo.src} alt={brand.logo.alt} className="size-9 shrink-0 rounded-md object-contain" />
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight">{brand.name}</span>
        {appearance.showTagline && brand.tagline && (
          <span className="block truncate text-xs text-muted-foreground">{brand.tagline}</span>
        )}
      </span>
    </a>
  );
}

export function HeaderDefault({ data, className }: HeaderDefaultProps): React.ReactElement | null {
  if (!data.links.length) return null;

  const { appearance } = data;

  return (
    <header
      className={cn(
        appearance.sticky && "sticky top-0 z-40",
        STYLE_CLASS[appearance.style],
        appearance.className,
        className
      )}
    >
      <div className={cn(WIDTH_CLASS[appearance.width], "flex min-h-16 items-center", ALIGN_CLASS[appearance.align])}>
        <Brand data={data} />
        <DesktopNav data={data} />
        <details className="relative ml-auto lg:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Menu className="size-5" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-1 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
            {data.links.map((link) => (
              <MobileLink key={link.id} link={link} data={data} />
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}

export default HeaderDefault;
