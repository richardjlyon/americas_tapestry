/**
 * Maps tapestry colony slugs to America's Tapestry print-shop URLs.
 *
 * The shop is a separate Shopify storefront on a subdomain, so links are
 * external. Set a colony's handle to its live Shopify product handle as that
 * product goes live; leave it null to fall back to the collection page. This
 * keeps every link valid during the staged rollout / proof gate.
 */
export const SHOP_BASE_URL = 'https://shop.americastapestry.com';
export const PRINTS_COLLECTION_PATH = '/collections/fine-art-prints';

/** Colony slug -> Shopify product handle (or null until that product is live). */
export const PRINT_PRODUCT_HANDLES: Record<string, string | null> = {
  connecticut: null,
  delaware: null,
  georgia: null,
  maryland: null,
  massachusetts: null,
  'new-hampshire': null,
  'new-jersey': null,
  'new-york': null,
  'north-carolina': null,
  pennsylvania: null,
  'rhode-island': null,
  'south-carolina': null,
  virginia: null,
};

/**
 * Returns the best shop URL for a colony: its specific product page when the
 * handle is live, otherwise the Fine-Art Prints collection page.
 */
export function getPrintUrl(colonySlug: string): string {
  const handle = PRINT_PRODUCT_HANDLES[colonySlug];
  if (handle) {
    return `${SHOP_BASE_URL}/products/${handle}`;
  }
  return `${SHOP_BASE_URL}${PRINTS_COLLECTION_PATH}`;
}
