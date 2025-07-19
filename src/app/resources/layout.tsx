import type React from 'react';
import { PageLayout } from '@/components/layouts/page-layout';

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
