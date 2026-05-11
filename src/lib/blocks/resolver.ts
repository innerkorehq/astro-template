/**
 * Master block resolver.
 *
 * Given a raw Block from page_content.body, dispatches to the correct
 * category resolver and returns a ResolvedBlock with typed data.
 *
 * Add new categories here as the registry grows.
 */

import type { Block, BlockContext, ResolvedBlock } from './types.js';
import { resolveProductBlock } from './resolvers/product.js';
import { resolveHeaderBlock } from './resolvers/header.js';

export async function resolveBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock> {
  const [category, variant = 'default'] = block.type.split('/');

  switch (category) {
    case 'header':
      return resolveHeaderBlock(block, ctx);

    case 'product':
      return resolveProductBlock(block, ctx);

    // ── Future categories ────────────────────────────────────────────────────
    // case 'service':  return resolveServiceBlock(block, ctx);
    // case 'content':  return resolveContentBlock(block, ctx);
    // case 'media':    return resolveMediaBlock(block, ctx);

    default:
      // Primitive / unknown block — pass through with no data fetch
      return {
        id: block.id,
        type: block.type,
        category,
        variant,
        data: { content: block.content, attrs: block.attrs },
        attrs: block.attrs,
      };
  }
}

/** Resolve all blocks in a page body in parallel. */
export async function resolveBlocks(
  blocks: Block[],
  ctx: BlockContext
): Promise<ResolvedBlock[]> {
  return Promise.all(blocks.map((b) => resolveBlock(b, ctx)));
}
