import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '../db/index.js';
import type { SiteConfig } from '../db/index.js';

// Module-level cache — populated on first request, reused across all renders
// in the same process (SSG prerender or SSR server lifetime).
let _cache: SiteConfig | null = null;

export const onRequest = defineMiddleware(async (context, next) => {
  if (!_cache) _cache = await getSiteConfig();
  context.locals.siteConfig = _cache;
  return next();
});
