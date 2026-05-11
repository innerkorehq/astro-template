import { listContentAuthors } from "@/db/index";
import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { TeamBlockData } from "@/components/utils/team/types";
import { resolveTeamData } from "@/components/utils/team/site-db";

export async function resolveTeamBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<TeamBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  let items = block.attrs.items as any;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    const authors = await listContentAuthors();
    items = authors.map(a => ({
      id: a.id,
      title: a.name,
      description: a.role || a.bio || undefined,
      media: a.avatar?.url ? { src: a.avatar.url, alt: a.name } : undefined,
      links: [
        ...(a.social_twitter ? [{ id: `tw-${a.id}`, label: "Twitter", href: a.social_twitter, icon: { name: 'twitter' } }] : []),
        ...(a.social_linkedin ? [{ id: `li-${a.id}`, label: "LinkedIn", href: a.social_linkedin, icon: { name: 'linkedin' } }] : [])
      ]
    }));
  }

  const enhancedAttrs = { ...block.attrs, items };

  return {
    id: block.id,
    type: block.type,
    category: "team",
    variant,
    data: resolveTeamData(enhancedAttrs, {}),
    attrs: block.attrs,
  };
}
