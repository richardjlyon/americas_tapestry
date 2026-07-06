import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface GalleryHeroProps {
  spotlight: { kind: 'current' | 'upcoming'; exhibition: Exhibition } | null;
  /** Full-bleed backdrop: a fine-art tapestry photograph. */
  backdrop: { src: string; alt: string } | null;
}

/**
 * The homepage hero: a dark gallery wall with a live exhibition spotlight.
 * Static (no carousel); the backdrop is one tapestry photograph dimmed
 * behind navy glass.
 */
export function GalleryHero({ spotlight, backdrop }: GalleryHeroProps) {
  const spotlightLine = spotlight
    ? spotlight.kind === 'current'
      ? `On view now · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
      : `Opening soon · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
    : 'The Exhibition Tour · 2026–2028';

  return (
    <section className="relative flex min-h-[75vh] items-center bg-colonial-navy">
      {backdrop && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <OptimizedImage
            src={backdrop.src}
            alt=""
            fill
            role="hero"
            className="object-cover opacity-40"
            priority
            quality={75}
            enableBlurPlaceholder
          />
          <div className="absolute inset-0 bg-gradient-to-t from-colonial-navy via-colonial-navy/60 to-colonial-navy/30" />
        </div>
      )}

      <div className="container relative mx-auto py-24 text-center">
        <span className="eyebrow eyebrow-gold">{spotlightLine}</span>
        {spotlight && (
          <p className="mt-1 font-serif text-colonial-parchment/70">
            {formatDateRange(
              spotlight.exhibition.startDate,
              spotlight.exhibition.endDate,
            )}
          </p>
        )}
        <h1 className="gallery-heading mx-auto mt-4 max-w-4xl text-5xl md:text-6xl lg:text-7xl">
          America&rsquo;s Tapestry
        </h1>
        <p className="gallery-lead mx-auto mt-3 max-w-2xl">
          Thirteen hand-embroidered panels telling the story of the original
          colonies — stitched by over a thousand volunteers, now touring the
          nation through 2028.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="colonial-gold" size="lg" className="text-base">
            <Link href="/exhibitions">Plan your visit</Link>
          </Button>
          <Link
            href="/tapestries"
            className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
          >
            Explore the tapestries
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
