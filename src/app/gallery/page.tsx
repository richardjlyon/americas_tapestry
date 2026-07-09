import GalleryClient from '@/components/features/gallery/GalleryClient';
import type { GalleryTapestryData } from '@/components/features/gallery/types';
import { getPrintUrl } from '@/lib/shop-links';
import {
  findGalleryImage,
  findGalleryThumb,
  getAllTapestries,
} from '@/lib/tapestries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Virtual Gallery | America's Tapestry",
  description:
    'Walk through Gallery 7 and explore the tapestries in an immersive 3D experience.',
};

/** Canonical slug order (tour order minus the intro/credits stops). */
const ORDERED_SLUGS = [
  'virginia',
  'massachusetts',
  'new-hampshire',
  'connecticut',
  'maryland',
  'rhode-island',
  'delaware',
  'north-carolina',
  'south-carolina',
  'new-york',
  'new-jersey',
  'pennsylvania',
  'georgia',
] as const;

/** Wall labels are truncated to roughly this many characters. */
const LABEL_LENGTH = 450;

/** Strip markdown syntax to plain text (server-side only). */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/_([^_]+)_/g, '$1') // underscore emphasis
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/^\s*>\s?/gm, '') // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // list bullets
    .replace(/\n{2,}/g, '\n\n') // collapse blank runs
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Truncate at a word boundary near `max` characters. */
function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/**
 * Gallery page — async Server Component.
 *
 * Loads all tapestry content, resolves image/audio variants on the
 * filesystem, and ships a fully serializable GalleryTapestryData[] to the
 * client. No Three.js imports here (SSR safety).
 */
export default async function GalleryPage(): Promise<React.ReactElement> {
  const tapestries = await getAllTapestries();
  const bySlug = new Map(tapestries.map((t) => [t.slug, t]));

  const galleryData: GalleryTapestryData[] = [];
  for (const slug of ORDERED_SLUGS) {
    const entry = bySlug.get(slug);
    if (!entry) {
      console.warn(
        `[gallery] no tapestry content for slug "${slug}" — skipped`,
      );
      continue;
    }
    const imageUrl = findGalleryImage(slug, '1920w');
    const imageUrlSmall = findGalleryImage(slug, '1024w');
    if (!imageUrl || !imageUrlSmall) {
      console.warn(`[gallery] no tapestry image found for "${slug}" — skipped`);
      continue;
    }
    const transcript = stripMarkdown(entry.content);
    galleryData.push({
      slug,
      name: entry.title,
      imageUrl,
      imageUrlSmall,
      thumbUrl: findGalleryThumb(slug) ?? imageUrlSmall,
      audioUrl: entry.audioPath ?? '',
      audioDescription: entry.audioDescription ?? '',
      description: truncateAtWord(transcript, LABEL_LENGTH),
      transcript,
      buyUrl: getPrintUrl(slug),
    });
  }

  return <GalleryClient tapestries={galleryData} />;
}
