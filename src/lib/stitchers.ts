import data from './data/stitchers.json';

export interface StateStitchers {
  slug: string;
  name: string;
  stateDirectors: string[];
  coreVolunteers: string[];
  guestVolunteers: string[];
}

type Sections = Pick<
  StateStitchers,
  'stateDirectors' | 'coreVolunteers' | 'guestVolunteers'
>;

const states = (data as { states: StateStitchers[] }).states;

export function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? '';
}

export function sortByLastName(names: string[]): string[] {
  return [...names].sort(
    (a, b) => lastName(a).localeCompare(lastName(b)) || a.localeCompare(b),
  );
}

export function dedupeNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}

export function getAllStateSlugs(): { state: string }[] {
  return states.map((s) => ({ state: s.slug }));
}

export function getStateStitchers(slug: string): StateStitchers | null {
  const state = states.find((s) => s.slug === slug);
  if (!state) return null;
  return {
    slug: state.slug,
    name: state.name,
    stateDirectors: sortByLastName(state.stateDirectors),
    coreVolunteers: sortByLastName(state.coreVolunteers),
    guestVolunteers: sortByLastName(state.guestVolunteers),
  };
}

export function getAggregatedStitchers(): Sections {
  const merge = (key: keyof Sections): string[] =>
    sortByLastName(dedupeNames(states.flatMap((s) => s[key])));
  return {
    stateDirectors: merge('stateDirectors'),
    coreVolunteers: merge('coreVolunteers'),
    guestVolunteers: merge('guestVolunteers'),
  };
}
