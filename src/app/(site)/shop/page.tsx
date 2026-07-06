import Link from 'next/link';
import {
  Award,
  BadgeCheck,
  Frame,
  LayoutGrid,
  Mail,
  ScrollText,
  Stamp,
  Truck,
} from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { FramedPrint } from '@/components/features/shop/framed-print';
import { PrintCard } from '@/components/features/shop/print-card';
import { ShopifyProductCard } from '@/components/features/shop/shopify-product-card';
import { getAllTapestries } from '@/lib/tapestries';
import { getCollectionProducts } from '@/lib/shopify';
import { pageMetadata } from '@/lib/seo';
import { StitchRule } from '@/components/ui/stitch-rule';

export const metadata = pageMetadata({
  title: 'Shop',
  description:
    "Museum-quality fine-art prints of the thirteen America's Tapestry colony panels, printed on demand and shipped to your door.",
  path: '/shop',
});

const valueProps = [
  {
    icon: Award,
    title: 'Museum-quality giclée',
    description: 'Archival inks on heavyweight, fade-resistant fine-art paper.',
  },
  {
    icon: Truck,
    title: 'Printed to order, shipped to you',
    description: 'Each print is made on demand and delivered to your door.',
  },
  {
    icon: Stamp,
    title: "Marking America's 250th",
    description: 'A lasting keepsake of the Semiquincentennial, July 4, 2026.',
  },
];

const editions = [
  {
    icon: Frame,
    title: 'Framed prints',
    description: 'Solid wood frame, museum mat — ready to hang.',
  },
  {
    icon: Award,
    title: 'Canvas prints',
    description: 'Gallery-wrapped canvas, no frame needed.',
  },
  {
    icon: LayoutGrid,
    title: 'Metal & acrylic prints',
    description: 'HD metal or acrylic with a vivid modern finish.',
  },
  {
    icon: ScrollText,
    title: 'Art prints',
    description: 'Unframed fine-art prints on archival stock.',
  },
  {
    icon: Stamp,
    title: 'The Exhibition Poster',
    description: 'The souvenir of the 250th — every state on the signature navy.',
  },
  {
    icon: Mail,
    title: 'Postcards & greeting cards',
    description: 'Mailable art cards and boxed note sets for every colony.',
  },
];


export default async function ShopPage() {
  const tapestries = await getAllTapestries();
  const eligible = tapestries.filter(
    (t) => t.status !== 'Not Started' && (t.thumbnail || t.imagePath),
  );
  const featured =
    eligible.find((t) => t.slug === 'pennsylvania') ?? eligible[0];

  // Live products from the shared Shopify store's "America's Tapestry"
  // collection (book + per-state postcards). Empty until the Storefront token
  // is configured, in which case the "Available now" section is hidden.
  const liveProducts = await getCollectionProducts('americas-tapestry');

  return (
    <>
      {/* Hero — the panels reframed as wall art */}
      <PageSection spacing="spacious">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
              Fine-Art Prints
            </span>
            <StitchRule className="mt-4" />
            <h1 className="mt-5 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-colonial-navy md:text-5xl lg:text-6xl">
              Bring the Tapestry home
            </h1>
            <p className="mt-5 max-w-xl text-colonial-navy/80">
              Thirteen hand-embroidered panels, one for each original colony —
              each now offered as a fine-art print. Find your state, and bring
              its story home.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="colonial-gold" size="lg">
                <a href="#collection">Browse the collection</a>
              </Button>
              <Button asChild variant="colonial-outline" size="lg">
                <Link href="/tapestries">Explore the panels</Link>
              </Button>
            </div>
          </div>

          {featured && (
            <div className="mx-auto w-full max-w-sm md:mx-0 md:max-w-lg">
              <FramedPrint
                src={featured.thumbnail || featured.imagePath || ''}
                alt={`${featured.title} tapestry — fine-art print`}
                orientation="portrait"
                priority
              />
              <p className="mt-3 text-center font-serif text-sm italic text-colonial-navy/70">
                {featured.title} — one of thirteen
              </p>
            </div>
          )}
        </div>
      </PageSection>

      {/* Available now — live from the Shopify "America's Tapestry" collection */}
      {liveProducts.length > 0 && (
        <PageSection spacing="spacious">
          <SectionHeader
            title="Available now"
            description="Ready to order — printed on demand and shipped to your door."
          />
          <StitchRule className="mx-auto mb-10" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {liveProducts.map((product) => (
              <ShopifyProductCard key={product.id} product={product} />
            ))}
          </div>
        </PageSection>
      )}

      {/* Why these prints */}
      <PageSection background="authentic-parchment" spacing="normal">
        <ul className="grid gap-8 sm:grid-cols-3">
          {valueProps.map(({ icon: Icon, title, description }) => (
            <li key={title} className="text-center sm:text-left">
              <Icon
                className="mx-auto h-8 w-8 text-colonial-burgundy sm:mx-0"
                aria-hidden="true"
              />
              <span className="mt-3 block font-sans text-lg font-semibold text-colonial-navy">
                {title}
              </span>
              <p className="mt-1 font-serif text-base text-colonial-navy/75">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </PageSection>

      {/* The collection grid */}
      <PageSection id="collection" spacing="spacious">
        <SectionHeader
          title="Shop the Collection"
          description="Each of the thirteen colony panels, available as a fine-art print."
        />
        <StitchRule className="mx-auto mb-10" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {eligible.map((tapestry) => (
            <PrintCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </PageSection>

      {/* Formats & editions */}
      <PageSection background="vintage-paper" spacing="spacious">
        <SectionHeader
          title="Formats & Editions"
          description="Seven formats per colony — from the $20 postcard pack to museum-ready wall art — plus the 2026 wall calendar and the hardcover book."
        />
        <StitchRule className="mx-auto mb-10" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {editions.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-colonial-navy/10 bg-white p-6 shadow-sm"
            >
              <Icon className="h-7 w-7 text-colonial-burgundy" aria-hidden="true" />
              <h3 className="mt-3 font-sans text-lg font-semibold text-colonial-navy">
                {title}
              </h3>
              <p className="mt-1 font-serif text-base text-colonial-navy/75">
                {description}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Closing call to action */}
      <PageSection background="colonial-navy" spacing="spacious">
        <div className="mx-auto max-w-2xl text-center">
          <BadgeCheck
            className="mx-auto h-9 w-9 text-colonial-gold"
            aria-hidden="true"
          />
          <h2 className="section-title mt-4 text-colonial-parchment">
            Own a piece of the story
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-serif text-lg text-colonial-parchment/80">
            From your home state to all thirteen colonies, mark America&rsquo;s
            250th with a print made to last.
          </p>
          <div className="mt-8">
            <Button asChild variant="colonial-gold" size="lg">
              <a href="#collection">Browse the collection</a>
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  );
}
