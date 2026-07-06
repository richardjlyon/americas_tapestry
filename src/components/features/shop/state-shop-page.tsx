import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';
import { StateEditionCard } from '@/components/features/shop/state-edition-card';
import { getAllProducts } from '@/lib/shopify';
import {
  ORDERABLE_TYPES,
  productsForType,
  typeArtwork,
  artworkSrc,
  stateLabel,
} from '@/lib/shop-products';

/**
 * One colony's shop index (`/shop/<state>`): a card for every product
 * available for that state — each wall-art format and the postcards —
 * plus the all-states book. Reached from the tapestry detail page's
 * "Shop this tapestry" CTA.
 */
export async function StateShopPage({ slug }: { slug: string }) {
  const name = stateLabel(slug);
  const products = await getAllProducts();

  // The state's live product for each orderable type, in taxonomy order.
  const editions = ORDERABLE_TYPES.map((type) => ({
    type,
    item:
      productsForType(products, type.slug).find((i) => i.state === slug) ??
      null,
  })).filter((e) => e.item !== null);

  return (
    <PageSection background="colonial-navy" spacing="spacious">
      <Link
        href={`/tapestries/${slug}`}
        className="inline-flex items-center gap-1 font-sans text-sm font-medium text-colonial-parchment/70 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        The {name} tapestry
      </Link>

      <header className="mt-10 text-center">
        <span className="eyebrow eyebrow-gold">The {name} Collection</span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          Take {name} home
        </h1>
        <p className="gallery-lead mx-auto mt-3 max-w-xl">
          Every way to own the {name} panel — fine-art prints, the exhibition
          poster, postcards, and the book that tells all thirteen stories.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {editions.map(({ type, item }) => {
          const art = typeArtwork(type.slug);
          return (
            <StateEditionCard
              key={type.slug}
              item={item!}
              artwork={
                art
                  ? { src: artworkSrc(art.base, slug), framed: art.framed }
                  : undefined
              }
            />
          );
        })}

      </div>

      {editions.length === 0 && (
        <p className="mx-auto mt-10 max-w-xl text-center font-serif text-lg text-colonial-parchment/70">
          {name} editions are being stitched into the shop — prints, posters,
          and postcards follow shortly.
        </p>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
        >
          Browse the whole shop
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </PageSection>
  );
}
