import * as React from "react";
import { cn } from "@/lib/utils";
import type { HeroBlockData, HeroLink, HeroItem } from "@/components/utils/hero/types";

export interface HeroProps {
  readonly data: HeroBlockData;
  readonly className?: string;
}

const STYLE_CLASS = {
  default: "bg-background text-foreground",
  minimal: "bg-transparent text-foreground",
  bordered: "border border-border bg-card text-card-foreground rounded-xl",
  solid: "bg-foreground text-background",
  transparent: "bg-transparent",
} as const;

function BlockLink({ link, className }: { link: HeroLink; className?: string }) {
  const isButton = link.kind === "button";
  return (
    <a
      href={link.href}
      target={link.target}
      className={cn(
        "inline-flex items-center gap-2 transition-colors",
        isButton 
          ? "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm" 
          : "text-muted-foreground hover:text-foreground text-sm font-medium",
        className
      )}
    >
      {link.icon && <span className="text-xs">{link.icon.name.slice(0, 2)}</span>}
      {link.label}
    </a>
  );
}

function BlockItem({ item }: { item: HeroItem }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50">
      {item.media && <img src={item.media.src} alt={item.media.alt} className="w-full h-32 object-cover rounded-md" />}
      {item.title && <h4 className="font-semibold">{item.title}</h4>}
      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
      {item.links && item.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {item.links.map(link => <BlockLink key={link.id} link={link} />)}
        </div>
      )}
    </div>
  );
}

export function HeroDefault({ data, className }: HeroProps): React.ReactElement {
  const { appearance, title, subtitle, description, media, links, items } = data;

  return (
    <section className={cn(STYLE_CLASS[appearance.style], "py-12 md:py-16", appearance.className, className)}>
      <div className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8",
        appearance.align === "center" ? "text-center items-center" : "text-left items-start",
        appearance.layout === "split" && "md:flex-row md:justify-between"
      )}>
        <div className="flex flex-col gap-4 max-w-3xl">
          {subtitle && <span className="text-sm font-semibold tracking-wider uppercase text-primary">{subtitle}</span>}
          {title && <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>}
          
          {links && links.length > 0 && (
            <div className={cn("flex flex-wrap gap-4 mt-4", appearance.align === "center" && "justify-center")}>
              {links.map(link => <BlockLink key={link.id} link={link} />)}
            </div>
          )}
        </div>

        {media && (
          <div className="shrink-0">
            <img src={media.src} alt={media.alt} className="rounded-xl object-cover shadow-lg w-full max-w-md" />
          </div>
        )}

        {items && items.length > 0 && (
          <div className={cn(
            "grid gap-6 w-full mt-8",
            appearance.layout === "compact" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {items.map(item => <BlockItem key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroDefault;
