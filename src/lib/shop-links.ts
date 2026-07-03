/**
 * Shop link targets during the headless build-out.
 *
 * The storefront lives ON this site (headless Shopify — products render
 * in-page via the Storefront API and hand off to Shopify only at checkout).
 * The external subdomain the June print-store plan assumed
 * (shop.americastapestry.com) was retired before it ever had DNS; a
 * Cloudflare 301 catches any published references and sends them to /shop.
 *
 * Until the full catalog pages ship, every commerce CTA resolves to an
 * on-site destination so no link dead-ends.
 */
export const SHOP_PATH = '/shop';

/**
 * Interim shop destination for a colony's print CTA: the shop landing page.
 * When per-product pages exist (storefront Plans 2–3), this maps to
 * `/shop/state/<slug>` or the product detail route instead.
 */
export function getPrintUrl(_colonySlug: string): string {
  return SHOP_PATH;
}
