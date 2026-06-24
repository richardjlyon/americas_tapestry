'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the browser console / monitoring for diagnosis.
    console.error(error);
  }, [error]);

  return (
    <PageLayout>
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="page-heading">Something came apart at the seams</h1>

        <p className="lead-text mb-content-lg">
          An unexpected error occurred while loading this page. Please try again
          — if the problem persists, return home and explore from there.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={reset}
            variant="colonial-primary"
            className="text-base py-2 px-5"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="colonial-outline" className="text-base py-2 px-5">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
