import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

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
      <main className="flex-1 pt-20 md:pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
