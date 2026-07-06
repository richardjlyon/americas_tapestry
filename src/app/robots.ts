import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Raw asset paths are crawler bait: rendered pages serve images from
      // the R2 CDN, so nothing legitimate needs these origin paths crawled.
      // (See VERCEL_USAGE_INVESTIGATION.md, 2026-07-06.)
      disallow: ['/images/', '/video/', '/docs/', '/data/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
