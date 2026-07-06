import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FramedPrint } from './framed-print';
import type { TapestryEntry } from '@/lib/tapestries';

interface PrintCardProps {
  tapestry: TapestryEntry;
}

/**
 * A single colony presented as a fine-art print. Links to the panel's own
 * page for its story and print callout; per-colony product pages take over
 * when the full storefront ships.
 */
export function PrintCard({ tapestry }: PrintCardProps) {
  const href = `/tapestries/${tapestry.slug}`;
  const image = tapestry.thumbnail || tapestry.imagePath || '';

  return (
    <Link
      href={href}
      className="group block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-2 focus-visible:ring-offset-colonial-linenWoven"
    >
      <FramedPrint
        src={image}
        alt={`${tapestry.title} tapestry — fine-art print`}
        orientation="portrait"
        className="transition-shadow duration-300 group-hover:shadow-[0_16px_44px_rgba(16,37,66,0.30)]"
      />
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="font-sans text-lg font-semibold text-colonial-navy transition-colors group-hover:text-colonial-burgundy">
          {tapestry.title}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 font-serif text-sm text-colonial-navy/70 transition-colors group-hover:text-colonial-burgundy">
          View the panel
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
