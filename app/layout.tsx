import type React from 'react';
import '@/app/globals.css';
import { Montserrat, EB_Garamond } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { DebugHelper } from '@/components/debug-helper';

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

export const metadata = {
  title: "America's Tapestry",
  description:
    'A visual exploration of cultural diversity across the American landscape',
  generator: 'v0.dev',
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
          <DebugHelper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
