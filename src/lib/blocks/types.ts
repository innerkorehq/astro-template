/**
 * Core block system types.
 *
 * A Block is a raw record from page_content.body (JSON array).
 * A ResolvedBlock wraps a Block with fetched, typed data ready for a component.
 *
 * Block type format: "{category}/{variant}"  e.g. "product/grid", "product/detail"
 * Primitive types (heading, paragraph, etc.) have no "/".
 */

export interface Block {
  id:       string;
  type:     string;                    // e.g. "product/grid" | "heading"
  content?: string;                    // for primitive text blocks
  attrs:    Record<string, unknown>;
  children?: Block[];
}

export interface ResolvedBlock<TData = unknown> {
  id:       string;
  type:     string;
  category: string;   // e.g. "product"
  variant:  string;   // e.g. "grid"
  data:     TData;
  attrs:    Record<string, unknown>;
}

/** Context passed to each resolver — page-level info it can use. */
export interface BlockContext {
  page_ref_id?:   string;   // page.ref_id (e.g. product slug)
  page_ref_type?: string;   // page.ref_type (e.g. 'product')
  currentPath?:   string;   // current page path for active navigation states
  locale:         string;
}
