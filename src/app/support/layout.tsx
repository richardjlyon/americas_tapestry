import type React from 'react';
import PageLayout from '@/app/page-layout';

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
