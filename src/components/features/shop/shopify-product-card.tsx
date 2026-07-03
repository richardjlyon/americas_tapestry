import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkoutUrl, type ShopifyProduct } from '@/lib/shopify';

interface ShopifyProductCardProps {
  product: ShopifyProduct;
}

/**
 * A live Shopify product from the America's Tapestry collection, rendered
 * in-site. "Buy" opens Shopify's checkout for that product's variant.
 */
export function ShopifyProductCard({ product }: ShopifyProductCardProps) {
  const href = checkoutUrl(product.variantId);
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.price.currencyCode,
  }).format(Number(product.price.amount));

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-colonial-navy/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_16px_44px_rgba(16,37,66,0.18)]">
      <div className="aspect-[4/3] overflow-hidden bg-colonial-parchment">
        {product.featuredImage ? (
          // Shopify CDN URL — plain <img> bypasses the app's custom R2 image loader.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-lg font-semibold leading-snug text-colonial-navy">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-3 font-serif text-sm text-colonial-navy/70">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-sans text-xl font-bold text-colonial-navy">
            {price}
          </span>
          {href && product.availableForSale ? (
            <Button asChild variant="colonial-gold" size="sm">
              <a href={href}>
                Buy
                <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          ) : (
            <span className="font-serif text-sm italic text-colonial-navy/50">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
