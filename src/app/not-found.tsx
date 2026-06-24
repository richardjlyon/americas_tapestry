import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/page-layout';
import { NotFoundContent } from '@/components/layout/not-found-content';

export const metadata: Metadata = {
  title: 'Page Not Found — America’s Tapestry',
  robots: { index: false, follow: false },
};

// Root not-found: catches unmatched URLs, which render in the bare root layout,
// so it supplies its own chrome via PageLayout. notFound() thrown inside the
// (site) route group is handled by (site)/not-found.tsx instead.
export default function NotFound() {
  return (
    <PageLayout>
      <NotFoundContent />
    </PageLayout>
  );
}
