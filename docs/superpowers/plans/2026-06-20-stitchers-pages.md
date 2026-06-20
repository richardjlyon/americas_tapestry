# Stitcher Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Post-implementation revision (shipped, master `ba476ba`):** Task 5 below
> appends *two* chips to the tapestry team grid. As shipped, only the **per-state**
> chip stays on the tapestry grid; the **aggregate** "Meet all of the stitchers"
> chip was moved to the `/team/stitchers` group page (rendered in
> `src/components/features/team/group-content.tsx`, stitchers group only, below the
> member cards). The chip markup was extracted to a shared component
> `src/components/features/stitchers/stitcher-link-card.tsx`, and a new
> `src/app/stitchers/layout.tsx` (wrapping `PageLayout`) was added so the stitcher
> routes render the site header/footer. See the design spec for the as-built detail.

**Goal:** Add per-state and aggregate "stitcher" pages listing every volunteer, reachable from two new chips on each tapestry's "Team Behind the Tapestry" grid.

**Architecture:** A one-time Python script parses the master xlsx into a committed `stitchers.json`. A small lib reads/transforms it. A shared server component renders three plain-text sections. Two static routes (`/stitchers`, `/stitchers/[state]`) render those sections. Two CTA chips are appended to the existing `TeamCard` grid.

**Tech Stack:** Next.js App Router (static export), TypeScript, Tailwind, Jest (next/jest, jsdom), Python 3 + openpyxl (build-time only), lucide-react.

## Global Constraints

- Stitcher list rendering is **plain text, no chrome or adornment**: bold group name, then names on the next line.
- Names are listed **comma-separated in a flowing paragraph**.
- All trailing `*` **and** `•` annotation markers are **stripped** from names; no legend anywhere.
- Affiliation/title-prefixed and note-annotated name cells (chiefly Delaware) are cleaned via an owner-approved `NAME_OVERRIDES` map in the build script: drop org affiliations, drop personal titles, drop note-style parentheticals, keep alternate-surname parentheticals.
- Per-state chip label: exactly `Meet the {State} Stitchers` (e.g. `Meet the Connecticut Stitchers`).
- Aggregate chip label: exactly `Meet all of the stitchers`.
- Aggregate page: **dedupe (case-insensitive) + sort by last name** within each section.
- State slug scheme: `name.toLowerCase().replace(/\s+/g, '-')` — matches existing tapestry slugs (`connecticut`, `new-hampshire`, …).
- Section labels (display): `State Directors`, `Core Volunteers`, `Guest Volunteers`.
- Source xlsx: `/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx`. The 13 state tabs each use `▶  STATE DIRECTOR(S)`, `▶  CORE VOLUNTEERS`, `▶  GUEST VOLUNTEERS` markers in column A; data rows have a digit in column A, First Name in col B, Last Name in col C.
- Expected counts (Directors/Core/Guest) after dedupe + cleanup: CT 1/8/161, DE 2/5/549 (raw 550; cleanup reveals one duplicate — Beth Bowersock), GA 1/6/8, MD 5/29/79, MA 1/5/27, NH 2/18/60, NJ 2/5/101, NY 1/13/44, NC 1/9/124, PA 2/24/242, RI 1/5/164, SC 1/27/100, VA 1/5/112.

---

## File Structure

- Create: `scripts/build-stitchers.py` — parse xlsx → JSON (build-time, re-runnable).
- Create: `src/lib/data/stitchers.json` — committed generated data.
- Create: `src/lib/stitchers.ts` — typed data access + pure transform helpers.
- Create: `src/__tests__/stitchers.test.ts` — unit tests for the pure helpers.
- Create: `src/components/features/stitchers/stitcher-sections.tsx` — presentational sections.
- Create: `src/app/stitchers/page.tsx` — aggregate page.
- Create: `src/app/stitchers/[state]/page.tsx` — per-state page.
- Modify: `src/components/features/tapestries/team-card.tsx` — add `stateSlug` prop + two CTA chips.
- Modify: `src/app/tapestries/[slug]/page.tsx:214-221` — pass `stateSlug={tapestry.slug}`.

---

### Task 1: Build script + generated JSON

**Files:**
- Create: `scripts/build-stitchers.py`
- Create (generated): `src/lib/data/stitchers.json`

**Interfaces:**
- Produces: `src/lib/data/stitchers.json` with shape
  `{ states: { slug, name, stateDirectors: string[], coreVolunteers: string[], guestVolunteers: string[] }[] }`.

- [ ] **Step 1: Write the build script**

Create `scripts/build-stitchers.py`:

