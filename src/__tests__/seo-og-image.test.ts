import { pageMetadata, DEFAULT_OG_IMAGE } from '@/lib/seo';

// Pull the OG and Twitter image URLs out of the Metadata object, normalising
// the various shapes Next.js accepts (string | {url} | array).
function ogImageUrl(meta: ReturnType<typeof pageMetadata>): string {
  const images = meta.openGraph?.images;
  const first = Array.isArray(images) ? images[0] : images;
  return typeof first === 'string' ? first : String((first as { url: unknown }).url);
}
function twitterImageUrl(meta: ReturnType<typeof pageMetadata>): string {
  const images = meta.twitter?.images;
  const first = Array.isArray(images) ? images[0] : images;
  return typeof first === 'string' ? first : String((first as { url: unknown }).url);
}

const R2_HOST = 'images.americastapestry.com';

describe('pageMetadata OG image resolution', () => {
  it('resolves a manifest-backed image to an R2 WebP variant (not the local original)', () => {
    const localPath = '/images/tapestries/connecticut/connecticut-photo.jpg';
    const meta = pageMetadata({
      title: 'Connecticut',
      description: 'desc',
      path: '/tapestries/connecticut',
      image: localPath,
    });

    const og = ogImageUrl(meta);
    expect(og).toContain(R2_HOST);
    expect(og).toMatch(/\.webp$/);
    expect(og).not.toBe(localPath);
    // Twitter card must match the OG image.
    expect(twitterImageUrl(meta)).toBe(og);
  });

  it('resolves the default brand OG image to R2 when no image is provided', () => {
    const meta = pageMetadata({
      title: 'Home',
      description: 'desc',
      path: '/',
    });
    const og = ogImageUrl(meta);
    expect(og).toContain(R2_HOST);
    expect(og).not.toBe(DEFAULT_OG_IMAGE);
  });

  it('falls back to the original path for an image not in the manifest', () => {
    const unmigrated = '/images/placeholders/placeholder.svg';
    const meta = pageMetadata({
      title: 'X',
      description: 'desc',
      path: '/x',
      image: unmigrated,
    });
    expect(ogImageUrl(meta)).toBe(unmigrated);
  });

  it('passes external URLs through unchanged', () => {
    const external = 'https://example.com/cover.jpg';
    const meta = pageMetadata({
      title: 'X',
      description: 'desc',
      path: '/x',
      image: external,
    });
    expect(ogImageUrl(meta)).toBe(external);
  });
});
