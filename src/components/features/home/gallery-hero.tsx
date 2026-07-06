import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroFader, type FaderImage } from '@/components/features/home/hero-fader';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface GalleryHeroProps {
  spotlight: { kind: 'current' | 'upcoming'; exhibition: Exhibition } | null;
  /** Full-bleed rotating backdrop: fine-art tapestry photographs. */
  backdrops: FaderImage[];
}

/**
 * The homepage hero, "full-bleed carousel + content plate" (Richard's
 * Option C, 2026-07-06): the panels rotate at near-full brightness behind
 * a translucent blurred navy plate that guarantees the text stays legible
 * whatever image is behind it. Carries the live exhibition spotlight.
 */
export function GalleryHero({ spotlight, backdrops }: GalleryHeroProps) {
  const spotlightLine = spotlight
    ? spotlight.kind === 'current'
      ? `On view now · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
      : `Opening soon · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
    : 'The Exhibition Tour · 2026–2028';

  return (
    <section className="relative flex min-h-[75vh] items-center overflow-hidden bg-colonial-navy">
      {backdrops.length > 0 && (
        <div className="absolute inset-0">
          <HeroFader images={backdrops} />
        </div>
      )}
      {/* A light veil keeps the room feeling navy without dimming the art. */}
      <div className="absolute inset-0 bg-colonial-navy/20" aria-hidden="true" />

      <div className="container relative mx-auto py-24">
        <div className="mx-auto max-w-3xl bg-colonial-navy/70 p-8 text-center shadow-plate ring-1 ring-white/10 backdrop-blur-md md:p-10">
          <span className="eyebrow eyebrow-gold">{spotlightLine}</span>
          {spotlight && (
            <p className="mt-1 font-serif text-colonial-parchment/70">
              {formatDateRange(
                spotlight.exhibition.startDate,
                spotlight.exhibition.endDate,
              )}
            </p>
          )}
          <h1 className="gallery-heading mx-auto mt-4 text-5xl md:text-6xl">
            America&rsquo;s Tapestry
          </h1>
          <p className="gallery-lead mx-auto mt-3 max-w-2xl">
            Thirteen hand-embroidered panels telling the story of the original
            colonies — stitched by over a thousand volunteers, now touring the
            nation through 2028.
          </p>
          <div className="gold-threshold mx-auto mt-5" />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              variant="colonial-gold"
              size="lg"
              className="text-base"
            >
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
      </div>
    </section>
  );
}
