import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Copy,
  Magnet,
  Palette,
  Ruler,
  Star,
} from "lucide-react";
import { PageSection } from "@/components/ui/page-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getImagePath } from "@/lib/image-utils";
import { EditionTypeCard } from "@/components/features/shop/edition-type-card";
import { FramedArtwork } from "@/components/ui/framed-artwork";
import { getAllProducts, getProductByHandle, checkoutUrl } from "@/lib/shopify";
import {
  WALL_ART_TYPES,
  POSTCARD_TYPE,
  STATE_SLUGS,
  typeArtwork,
  artworkSrc,
  stateLabel,
} from "@/lib/shop-products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop",
  description:
    "The America's Tapestry book, fine-art prints and posters of the colony panels, and postcards — printed on demand and shipped to your door.",
  path: "/shop",
});

/** A single postcard face (5.5×4.25 landscape) as a physical card. */
function PostcardFace({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[8px] bg-white shadow-[0_22px_48px_-18px_rgba(11,15,32,0.5)] ring-1 ring-colonial-navy/10">
      <div className="relative aspect-[419/329]">
        <OptimizedImage
          src={getImagePath(src)}
          alt={alt}
          fill
          sizes="(min-width: 768px) 40vw, 85vw"
          role="feature"
          className="object-cover"
          enableBlurPlaceholder
        />
      </div>
    </div>
  );
}

