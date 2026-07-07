import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageSection } from "@/components/ui/page-section";
import { BookCover } from "@/components/features/shop/book-cover";
import { StateEditionCard } from "@/components/features/shop/state-edition-card";
import { getAllProducts } from "@/lib/shopify";
import {
  ORDERABLE_TYPES,
  productsForType,
  typeArtwork,
  artworkSrc,
  stateLabel,
} from "@/lib/shop-products";

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
              heading={type.label}
              artwork={
                art
                  ? { src: artworkSrc(art.base, slug), framed: art.framed }
                  : undefined
              }
              matchPortrait
            />
          );
        })}

        {/* The book, back on the wall as a coming-soon teaser — checkout
            stays disabled until launch; the card previews /shop/book. */}
        <Link
          href="/shop/book"
          className="group block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
        >
          <div className="flex aspect-[4/5] items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            <BookCover
              src="/images/shop/book/book-cover.png"
              alt="The Making of America's Tapestry — hardcover book"
              className="w-full"
            />
          </div>
          <div className="mt-5 text-center">
            <span
              aria-hidden="true"
              className="mx-auto block h-px w-8 bg-colonial-gold/70 transition-all duration-300 group-hover:w-14"
            />
            <h3 className="mt-3 font-serif text-lg uppercase tracking-[0.18em] text-colonial-parchment">
              The Book
            </h3>
            <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-colonial-parchment/60">
              Coming soon
              <span className="mx-2 text-colonial-parchment/30">·</span>
              <span className="inline-flex items-center gap-1 text-colonial-gold">
                Preview
                <ArrowRight
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </p>
          </div>
        </Link>
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
