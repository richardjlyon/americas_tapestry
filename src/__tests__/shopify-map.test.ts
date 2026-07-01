import { mapProductNode } from '@/lib/shopify';

const rawNode = {
  id: 'gid://shopify/Product/1',
  title: 'The Georgia Panel Postcard (Pack of 10)',
  handle: 'georgia-postcard-pack-of-10',
  description: 'Ten cards.',
  tags: ['americas-tapestry', 'georgia', 'postcard'],
  featuredImage: { url: 'https://cdn.shopify.com/x.webp', altText: null },
  priceRange: {
    minVariantPrice: { amount: '20.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '20.0', currencyCode: 'USD' },
  },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/9', availableForSale: true } }] },
};

describe('mapProductNode', () => {
  it('maps a raw Storefront product node to a flat ShopifyProduct with tags', () => {
    const p = mapProductNode(rawNode);
    expect(p.id).toBe('gid://shopify/Product/1');
    expect(p.tags).toEqual(['americas-tapestry', 'georgia', 'postcard']);
    expect(p.price).toEqual({ amount: '20.0', currencyCode: 'USD' });
    expect(p.maxPrice).toEqual({ amount: '20.0', currencyCode: 'USD' });
    expect(p.variantId).toBe('gid://shopify/ProductVariant/9');
    expect(p.availableForSale).toBe(true);
  });

  it('defaults gracefully when optional fields are missing', () => {
    const p = mapProductNode({ ...rawNode, description: null, tags: [], featuredImage: null, variants: { edges: [] } });
    expect(p.description).toBe('');
    expect(p.tags).toEqual([]);
    expect(p.featuredImage).toBeNull();
    expect(p.variantId).toBeNull();
    expect(p.availableForSale).toBe(false);
  });
});
