import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Palette,
  Ruler,
  Users,
} from "lucide-react";
import { PageSection } from "@/components/ui/page-section";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getImagePath } from "@/lib/image-utils";
import { BookCover } from "@/components/features/shop/book-cover";
import { getAllProducts, checkoutUrl } from "@/lib/shopify";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The Making of America’s Tapestry — the Book",
  description:
    "The hardcover keepsake behind the thirteen hand-embroidered colony panels: every artwork in full color, the history each one tells, and the five hundred stitchers who made it. Hardback, 58 pages, 8.3 × 11 in.",
  path: "/shop/book",
});

/** Physical facts a buyer wants before spending $45. */
const SPECS = [
  { label: "Format", value: "Hardback" },
  { label: "Pages", value: "58" },
  { label: "Size", value: "8.3 × 11 in" },
];

/** Real interior pages — the "look inside". */
const SPREADS = [
  {
    src: "/images/shop/book/inside/book-inside-pennsylvania-panel.jpg",
    caption: "Every colony panel, reproduced in full color",
    alt: "A book page showing the Pennsylvania panel — flag maker Rebecca Young sewing for the Continental Navy",
  },
  {
    src: "/images/shop/book/inside/book-inside-pennsylvania-story.jpg",
    caption: "The history each panel tells",
    alt: "A book page telling the story of the Pennsylvania panel",
  },
  {
    src: "/images/shop/book/inside/book-inside-embroidery-threads.jpg",
    caption: "Colors matched to Colonial Williamsburg dye samples",
    alt: "A book page showing spools of wool, linen, cotton and silk embroidery thread",
  },
  {
    src: "/images/shop/book/inside/book-inside-stitching-detail.jpg",
    caption: "The craft, up close",
    alt: "A book page with macro photographs of the embroidery and antique scissors",
  },
  {
    src: "/images/shop/book/inside/book-inside-south-carolina-panel.jpg",
    caption: "Thirteen colonies, colony by colony",
    alt: "A book page showing the South Carolina panel",
  },
  {
    src: "/images/shop/book/inside/book-inside-stitchers.jpg",
    caption: "The five hundred hands that made it",
    alt: "A book page with a photograph of volunteer stitchers holding a finished panel",
  },
];

/** What the $45 buys — the value, in the reader’s terms. */
const VALUE = [
  {
    icon: BookOpen,
    title: "Thirteen panels, in full color",
    body: "Every colony’s hand-embroidered artwork, photographed and reproduced across the book.",
  },
  {
    icon: Palette,
    title: "Colonial-era craft",
    body: "Wool, linen, cotton and silk in colors matched to Colonial Williamsburg dye samples, worked in 18th-century stitches.",
  },
  {
    icon: Users,
    title: "Five hundred stitchers",
    body: "The volunteers and state directors who made it — named, colony by colony, in the book.",
  },
];

/** One interior page, shown as a physical leaf with a caption. */
function InsidePage({
  src,
  caption,
  alt,
}: {
  src: string;
  caption: string;
  alt: string;
}) {
  return (
    <figure>
      <div className="overflow-hidden rounded-[3px] bg-white shadow-[0_20px_44px_-20px_rgba(11,15,32,0.55)] ring-1 ring-colonial-navy/10">
        <div className="relative aspect-[595/788]">
          <OptimizedImage
            src={getImagePath(src)}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            role="feature"
            className="object-cover"
            enableBlurPlaceholder
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center font-serif text-sm italic text-colonial-navy/70">
        {caption}
      </figcaption>
    </figure>
  );
}