```python
#!/usr/bin/env python3
"""Parse the America's Tapestry master spreadsheet into src/lib/data/stitchers.json.

Re-run whenever the spreadsheet changes:
    python3 scripts/build-stitchers.py [path/to/master.xlsx]
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

DEFAULT_SRC = "/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx"
OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "data" / "stitchers.json"

STATES = [
    "Connecticut", "Delaware", "Georgia", "Maryland", "Massachusetts",
    "New Hampshire", "New Jersey", "New York", "North Carolina",
    "Pennsylvania", "Rhode Island", "South Carolina", "Virginia",
]

SECTION_MAP = {
    "STATE DIRECTOR": "stateDirectors",
    "CORE VOLUNTEER": "coreVolunteers",
    "GUEST VOLUNTEER": "guestVolunteers",
}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("*", "")).strip()


def section_key(marker: str):
    upper = marker.upper()
    for needle, key in SECTION_MAP.items():
        if needle in upper:
            return key
    return None


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


def main() -> None:
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)

    states_out = []
    for state in STATES:
        ws = wb[state]
        buckets = {"stateDirectors": [], "coreVolunteers": [], "guestVolunteers": []}
        current = None
        for row in ws.iter_rows(values_only=True):
            first_cell = row[0]
            if isinstance(first_cell, str) and first_cell.strip().startswith("▶"):
                current = section_key(first_cell)
                continue
            if current and first_cell is not None and str(first_cell).strip().isdigit():
                name = clean(f"{clean(row[1])} {clean(row[2])}")
                if name:
                    buckets[current].append(name)

        # Dedupe within each section (case-insensitive, keep first spelling)
        for key, names in buckets.items():
            seen = set()
            deduped = []
            for name in names:
                lowered = name.lower()
                if lowered not in seen:
                    seen.add(lowered)
                    deduped.append(name)
            buckets[key] = deduped

        states_out.append({"slug": slugify(state), "name": state, **buckets})
        print(
            f"{state}: {len(buckets['stateDirectors'])}/"
            f"{len(buckets['coreVolunteers'])}/{len(buckets['guestVolunteers'])}"
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"states": states_out}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the script**

Run: `python3 scripts/build-stitchers.py`
Expected: 13 lines of per-state counts exactly matching the Global Constraints table (CT `1/8/161`, DE `2/5/550`, …, VA `1/5/112`), then `Wrote .../src/lib/data/stitchers.json`.

- [ ] **Step 3: Verify no asterisks leaked into the JSON**

Run: `grep -c '\*' src/lib/data/stitchers.json`
Expected: `0`

- [ ] **Step 4: Spot-check the JSON shape**

Run: `python3 -c "import json; d=json.load(open('src/lib/data/stitchers.json')); s=d['states'][0]; print(s['slug'], s['name'], s['stateDirectors'], s['coreVolunteers'][:2])"`
Expected: `connecticut Connecticut ['Laura Kasowitz'] ['Elizabeth Hinterkeuser', 'Erin Lein']`

- [ ] **Step 5: Commit**

```bash
git add scripts/build-stitchers.py src/lib/data/stitchers.json
git commit -m "feat: generate stitchers.json from master spreadsheet"
```

---

### Task 2: Data access lib + tests

**Files:**
- Create: `src/lib/stitchers.ts`
- Test: `src/__tests__/stitchers.test.ts`

**Interfaces:**
- Consumes: `src/lib/data/stitchers.json` (from Task 1).
- Produces:
  - `interface StateStitchers { slug: string; name: string; stateDirectors: string[]; coreVolunteers: string[]; guestVolunteers: string[]; }`
  - `lastName(name: string): string`
  - `sortByLastName(names: string[]): string[]`
  - `dedupeNames(names: string[]): string[]`
  - `getAllStateSlugs(): { state: string }[]`
  - `getStateStitchers(slug: string): StateStitchers | null`
  - `getAggregatedStitchers(): { stateDirectors: string[]; coreVolunteers: string[]; guestVolunteers: string[] }`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/stitchers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- stitchers`
