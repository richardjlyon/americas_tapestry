import { getPrintUrl, SHOP_PATH } from '@/lib/shop-links';

describe('shop links (headless interim)', () => {
  it('exposes the on-site shop path', () => {
    expect(SHOP_PATH).toBe('/shop');
  });

  it('routes every colony print CTA to the on-site shop', () => {
    expect(getPrintUrl('delaware')).toBe('/shop');
    expect(getPrintUrl('connecticut')).toBe('/shop');
  });

  it('never produces an external URL, even for unknown slugs', () => {
    expect(getPrintUrl('atlantis')).toBe('/shop');
    expect(getPrintUrl('atlantis')).not.toMatch(/^https?:\/\//);
  });
});
