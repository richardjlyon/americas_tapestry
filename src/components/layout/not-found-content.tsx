import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Compass } from 'lucide-react';

/**
 * Branded 404 body, without site chrome.
 *
 * Rendered with PageLayout by the root `not-found.tsx` (unmatched URLs render
 * in the bare root layout) and directly by `(site)/not-found.tsx` (chrome is
 * already provided by the (site) route-group layout). Keeping the chrome out of
 * here is what prevents doubled Header/Footer when notFound() fires inside the
 * (site) group.
 */
export function NotFoundContent() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-28 text-center">
      <p className="font-serif text-6xl md:text-7xl font-bold text-colonial-burgundy tracking-tight">
        404
      </p>

      <h1 className="page-heading mt-6">This thread leads nowhere</h1>

      <p className="lead-text mb-content-lg">
        The page you&apos;re looking for has come unstitched. It may have been
        moved or no longer exists.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild variant="colonial-primary" className="text-base py-2 px-5">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Link>
        </Button>
        <Button asChild variant="colonial-outline" className="text-base py-2 px-5">
          <Link href="/tapestries">
            <Compass className="mr-2 h-4 w-4" /> Browse the Tapestries
          </Link>
        </Button>
      </div>
    </section>
  );
}
