import type React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SiteBreadcrumb } from '@/components/ui/site-breadcrumb';
interface PageLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageLayout({
  children,
  fullWidth = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* The header is fixed positioned, so we need margin-top to prevent overlap */}
      <div className="mt-16 md:mt-20">
        <SiteBreadcrumb />
      </div>
      <main className="flex-1 pt-4 md:pt-6">{children}</main>
      <Footer />
    </div>
  );
}
