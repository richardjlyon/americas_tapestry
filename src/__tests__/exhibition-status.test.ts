jest.mock('@/lib/markdown', () => ({ extractExcerpt: () => '' }));

import {
  getExhibitionStatus,
  groupExhibitionsByStatus,
} from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

const ex = (startDate: string, endDate: string) =>
  ({ startDate, endDate }) as Exhibition;

describe('getExhibitionStatus', () => {
  const JULY_6_2026 = new Date('2026-07-06T12:00:00');

  it('is current while today is inside the range', () => {
    expect(
      getExhibitionStatus(ex('19 June 2026', '6 September 2026'), JULY_6_2026),
    ).toBe('current');
  });

  it('is upcoming before the start date', () => {
    expect(
      getExhibitionStatus(ex('12 September 2026', '27 September 2026'), JULY_6_2026),
    ).toBe('upcoming');
  });

  it('is past after the end date', () => {
    expect(
      getExhibitionStatus(
        ex('19 June 2026', '6 September 2026'),
        new Date('2026-09-07T00:00:01'),
      ),
    ).toBe('past');
  });

  it('stays current through the whole end day (day-precision)', () => {
    expect(
      getExhibitionStatus(
        ex('19 June 2026', '6 September 2026'),
        new Date('2026-09-06T21:00:00'),
      ),
    ).toBe('current');
  });

  it('month-precision end date counts through the END of that month', () => {
    const octToDec = ex('October 2026', 'December 2026');
    expect(getExhibitionStatus(octToDec, new Date('2026-12-15T12:00:00'))).toBe(
      'current',
    );
    expect(getExhibitionStatus(octToDec, new Date('2026-12-31T20:00:00'))).toBe(
      'current',
    );
    expect(getExhibitionStatus(octToDec, new Date('2027-01-01T08:00:00'))).toBe(
      'past',
    );
  });

  it('month-precision start date counts from the 1st of that month', () => {
    expect(
      getExhibitionStatus(
        ex('October 2026', 'December 2026'),
        new Date('2026-10-01T09:00:00'),
      ),
    ).toBe('current');
  });
});

describe('groupExhibitionsByStatus', () => {
  const JULY_6_2026 = new Date('2026-07-06T12:00:00');
  const a = { ...ex('19 June 2026', '6 September 2026'), slug: 'muscarelle' };
  const b = { ...ex('12 September 2026', '27 September 2026'), slug: 'seton' };
  const c = { ...ex('November 2027', 'February 2028'), slug: 'nysm' };
  const d = { ...ex('1 January 2026', '1 February 2026'), slug: 'older' };
  const e = { ...ex('1 March 2026', '1 April 2026'), slug: 'newer' };

  it('groups and orders: current/upcoming ascending, past most-recent-first', () => {
    const groups = groupExhibitionsByStatus(
      [c, e, a, d, b] as Exhibition[],
      JULY_6_2026,
    );
    expect(groups.current.map((x) => x.slug)).toEqual(['muscarelle']);
    expect(groups.upcoming.map((x) => x.slug)).toEqual(['seton', 'nysm']);
    expect(groups.past.map((x) => x.slug)).toEqual(['newer', 'older']);
  });
});
