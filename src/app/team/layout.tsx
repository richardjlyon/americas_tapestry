import type React from 'react';
import { PageLayout } from '@/components/layouts/page-layout';

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