export default async function BookPage() {
  const products = await getAllProducts();
  const book = products.find((p) => p.tags.includes("book")) ?? null;
  const href = checkoutUrl(book?.variantId ?? null);
  // BOOK LAUNCH PARKED (per Richard, 2026-07-06): the page stays browsable
  // but the book is not yet on sale — show "Coming soon" and never link to
  // Shopify checkout. Restore the availability check at launch:
  //   const buyable = Boolean(href && book?.availableForSale);
  const buyable = false;
  const price = book
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: book.price.currencyCode,
        maximumFractionDigits: 0,
      }).format(Number(book.price.amount))
    : "$45";

  const BuyButton = ({ label }: { label: string }) =>
    buyable ? (
      <Button asChild variant="colonial-gold" size="lg">
        <a href={href!}>
          {label}
          <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    ) : (
      <span className="inline-flex items-center border border-dashed border-colonial-gold/50 px-4 py-2 font-sans text-sm font-semibold uppercase tracking-[0.15em] text-colonial-gold">
        Coming soon
      </span>
    );

  return (
    <>
      {/* Hero — the hardcover on a navy stage */}
      <PageSection background="colonial-navy" spacing="spacious">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 font-sans text-sm font-medium text-colonial-parchment/70 transition-colors hover:text-colonial-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          The shop
        </Link>

        <div className="mt-10 grid items-center gap-12 md:grid-cols-[1fr_0.9fr] md:gap-16">
          <div>
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-gold">
              The Book
            </span>
            <div className="gold-threshold mt-4" />
            <h1 className="mt-5 font-serif text-4xl leading-tight text-colonial-parchment md:text-5xl lg:text-6xl">
              The Making of America&rsquo;s Tapestry
            </h1>
            <p className="mt-5 max-w-xl font-serif text-lg text-colonial-parchment/80">
              One project, thirteen colonies, five hundred pairs of hands — the
              keepsake volume behind the hand-embroidered panels. Every artwork,
              the history it tells, and the people who stitched it.
            </p>

            {/* Spec plate */}
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {SPECS.map((s) => (
                <div key={s.label}>
                  <dt className="font-sans text-xs uppercase tracking-[0.15em] text-colonial-parchment/50">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-serif text-lg text-colonial-parchment">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <BuyButton label={`Buy the book — ${price}`} />
              <a
                href="#inside"
                className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-colonial-parchment/80 underline-offset-4 hover:text-colonial-gold hover:underline"
              >
                Look inside
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm py-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(58%_58%_at_52%_42%,rgba(191,155,84,0.3),transparent_70%)]"
            />
            <BookCover
              src="/images/shop/book/book-cover.png"
              alt="The Making of America's Tapestry — hardcover"
            />
          </div>
        </div>
      </PageSection>

      {/* Look inside — real interior pages */}
      <PageSection
        id="inside"
        background="authentic-parchment"
        spacing="spacious"
      >
        <div className="text-center">
          <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
            Look inside
          </span>
          <h2 className="mt-3 font-serif text-3xl text-colonial-navy md:text-4xl">
            Fifty-eight pages, cover to cover
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-colonial-navy/75">
            Full-color panels, the stories behind them, and the craft up close.
          </p>
          <div className="gold-threshold mx-auto mt-6" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SPREADS.map((s) => (
            <InsidePage key={s.src} {...s} />
          ))}
        </div>
      </PageSection>

      {/* What the $45 buys */}
      <PageSection spacing="spacious">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div className="overflow-hidden rounded-[4px] shadow-[0_24px_54px_-22px_rgba(11,15,32,0.5)] ring-1 ring-colonial-navy/10">
            <div className="relative aspect-[595/788]">
              <OptimizedImage
                src={getImagePath(
                  "/images/shop/book/inside/book-inside-embroidery-threads.jpg",
                )}
                alt="A book page showing spools of colonial-era embroidery thread"
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                role="feature"
                className="object-cover"
                enableBlurPlaceholder
              />
            </div>
          </div>

          <div>
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-colonial-burgundy">
              Why it belongs on your shelf
            </span>
            <div className="gold-threshold mt-4" />
            <ul className="mt-8 space-y-7">
              {VALUE.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <Icon
                    className="mt-1 h-6 w-6 shrink-0 text-colonial-burgundy"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-colonial-navy">
                      {title}
                    </h3>
                    <p className="mt-1 font-serif text-base text-colonial-navy/75">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      {/* Closing purchase band */}
      <PageSection background="colonial-navy" spacing="spacious">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl text-colonial-parchment md:text-4xl">
            Bring the whole story home
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-colonial-parchment/80">
            A hardback keepsake of America&rsquo;s 250th — 58 pages, 8.3 × 11
            inches, and every colony inside.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Ruler className="h-5 w-5 text-colonial-gold" aria-hidden="true" />
            <span className="font-sans text-sm uppercase tracking-[0.14em] text-colonial-parchment/70">
              Hardback · 58 pages · 8.3 × 11 in
            </span>
          </div>
          <div className="mt-8 flex justify-center">
            <BuyButton label={`Buy the book — ${price}`} />
          </div>
        </div>
      </PageSection>
    </>
  );
}
