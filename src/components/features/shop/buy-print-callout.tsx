import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';
import { getPrintUrl } from '@/lib/shop-links';
import { artworkSrc } from '@/lib/shop-products';

interface BuyPrintCalloutProps {
  /** Tapestry colony slug, e.g. "delaware". */
  colonySlug: string;
  /** Display name, e.g. "Delaware". */
  colonyName: string;
}

/**
 * Drives warm tapestry-page traffic to the print shop. Pairs the colony's
 * exhibition poster with a call-to-action into the on-site shop. Rendered as a
 * page section — the parent supplies the pin separator and spacing.
 */
export function BuyPrintCallout({
  colonySlug,
  colonyName,
}: BuyPrintCalloutProps) {
  const href = getPrintUrl(colonySlug);

  return (
    <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[15rem_1fr] md:gap-10">
      {/* The colony's exhibition poster */}
      <div className="mx-auto w-full max-w-[15rem] md:mx-0">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-colonial-navy shadow-[0_18px_44px_-18px_rgba(16,37,66,0.5)] ring-1 ring-colonial-navy/15">
          <OptimizedImage
            src={getImagePath(artworkSrc('poster', colonySlug))}
            alt={`${colonyName} exhibition poster`}
            fill
            sizes="(min-width: 768px) 15rem, 15rem"
            role="feature"
            className="object-cover"
            enableBlurPlaceholder
          />
        </div>
      </div>

      {/* The call to action */}
      <div className="text-center md:text-left">
        <h2 className="font-serif text-2xl font-normal text-colonial-navy md:text-3xl">
          Own this panel as a fine-art print
        </h2>
        <p className="mt-3 font-serif text-lg text-colonial-navy/80">
          Bring the {colonyName} tapestry home — museum-quality giclée prints,
          printed and shipped to your door.
        </p>
        <div className="mt-6">
          <Button asChild variant="colonial-gold" size="lg">
            <Link href={href}>Shop {colonyName} prints</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
