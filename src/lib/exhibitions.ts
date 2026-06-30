import type { z } from 'zod';
import type { ContentItem } from './content-core';
import { extractExcerpt } from './markdown';
import { exhibitionSchema } from './content-schemas';
import { defineContentLoader } from './content-loader';

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
 * Format exhibition date from string to day/month format
 * Converts "19 June 2026" to "19 June", or "19 June 2026" when the year is kept
 *
 * @param dateString Date string from frontmatter
 * @param includeYear Whether to append the year
 * @returns Formatted date string
 */
function formatExhibitionDate(
  dateString: string,
  includeYear: boolean,
): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      ...(includeYear ? { year: 'numeric' } : {}),
    });
  } catch (error) {
    console.warn(`Invalid date format: ${dateString}`);
    return dateString; // Return original if parsing fails
  }
}

/**
 * Format date range for exhibition display
 * Returns "19 June – 6 September 2026" format (year shown once at the end)
 *
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Formatted date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatExhibitionDate(startDate, false);
  const end = formatExhibitionDate(endDate, true);
  return `${start} – ${end}`;
}

/**
 * Map validated exhibition frontmatter to an Exhibition object. Shared by
 * getAll and getBySlug so the field defaults live in one place.
 */
function mapExhibition(
  data: z.infer<typeof exhibitionSchema>,
  item: ContentItem,
): Exhibition {
  // Convert image field to imagePath using /images/exhibitions/
  const imagePath = `/images/exhibitions/${data['image']}`;

  // Create an excerpt from the content or use provided one
  const excerpt = item.excerpt || extractExcerpt(item.content);

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
    content: item.content,
    excerpt,
  } as Exhibition;
}

const exhibitionsLoader = defineContentLoader<
  Exhibition,
  typeof exhibitionSchema
>({
  contentType: 'exhibitions',
  label: 'exhibition',
  schema: exhibitionSchema,
  map: mapExhibition,
  // Sort by startDate chronologically, falling back to name on bad dates
  sort: (a, b) => {
    try {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      console.warn('Error sorting exhibitions by date:', error);
      return a.name.localeCompare(b.name);
    }
  },
});

/** Get all exhibitions, sorted chronologically by start date. */
export const getAllExhibitions = exhibitionsLoader.getAll;

/** Get a single exhibition by slug, or null if not found. */
export const getExhibitionBySlug = exhibitionsLoader.getBySlug;
