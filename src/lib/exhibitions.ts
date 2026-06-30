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
 * Whether a frontmatter date carries a specific day, e.g. "19 June 2026", as
 * opposed to a month-only date like "June 2026". Detected from the source string
 * (a parsed Date always has a day), so month-precision exhibitions render
 * without a misleading "1".
 */
function hasDay(dateString: string): boolean {
  return /^\s*\d{1,2}\s+[A-Za-z]/.test(dateString);
}

/**
 * Format a single exhibition date, including the day and/or year as requested.
 *
 * @param dateString Date string from frontmatter
 * @param opts Whether to include the day and the year
 * @returns Formatted date string
 */
function formatExhibitionDate(
  dateString: string,
  opts: { day: boolean; year: boolean },
): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      ...(opts.day ? { day: 'numeric' } : {}),
      month: 'long',
      ...(opts.year ? { year: 'numeric' } : {}),
    });
  } catch (error) {
    console.warn(`Invalid date format: ${dateString}`);
    return dateString; // Return original if parsing fails
  }
}

/**
 * Format a date range for exhibition display. Shows the day only for dates that
 * carry one ("19 June – 6 September 2026"); month-only dates render as month +
 * year ("October – December 2026"). The year appears once at the end, unless the
 * range crosses years, in which case it is shown on both ends
 * ("November 2027 – February 2028").
 *
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Formatted date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const sameYear =
    new Date(startDate).getFullYear() === new Date(endDate).getFullYear();
  const start = formatExhibitionDate(startDate, {
    day: hasDay(startDate),
    year: !sameYear,
  });
  const end = formatExhibitionDate(endDate, {
    day: hasDay(endDate),
    year: true,
  });
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
