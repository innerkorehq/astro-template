import { getMenu, getSiteConfig } from "@/db/index";
import type { FooterBlockData } from "@/components/utils/footer/types";
import {
  footerOptionsFromAttrs,
  resolveFooterDataFromSiteDb,
} from "@/components/utils/footer/site-db";
import type { Block, BlockContext, ResolvedBlock } from "../types.js";

export async function resolveFooterBlock(
  block: Block,
  ctx: BlockContext
): Promise<ResolvedBlock<FooterBlockData>> {
  const variant = block.type.split("/")[1] ?? "default";
  const attrs = block.attrs;
  const options = footerOptionsFromAttrs(attrs);

  const [site, menu, secondaryMenu] = await Promise.all([
    getSiteConfig(),
    getMenu(options.menuHandle ?? "footer-nav"),
    getMenu(options.secondaryMenuHandle ?? "footer-secondary"),
  ]);

  return {
    id: block.id,
    type: block.type,
    category: "footer",
    variant,
    data: resolveFooterDataFromSiteDb({ site, menu, secondaryMenu, options, attrs }),
    attrs,
  };
}
