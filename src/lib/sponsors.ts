import type { z } from 'zod';
import type { ContentItem } from './content-core';
import { extractExcerpt, markdownToHtml } from './markdown';
import { sponsorSchema } from './content-schemas';
import { defineContentLoader } from './content-loader';

export interface Sponsor {
  slug: string;
  name: string;
  website?: string;
  tier?: string;
  location?: string;
  partnership_year?: number;
  logo?: string;
  logoPath: string;
  order?: number;
  content: string;
  excerpt: string;
  excerptHtml?: string;
}

/**
 * Format a sponsor name from slug or data
 *
 * @param nameFromData Name from frontmatter data (if any)
 * @param slug Sponsor slug
 * @returns Formatted display name
 */
function formatSponsorName(
  nameFromData: string | undefined,
  slug: string,
): string {
  const baseName = nameFromData || slug.replace(/-/g, ' ');
  return baseName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Map validated sponsor frontmatter to a Sponsor object. Shared by getAll and
 * getBySlug so the field defaults live in one place.
 */
function mapSponsor(
  data: z.infer<typeof sponsorSchema>,
  item: ContentItem,
): Sponsor {
  // Use simple convention: /images/sponsors/{slug}-logo.png
  // If frontmatter explicitly sets logo to "none", skip the logo
  const hasLogo = data['logo'] !== 'none';
  const logoPath = hasLogo ? `/images/sponsors/${item.slug}-logo.png` : '';

  // Create an excerpt from the content or use provided one
  const excerpt = item.excerpt || extractExcerpt(item.content);

  return {
    slug: item.slug,
    name: formatSponsorName(data['name'], item.slug),
    website: data['website'] || '#',
    tier: data['tier'] || 'Supporter',
    location: data['location'] || '',
    partnership_year: data['partnership_year'],
    logo: hasLogo ? `${item.slug}-logo.png` : '',
    logoPath,
    order: data['order'] || 999,
    content: item.content,
    excerpt,
  } as Sponsor;
}

const sponsorsLoader = defineContentLoader<Sponsor, typeof sponsorSchema>({
  contentType: 'sponsors',
  label: 'sponsor',
  schema: sponsorSchema,
  map: mapSponsor,
  sort: (a, b) => a.name.localeCompare(b.name),
});

/** Get all sponsors, sorted alphabetically by name. */
export const getAllSponsors = sponsorsLoader.getAll;

/** Get a single sponsor by slug, or null if not found. */
export const getSponsorBySlug = sponsorsLoader.getBySlug;

/**
 * Get a sponsor together with its rendered HTML content
 *
 * @param slug Sponsor slug
 * @returns The sponsor (or null) and its markdown content rendered to HTML
 */
export async function getSponsorData(
  slug: string,
): Promise<{ sponsor: Sponsor | null; contentHtml: string }> {
  const sponsor = await getSponsorBySlug(slug);
  const contentHtml = sponsor ? await markdownToHtml(sponsor.content) : '';

  return { sponsor, contentHtml };
}
