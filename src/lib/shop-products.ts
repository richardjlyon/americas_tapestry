/**
 * The America's Tapestry shop's product taxonomy.
 *
 * Every colony product in Shopify carries three flat tags: `americas-tapestry`
 * (catalog membership), a colony slug (e.g. `virginia`), and exactly one
 * product-type tag below. The storefront groups the live collection by these
 * type tags — a product-type slug IS its Shopify tag and its `/shop/<slug>`
 * URL segment. See SHOP_COORDINATION.md for the tagging contract.
 */
import type { ShopifyProduct } from './shopify';

export interface ShopProductType {
  /** URL segment and Shopify type tag — the two are identical. */
  slug: string;
  /** Card/page heading, e.g. "Fine Art Print". */
  label: string;
  /** One-line descriptor shown under the label. */
  tagline: string;
  /** Lowest price across states, for a "from $X" hint. */
  priceFrom: number;
  /** Printed sheet size, shown on the buy affordance. Omitted for postcards. */
  dimensions?: string;
}

/** The four wall-art editions, in display order. */
export const WALL_ART_TYPES: ShopProductType[] = [
  {
    slug: 'art-print',
    label: 'Fine Art Print',
    tagline: 'Archival giclée on heavyweight fine-art paper — unframed.',
    priceFrom: 55,
    dimensions: '16×20″',
  },
  {
    slug: 'framed-print',
    label: 'Framed Print',
    tagline: 'The giclée print in a solid-wood frame — ready to hang.',
    priceFrom: 140,
    dimensions: '16×20″',
  },
  {
    slug: 'poster',
    label: 'Exhibition Poster',
    tagline: 'The souvenir poster of the 250th — unframed.',
    priceFrom: 25,
    dimensions: '16×20″',
  },
  {
    slug: 'framed-poster',
    label: 'Framed Poster',
    tagline: 'The exhibition poster, framed and ready to hang.',
    priceFrom: 130,
    dimensions: '16×20″',
  },
];

/** Postcards — one type, thirteen colonies, packs of ten. */
export const POSTCARD_TYPE: ShopProductType = {
  slug: 'postcard',
  label: 'Postcards',
  tagline: 'A pack of ten mailable art cards for a single colony.',
  priceFrom: 20,
};

/** Every per-state orderable type keyed by slug (wall art + postcards). */
export const ORDERABLE_TYPES: ShopProductType[] = [
  ...WALL_ART_TYPES,
  POSTCARD_TYPE,
];

/** Look up a product type by its slug (`/shop/<slug>`). */
export function getProductType(slug: string): ShopProductType | undefined {
  return ORDERABLE_TYPES.find((t) => t.slug === slug);
}

/** The thirteen colony slugs carried as flat state tags in Shopify. */
export const STATE_SLUGS = [
  'connecticut',
  'delaware',
  'georgia',
  'maryland',
  'massachusetts',
  'new-hampshire',
  'new-jersey',
  'new-york',
  'north-carolina',
  'pennsylvania',
  'rhode-island',
  'south-carolina',
  'virginia',
] as const;

/** Derive the colony slug from a product's flat tags, or null if absent. */
export function stateFromTags(tags: string[]): string | null {
  return tags.find((t) => (STATE_SLUGS as readonly string[]).includes(t)) ?? null;
}

/** Human-readable colony name from its slug, e.g. `new-york` → "New York". */
export function stateLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * How each wall-art type is illustrated on its category page. The artwork comes
 * from local masters (see public/images/shop/prints/<state>/), NOT the Gelato
 * mockups: `fineart` is the panel on its linen border; `poster` is the finished
 * navy poster design. Framed types render the same art in a simulated frame.
 */
export interface TypeArtwork {
  base: 'fineart' | 'poster';
  framed: boolean;
}

const TYPE_ARTWORK: Record<string, TypeArtwork> = {
  'art-print': { base: 'fineart', framed: false },
  'framed-print': { base: 'fineart', framed: true },
  poster: { base: 'poster', framed: false },
  'framed-poster': { base: 'poster', framed: true },
};

/** The artwork treatment for a type slug, or null (e.g. postcards). */
export function typeArtwork(slug: string): TypeArtwork | null {
  return TYPE_ARTWORK[slug] ?? null;
}

/** Public path to a colony's base artwork, resolved through the R2 manifest. */
export function artworkSrc(base: 'fineart' | 'poster', state: string): string {
  return `/images/shop/prints/${state}/${state}-${base}.jpg`;
}

export interface StateProduct {
  state: string;
  stateName: string;
  product: ShopifyProduct;
}

/**
 * Filter a flat product list to one type, tag each with its colony, and sort
 * alphabetically by colony name. Products missing a state tag are dropped.
 */
export function productsForType(
  products: ShopifyProduct[],
  typeSlug: string,
): StateProduct[] {
  return products
    .filter((p) => p.tags.includes(typeSlug))
    .map((product) => {
      const state = stateFromTags(product.tags);
      return state
        ? { state, stateName: stateLabel(state), product }
        : null;
    })
    .filter((x): x is StateProduct => x !== null)
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
}
