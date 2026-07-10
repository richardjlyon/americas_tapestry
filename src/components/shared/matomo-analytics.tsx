'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Self-hosted Matomo (cookieless — no consent banner required).
const MATOMO_URL = 'https://stats.kwlan.net/';
const MATOMO_SITE_ID = '1';

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export function MatomoAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    const _paq = (window._paq = window._paq || []);
    if (!initialized.current) {
      initialized.current = true;
      _paq.push(['disableCookies']);
      _paq.push(['enableLinkTracking']);
      _paq.push(['setTrackerUrl', `${MATOMO_URL}matomo.php`]);
      _paq.push(['setSiteId', MATOMO_SITE_ID]);
      const script = document.createElement('script');
      script.async = true;
      script.src = `${MATOMO_URL}matomo.js`;
      document.head.appendChild(script);
      _paq.push(['trackPageView']);
    } else {
      // Client-side navigation: report the new route as a page view.
      _paq.push(['setCustomUrl', window.location.href]);
      _paq.push(['setDocumentTitle', document.title]);
      _paq.push(['trackPageView']);
    }
  }, [pathname]);

  return null;
}
