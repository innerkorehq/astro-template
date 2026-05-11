import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { FeatureBlockData } from "@/components/utils/feature/types";
import { resolveFeatureData } from "@/components/utils/feature/site-db";

export async function resolveFeatureBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<FeatureBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "feature",
    variant,
    data: resolveFeatureData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
