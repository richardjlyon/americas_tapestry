import { ArrowRight } from 'lucide-react';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import { FramePicker, type FrameOption } from './frame-picker';
import { checkoutUrl } from '@/lib/shopify';
import type { StateProduct } from '@/lib/shop-products';

interface StateEditionCardProps {
  item: StateProduct;
  /** Local print artwork + frame treatment; omitted for postcards. */
  artwork?: { src: string; framed: boolean } | undefined;
}

/**
 * One colony's edition, hung on the category page's gallery wall. The whole
 * piece is the buy target — clicking opens Shopify checkout for its variant.
 * Prints use local artwork (optionally framed); postcards fall back to the
 * Gelato mockup.
 */
export function StateEditionCard({ item, artwork }: StateEditionCardProps) {
  const { stateName, product } = item;
  const href = checkoutUrl(product.variantId);
  const buyable = Boolean(href && product.availableForSale);
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
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
    <div className="aspect-[4/5] overflow-hidden bg-colonial-parchment shadow-[0_18px_44px_-22px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
      {product.featuredImage ? (
        // Shopify CDN URL — plain <img> bypasses the app's R2 image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? `${stateName} — ${product.title}`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      ) : null}
    </div>
  );

  // Framed editions carry a Frame option (White / Wood / Black) — let the buyer
  // choose, and point Buy at the matching variant.
  const frameVariants = product.variants.filter((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === 'frame'),
  );
  if (frameVariants.length > 1) {
    const options: FrameOption[] = frameVariants
      .map((v) => {
        const frame =
          v.selectedOptions.find((o) => o.name.toLowerCase() === 'frame')
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
              {stateName}
            </h3>
            <FramePicker options={options} price={price} />
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
        {stateName}
      </h3>
      <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-colonial-parchment/60">
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

  const inner = (
    <>
      <div className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
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
