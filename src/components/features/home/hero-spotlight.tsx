'use client';

import { useSyncExternalStore } from 'react';
import {
  formatDateRange,
  getExhibitionSpotlight,
} from '@/lib/exhibition-dates';

/** The slice of an exhibition the hero needs; kept small for the client. */
export interface TourStop {
  name: string;
  state: string;
  startDate: string;
  endDate: string;
}

/** Calendar day in local time, e.g. "2026-10-24": stable all day long. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** The date never "changes" mid-visit in a way worth re-rendering for. */
const noSubscription = () => () => {};

/**
 * The hero's eyebrow and dates. While the tour is at a venue it reads
 * "Now showing"; between venues it reads "Coming soon" and names the next
 * one. The page is static, so the build-time answer is rendered first and
 * then recomputed against the visitor's clock — the label changes on the
 * opening and closing days without waiting for a redeploy.
 */
export function HeroSpotlight({
  stops,
  builtAt,
}: {
  stops: TourStop[];
  /** Build time (ISO). The first render uses it so server and client agree. */
  builtAt: string;
}) {
  // Today's date, read from the browser after hydration; the build date on
  // the server and during hydration, so both renders match.
  const today = useSyncExternalStore(
    noSubscription,
    () => dayKey(new Date()),
    () => dayKey(new Date(builtAt)),
  );
  const [y, m, d] = today.split('-').map(Number);
  // Midday, so a venue counts as showing for the whole of its first and last day.
  const now = new Date(y!, m! - 1, d!, 12);

  const spotlight = getExhibitionSpotlight(stops, now);
  const line = spotlight
    ? `${spotlight.kind === 'current' ? 'Now showing' : 'Coming soon'} · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
    : 'The Exhibition Tour · 2026–2028';

  return (
    <>
      <span className="eyebrow eyebrow-gold">{line}</span>
      {spotlight && (
        <p className="mt-1 font-serif text-colonial-parchment/70">
          {formatDateRange(
            spotlight.exhibition.startDate,
            spotlight.exhibition.endDate,
          )}
        </p>
      )}
    </>
  );
}
