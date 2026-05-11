// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  // SITE is injected via the SITE env variable by the site_builder pipeline
  // so @astrojs/sitemap generates a correct sitemap.xml for each customer site.
  site: process.env.SITE || 'https://example.com',
  integrations: [
    db(),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "class-variance-authority",
        "radix-ui",
        "clsx",
        "tailwind-merge",
      ],
    },
  },
});
