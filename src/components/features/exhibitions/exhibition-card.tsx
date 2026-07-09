import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  /** Larger treatment for the venue currently on view. */
  featured?: boolean;
}

/**
 * A tour venue, presented as a plate in the Night Gallery. The featured
 * variant (the venue on view now) gets a taller image and stronger presence.
 */
export function ExhibitionCard({
  exhibition,
  featured = false,
}: ExhibitionCardProps) {
  return (
    <div
      className={
        featured
          ? 'overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate-lg'
          : 'flex flex-col overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate transition-shadow hover:shadow-plate-lg md:h-[224px] md:flex-row'
      }
    >
      <div
        className={
          featured
            ? 'relative h-64 w-full md:h-80'
            : 'relative h-48 w-full flex-shrink-0 md:h-[224px] md:w-[224px]'
        }
      >
        <Image
          src={getImagePath(exhibition.imagePath)}
          alt={`${exhibition.name} venue`}
          fill
          sizes={
            featured ? '(min-width: 1024px) 56rem, 100vw' : getImageSizes('thumbnail')
          }
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <span className="eyebrow eyebrow-gold">
          {formatDateRange(exhibition.startDate, exhibition.endDate)}
        </span>
        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-colonial-parchment/60">
          {exhibition.state}
        </p>
        <h3
          className={`gallery-heading mt-1 ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
        >
          {exhibition.name}
        </h3>
        <p className="mt-2 text-sm text-colonial-parchment/60">
          {exhibition.address}
        </p>
        <div className="mt-auto pt-4">
          <Link
            href={`/exhibitions/${exhibition.slug}`}
            className="inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
          >
            Explore the venue
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
