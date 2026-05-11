import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { CtaBlockData } from "@/components/utils/cta/types";
import { resolveCtaData } from "@/components/utils/cta/site-db";

export async function resolveCtaBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<CtaBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "cta",
    variant,
    data: resolveCtaData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
