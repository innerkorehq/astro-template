import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { MapBlockData } from "@/components/utils/map/types";
import { resolveMapData } from "@/components/utils/map/site-db";

export async function resolveMapBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<MapBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "map",
    variant,
    data: resolveMapData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
