import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { ContactBlockData } from "@/components/utils/contact/types";
import { resolveContactData } from "@/components/utils/contact/site-db";

export async function resolveContactBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<ContactBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "contact",
    variant,
    data: resolveContactData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
