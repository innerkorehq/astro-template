import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { TestimonialBlockData } from "@/components/utils/testimonial/types";
import { resolveTestimonialData } from "@/components/utils/testimonial/site-db";

export async function resolveTestimonialBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<TestimonialBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  const dbContext = {};

  return {
    id: block.id,
    type: block.type,
    category: "testimonial",
    variant,
    data: resolveTestimonialData(block.attrs, dbContext),
    attrs: block.attrs,
  };
}
