import {
  getPrintUrl,
  PRINT_PRODUCT_HANDLES,
  SHOP_BASE_URL,
} from '@/lib/shop-links';

describe('getPrintUrl', () => {
  it('returns the collection URL when the colony has no live handle', () => {
    expect(getPrintUrl('delaware')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
  });

  it('returns the product URL when a handle is set', () => {
    PRINT_PRODUCT_HANDLES['connecticut'] = 'connecticut-fine-art-print';
    expect(getPrintUrl('connecticut')).toBe(
      `${SHOP_BASE_URL}/products/connecticut-fine-art-print`,
    );
    PRINT_PRODUCT_HANDLES['connecticut'] = null; // reset shared state
  });

  it('falls back to the collection URL for an unknown slug', () => {
    expect(getPrintUrl('atlantis')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
  });
});
