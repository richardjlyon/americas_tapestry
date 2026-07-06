import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StitchRule } from '@/components/ui/stitch-rule';

/** Museum-shop strip: prints and postcards, one quiet ask. */
export function ShopStrip() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="eyebrow eyebrow-gold">The Shop</span>
      <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
        Take the Tapestry home
      </h2>
      <StitchRule className="mx-auto mt-3" />
      <p className="gallery-lead mx-auto mt-4">
        Fine-art prints, exhibition posters, and postcards of every colony
        panel — printed on demand and shipped to your door.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild variant="colonial-gold" size="lg" className="text-base">
          <Link href="/shop">Visit the shop</Link>
        </Button>
        <Link
          href="/shop/art-print"
          className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
        >
          Fine-art prints
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
