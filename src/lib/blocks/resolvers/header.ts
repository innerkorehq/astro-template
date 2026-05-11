import { getMenu, getSiteConfig } from "@/db/index";
import type { HeaderBlockData } from "@/components/utils/header/types";
import {
  headerOptionsFromAttrs,
  resolveHeaderDataFromSiteDb,
} from "@/components/utils/header/site-db";
import type { Block, BlockContext, ResolvedBlock } from "../types.js";

export async function resolveHeaderBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<HeaderBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  const attrs = block.attrs;
  const attrOptions = headerOptionsFromAttrs(attrs);
  const options = { ...attrOptions, currentPath: attrOptions.currentPath ?? ctx.currentPath };
  const [site, menu] = await Promise.all([
    getSiteConfig(),
    getMenu(options.menuHandle ?? "primary-nav"),
  ]);

  return {
    id: block.id,
    type: block.type,
    category: "header",
    variant,
    data: resolveHeaderDataFromSiteDb({ site, menu, options, attrs }),
    attrs,
  };
}
