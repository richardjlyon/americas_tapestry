# Stitcher Pages — Design Spec

Date: 2026-06-20
Status: Approved (pending spec review)
Working/recovery file: `2026-06-20-stitchers-pages-plan.md`

## Goal

Document every volunteer ("stitcher") for America's Tapestry by adding:

1. **Per-state stitcher pages** reached from a new chip on each tapestry's
   "The Team Behind the Tapestry" grid.
2. **A single aggregate stitcher page** reached from a second chip on the same grid.

Source of truth: `/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx`.

## Confirmed Decisions

| Decision | Choice |
|---|---|
| Asterisks on names | **Strip entirely** (no markers, no legend) |
| Name layout | **Comma-separated flowing paragraph** |
| URL structure | **`/stitchers` (aggregate) + `/stitchers/[state]` (per-state)** |
| Per-state chip label | **"Meet the {State} Stitchers"** (e.g. "Meet the Connecticut Stitchers") |
| Aggregate chip label | **"Meet all of the stitchers"** |
| Aggregate dedupe | **Dedupe + sort alphabetically by last name** per section |
| Data pipeline | **One-time Node script → committed JSON** |

## Spreadsheet Structure (confirmed)

13 state tabs (exact state names) plus "State Directors" and "Summary" tabs.
Each state tab:
- Row 0: legend `* Stitchers marked with an asterisk have contributed to more than one panel.`
- Row 2: title `AMERICA'S TAPESTRY — <STATE> PANEL VOLUNTEERS`
- Row 3: header `#, First Name, Last Name, Category, Notes`
- Section markers in col A: `▶  STATE DIRECTOR(S)`, `▶  CORE VOLUNTEERS`, `▶  GUEST VOLUNTEERS`
- Data rows: `#, First, Last, Category, Notes`. Names may carry trailing `*`.

Counts per state (Directors / Core / Guest):
CT 1/8/161, DE 2/5/550, GA 1/6/8, MD 5/29/79, MA 1/5/27, NH 2/18/60,
NJ 2/5/101, NY 1/13/44, NC 1/9/124, PA 2/24/242, RI 1/5/164, SC 1/27/100, VA 1/5/112.

## Architecture

### 1. Build script — `scripts/build-stitchers.py`

A standalone, re-runnable Python script (matches existing
`scripts/generate-audio-descriptions.py`). Python chosen over Node because
`openpyxl` is already available and the SheetJS `xlsx` npm package is no longer
on the public npm registry (adding it would break `npm install`).

- Reads the xlsx (path configurable, defaults to the Downloads file; accept override
  via `sys.argv[1]`).
- Uses `openpyxl` (already installed).
- For each of the 13 state tabs:
  - Walk rows, tracking the current `▶` section marker.
  - For each data row (col A is a digit), build `"<First> <Last>"`.
  - Strip trailing `*` and surrounding whitespace from the assembled name.
  - Dedupe within each section (case-insensitive compare, keep first spelling).
- Emit `src/lib/data/stitchers.json`:
  ```json
  { "states": [
    { "slug": "connecticut", "name": "Connecticut",
      "stateDirectors": ["Laura Kasowitz"],
      "coreVolunteers": ["..."],
      "guestVolunteers": ["..."] }
  ] }
  ```
- `slug = name.toLowerCase().replace(/\s+/g, '-')`.
- Log per-state counts so output can be eyeballed against the table above.

### 2. Data access — `src/lib/stitchers.ts`

Imports `stitchers.json` and exposes typed helpers:

```ts
export interface StateStitchers {
  slug: string;
  name: string;
  stateDirectors: string[];
  coreVolunteers: string[];
  guestVolunteers: string[];
}
```

- `getAllStateSlugs(): { state: string }[]` — for `generateStaticParams`.
- `getStateStitchers(slug: string): StateStitchers | null` — one state, each
  section sorted by last name.
- `getAggregatedStitchers(): Omit<StateStitchers, 'slug' | 'name'>` — merge all
  states, dedupe (case-insensitive) + sort by last name within each section.

Last-name sort key: last whitespace-delimited token of the name.

### 3. Presentational component — `src/components/features/stitchers/stitcher-sections.tsx`

```tsx
interface StitcherSectionsProps {
  stateDirectors: string[];
  coreVolunteers: string[];
  guestVolunteers: string[];
}
```

Renders up to three sections, plain text, no chrome:
- Bold group name (`State Directors`, `Core Volunteers`, `Guest Volunteers`).
- Next line: names joined with `, `.
- A section with zero names is omitted.

Server component (no interactivity).

### 4. Routes

- `src/app/stitchers/[state]/page.tsx`
  - `generateStaticParams` from `getAllStateSlugs()`.
  - `getStateStitchers(state)`; `notFound()` if null.
  - H1 `"{name} Stitchers"`, then `<StitcherSections>`.
- `src/app/stitchers/page.tsx`
  - H1 `"All Stitchers"`, then `<StitcherSections>` from `getAggregatedStitchers()`.

Both use the existing page layout primitives (`PageSection` / `ReadingContainer`)
to stay visually consistent while keeping the list itself unadorned.

### 5. Team grid chips — `src/components/features/tapestries/team-card.tsx`

- Add prop `stateSlug: string`.
- After the mapped member chips, append two CTA chips that reuse the same
  `Link` + `Card` sizing as member chips:
  - Circular frame containing a centered `Users` icon from `lucide-react`
    (in place of the portrait), a bold label, and a `→` affordance.
  - Per-state: label `Meet the {stateName} Stitchers` → `/stitchers/{stateSlug}`.
  - Aggregate: label `Meet all of the stitchers` → `/stitchers`.
- A small internal helper component renders a CTA chip (label + href) to avoid
  duplication.

Update the call site in `src/app/tapestries/[slug]/page.tsx` to pass
`stateSlug={tapestry.slug}`. Because the chip href uses the actual tapestry slug,
the per-state link is guaranteed to match the route; the JSON slug scheme is
verified to agree during testing.

## Out of Scope / YAGNI

- No empty-state handling (all 13 states have data).
- No search/filter on the lists.
- No photos or per-person links on the stitcher pages.
- No runtime xlsx parsing; JSON is committed.

## Verification

1. Run `python3 scripts/build-stitchers.py`; confirm logged counts match the table
   (e.g. Connecticut 1/8/161) and JSON exists.
2. Grep `stitchers.json` for `*` → none in names.
3. `npm run build` succeeds; `/stitchers` and every `/stitchers/<state>` prerender.
4. Visit a tapestry page (e.g. Connecticut): two new chips appear at the end of
   the team grid and navigate correctly.
5. Confirm `/stitchers` sections are deduped + alphabetical by last name.

## Implementation Order

1. `scripts/build-stitchers.py` → generate `stitchers.json`; verify counts.
2. `src/lib/stitchers.ts`.
3. `stitcher-sections.tsx`.
4. Routes `/stitchers` and `/stitchers/[state]`.
5. CTA chips in `team-card.tsx` + pass `stateSlug` from tapestry page.
6. Build + verify.
