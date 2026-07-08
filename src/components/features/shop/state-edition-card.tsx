import { ArrowRight } from "lucide-react";
import { FramedArtwork } from "@/components/ui/framed-artwork";
import { FramePicker, type FrameOption } from "./frame-picker";
import { checkoutUrl } from "@/lib/shopify";
import type { StateProduct } from "@/lib/shop-products";

interface StateEditionCardProps {
  item: StateProduct;
  /** Local print artwork + frame treatment; omitted for postcards. */
  artwork?: { src: string; framed: boolean } | undefined;
  /**
   * Card title. Defaults to the colony name (per-type pages show one card per
   * colony). Per-state pages (`/shop/<state>`) pass the edition-type label
   * here — e.g. "Postcards" — since every card is the same colony there.
   */
  heading?: string;
  /**
   * Printed sheet size (e.g. "16×20″"), shown just before the price on the buy
   * affordance. Omitted for postcards.
   */
  dimensions?: string | undefined;
  /**
   * On a per-state page the postcard shares a row with portrait print cards.
   * Set this so the postcard takes the same 4:5 footprint (centered within it)
   * and its title lines up with the neighbouring editions. Omit on the
   * all-postcards page, where a snug card reads better.
   */
  matchPortrait?: boolean;
}

/**
 * One colony's edition, hung on the category page's gallery wall. The whole
 * piece is the buy target — clicking opens Shopify checkout for its variant.
 * Prints use local artwork (optionally framed); postcards fall back to the
 * Gelato mockup.
 */
export function StateEditionCard({
  item,
  artwork,
  heading,
  dimensions,
  matchPortrait = false,
}: StateEditionCardProps) {
  const { stateName, product } = item;
  const title = heading ?? stateName;
  const href = checkoutUrl(product.variantId);
  const buyable = Boolean(href && product.availableForSale);
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.price.currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(product.price.amount));

  const piece = artwork ? (
    <FramedArtwork
      src={artwork.src}
      alt={`${stateName} — ${product.title}`}
      framed={artwork.framed}
    />
  ) : (
    // Postcards ship no local artwork — the Shopify mockup is a 1:1 webp with
    // ~14.3% transparent bands baked in above and below the postcard, which
    // showed as blank bars on the card. Crop them off: give the box the
    // opaque region's aspect ratio (~1.41) and object-cover from center so the
    // transparent padding is clipped, leaving just the postcard. A soft shadow
    // lifts the card off the navy wall instead of looking cut out of it.
    <div className="aspect-[1.41] w-full overflow-hidden rounded-[6px] bg-white shadow-[0_30px_58px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
      {product.featuredImage ? (
        // Shopify CDN URL — plain <img> bypasses the app's R2 image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.featuredImage.url}
          alt={
            product.featuredImage.altText ?? `${stateName} — ${product.title}`
          }
          className="block h-full w-full object-cover object-center"
          loading="lazy"
        />
      ) : null}
    </div>
  );

  // Framed editions carry a Frame option (White / Wood / Black) — let the buyer
  // choose, and point Buy at the matching variant.
  const frameVariants = product.variants.filter((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === "frame"),
  );
  if (frameVariants.length > 1) {
    const options: FrameOption[] = frameVariants
      .map((v) => {
        const frame =
          v.selectedOptions.find((o) => o.name.toLowerCase() === "frame")
            ?.value ?? v.title;
        const vHref = checkoutUrl(v.id);
        return vHref
          ? { frame, href: vHref, available: v.availableForSale }
          : null;
      })
      .filter((o): o is FrameOption => o !== null);

    if (options.length > 1) {
      return (
        <div className="group block">
          <div className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            {piece}
          </div>
          <div className="mt-5 text-center">
            <span
              aria-hidden="true"
              className="mx-auto block h-px w-8 bg-colonial-gold/70 transition-all duration-300 group-hover:w-14"
            />
            <h3 className="mt-3 font-serif text-lg uppercase tracking-[0.18em] text-colonial-parchment">
              {title}
            </h3>
            <FramePicker
              options={options}
              price={price}
              dimensions={dimensions}
            />
          </div>
        </div>
      );
    }
  }

  /** Gold hairline, colony in engraved small-caps, price + buy affordance. */
  const placard = (
    <div className="mt-5 text-center">
      <span
        aria-hidden="true"
        className="mx-auto block h-px w-8 bg-colonial-gold/70 transition-all duration-300 group-hover:w-14"
      />
      <h3 className="mt-3 font-serif text-lg uppercase tracking-[0.18em] text-colonial-parchment">
        {title}
      </h3>
      <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-colonial-parchment/60">
        {dimensions ? (
          <>
            <span className="text-colonial-parchment/45">{dimensions}</span>
            <span className="mx-2 text-colonial-parchment/30">·</span>
          </>
        ) : null}
        {price}
        {buyable ? (
          <>
            <span className="mx-2 text-colonial-parchment/30">·</span>
            <span className="inline-flex items-center gap-1 text-colonial-gold">
              Buy
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </>
        ) : (
          <>
            <span className="mx-2 text-colonial-parchment/30">·</span>
            <span className="italic text-colonial-parchment/40">Sold out</span>
          </>
        )}
      </p>
    </div>
  );

  // The postcard's short landscape image would leave its title floating high
  // beside the portrait print cards. On per-state pages give it the same 4:5
  // footprint as those cards and center the postcard within it, so its title
  // lands on the same line as the neighbouring editions' titles.
  const framePortrait = !artwork && matchPortrait;
  const inner = (
    <>
      <div
        className={`${framePortrait ? "flex aspect-[4/5] items-center " : ""}transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none`}
      >
        {piece}
      </div>
      {placard}
    </>
  );

  if (!buyable) {
    return <div className="group block">{inner}</div>;
  }

  return (
    <a
      href={href!}
      className="group block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
    >
      {inner}
    </a>
  );
}
