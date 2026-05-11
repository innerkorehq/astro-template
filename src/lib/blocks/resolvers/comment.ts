import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { CommentBlockData } from "@/components/utils/comment/types";
import { resolveCommentData } from "@/components/utils/comment/site-db";

export async function resolveCommentBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<CommentBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "comment",
    variant,
    data: resolveCommentData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
