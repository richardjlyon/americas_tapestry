import { getAllContent, getContentBySlug } from './content-core';
import { extractExcerpt, markdownToHtml } from './markdown';
import { sponsorSchema, validateFrontmatter } from './content-schemas';

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
 * Get all sponsors
 *
 * @returns Array of sponsor objects
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  try {
    // Use content-core to get all sponsor content
    const sponsorContent = await getAllContent('sponsors');

    const sponsors: Sponsor[] = sponsorContent
      .filter((item) => item.slug !== 'README') // Exclude README files
      .map((item) => {
        const data = validateFrontmatter(sponsorSchema, item.frontmatter, {
          contentType: 'sponsor',
          slug: item.slug,
        });
        const content = item.content;

        // Use simple convention: /images/sponsors/{slug}-logo.png
        // If frontmatter explicitly sets logo to "none", skip the logo
        const hasLogo = data['logo'] !== 'none';
        const logoPath = hasLogo ? `/images/sponsors/${item.slug}-logo.png` : '';

        // Create an excerpt from the content or use provided one
        const excerpt = item.excerpt || extractExcerpt(content);

        // Format the display name
        const displayName = formatSponsorName(data['name'], item.slug);

        // Return the sponsor data
        return {
          slug: item.slug,
          name: displayName,
          website: data['website'] || '#',
          tier: data['tier'] || 'Supporter',
          location: data['location'] || '',
          partnership_year: data['partnership_year'],
          logo: hasLogo ? `${item.slug}-logo.png` : '',
          logoPath,
          order: data['order'] || 999,
          content,
          excerpt,
        } as Sponsor;
      });

    // Sort alphabetically by name
    return sponsors.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting all sponsors:', error);
    return [];
  }
}

/**
 * Get a single sponsor by slug
 *
 * @param slug Sponsor slug
 * @returns Sponsor object or null if not found
 */
export async function getSponsorBySlug(slug: string): Promise<Sponsor | null> {
  try {
    // Use content-core to get the specific sponsor content
    const sponsorItem = await getContentBySlug('sponsors', slug);

    if (!sponsorItem) {
      return null;
    }

    const data = validateFrontmatter(sponsorSchema, sponsorItem.frontmatter, {
      contentType: 'sponsor',
      slug,
    });
    const content = sponsorItem.content;

    // Use simple convention: /images/sponsors/{slug}-logo.png
    // If frontmatter explicitly sets logo to "none", skip the logo
    const hasLogo = data['logo'] !== 'none';
    const logoPath = hasLogo ? `/images/sponsors/${slug}-logo.png` : '';

    // Create an excerpt from the content or use provided one
    const excerpt = sponsorItem.excerpt || extractExcerpt(content);

    // Format the display name
    const displayName = formatSponsorName(data['name'], slug);

    return {
      slug,
      name: displayName,
      website: data['website'] || '#',
      tier: data['tier'] || 'Supporter',
      location: data['location'] || '',
      partnership_year: data['partnership_year'],
      logo: hasLogo ? `${slug}-logo.png` : '',
      logoPath,
      order: data['order'] || 999,
      content,
      excerpt,
    } as Sponsor;
  } catch (error) {
    console.error(`Error getting sponsor by slug ${slug}:`, error);
    return null;
  }
}

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
