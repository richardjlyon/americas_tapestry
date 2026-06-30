// exhibitions.ts transitively imports markdown.ts, which pulls in ESM-only
// packages Jest can't transform. The date formatter doesn't use it, so stub it.
jest.mock('@/lib/markdown', () => ({ extractExcerpt: () => '' }));

import { formatDateRange } from '@/lib/exhibitions';

describe('formatDateRange', () => {
  it('shows the day when both source dates carry one (same year)', () => {
    expect(formatDateRange('19 June 2026', '6 September 2026')).toBe(
      '19 June – 6 September 2026',
    );
  });

  it('shows the day for a same-month range', () => {
    expect(formatDateRange('12 September 2026', '27 September 2026')).toBe(
      '12 September – 27 September 2026',
    );
  });

  it('omits the day for month-only dates (same year)', () => {
    expect(formatDateRange('October 2026', 'December 2026')).toBe(
      'October – December 2026',
    );
  });

  it('shows the year on both ends when a month-only range crosses years', () => {
    expect(formatDateRange('November 2027', 'February 2028')).toBe(
      'November 2027 – February 2028',
    );
  });
});