Expected: FAIL — `Cannot find module '@/lib/stitchers'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/stitchers.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- stitchers`
Expected: PASS (all assertions green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/stitchers.ts src/__tests__/stitchers.test.ts
git commit -m "feat: add stitchers data access lib"
```

---

### Task 3: StitcherSections presentational component

**Files:**
- Create: `src/components/features/stitchers/stitcher-sections.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (pure props).
- Produces: `StitcherSections` React component with props
  `{ stateDirectors: string[]; coreVolunteers: string[]; guestVolunteers: string[] }`.

- [ ] **Step 1: Write the component**

Create `src/components/features/stitchers/stitcher-sections.tsx`:

```tsx
interface StitcherSectionsProps {
  stateDirectors: string[];
  coreVolunteers: string[];
  guestVolunteers: string[];
}

const GROUPS: { label: string; key: keyof StitcherSectionsProps }[] = [
  { label: 'State Directors', key: 'stateDirectors' },
  { label: 'Core Volunteers', key: 'coreVolunteers' },
  { label: 'Guest Volunteers', key: 'guestVolunteers' },
];

/**
 * Renders stitcher names as plain text: a bold group name followed by a
 * comma-separated paragraph of names. Empty groups are omitted.
 */
export function StitcherSections(props: StitcherSectionsProps) {
  return (
    <div className="space-y-6">
      {GROUPS.map(({ label, key }) => {
        const names = props[key];
        if (!names || names.length === 0) return null;
        return (
          <div key={key}>
            <p className="font-bold text-colonial-navy">{label}</p>
            <p className="text-colonial-navy">{names.join(', ')}</p>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check the component**

Run: `npx tsc --noEmit`
Expected: no errors referencing `stitcher-sections.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/stitchers/stitcher-sections.tsx
git commit -m "feat: add StitcherSections component"
```

---

### Task 4: Routes (`/stitchers` and `/stitchers/[state]`)

**Files:**
- Create: `src/app/stitchers/page.tsx`
- Create: `src/app/stitchers/[state]/page.tsx`

**Interfaces:**
- Consumes: `getAggregatedStitchers`, `getStateStitchers`, `getAllStateSlugs` (Task 2); `StitcherSections` (Task 3); `PageSection` (`@/components/ui/page-section`), `ReadingContainer` (`@/components/ui/reading-container`).

- [ ] **Step 1: Write the aggregate page**

Create `src/app/stitchers/page.tsx`:

```tsx
import { getAggregatedStitchers } from '@/lib/stitchers';
import { StitcherSections } from '@/components/features/stitchers/stitcher-sections';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';

export const metadata = {
  title: 'All Stitchers',
};

export default function AllStitchersPage() {
  const sections = getAggregatedStitchers();

  return (
    <>
      <h1 className="page-heading">All Stitchers</h1>
      <PageSection spacing="normal">
        <ReadingContainer width="content" background="paper">
          <StitcherSections {...sections} />
        </ReadingContainer>
      </PageSection>
    </>
  );
}
```

- [ ] **Step 2: Write the per-state page**

Create `src/app/stitchers/[state]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import {
  getAllStateSlugs,
  getStateStitchers,
} from '@/lib/stitchers';
import { StitcherSections } from '@/components/features/stitchers/stitcher-sections';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';

export function generateStaticParams() {
  return getAllStateSlugs();
}

export default async function StateStitchersPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const data = getStateStitchers(state);

  if (!data) {
    notFound();
  }

  return (
    <>
      <h1 className="page-heading">{data.name} Stitchers</h1>
      <PageSection spacing="normal">
        <ReadingContainer width="content" background="paper">
          <StitcherSections
            stateDirectors={data.stateDirectors}
            coreVolunteers={data.coreVolunteers}
            guestVolunteers={data.guestVolunteers}
          />
        </ReadingContainer>
      </PageSection>
    </>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing the new route files.

- [ ] **Step 4: Commit**

```bash
git add src/app/stitchers/page.tsx 'src/app/stitchers/[state]/page.tsx'
git commit -m "feat: add /stitchers and /stitchers/[state] routes"
```

---

### Task 5: CTA chips in the team grid

**Files:**
- Modify: `src/components/features/tapestries/team-card.tsx`
- Modify: `src/app/tapestries/[slug]/page.tsx:214-221`

**Interfaces:**
- Consumes: `TeamCard` gains required prop `stateSlug: string`.
- The tapestry page passes `stateSlug={tapestry.slug}` and `stateName={tapestry.title}` (already passed).

- [ ] **Step 1: Add `stateSlug` to the TeamCard props interface**

In `src/components/features/tapestries/team-card.tsx`, change the interface:

```tsx
interface TeamCardProps {
  stateName: string;
  stateSlug: string;
  historicalPartners?: TeamMember[] | null;
  illustrators?: TeamMember[] | null;
  stateDirectors?: TeamMember[] | null;
  stitchingGroups?: TeamMember[] | null;
  stitchers?: TeamMember[] | null;
}
```

- [ ] **Step 2: Destructure the new prop and the (now used) state name**

Replace the existing destructuring block:

```tsx
export function TeamCard({
  stateName: _stateName,
  historicalPartners,
  illustrators,
  stateDirectors,
  stitchingGroups,
  stitchers,
}: TeamCardProps) {
```

with:

```tsx
export function TeamCard({
  stateName,
  stateSlug,
  historicalPartners,
  illustrators,
  stateDirectors,
  stitchingGroups,
  stitchers,
}: TeamCardProps) {
```

- [ ] **Step 3: Add the `Users` icon import**

At the top of the file, below the existing `import { useState } from 'react';` line, add:

```tsx
import { Users } from 'lucide-react';
```

- [ ] **Step 4: Add a CTA chip helper component**

In the same file, directly above `export function TeamCard(`, add:

```tsx
function StitcherLinkCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[300px]"
    >
      <Card className="border border-colonial-parchment/60 overflow-hidden hover:shadow-md transition-shadow h-full">
        <CardContent className="pb-0 mb-0 h-full">
          <div className="flex flex-col items-center p-4 h-full">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-colonial-burgundy flex items-center justify-center bg-colonial-parchment/30">
              <Users className="w-12 h-12 text-colonial-burgundy" aria-hidden="true" />
            </div>
            <div className="text-center w-full flex-grow flex flex-col">
              <div className="flex-grow">
                <h3 className="font-sans text-lg font-bold text-colonial-burgundy">
                  {label}
                </h3>
              </div>
              <div className="mt-auto pt-4">
                <span className="inline-block text-link">View list →</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 5: Render the two CTA chips at the end of the grid**

In the returned JSX, locate the closing of the members `.map(...)` followed by the grid `</div>`:

```tsx
        ))}
      </div>
    </PageSection>