export default async function ShopPage() {
  // A random colony (every one has print artwork) illustrates each edition card
  // with its real treatment.
  const shuffledStates = [...STATE_SLUGS].sort(() => Math.random() - 0.5);
  const pickState = (i: number) => shuffledStates[i % shuffledStates.length]!;

  // Live catalog from the shared Shopify store's "America's Tapestry"
  // collection. Empty until the Storefront token is configured; each type card
  // then reports how many colonies are orderable and fills in automatically.
  const products = await getAllProducts();
  const countFor = (slug: string) =>
    products.filter((p) => p.tags.includes(slug)).length;

  // The coloring book — a single collection-wide product (no state tag),
  // available now with a direct-to-checkout Buy button.
  const coloringBook = products.find((p) => p.tags.includes("coloring-book"));
  const coloringBookHref = coloringBook
    ? checkoutUrl(coloringBook.variantId)
    : null;

  // The needle minder — a limited-edition single product (no state tag). Its
  // detail fetch brings back all three photos for the collage: the backing
  // card, the in-use scene, and the enamel close-up, in Shopify image order.
  const needleMinder = products.find((p) => p.tags.includes("needle-minder"));
  const needleMinderDetail = needleMinder
    ? await getProductByHandle(needleMinder.handle)
    : null;
  const needleMinderHref = needleMinder
    ? checkoutUrl(needleMinder.variantId)
    : null;
  const nmImages = needleMinderDetail?.images ?? [];
  // The in-use scene (second image) makes the strongest hero; the card and
  // close-up sit beneath. With fewer than three images, fall back gracefully.
  const nmHero = nmImages[1] ?? nmImages[0] ?? null;
  const nmThumbs = nmImages.filter((img) => img !== nmHero).slice(0, 2);

  return (
    <>
      {/* Hero — the collection, generically (book promotion parked until launch) */}
      <PageSection spacing="spacious">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
              The Shop
            </span>
            <div className="gold-threshold mt-3" />
            <h1 className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-colonial-navy md:text-5xl lg:text-6xl">
              Own a Piece of America&rsquo;s Tapestry
            </h1>
            <p className="mt-4 max-w-xl text-colonial-navy/80">
              Museum-quality giclée prints, exhibition posters, and mailable art
              cards of all thirteen hand-embroidered colony panels — printed on
              demand and shipped to your door.
            </p>
            <p className="mt-3 max-w-xl font-medium text-colonial-burgundy">
              Every purchase helps fund the tapestry&rsquo;s three-year tour
              through the original thirteen states.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button asChild variant="colonial-gold" size="lg">
                <a href="#prints">
                  Shop prints &amp; posters
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm py-4 md:mx-0">
            {/* A warm spotlight sets the artwork off the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(58%_58%_at_52%_42%,rgba(191,155,84,0.28),transparent_70%)]"
            />
            <FramedArtwork
              src={artworkSrc("fineart", pickState(0))}
              alt={`The ${stateLabel(pickState(0))} panel as a framed fine-art print`}
              framed
            />
          </div>
        </div>
      </PageSection>

      {/* Prints & posters — one card per edition, click through to all colonies */}
      <PageSection
        id="prints"
        background="authentic-parchment"
        spacing="spacious"
      >
        <SectionHeader
          title="Prints & Posters"
          description="Four editions of every colony panel, all 16×20″. Choose an edition, then pick your colony."
        />
        <div className="gold-threshold mx-auto mb-10" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WALL_ART_TYPES.map((type, i) => {
            const art = typeArtwork(type.slug)!;
            const state = pickState(i);
            return (
              <EditionTypeCard
                key={type.slug}
                type={type}
                illustrationSrc=""
                illustrationLabel={stateLabel(state)}
                artwork={{
                  src: artworkSrc(art.base, state),
                  framed: art.framed,
                }}
                availableCount={countFor(type.slug)}
              />
            );
          })}
        </div>
      </PageSection>

      {/* Postcards — front & back, with the details */}
      <PageSection spacing="spacious">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* A fanned pair — the panel front peeking behind the message back. */}
          <div className="relative mx-auto w-full max-w-md px-8 py-8">
            <div className="absolute inset-x-8 -top-1 rotate-[-8deg] transition-transform duration-500 hover:rotate-[-10deg]">
              <PostcardFace
                src="/images/shop/postcards/pennsylvania-front.jpg"
                alt="Postcard front — the Pennsylvania colony panel"
              />
            </div>
            <div className="relative translate-y-7 rotate-[4deg] transition-transform duration-500 hover:rotate-[2deg]">
              <PostcardFace
                src="/images/shop/postcards/pennsylvania-back.jpg"
                alt="Postcard back — the Pennsylvania panel's story, its state directors, and space for a message and address"
              />
            </div>
          </div>

          {/* The details */}
          <div>
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
              Postcards
            </span>
            <div className="gold-threshold mt-4" />
            <h2 className="mt-5 font-sans text-3xl font-bold leading-tight text-colonial-navy md:text-4xl">
              Mail a piece of the story
            </h2>
            <p className="mt-4 max-w-md text-colonial-navy/80">
              Ten art cards of a single colony&rsquo;s panel. The back carries
              the panel&rsquo;s story and its state directors, with room for a
              note of your own.
            </p>
            <ul className="mt-6 space-y-3 font-serif text-base text-colonial-navy/85">
              <li className="flex items-center gap-3">
                <Copy
                  className="h-5 w-5 shrink-0 text-colonial-burgundy"
                  aria-hidden="true"
                />
                Pack of ten — one colony per pack
              </li>
              <li className="flex items-center gap-3">
                <Ruler
                  className="h-5 w-5 shrink-0 text-colonial-burgundy"
                  aria-hidden="true"
                />
                5.5 × 4.25 inches
              </li>
            </ul>
            <Button asChild variant="colonial-gold" size="lg" className="mt-8">
              <Link href="/shop/postcard">
                Shop postcards
                {countFor(POSTCARD_TYPE.slug) > 0
                  ? ` — ${countFor(POSTCARD_TYPE.slug)} colonies`
                  : ""}
              </Link>
            </Button>
          </div>
        </div>
      </PageSection>

      {/* The Coloring Book — a single product, available now */}
      {coloringBook?.featuredImage && coloringBookHref && (
        <PageSection background="authentic-parchment" spacing="spacious">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            {/* The cover */}
            <div className="relative mx-auto w-full max-w-xs px-4 py-4 md:mx-0 md:ml-auto">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(58%_58%_at_52%_42%,rgba(191,155,84,0.28),transparent_70%)]"
              />
              {/* The Gelato mockup is a portrait cover floated in a 2048²
                  canvas with ~11% transparent bands each side. Give the box the
                  cover's own aspect (1583×2042) and object-cover so the bands
                  clip and the shadow hugs the cover, not the empty canvas. */}
              <div className="mx-auto aspect-[1583/2042] w-full overflow-hidden rounded-[6px] shadow-[0_30px_58px_-20px_rgba(11,15,32,0.55)] ring-1 ring-colonial-navy/10">
                {/* Shopify CDN URL — plain <img> bypasses the app's R2 image loader. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coloringBook.featuredImage.url}
                  alt={coloringBook.featuredImage.altText ?? coloringBook.title}
                  className="block h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>

            {/* The details */}
            <div>
              <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
                New — Available Now
              </span>
              <div className="gold-threshold mt-4" />
              <h2 className="mt-5 font-sans text-3xl font-bold leading-tight text-colonial-navy md:text-4xl">
                The America&rsquo;s Tapestry Coloring Book
              </h2>
              <p className="mt-4 max-w-md text-colonial-navy/80">
                The thirteen colony panels redrawn as line art to color in —
                the whole tapestry, page by page. Printed on demand and shipped
                to your door.
              </p>
              <ul className="mt-6 space-y-3 font-serif text-base text-colonial-navy/85">
                <li className="flex items-center gap-3">
                  <Palette
                    className="h-5 w-5 shrink-0 text-colonial-burgundy"
                    aria-hidden="true"
                  />
                  All thirteen colony panels as colorable line art
                </li>
              </ul>
              <Button asChild variant="colonial-gold" size="lg" className="mt-8">
                <a href={coloringBookHref}>
                  Buy the coloring book — $
                  {Number(coloringBook.price.amount).toFixed(0)}
                </a>
              </Button>
            </div>
          </div>
        </PageSection>
      )}

      {/* The Needle Minder — a limited edition of 100 */}
      {needleMinder && nmHero && needleMinderHref && (
        <PageSection spacing="spacious">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            {/* Photo collage — the in-use scene above the card and close-up. */}
            <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
              <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-[8px] shadow-[0_22px_48px_-18px_rgba(11,15,32,0.5)] ring-1 ring-colonial-navy/10">
                {/* Shopify CDN URLs — plain <img> bypasses the R2 image loader. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nmHero.url}
                  alt={
                    nmHero.altText ||
                    "The America's Tapestry needle minder at work on embroidery linen, beside stork scissors and a threaded needle"
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {nmThumbs.map((img, i) => (
                <div
                  key={img.url}
                  className="relative aspect-[3/2] overflow-hidden rounded-[8px] shadow-[0_16px_36px_-16px_rgba(11,15,32,0.45)] ring-1 ring-colonial-navy/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={
                      img.altText ||
                      (i === 0
                        ? "The needle minder on its commemorative backing card"
                        : "Close-up of the enamel spool needle minder")
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* The details */}
            <div>
              <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
                Limited Edition — Only 100 Made
              </span>
              <div className="gold-threshold mt-4" />
              <h2 className="mt-5 font-sans text-3xl font-bold leading-tight text-colonial-navy md:text-4xl">
                The Needle Minder
              </h2>
              <p className="mt-4 max-w-md text-colonial-navy/80">
                Our spool logo as a magnetic needle minder — it holds your
                needle to the fabric between stitches, right where you left it.
                Printed in glossy navy UV ink, each one arrives on its own
                commemorative backing card.
              </p>
              <ul className="mt-6 space-y-3 font-serif text-base text-colonial-navy/85">
                <li className="flex items-center gap-3">
                  <Star
                    className="h-5 w-5 shrink-0 text-colonial-burgundy"
                    aria-hidden="true"
                  />
                  A limited run of one hundred
                </li>
                <li className="flex items-center gap-3">
                  <Ruler
                    className="h-5 w-5 shrink-0 text-colonial-burgundy"
                    aria-hidden="true"
                  />
                  ¾″ high, glossy navy UV ink
                </li>
                <li className="flex items-center gap-3">
                  <Magnet
                    className="h-5 w-5 shrink-0 text-colonial-burgundy"
                    aria-hidden="true"
                  />
                  Strong magnet keeps your needle to hand
                </li>
              </ul>
              <Button asChild variant="colonial-gold" size="lg" className="mt-8">
                <a href={needleMinderHref}>
                  Buy the needle minder — $
                  {Number(needleMinder.price.amount).toFixed(0)}
                </a>
              </Button>
            </div>
          </div>
        </PageSection>
      )}

      {/* Coming soon — the book and the 2026 wall calendar */}
      <PageSection background="vintage-paper" spacing="spacious">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-colonial-gold/60 bg-white/60 p-10 text-center">
            <BookOpen
              className="mx-auto h-9 w-9 text-colonial-burgundy"
              aria-hidden="true"
            />
            <span className="mt-4 inline-block rounded-full bg-colonial-gold/20 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-colonial-burgundy">
              Coming soon
            </span>
            <h2 className="section-title mt-4 text-2xl">The Book</h2>
            <p className="mx-auto mt-3 max-w-lg font-serif text-lg text-colonial-navy/75">
              The hardcover companion — thirteen hand-embroidered panels and the
              people who stitched them, in one keepsake volume.
            </p>
            <Link
              href="/shop/book"
              className="mt-4 inline-flex items-center font-medium text-colonial-burgundy transition-colors hover:text-colonial-burgundy/80"
            >
              Preview the book
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-lg border border-dashed border-colonial-gold/60 bg-white/60 p-10 text-center">
            <CalendarDays
              className="mx-auto h-9 w-9 text-colonial-burgundy"
              aria-hidden="true"
            />
            <span className="mt-4 inline-block rounded-full bg-colonial-gold/20 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-colonial-burgundy">
              Coming soon
            </span>
            <h2 className="section-title mt-4 text-2xl">
              The 2026 Wall Calendar
            </h2>
            <p className="mx-auto mt-3 max-w-lg font-serif text-lg text-colonial-navy/75">
              Twelve months of the colony panels, marking America&rsquo;s 250th
              year. Being stitched into the shop now — check back soon.
            </p>
          </div>
        </div>
      </PageSection>
    </>
  );
}
