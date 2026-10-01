import type { z } from 'zod';
import type { ContentItem } from './content-core';
import { extractExcerpt } from './markdown';
import { exhibitionSchema } from './content-schemas';
import { defineContentLoader } from './content-loader';

export {
  formatDateRange,
  getExhibitionStatus,
  groupExhibitionsByStatus,
  getExhibitionSpotlight,
} from './exhibition-dates';
export type { ExhibitionStatus, ExhibitionDates } from './exhibition-dates';

/** A photograph shown in a venue's on-view gallery. */
export interface ExhibitionGalleryImage {
  src: string;
  alt: string;
}

/** One line of a venue's opening hours, e.g. "Monday – Thursday" / "12pm – 8pm". */
export interface ExhibitionHours {
  days: string;
  time: string;
}

export interface Exhibition {
  slug: string;
  name: string;
  state: string;
  role: string;
  address: string;
  startDate: string;
  endDate: string;
  moreInfo?: string;
  hours: ExhibitionHours[];
  image: string;
  imagePath: string;
  gallery: ExhibitionGalleryImage[];
  content: string;
  excerpt: string;
}

/**
 * Map validated exhibition frontmatter to an Exhibition object. Shared by
 * getAll and getBySlug so the field defaults live in one place.
 */
function mapExhibition(
  data: z.infer<typeof exhibitionSchema>,
  item: ContentItem,
): Exhibition {
  // Bare filenames live in /images/exhibitions/; an absolute path is used as
  // given, so a venue can reuse a photo already published elsewhere on the site
  // (and already in the R2 manifest) rather than duplicating the file.
  const imagePath = data['image'].startsWith('/')
    ? data['image']
    : `/images/exhibitions/${data['image']}`;

  // Gallery photos live in a per-venue subfolder: /images/exhibitions/<slug>/
  const gallery: ExhibitionGalleryImage[] = (data['gallery'] ?? []).map(
    (photo) => ({
      src: `/images/exhibitions/${item.slug}/${photo.image}`,
      alt: photo.alt,
    }),
  );

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
    hours: (data['hours'] ?? []).map((h) => ({ days: h.days, time: h.time })),
    image: data['image'] || `${item.slug}.png`,
    imagePath,
    gallery,
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
