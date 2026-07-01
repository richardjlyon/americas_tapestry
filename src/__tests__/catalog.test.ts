import { toCatalogProduct, STATES, PRODUCT_TYPES, stateName } from '@/lib/catalog';
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
      expect.arrayContaining(['postcard', 'poster', 'tote', 'mug', 'giclee', 'framed', 'artist-edition', 'book', 'composite']),
    );
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

  it('marks all-states products (book/composite) with a null state', () => {
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

  it('derives Sold out and honors marketing tags (bestseller/new/signed)', () => {
    const c = toCatalogProduct(make({ availableForSale: false, tags: ['americas-tapestry', 'virginia', 'artist-edition', 'signed'] }));
    expect(c.availability).toBe('sold-out');
    expect(c.badges).toContain('Sold out');
    expect(c.badges).toContain('Signed');
  });
});

import { filterProducts, type CatalogFilters } from '@/lib/catalog';

const EMPTY: CatalogFilters = { states: [], types: [], availability: 'all', priceMin: null, priceMax: null };

describe('filterProducts', () => {
  const list = [
    toCatalogProduct(make({ id: '1', tags: ['americas-tapestry', 'georgia', 'postcard'], price: { amount: '20.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '2', tags: ['americas-tapestry', 'virginia', 'poster'], price: { amount: '40.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '3', tags: ['americas-tapestry', 'book'], price: { amount: '45.0', currencyCode: 'USD' }, availableForSale: false })),
  ];

  it('returns everything when no filters are set', () => {
    expect(filterProducts(list, EMPTY)).toHaveLength(3);
  });
  it('filters by state (OR within facet)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'] }).map((p) => p.id)).toEqual(['1']);
  });
  it('filters by type', () => {
    expect(filterProducts(list, { ...EMPTY, types: ['poster'] }).map((p) => p.id)).toEqual(['2']);
  });
  it('ANDs across facets (state AND type)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'], types: ['poster'] })).toHaveLength(0);
  });
  it('filters by availability and price range', () => {
    expect(filterProducts(list, { ...EMPTY, availability: 'available' }).map((p) => p.id)).toEqual(['1', '2']);
    expect(filterProducts(list, { ...EMPTY, priceMin: 30, priceMax: 42 }).map((p) => p.id)).toEqual(['2']);
  });
});
