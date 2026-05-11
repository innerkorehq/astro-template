import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { FaqBlockData } from "@/components/utils/faq/types";
import { resolveFaqData } from "@/components/utils/faq/site-db";

export async function resolveFaqBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<FaqBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "faq",
    variant,
    data: resolveFaqData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
