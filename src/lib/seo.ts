import type { Metadata } from 'next';

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
  "America's Tapestry weaves together stories from our nation's founding through embroidery — thirteen panels representing the original colonies, created for America's 250th anniversary.";

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
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
