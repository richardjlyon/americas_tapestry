import {
  lastName,
  sortByLastName,
  dedupeNames,
  getAllStateSlugs,
  getStateStitchers,
  getAggregatedStitchers,
} from '@/lib/stitchers';

describe('stitchers helpers', () => {
  it('extracts the last whitespace-delimited token as the last name', () => {
    expect(lastName('Laura Kasowitz')).toBe('Kasowitz');
    expect(lastName('Beverly Army Williams')).toBe('Williams');
    expect(lastName('Cher')).toBe('Cher');
  });

  it('sorts by last name, then full name', () => {
    expect(sortByLastName(['Erin Vogel', 'Erin Lein', 'Allison Morse'])).toEqual([
      'Erin Lein',
      'Allison Morse',
      'Erin Vogel',
    ]);
  });

  it('dedupes case-insensitively, keeping the first spelling', () => {
    expect(dedupeNames(['Amy Bieniek', 'amy bieniek', 'Natalie Bieniek'])).toEqual([
      'Amy Bieniek',
      'Natalie Bieniek',
    ]);
  });
});

describe('stitchers data access', () => {
  it('exposes a slug for every state', () => {
    const slugs = getAllStateSlugs();
    expect(slugs).toContainEqual({ state: 'connecticut' });
    expect(slugs).toContainEqual({ state: 'new-hampshire' });
    expect(slugs).toHaveLength(13);
  });

  it('returns one state sorted by last name', () => {
    const ct = getStateStitchers('connecticut');
    expect(ct?.name).toBe('Connecticut');
    expect(ct?.stateDirectors).toEqual(['Laura Kasowitz']);
    expect(ct?.coreVolunteers).toHaveLength(8);
    // sorted by last name
    expect(ct?.coreVolunteers[0]).toBe('Elizabeth Hinterkeuser');
  });

  it('returns null for an unknown slug', () => {
    expect(getStateStitchers('atlantis')).toBeNull();
  });

  it('aggregates, dedupes, and sorts across all states', () => {
    const all = getAggregatedStitchers();
    // Guest volunteers aggregate is large and deduped
    expect(all.guestVolunteers.length).toBeGreaterThan(1000);
    expect(new Set(all.guestVolunteers.map((n) => n.toLowerCase())).size).toBe(
      all.guestVolunteers.length,
    );
    // sorted by last name
    const lasts = all.stateDirectors.map(lastName);
    expect([...lasts]).toEqual([...lasts].sort((a, b) => a.localeCompare(b)));
  });
});
