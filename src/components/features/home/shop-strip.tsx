import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StitchRule } from '@/components/ui/stitch-rule';

/** Museum-shop strip: the book and fine-art prints, one quiet ask. */
export function ShopStrip() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="eyebrow eyebrow-gold">The Shop</span>
      <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
        Take the Tapestry home
      </h2>
      <StitchRule className="mx-auto mt-4" />
      <p className="gallery-lead mx-auto mt-6">
        The hardcover book, fine-art prints of every colony panel, and
        postcards — printed on demand and shipped to your door.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild variant="colonial-gold" size="lg" className="text-base">
          <Link href="/shop">Visit the shop</Link>
        </Button>
        <Link
          href="/shop/book"
          className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
        >
          Explore the book
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
