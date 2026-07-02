import { toCatalogProduct, STATES, PRODUCT_TYPES, stateName, searchProducts, sortProducts, facetCounts, parseFilters, serializeFilters, type CatalogQuery, PRICE_TIERS, tierOf, TYPE_GROUPS, typesInGroup } from '@/lib/catalog';
import type { ShopifyProduct } from '@/lib/shopify';

function make(overrides: Partial<ShopifyProduct> = {}): ShopifyProduct {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Georgia Panel Postcard (Pack of 10)',
    handle: 'georgia-postcard',
    description: 'Ten cards.',
    tags: ['americas-tapestry', 'georgia', 'postcard'],
    featuredImage: { url: 'https://cdn.shopify.com/x.webp', altText: 'Georgia' },
    price: { amount: '20.0', currencyCode: 'USD' },
    maxPrice: { amount: '20.0', currencyCode: 'USD' },
    variantId: 'gid://shopify/ProductVariant/9',
    availableForSale: true,
    ...overrides,
  };
}

describe('catalog vocab', () => {
  it('has 13 states and known product types', () => {
    expect(STATES).toHaveLength(13);
    expect(STATES.map((s) => s.slug)).toContain('new-hampshire');
    expect(PRODUCT_TYPES.map((t) => t.slug)).toEqual(
      expect.arrayContaining(['framed-print', 'canvas', 'metal-print', 'art-print', 'greeting-cards', 'postcard', 'calendar', 'book']),
    );
    expect(PRODUCT_TYPES).toHaveLength(11);
    expect(stateName('georgia')).toBe('Georgia');
  });
});

describe('toCatalogProduct', () => {
  it('resolves flat tags to state and type', () => {
    const c = toCatalogProduct(make());
    expect(c.state).toBe('georgia');
    expect(c.type).toBe('postcard');
    expect(c.price).toBe(20);
    expect(c.hasPriceRange).toBe(false);
    expect(c.availability).toBe('available');
    expect(c.badges).toContain('In stock');
  });

  it('marks all-states products (book/calendar) with a null state', () => {
    const c = toCatalogProduct(make({ tags: ['americas-tapestry', 'book'], title: 'The Hardcover' }));
    expect(c.state).toBeNull();
    expect(c.type).toBe('book');
  });

  it('flags a price range with hasPriceRange and keeps min as price', () => {
    const c = toCatalogProduct(make({ price: { amount: '85.0', currencyCode: 'USD' }, maxPrice: { amount: '240.0', currencyCode: 'USD' } }));
    expect(c.price).toBe(85);
    expect(c.maxPrice).toBe(240);
    expect(c.hasPriceRange).toBe(true);
  });

  it('derives Sold out and honors marketing tags (bestseller/new/commemorative)', () => {
    const c = toCatalogProduct(make({ availableForSale: false, tags: ['americas-tapestry', 'virginia', 'framed-print', 'commemorative'] }));
    expect(c.availability).toBe('sold-out');
    expect(c.type).toBe('framed-print');
    expect(c.badges).toContain('Sold out');
    expect(c.badges).toContain('250th');
  });

  it('surfaces the coming-soon marketing tag as a badge', () => {
    const c = toCatalogProduct(make({ tags: ['americas-tapestry', 'georgia', 'mug', 'coming-soon'] }));
    expect(c.badges).toContain('Coming soon');
  });
});

import { filterProducts, type CatalogFilters } from '@/lib/catalog';

const EMPTY: CatalogFilters = { states: [], types: [], tiers: [], availability: 'all', priceMin: null, priceMax: null };

