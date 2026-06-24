import { Button } from '@/components/ui/button';
import { getPrintUrl } from '@/lib/shop-links';

interface BuyPrintCalloutProps {
  /** Tapestry colony slug, e.g. "delaware". */
  colonySlug: string;
  /** Display name, e.g. "Delaware". */
  colonyName: string;
}

/**
 * Drives warm tapestry-page traffic to the print shop. Renders an aside with a
 * single external call-to-action linking to the colony's product (or the
 * collection page until that product is live).
 */
export function BuyPrintCallout({
  colonySlug,
  colonyName,
}: BuyPrintCalloutProps) {
  const href = getPrintUrl(colonySlug);

  return (
    <aside className="my-content-lg rounded-lg border border-colonial-gold/40 bg-colonial-parchment p-6 text-center shadow-sm">
      <h3 className="font-serif text-2xl text-colonial-navy">
        Own this panel as a fine-art print
      </h3>
      <p className="mx-auto mt-2 max-w-prose text-colonial-navy/80">
        Bring the {colonyName} tapestry home — museum-quality giclée prints,
        printed and shipped to your door.
      </p>
      <Button asChild variant="colonial-gold" size="lg" className="mt-4">
        <a href={href} target="_blank" rel="noopener noreferrer">
          Shop {colonyName} prints
        </a>
      </Button>
    </aside>
  );
}
