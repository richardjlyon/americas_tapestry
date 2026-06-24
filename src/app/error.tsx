'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { ErrorContent } from '@/components/layout/error-content';

// Root error boundary: catches errors outside the (site) group (e.g. /gallery),
// which render in the bare root layout, so it supplies its own chrome. Errors
// thrown inside the (site) group are handled by (site)/error.tsx instead.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageLayout>
      <ErrorContent error={error} reset={reset} />
    </PageLayout>
  );
}