describe('filterProducts', () => {
  const list = [
    toCatalogProduct(make({ id: '1', tags: ['americas-tapestry', 'georgia', 'postcard'], price: { amount: '20.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '2', tags: ['americas-tapestry', 'virginia', 'art-print'], price: { amount: '40.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '3', tags: ['americas-tapestry', 'book'], price: { amount: '45.0', currencyCode: 'USD' }, availableForSale: false })),
  ];

  it('returns everything when no filters are set', () => {
    expect(filterProducts(list, EMPTY)).toHaveLength(3);
  });
  it('filters by state (OR within facet)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'] }).map((p) => p.id)).toEqual(['1']);
  });
  it('filters by type', () => {
    expect(filterProducts(list, { ...EMPTY, types: ['art-print'] }).map((p) => p.id)).toEqual(['2']);
  });
  it('ANDs across facets (state AND type)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'], types: ['art-print'] })).toHaveLength(0);
  });
  it('filters by availability and price range', () => {
    expect(filterProducts(list, { ...EMPTY, availability: 'available' }).map((p) => p.id)).toEqual(['1', '2']);
    expect(filterProducts(list, { ...EMPTY, priceMin: 30, priceMax: 42 }).map((p) => p.id)).toEqual(['2']);
  });
});

describe('searchProducts', () => {
  const list = [
    toCatalogProduct(make({ id: '1', title: 'Georgia Panel Postcard', tags: ['americas-tapestry', 'georgia', 'postcard'] })),
    toCatalogProduct(make({ id: '2', title: 'Virginia Art Print', description: 'Tidewater panel', tags: ['americas-tapestry', 'virginia', 'art-print'] })),
  ];
  it('returns all for an empty/whitespace query', () => {
    expect(searchProducts(list, '   ')).toHaveLength(2);
  });
  it('matches on title', () => {
    expect(searchProducts(list, 'art print').map((p) => p.id)).toEqual(['2']);
  });
  it('matches on state name and is case-insensitive', () => {
    expect(searchProducts(list, 'GEORGIA').map((p) => p.id)).toEqual(['1']);
  });
  it('matches on type label (e.g. "postcards")', () => {
    expect(searchProducts(list, 'postcards').map((p) => p.id)).toEqual(['1']);
  });
});

