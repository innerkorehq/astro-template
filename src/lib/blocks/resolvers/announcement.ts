import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { AnnouncementBlockData } from "@/components/utils/announcement/types";
import { resolveAnnouncementData } from "@/components/utils/announcement/site-db";

export async function resolveAnnouncementBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<AnnouncementBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "announcement",
    variant,
    data: resolveAnnouncementData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
