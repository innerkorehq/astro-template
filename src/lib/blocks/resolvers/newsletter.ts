import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { NewsletterBlockData } from "@/components/utils/newsletter/types";
import { resolveNewsletterData } from "@/components/utils/newsletter/site-db";

export async function resolveNewsletterBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<NewsletterBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "newsletter",
    variant,
    data: resolveNewsletterData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
