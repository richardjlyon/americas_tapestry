'use client';

import { ErrorContent } from '@/components/layout/error-content';

// Handles errors thrown by any page inside the (site) route group. The (site)
// layout already provides chrome, so this renders the bare error body to avoid
// doubling it.
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent error={error} reset={reset} />;
}
