import { listContentCards } from "@/db/index";
import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { BlogCardBlockData } from "@/components/utils/blog-card/types";
import { resolveBlogCardData } from "@/components/utils/blog-card/site-db";

export async function resolveBlogCardBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<BlogCardBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  // Fetch from site.db if no manual items provided
  const limit = Number(block.attrs.limit) || 3;
  let items = block.attrs.items as any;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    const cards = await listContentCards({ content_type: 'blog_post', limit });
    items = cards.map(c => ({
      id: c.id,
      title: c.title,
      description: c.excerpt || c.subtitle || undefined,
      media: c.cover_url ? { src: c.cover_url, alt: c.title } : undefined,
      links: c.slug ? [{ id: `link-${c.id}`, label: "Read more", href: `/${c.slug}` }] : []
    }));
  }

  const enhancedAttrs = { ...block.attrs, items };
  
  return {
    id: block.id,
    type: block.type,
    category: "blog-card",
    variant,
    data: resolveBlogCardData(enhancedAttrs, {}),
    attrs: block.attrs,
  };
}
