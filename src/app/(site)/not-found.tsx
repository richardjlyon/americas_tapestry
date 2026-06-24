import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/layout/not-found-content';

export const metadata: Metadata = {
  title: 'Page Not Found — America’s Tapestry',
  robots: { index: false, follow: false },
};

// Handles notFound() thrown by any page inside the (site) route group. The
// (site) layout already provides the Header/breadcrumb/Footer chrome, so this
// renders the bare 404 body to avoid doubling it.
export default function SiteNotFound() {
  return <NotFoundContent />;
}
