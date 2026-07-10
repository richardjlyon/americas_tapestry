import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Montserrat, EB_Garamond } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Analytics } from '@vercel/analytics/react';
import { MatomoAnalytics } from '@/components/shared/matomo-analytics';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo';

// Load Montserrat as the sans-serif font
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Load EB Garamond as the serif font from Google Fonts instead of local
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Plain default title (no template): per-page helpers return fully-formed
  // titles already ending in the site name, so a template would double-suffix.
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${montserrat.variable} ${ebGaramond.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
        <MatomoAnalytics />
      </body>
    </html>
  );
}
