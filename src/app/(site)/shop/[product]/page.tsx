import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';
import { Button } from '@/components/ui/button';
import { StateEditionCard } from '@/components/features/shop/state-edition-card';
import { getAllProducts } from '@/lib/shopify';
import {
  ORDERABLE_TYPES,
  STATE_SLUGS,
  getProductType,
  productsForType,
  typeArtwork,
  artworkSrc,
  stateLabel,
} from '@/lib/shop-products';
import { StateShopPage } from '@/components/features/shop/state-shop-page';
import { pageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ product: string }>;
}

const isStateSlug = (slug: string) =>
  (STATE_SLUGS as readonly string[]).includes(slug);

/** Pre-render a route for each known product type and each colony. */
export function generateStaticParams() {
  return [
    ...ORDERABLE_TYPES.map((t) => ({ product: t.slug })),
    ...STATE_SLUGS.map((s) => ({ product: s })),
  ];
}

export async function generateMetadata({ params }: PageProps) {
  const { product } = await params;
  if (isStateSlug(product)) {
    const name = stateLabel(product);
    return pageMetadata({
      title: `Shop ${name}`,
      description: `Every way to take the ${name} tapestry panel home — fine-art prints, the exhibition poster, postcards, and the book.`,
      path: `/shop/${product}`,
    });
  }
  const type = getProductType(product);
  if (!type)
    return pageMetadata({
      title: 'Shop',
      description:
        "Shop the America's Tapestry book, fine-art prints, posters, and postcards.",
      path: '/shop',
    });
  return pageMetadata({
    title: type.label,
    description: `${type.tagline} Order the ${type.label.toLowerCase()} for any of the thirteen America's Tapestry colony panels.`,
    path: `/shop/${type.slug}`,
  });
}

export default async function ProductTypePage({ params }: PageProps) {
  const { product } = await params;
  if (isStateSlug(product)) return <StateShopPage slug={product} />;
  const type = getProductType(product);
  if (!type) notFound();

  const items = productsForType(await getAllProducts(), type.slug);
  const art = typeArtwork(type.slug);
  const isPrint = art !== null;

  return (
    <PageSection background="colonial-navy" spacing="spacious">
      {/* Back to the shop — a quiet link, legible on the navy wall. */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 font-sans text-sm font-medium text-colonial-parchment/70 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        The shop
      </Link>

      {/* Gallery header */}
      <header className="mt-10 text-center">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-colonial-gold">
          {isPrint ? 'Wall art · 16×20″' : 'Packs of ten'}
        </span>
        <h1 className="mt-4 font-serif text-4xl text-colonial-parchment md:text-5xl">
          {type.label}
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-colonial-parchment/70">
          {type.tagline} Choose your colony.
        </p>
        <span
          aria-hidden="true"
          className="mx-auto mt-8 block h-px w-16 bg-colonial-gold/60"
        />
      </header>

      {items.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StateEditionCard
              key={item.product.id}
              item={item}
              dimensions={type.dimensions}
              artwork={
                art
                  ? { src: artworkSrc(art.base, item.state), framed: art.framed }
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-dashed border-colonial-gold/40 bg-white/5 p-10 text-center">
          <p className="font-serif text-lg text-colonial-parchment/80">
            This edition is being stitched into the shop. Colony panels are added
            one by one — check back soon, or explore the other formats.
          </p>
          <Button asChild variant="colonial-gold" size="lg" className="mt-6">
            <Link href="/shop">Browse the shop</Link>
          </Button>
        </div>
      )}
    </PageSection>
  );
}
