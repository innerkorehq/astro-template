import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { HeroBlockData } from "@/components/utils/hero/types";
import { resolveHeroData } from "@/components/utils/hero/site-db";

export async function resolveHeroBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<HeroBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "hero",
    variant,
    data: resolveHeroData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
