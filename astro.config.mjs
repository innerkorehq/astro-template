// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // SITE is injected via the SITE env variable by the site_builder pipeline
  // so @astrojs/sitemap generates a correct sitemap.xml for each customer site.
  site: process.env.SITE || 'https://example.com',
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Mirror tsconfig.json's "paths" so `@/foo` resolves to `src/foo`
        // at both TypeScript compile-time and Vite bundle-time.
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