describe('sortProducts', () => {
  const list = [
    toCatalogProduct(make({ id: 'b', title: 'Bravo', price: { amount: '40.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: 'a', title: 'Alpha', price: { amount: '20.0', currencyCode: 'USD' } })),
  ];
  it('does not mutate the input array', () => {
    const copy = [...list];
    sortProducts(list, 'price-asc');
    expect(list).toEqual(copy);
  });
  it('sorts by price ascending and descending', () => {
    expect(sortProducts(list, 'price-asc').map((p) => p.id)).toEqual(['a', 'b']);
    expect(sortProducts(list, 'price-desc').map((p) => p.id)).toEqual(['b', 'a']);
  });
  it('sorts by title', () => {
    expect(sortProducts(list, 'title').map((p) => p.id)).toEqual(['a', 'b']);
  });
  it('featured preserves input order', () => {
    expect(sortProducts(list, 'featured').map((p) => p.id)).toEqual(['b', 'a']);
  });
});

describe('facetCounts', () => {
  it('counts products per state and type, ignoring nulls', () => {
    const list = [
      toCatalogProduct(make({ tags: ['americas-tapestry', 'georgia', 'postcard'] })),
      toCatalogProduct(make({ tags: ['americas-tapestry', 'georgia', 'canvas'] })),
      toCatalogProduct(make({ tags: ['americas-tapestry', 'book'] })),
    ];
    const { states, types } = facetCounts(list);
    expect(states['georgia']).toBe(2);
    expect(states['book']).toBeUndefined();
    expect(types['postcard']).toBe(1);
    expect(types['book']).toBe(1);
  });
});

describe('parseFilters', () => {
  it('reads comma-separated states/types, sort, price, availability, q', () => {
    const q = parseFilters({ state: 'georgia,virginia', type: 'postcard', sort: 'price-asc', min: '20', max: '80', avail: 'available', q: 'tote' });
    expect(q.filters.states).toEqual(['georgia', 'virginia']);
    expect(q.filters.types).toEqual(['postcard']);
    expect(q.filters.priceMin).toBe(20);
    expect(q.filters.priceMax).toBe(80);
    expect(q.filters.availability).toBe('available');
    expect(q.sort).toBe('price-asc');
    expect(q.q).toBe('tote');
  });
  it('defaults cleanly for empty/garbage input', () => {
    const q = parseFilters({ sort: 'nonsense', min: 'abc' });
    expect(q.filters.states).toEqual([]);
    expect(q.filters.priceMin).toBeNull();
    expect(q.sort).toBe('featured');
    expect(q.q).toBe('');
    expect(q.filters.availability).toBe('all');
  });
  it('rejects partial-numeric min/max garbage', () => {
    const q = parseFilters({ min: '20abc', max: '5.5.5' });
    expect(q.filters.priceMin).toBeNull();
    expect(q.filters.priceMax).toBeNull();
  });
  it('ignores unknown state/type slugs', () => {
    const q = parseFilters({ state: 'georgia,atlantis', type: 'postcard,spaceship' });
    expect(q.filters.states).toEqual(['georgia']);
    expect(q.filters.types).toEqual(['postcard']);
  });
});

describe('serializeFilters', () => {
  it('omits empty and default values', () => {
    const base: CatalogQuery = { filters: { states: [], types: [], tiers: [], availability: 'all', priceMin: null, priceMax: null }, sort: 'featured', q: '' };
    expect(serializeFilters(base).toString()).toBe('');
  });
  it('round-trips a populated query', () => {
    const q: CatalogQuery = { filters: { states: ['georgia'], types: ['postcard'], tiers: [], availability: 'available', priceMin: 20, priceMax: 80 }, sort: 'price-asc', q: 'tote' };
    const round = parseFilters(Object.fromEntries(serializeFilters(q)));
    expect(round).toEqual(q);
  });
});

describe('price tiers', () => {
  it('buckets prices into the four tiers (half-open)', () => {
    expect(PRICE_TIERS.map((t) => t.slug)).toEqual(['under-25', '25-50', '50-150', '150-plus']);
    expect(tierOf(20)).toBe('under-25');
    expect(tierOf(25)).toBe('25-50');
    expect(tierOf(49.99)).toBe('25-50');
    expect(tierOf(90)).toBe('50-150');
    expect(tierOf(150)).toBe('150-plus');
    expect(tierOf(300)).toBe('150-plus');
  });
  it('filterProducts filters by tier', () => {
    const list = [
      toCatalogProduct(make({ id: 'p', tags: ['americas-tapestry', 'georgia', 'postcard'], price: { amount: '20.0', currencyCode: 'USD' } })),
      toCatalogProduct(make({ id: 'f', tags: ['americas-tapestry', 'georgia', 'framed-print'], price: { amount: '90.0', currencyCode: 'USD' } })),
    ];
    expect(filterProducts(list, { states: [], types: [], tiers: ['under-25'], availability: 'all', priceMin: null, priceMax: null }).map((x) => x.id)).toEqual(['p']);
  });
  it('parseFilters/serializeFilters round-trip the tier param', () => {
    const q = { filters: { states: [], types: [], tiers: ['50-150'], availability: 'all' as const, priceMin: null, priceMax: null }, sort: 'featured' as const, q: '' };
    expect(parseFilters(Object.fromEntries(serializeFilters(q))).filters.tiers).toEqual(['50-150']);
  });
});

describe('type groups', () => {
  it('defines Wall Art as the four print types', () => {
    expect(TYPE_GROUPS['wall-art']?.label).toBe('Wall Art');
    expect(typesInGroup('wall-art')).toEqual(['framed-print', 'canvas', 'metal-print', 'art-print']);
  });
  it('returns [] for an unknown group', () => {
    expect(typesInGroup('nonsense')).toEqual([]);
  });
});
