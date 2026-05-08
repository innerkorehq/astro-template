/**
 * PageLayout system — barrel export
 *
 * Import the layout and helpers from one place:
 *
 *   import PageLayout, { SidebarToggle } from "@/layouts/PageLayout"
 *   // or
 *   import PageLayout from "@/layouts/PageLayout/PageLayout.astro"
 *   import SidebarToggle from "@/layouts/PageLayout/SidebarToggle.astro"
 */

export { default } from "./PageLayout.astro"
export { default as SidebarToggle } from "./SidebarToggle.astro"

// Re-export the type so consuming .astro files can import it
export type { LayoutVariant } from "./types.ts"
