import type React from 'react';
import { PageLayout } from '@/components/layout/page-layout';

/**
 * Shared layout for all standard site pages — wraps content in the site
 * chrome (Header, breadcrumb, Footer) via PageLayout. The route group does
 * not affect URLs. Chrome-less routes (e.g. the immersive /gallery) and the
 * not-found/error boundaries live outside this group.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
