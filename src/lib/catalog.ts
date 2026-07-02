import type { ShopifyProduct } from '@/lib/shopify';

export interface StateVocab { slug: string; name: string; abbr: string }
export interface TypeVocab { slug: string; label: string }

export const STATES: StateVocab[] = [
  { slug: 'connecticut', name: 'Connecticut', abbr: 'Ct' },
  { slug: 'delaware', name: 'Delaware', abbr: 'De' },
  { slug: 'georgia', name: 'Georgia', abbr: 'Ga' },
  { slug: 'maryland', name: 'Maryland', abbr: 'Md' },
  { slug: 'massachusetts', name: 'Massachusetts', abbr: 'Ma' },
  { slug: 'new-hampshire', name: 'New Hampshire', abbr: 'Nh' },
  { slug: 'new-jersey', name: 'New Jersey', abbr: 'Nj' },
  { slug: 'new-york', name: 'New York', abbr: 'Ny' },
  { slug: 'north-carolina', name: 'North Carolina', abbr: 'Nc' },
  { slug: 'pennsylvania', name: 'Pennsylvania', abbr: 'Pa' },
  { slug: 'rhode-island', name: 'Rhode Island', abbr: 'Ri' },
  { slug: 'south-carolina', name: 'South Carolina', abbr: 'Sc' },
  { slug: 'virginia', name: 'Virginia', abbr: 'Va' },
];

export const PRODUCT_TYPES: TypeVocab[] = [
  { slug: 'framed-print', label: 'Framed Prints' },
  { slug: 'canvas', label: 'Canvas Prints' },
  { slug: 'metal-print', label: 'Metal & Acrylic Prints' },
  { slug: 'art-print', label: 'Art Prints' },
  { slug: 'greeting-cards', label: 'Greeting Card Sets' },
  { slug: 'postcard', label: 'Postcards' },
  { slug: 'calendar', label: '2026 Wall Calendar' },
  { slug: 'book', label: 'Book' },
  // Phase-2 long tail — recognized so tagged products render, but not featured.
  { slug: 'mug', label: 'Mugs' },
  { slug: 'tote', label: 'Tote Bags' },
  { slug: 'fridge-magnet', label: 'Fridge Magnets' },
];

/** Phase-2 types: recognized/valid, but not surfaced as featured curated entries. */
export const PHASE2_TYPE_SLUGS = new Set(['mug', 'tote', 'fridge-magnet']);

const STATE_SLUGS = new Set(STATES.map((s) => s.slug));
const TYPE_SLUGS = new Set(PRODUCT_TYPES.map((t) => t.slug));
/** Optional marketing tags → display badge label. */
const MARKETING_BADGES: Record<string, string> = { bestseller: 'Bestseller', new: 'New', commemorative: '250th' };

export function stateName(slug: string): string | undefined {
  return STATES.find((s) => s.slug === slug)?.name;
}
export function typeLabel(slug: string): string | undefined {
  return PRODUCT_TYPES.find((t) => t.slug === slug)?.label;
}

export type Availability = 'available' | 'sold-out';

export interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  price: number;
  maxPrice: number;
  currency: string;
  hasPriceRange: boolean;
  state: string | null;
  type: string | null;
  availability: Availability;
  badges: string[];
}

export function toCatalogProduct(p: ShopifyProduct): CatalogProduct {
  const state = p.tags.find((t) => STATE_SLUGS.has(t)) ?? null;
  const type = p.tags.find((t) => TYPE_SLUGS.has(t)) ?? null;
  const price = Number.parseFloat(p.price.amount);
  const maxPrice = Number.parseFloat(p.maxPrice.amount);
  const availability: Availability = p.availableForSale ? 'available' : 'sold-out';

  const badges: string[] = [];
  for (const tag of p.tags) if (MARKETING_BADGES[tag]) badges.push(MARKETING_BADGES[tag]!);
  badges.push(availability === 'available' ? 'In stock' : 'Sold out');

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    image: p.featuredImage,
    price,
    maxPrice,
    currency: p.price.currencyCode,
    hasPriceRange: maxPrice > price,
    state,
    type,
    availability,
    badges,
  };
}

export interface CatalogFilters {
  states: string[];
  types: string[];
  availability: 'all' | 'available';
  priceMin: number | null;
  priceMax: number | null;
}

export function filterProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  return products.filter((p) => {
    if (filters.states.length && (p.state === null || !filters.states.includes(p.state))) return false;
    if (filters.types.length && (p.type === null || !filters.types.includes(p.type))) return false;
    if (filters.availability === 'available' && p.availability !== 'available') return false;
    if (filters.priceMin !== null && p.price < filters.priceMin) return false;
    if (filters.priceMax !== null && p.price > filters.priceMax) return false;
    return true;
  });
}

export function searchProducts(products: CatalogProduct[], query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const haystack = [
      p.title,
      p.description,
      p.state ? stateName(p.state) ?? '' : '',
      p.type ? typeLabel(p.type) ?? '' : '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title';

export function sortProducts(products: CatalogProduct[], key: SortKey): CatalogProduct[] {
  const copy = [...products];
  switch (key) {
    case 'price-asc': return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'title': return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'featured': default: return copy;
  }
}

export function facetCounts(products: CatalogProduct[]): { states: Record<string, number>; types: Record<string, number> } {
  const states: Record<string, number> = {};
  const types: Record<string, number> = {};
  for (const p of products) {
    if (p.state) states[p.state] = (states[p.state] ?? 0) + 1;
    if (p.type) types[p.type] = (types[p.type] ?? 0) + 1;
  }
  return { states, types };
}
