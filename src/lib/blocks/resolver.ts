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
import { resolveFooterBlock } from './resolvers/footer.js';
import { resolveHeroBlock } from './resolvers/hero.js';
import { resolveBannerBlock } from './resolvers/banner.js';
import { resolveFeatureBlock } from './resolvers/feature.js';
import { resolveFaqBlock } from './resolvers/faq.js';
import { resolveTestimonialBlock } from './resolvers/testimonial.js';
import { resolveTeamBlock } from './resolvers/team.js';
import { resolveBlogCardBlock } from './resolvers/blog-card.js';
import { resolveArticleBodyBlock } from './resolvers/article-body.js';
import { resolveNewsletterBlock } from './resolvers/newsletter.js';
import { resolveCtaBlock } from './resolvers/cta.js';
import { resolveContactBlock } from './resolvers/contact.js';
import { resolveMapBlock } from './resolvers/map.js';
import { resolveCommentBlock } from './resolvers/comment.js';
import { resolveRelatedPostsBlock } from './resolvers/related-posts.js';
import { resolveAnnouncementBlock } from './resolvers/announcement.js';

export async function resolveBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock> {
  const [category, variant = 'default'] = block.type.split('/');

  switch (category) {
    case 'header':
      return resolveHeaderBlock(block, ctx);

    case 'footer':
      return resolveFooterBlock(block, ctx);

    case 'product':
      return resolveProductBlock(block, ctx);

    case 'hero':
      return resolveHeroBlock(block, ctx);

    case 'banner':
      return resolveBannerBlock(block, ctx);

    case 'feature':
      return resolveFeatureBlock(block, ctx);

    case 'faq':
      return resolveFaqBlock(block, ctx);

    case 'testimonial':
      return resolveTestimonialBlock(block, ctx);

    case 'team':
      return resolveTeamBlock(block, ctx);

    case 'blog-card':
      return resolveBlogCardBlock(block, ctx);

    case 'article-body':
      return resolveArticleBodyBlock(block, ctx);

    case 'newsletter':
      return resolveNewsletterBlock(block, ctx);

    case 'cta':
      return resolveCtaBlock(block, ctx);

    case 'contact':
      return resolveContactBlock(block, ctx);

    case 'map':
      return resolveMapBlock(block, ctx);

    case 'comment':
      return resolveCommentBlock(block, ctx);

    case 'related-posts':
      return resolveRelatedPostsBlock(block, ctx);

    case 'announcement':
      return resolveAnnouncementBlock(block, ctx);

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
