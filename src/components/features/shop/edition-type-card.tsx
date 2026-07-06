import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FramedPrint } from './framed-print';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import type { ShopProductType } from '@/lib/shop-products';

interface EditionTypeCardProps {
  type: ShopProductType;
  /** A tapestry image used as illustration (fallback for postcards). */
  illustrationSrc: string;
  /** Colony title of the illustration, for alt text. */
  illustrationLabel: string;
  /**
   * The edition's real treatment — a colony's fine-art or poster artwork,
   * framed or not — so the card previews exactly what the category page sells.
   * Omitted for postcards, which fall back to the tapestry illustration.
   */
  artwork?: { src: string; framed: boolean } | undefined;
  /** How many colonies are orderable in this type right now. */
  availableCount: number;
}

/**
 * A shopfront card for one product type (e.g. "Framed Print"). Previews the
 * edition's actual treatment (fine-art vs poster, framed vs not) with a random
 * colony; the click-through leads to that type's "/shop/<slug>" page listing
 * every colony available to order.
 */
export function EditionTypeCard({
  type,
  illustrationSrc,
  illustrationLabel,
  artwork,
  availableCount,
}: EditionTypeCardProps) {
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(type.priceFrom);

  return (
    <Link
      href={`/shop/${type.slug}`}
      className="group block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-2 focus-visible:ring-offset-colonial-linenWoven"
    >
      {artwork ? (
        <FramedArtwork
          src={artwork.src}
          alt={`${type.label} — the ${illustrationLabel} panel`}
          framed={artwork.framed}
          className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none"
        />
      ) : (
        <FramedPrint
          src={illustrationSrc}
          alt={`${type.label} — illustrated with the ${illustrationLabel} panel`}
          orientation="portrait"
          className="transition-shadow duration-300 group-hover:shadow-[0_16px_44px_rgba(16,37,66,0.30)]"
        />
      )}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans text-lg font-semibold text-colonial-navy transition-colors group-hover:text-colonial-burgundy">
            {type.label}
          </h3>
          <span className="shrink-0 font-sans text-sm font-semibold text-colonial-navy/80">
            from {price}
          </span>
        </div>
        <p className="mt-1 font-serif text-sm text-colonial-navy/70">
          {type.tagline}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 font-sans text-sm font-medium text-colonial-burgundy">
          {availableCount > 0
            ? `Shop ${availableCount} ${availableCount === 1 ? 'colony' : 'colonies'}`
            : 'Coming soon'}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
