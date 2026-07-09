import GalleryClient from '@/components/features/gallery/GalleryClient';
import type { GalleryTapestryData } from '@/components/features/gallery/types';
import imageManifest from '@/lib/image-manifest.json';
import { getPrintUrl } from '@/lib/shop-links';
import {
  findGalleryImage,
  findGalleryThumb,
  getAllTapestries,
} from '@/lib/tapestries';
import type { Metadata } from 'next';

interface ManifestEntry {
  variants: Record<string, string>;
}

/**
 * Resolve a tapestry texture to its pre-optimized R2 variant so the 3D
 * gallery streams from R2 instead of Vercel bandwidth. The fine-art print
 * masters are already uploaded (shop pipeline); the R2 bucket carries a
 * CORS policy so WebGL texture loads succeed cross-origin.
 */
function r2FineArtVariant(
  slug: string,
  width: '640' | '1024' | '1920',
): string | null {
  const manifest = imageManifest as Record<string, ManifestEntry>;
  const entry = manifest[`/images/shop/prints/${slug}/${slug}-fineart.jpg`];
  return entry?.variants[width] ?? null;
}

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
    const imageUrl =
      r2FineArtVariant(slug, '1920') ?? findGalleryImage(slug, '1920w');
    const imageUrlSmall =
      r2FineArtVariant(slug, '1024') ?? findGalleryImage(slug, '1024w');
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
      thumbUrl:
        r2FineArtVariant(slug, '640') ??
        findGalleryThumb(slug) ??
        imageUrlSmall,
      audioUrl: entry.audioPath ?? '',
      audioDescription: entry.audioDescription ?? '',
      description: truncateAtWord(transcript, LABEL_LENGTH),
      transcript,
      buyUrl: getPrintUrl(slug),
    });
  }

  return <GalleryClient tapestries={galleryData} />;
}
