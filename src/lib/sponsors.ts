import { getAllContent, getContentBySlug } from './content-core';
import { extractExcerpt } from './markdown';

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
function formatSponsorName(nameFromData: string | undefined, slug: string): string {
  const baseName = nameFromData || slug.replace(/-/g, ' ');
  return baseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
      .filter(item => item.slug !== 'README') // Exclude README files
      .map((item) => {
        const data = item.frontmatter;
        const content = item.content;

        // Use simple convention: /images/sponsors/{slug}-logo.png
        const logoPath = `/images/sponsors/${item.slug}-logo.png`;

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
          logo: `${item.slug}-logo.png`,
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

    const data = sponsorItem.frontmatter;
    const content = sponsorItem.content;

    // Use simple convention: /images/sponsors/{slug}-logo.png
    const logoPath = `/images/sponsors/${slug}-logo.png`;

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
      logo: `${slug}-logo.png`,
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
