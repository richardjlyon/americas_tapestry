import type { Metadata } from 'next';
import { getR2Url } from './cloudflare-loader';

/**
 * Centralized SEO/metadata helpers.
 *
 * Pages call `pageMetadata(...)` to produce a consistent, self-contained Metadata
 * object (title, description, canonical URL, Open Graph, Twitter card). The root
 * layout sets `metadataBase` and site-wide defaults; per-page values here override
 * or augment those.
 */

export const SITE_NAME = "America's Tapestry";
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://americastapestry.com';
export const SITE_DESCRIPTION =
  "America's Tapestry tells the stories of our nation's founding through embroidery — thirteen hand-stitched panels representing the original colonies, created for America's 250th anniversary and now touring museums and galleries on a two-year exhibition through 2028.";

// Default social-share image. Served from public/ at the site origin (1024×1024).
export const DEFAULT_OG_IMAGE = '/images/branding/americas-tapestry-logo-patriotic.png';

interface PageMetaInput {
  /** Page-specific title; the site name is appended automatically. */
  title: string;
  description: string;
  /** Absolute site path for the canonical URL, e.g. '/tapestries/connecticut'. */
  path: string;
  /** Optional Open Graph image path/URL. Falls back to the brand image. */
  image?: string | undefined;
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: PageMetaInput): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  // Serve the social-share image from R2 when it has been migrated. OG/Twitter
  // image tags are plain absolute URLs that bypass the next/image loader, so an
  // unresolved local path is served full-resolution from Vercel (a tapestry
  // master is ~3 MB) on every crawler/unfurl. getR2Url returns a pre-optimized
  // WebP variant, or null for placeholders / external / un-migrated images, in
  // which case we fall back to the original path.
  const ogImage = getR2Url(image, 1200) ?? image;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
