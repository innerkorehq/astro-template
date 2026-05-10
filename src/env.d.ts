/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    siteConfig: import('./db/types.js').SiteConfig;
  }
}
