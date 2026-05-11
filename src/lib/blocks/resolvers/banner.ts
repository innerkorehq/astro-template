import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { BannerBlockData } from "@/components/utils/banner/types";
import { resolveBannerData } from "@/components/utils/banner/site-db";

export async function resolveBannerBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<BannerBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "banner",
    variant,
    data: resolveBannerData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