```

Replace it with (adds the two chips before the grid closes):

```tsx
        ))}

        <StitcherLinkCard
          href={`/stitchers/${stateSlug}`}
          label={`Meet the ${stateName} Stitchers`}
        />
        <StitcherLinkCard href="/stitchers" label="Meet all of the stitchers" />
      </div>
    </PageSection>
```

- [ ] **Step 6: Pass `stateSlug` from the tapestry page**

In `src/app/tapestries/[slug]/page.tsx`, update the `<TeamCard>` call (around lines 214-221):

```tsx
            <TeamCard
              stateName={tapestry.title}
              stateSlug={tapestry.slug}
              stateDirectors={stateDirectors}
              historicalPartners={historicalPartners}
              illustrators={illustrators}
              stitchingGroups={stitchingGroups}
              stitchers={stitchers}
            />
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (the previously-unused `_stateName` rename is now consumed; `stateSlug` is provided at the call site).

- [ ] **Step 8: Commit**

```bash
git add src/components/features/tapestries/team-card.tsx 'src/app/tapestries/[slug]/page.tsx'
git commit -m "feat: add stitcher CTA chips to team grid"
```

---

### Task 6: Full build + verification

**Files:** none (verification only).

- [ ] **Step 1: Run the unit tests**

Run: `npm test -- stitchers`
Expected: PASS.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds; output lists prerendered `/stitchers` and `/stitchers/[state]` (13 state params).

- [ ] **Step 3: Manual smoke (dev server)**

Run: `npm run dev`, then visit:
- `/tapestries/connecticut` — two new chips appear at the end of the team grid: "Meet the Connecticut Stitchers" and "Meet all of the stitchers".
- Click "Meet the Connecticut Stitchers" → `/stitchers/connecticut` shows bold `State Directors` (Laura Kasowitz), `Core Volunteers` (8 names), `Guest Volunteers` (161 names), comma-separated, no asterisks.
- `/stitchers` → deduped, alphabetical-by-last-name master list.

Expected: all of the above render correctly. Stop the dev server when done.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "chore: verify stitcher pages build and render"
```

---

## Self-Review

**Spec coverage:**
- Per-state page (3 sections, plain text, bold group, comma list) → Tasks 3, 4. ✓
- Aggregate page (dedupe + sort) → Tasks 2, 4. ✓
- Strip asterisks → Task 1 (`clean`) + Task 1 Step 3 grep. ✓
- Two chips with exact labels → Task 5. ✓
- URL structure `/stitchers` + `/stitchers/[state]` → Task 4. ✓
- Committed JSON via script → Task 1. ✓
- Slug matches tapestry slug → Global Constraints + Task 5 passes `tapestry.slug`. ✓

**Placeholder scan:** No TBD/TODO; every code step has full code. ✓

**Type consistency:** `getStateStitchers`/`getAggregatedStitchers`/`getAllStateSlugs` signatures match between Task 2 definition and Task 4 usage. `StitcherSections` prop names (`stateDirectors`/`coreVolunteers`/`guestVolunteers`) match between Task 3 and Task 4. `TeamCard` `stateSlug` defined in Task 5 Step 1, provided in Step 6. ✓
