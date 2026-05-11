import { getDocumentBySlug } from "@/db/index";
import type { Block, BlockContext, ResolvedBlock } from "../types.js";
import type { ArticleBodyBlockData } from "@/components/utils/article-body/types";
import { resolveArticleBodyData } from "@/components/utils/article-body/site-db";

export async function resolveArticleBodyBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<ArticleBodyBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  
  let description = block.attrs.description as string | undefined;
  
  if (!description && ctx.page_ref_id) {
    const doc = await getDocumentBySlug(ctx.page_ref_id, ctx.locale);
    if (doc) {
      description = doc.body || undefined;
      if (!block.attrs.title && doc.title) {
        block.attrs.title = doc.title;
      }
    }
  }

  const enhancedAttrs = { ...block.attrs, description };

  return {
    id: block.id,
    type: block.type,
    category: "article-body",
    variant,
    data: resolveArticleBodyData(enhancedAttrs, {}),
    attrs: block.attrs,
  };
}
