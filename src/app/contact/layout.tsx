import type React from 'react';
import { PageLayout } from '@/components/layout/page-layout';

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
