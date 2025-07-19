import type React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SiteBreadcrumb } from '@/components/ui/site-breadcrumb';

interface PageLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function PageLayout({
  children,
  fullWidth = false,
}: PageLayoutProps) {
  return (
    <>
      <Header />
      <SiteBreadcrumb />
      <main className="flex-1 woven-linen content-spacing-sm">{children}</main>
      <Footer />
    </>
  );
}