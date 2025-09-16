import { getAllContent, getContentBySlug } from './content-core';
import { extractExcerpt } from './markdown';

export interface Exhibition {
  slug: string;
  name: string;
  state: string;
  role: string;
  address: string;
  startDate: string;
  endDate: string;
  moreInfo?: string;
  image: string;
  imagePath: string;
  content: string;
  excerpt: string;
}

/**
 * Format exhibition date from string to month/year format
 * Converts "1 January 2027" to "January 2027"
 *
 * @param dateString Date string from frontmatter
 * @returns Formatted date string
 */
function formatExhibitionDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.warn(`Invalid date format: ${dateString}`);
    return dateString; // Return original if parsing fails
  }
}

/**
 * Format date range for exhibition display
 * Returns "January 2027 - April 2027" format
 *
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Formatted date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatExhibitionDate(startDate);
  const end = formatExhibitionDate(endDate);
  return `${start} - ${end}`;
}

/**
 * Get all exhibitions sorted by start date
 *
 * @returns Array of exhibition objects
 */
export async function getAllExhibitions(): Promise<Exhibition[]> {
  try {
    // Use content-core to get all exhibition content
    const exhibitionContent = await getAllContent('exhibitions');

    const exhibitions: Exhibition[] = exhibitionContent
      .filter((item) => item.slug !== 'README') // Exclude README files
      .map((item) => {
        const data = item.frontmatter;
        const content = item.content;

        // Convert image field to imagePath using /images/exhibitions/
        const imagePath = `/images/exhibitions/${data['image']}`;

        // Create an excerpt from the content or use provided one
        const excerpt = item.excerpt || extractExcerpt(content);

        // Return the exhibition data
        return {
          slug: item.slug,
          name: data['name'] || item.slug.replace(/-/g, ' '),
          state: data['state'] || '',
          role: data['role'] || 'exhibition',
          address: data['address'] || '',
          startDate: data['startDate'] || '',
          endDate: data['endDate'] || '',
          moreInfo: data['moreInfo'],
          image: data['image'] || `${item.slug}.png`,
          imagePath,
          content,
          excerpt,
        } as Exhibition;
      });

    // Sort by startDate chronologically
    return exhibitions.sort((a, b) => {
      try {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.warn('Error sorting exhibitions by date:', error);
        return a.name.localeCompare(b.name); // Fallback to name sorting
      }
    });
  } catch (error) {
    console.error('Error getting all exhibitions:', error);
    return [];
  }
}

/**
 * Get a single exhibition by slug
 *
 * @param slug Exhibition slug
 * @returns Exhibition object or null if not found
 */
export async function getExhibitionBySlug(
  slug: string,
): Promise<Exhibition | null> {
  try {
    // Use content-core to get the specific exhibition content
    const exhibitionItem = await getContentBySlug('exhibitions', slug);

    if (!exhibitionItem) {
      return null;
    }

    const data = exhibitionItem.frontmatter;
    const content = exhibitionItem.content;

    // Convert image field to imagePath using /images/exhibitions/
    const imagePath = `/images/exhibitions/${data['image']}`;

    // Create an excerpt from the content or use provided one
    const excerpt = exhibitionItem.excerpt || extractExcerpt(content);

    return {
      slug,
      name: data['name'] || slug.replace(/-/g, ' '),
      state: data['state'] || '',
      role: data['role'] || 'exhibition',
      address: data['address'] || '',
      startDate: data['startDate'] || '',
      endDate: data['endDate'] || '',
      moreInfo: data['moreInfo'],
      image: data['image'] || `${slug}.png`,
      imagePath,
      content,
      excerpt,
    } as Exhibition;
  } catch (error) {
    console.error(`Error getting exhibition by slug ${slug}:`, error);
    return null;
  }
}
