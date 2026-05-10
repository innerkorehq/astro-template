import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '../db/index.js';
import type { SiteConfig } from '../db/index.js';

// Module-level cache: populated on first request, reused for all subsequent
// renders in the same process (SSG prerender or SSR server lifetime).
let _cache: SiteConfig | null = null;

export const onRequest = defineMiddleware((context, next) => {
  if (!_cache) _cache = getSiteConfig();
  context.locals.siteConfig = _cache;
  return next();
});
