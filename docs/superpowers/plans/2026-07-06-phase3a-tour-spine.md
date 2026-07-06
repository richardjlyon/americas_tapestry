# Phase 3a: Tour Spine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the exhibition tour the site's spine: date-aware now/next/past logic in the exhibitions lib, "Visit"-first navigation and footer, and the /exhibitions page rebuilt as a dark Night Gallery centerpiece.

**Architecture:** Pure logic lands in `src/lib/exhibitions.ts` (TDD — the only part with unit tests). The nav/footer are data-array edits. The exhibitions page and card adopt the Phase 2 vocabulary (`.eyebrow-gold`, `.gallery-heading`, `.gold-threshold`, `shadow-plate`, `colonial-frame`) on a full-page navy room. Homepage consumption of the now-on-view logic is Plan 3b, NOT this plan.

**Tech Stack:** Next 16 App Router (server components), Tailwind + Phase 2 tokens, Jest 29.

## Global Constraints

- Nav label decision (Richard, 2026-07-06): the tour page is **"Visit"** in nav; the page keeps its `/exhibitions` URL and "Exhibitions" page title.
- Phase 2 cascade trap: Tailwind UTILITY classes silently beat components-layer classes (`.gallery-heading` etc.) on the same element — never put a competing utility (e.g. `bg-white`, `font-sans`) on an element carrying a Night Gallery class.
- Exhibition body copy is still "Lorum Ipsum" — this plan must NOT render exhibition `content` anywhere (cards use frontmatter only). The two extra venues (Maryland Center for History and Culture, Atlanta History Center) stay a styled hardcoded block — no dates exist for them yet.
- Commit scope: `git add` only files named per task; the tree carries unrelated uncommitted shop WIP. Never `git add -A`.
- Verification per task: `npx tsc --noEmit` exit 0; `npx jest 2>&1 | tail -3` (12 suites/107 tests + this plan's additions); `npx next build` succeeds; dev-server visual checks as specified.
- Conventional commits ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Exhibition status logic (TDD)

**Files:**
- Modify: `src/lib/exhibitions.ts` (append after `formatDateRange`)
- Test: `src/__tests__/exhibition-status.test.ts` (create)

**Interfaces:**
- Produces:
  - `type ExhibitionStatus = 'current' | 'upcoming' | 'past'`
  - `getExhibitionStatus(exhibition: Pick<Exhibition, 'startDate' | 'endDate'>, now?: Date): ExhibitionStatus`
  - `groupExhibitionsByStatus(exhibitions: Exhibition[], now?: Date): { current: Exhibition[]; upcoming: Exhibition[]; past: Exhibition[] }` — current & upcoming ascending by start, past DESCENDING (most recent first).
- Consumes: existing `hasDay()` (module-private, same file) and `Exhibition`.

Key date semantics (this is the point of the task): an exhibition is `current` through the END of its end date. Month-precision end dates ("December 2026") parse as the 1st — they must count through the LAST day of that month. Day-precision end dates count through 23:59:59 of that day.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/exhibition-status.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — they must FAIL (functions don't exist)**

Run: `npx jest exhibition-status -v`
Expected: FAIL — `getExhibitionStatus` is not exported.

- [ ] **Step 3: Implement**

Append to `src/lib/exhibitions.ts` (after `formatDateRange`):

```typescript
export type ExhibitionStatus = 'current' | 'upcoming' | 'past';

/**
 * The moment an exhibition stops being "on view": the end of its end date.
 * Month-precision dates ("December 2026") parse as the 1st, so they roll to
 * the end of that month; day-precision dates count through 23:59:59.999.
 */
function exhibitionEndBound(endDate: string): Date {
  const end = new Date(endDate);
  if (!hasDay(endDate)) {
    // Last day of the month: day 0 of the following month.
    return new Date(end.getFullYear(), end.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  return new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    23,
    59,
    59,
    999,
  );
}

/** Whether an exhibition is on view now, still to come, or finished. */
export function getExhibitionStatus(
  exhibition: Pick<Exhibition, 'startDate' | 'endDate'>,
  now: Date = new Date(),
): ExhibitionStatus {
  if (now < new Date(exhibition.startDate)) return 'upcoming';
  if (now > exhibitionEndBound(exhibition.endDate)) return 'past';
  return 'current';
}

/**
 * Split exhibitions into on-view / coming / finished groups for the tour
 * page. Current and upcoming are ordered soonest-first; past is ordered
 * most-recently-closed-first.
 */
export function groupExhibitionsByStatus(
  exhibitions: Exhibition[],
  now: Date = new Date(),
): { current: Exhibition[]; upcoming: Exhibition[]; past: Exhibition[] } {
  const byStart = (a: Exhibition, b: Exhibition) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

  const current = exhibitions
    .filter((e) => getExhibitionStatus(e, now) === 'current')
    .sort(byStart);
  const upcoming = exhibitions
    .filter((e) => getExhibitionStatus(e, now) === 'upcoming')
    .sort(byStart);
  const past = exhibitions
    .filter((e) => getExhibitionStatus(e, now) === 'past')
    .sort((a, b) => byStart(b, a));

  return { current, upcoming, past };
}
```

- [ ] **Step 4: Run tests — all pass; then the full suite**

Run: `npx jest exhibition-status -v` → all pass.
Run: `npx jest 2>&1 | tail -3` → 13 suites, 115 tests.
Run: `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exhibitions.ts src/__tests__/exhibition-status.test.ts
git commit -m "feat(exhibitions): date-aware current/upcoming/past status logic

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: "Visit"-first navigation and footer

**Files:**
- Modify: `src/components/layout/header.tsx:10-19` (navigationItems array only)
- Modify: `src/components/layout/footer.tsx:24-58` (Quick Links arrays only)

**Interfaces:** none new. INTENDED VISUAL CHANGE: nav order/labels; footer gains Visit + Gallery.

- [ ] **Step 1: Reorder the header nav**

Replace the `navigationItems` array in `header.tsx` with:

```tsx
const navigationItems = [
  { name: 'Visit', href: '/exhibitions' },
  { name: 'Tapestries', href: '/tapestries' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Shop', href: '/shop' },
  { name: 'News', href: '/news' },
  { name: 'About', href: '/about' },
  { name: 'Team', href: '/team' },
  { name: 'Sponsors', href: '/sponsors' },
  { name: 'Contact', href: '/contact' },
];
```

(Visitor tasks first — Visit/Tapestries/Gallery/Shop; institutional pages demoted. 9 items; both desktop and mobile menus consume this array, so one edit covers both.)

- [ ] **Step 2: Update the footer Quick Links**

In `footer.tsx`, replace the two hardcoded link arrays with:

```tsx
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Visit', href: '/exhibitions' },
                  { name: 'Tapestries', href: '/tapestries' },
                  { name: 'Gallery', href: '/gallery' },
                  { name: 'Shop', href: '/shop' },
                ].map((item) => (
```

for the first column and

```tsx
                {[
                  { name: 'News', href: '/news' },
                  { name: 'About', href: '/about' },
                  { name: 'Team', href: '/team' },
                  { name: 'Sponsors', href: '/sponsors' },
                  { name: 'Contact', href: '/contact' },
                ].map((item) => (
```

for the second (5 + 5; the surrounding JSX is unchanged).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green.
Dev-server: nav reads Visit · Tapestries · Gallery · Shop · News · About · Team · Sponsors · Contact at xl width; all 9 links work (Gallery loads the 3D walk-through — chrome-free full-screen is expected); footer shows both columns; mobile menu lists all 9.
Note: if 9 items crowd the xl nav, that is ACCEPTABLE for now (they fit at 2xl); flag actual overflow/wrapping in your report rather than changing breakpoints unilaterally.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/footer.tsx
git commit -m "feat(nav): Visit-first navigation; Gallery joins nav and footer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Exhibitions page as the dark tour centerpiece

**Files:**
- Modify: `src/app/(site)/exhibitions/page.tsx` (full rewrite below)
- Modify: `src/components/features/exhibitions/exhibition-card.tsx` (full rewrite below)

**Interfaces:**
- Consumes: Task 1's `groupExhibitionsByStatus`; Phase 2 classes `.eyebrow`, `.eyebrow-gold`, `.gold-threshold`, `.gallery-heading`, `.gallery-lead`, token `shadow-plate`; `formatDateRange`.
- Produces: `ExhibitionCard({ exhibition, featured? })` — `featured` renders the larger on-view-now treatment.

INTENDED VISUAL CHANGE: /exhibitions becomes a full dark navy room.

- [ ] **Step 1: Check the (site) layout wrapper**

Read `src/app/(site)/layout.tsx`. If it wraps children in a `<main>` with a background/texture class or top padding, note it: the page below must present as a continuous dark room, so the page's OWN root section carries `bg-colonial-navy` and enough vertical padding; a textured `<main>` background may show at the very edges — acceptable if minor (flag in report), but if `<main>` forces a light container around everything, wrap the page content in a single full-bleed `<div className="bg-colonial-navy">` instead of relying on PageSection.

- [ ] **Step 2: Rewrite the card**

Replace `src/components/features/exhibitions/exhibition-card.tsx`:

```tsx
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  /** Larger treatment for the venue currently on view. */
  featured?: boolean;
}

/**
 * A tour venue, presented as a plate in the Night Gallery. The featured
 * variant (the venue on view now) gets a taller image and stronger presence.
 */
export function ExhibitionCard({
  exhibition,
  featured = false,
}: ExhibitionCardProps) {
  return (
    <div
      className={
        featured
          ? 'overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate-lg'
          : 'flex flex-col overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate transition-shadow hover:shadow-plate-lg md:h-[224px] md:flex-row'
      }
    >
      <div
        className={
          featured
            ? 'relative h-64 w-full md:h-80'
            : 'relative h-48 w-full flex-shrink-0 md:h-[224px] md:w-[224px]'
        }
      >
        <Image
          src={getImagePath(exhibition.imagePath)}
          alt={`${exhibition.name} venue`}
          fill
          sizes={
            featured ? '(min-width: 1024px) 56rem, 100vw' : getImageSizes('thumbnail')
          }
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <span className="eyebrow eyebrow-gold">
          {formatDateRange(exhibition.startDate, exhibition.endDate)}
        </span>
        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-colonial-parchment/60">
          {exhibition.state}
        </p>
        <h3
          className={`gallery-heading mt-1 ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
        >
          {exhibition.name}
        </h3>
        <p className="mt-2 text-sm text-colonial-parchment/60">
          {exhibition.address}
        </p>
        {exhibition.moreInfo && (
          <div className="mt-auto pt-4">
            <a
              href={exhibition.moreInfo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
            >
              Plan your visit
              <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite the page**

Replace `src/app/(site)/exhibitions/page.tsx`:

```tsx
import {
  getAllExhibitions,
  groupExhibitionsByStatus,
} from '@/lib/exhibitions';
import { ExhibitionCard } from '@/components/features/exhibitions/exhibition-card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Visit',
  description:
    "Where to see America's Tapestry on display — the venue on view now and every upcoming stop on the 2026–2028 exhibition tour.",
  path: '/exhibitions',
});

function TourSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <span className="eyebrow eyebrow-gold">{eyebrow}</span>
      <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">{title}</h2>
      <div className="gold-threshold mt-4" />
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();
  const { current, upcoming, past } = groupExhibitionsByStatus(exhibitions);

  return (
    <div className="bg-colonial-navy">
      <div className="container mx-auto space-y-16 py-16 md:space-y-20 md:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Exhibition Tour</span>
          <h1 className="gallery-heading mt-3 text-4xl md:text-5xl">
            See America&rsquo;s Tapestry
          </h1>
          <p className="gallery-lead mx-auto mt-4">
            All thirteen panels are touring the original colonies through
            2028. Find the gallery nearest you.
          </p>
        </header>

        {current.length > 0 && (
          <TourSection eyebrow="On view now" title="Now showing">
            {current.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.slug}
                exhibition={exhibition}
                featured
              />
            ))}
          </TourSection>
        )}

        {upcoming.length > 0 && (
          <TourSection eyebrow="Coming next" title="Upcoming venues">
            {upcoming.map((exhibition) => (
              <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
            ))}
          </TourSection>
        )}

        <section className="mx-auto w-full max-w-4xl">
          <p className="gallery-lead">
            Additional confirmed venues include{' '}
            <a
              href="https://www.mdhistory.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-colonial-gold hover:text-colonial-gold/80"
            >
              the Maryland Center for History and Culture
            </a>{' '}
            and{' '}
            <a
              href="https://www.atlantahistorycenter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-colonial-gold hover:text-colonial-gold/80"
            >
              the Atlanta History Center
            </a>
            . Dates will be announced here.
          </p>
        </section>

        {past.length > 0 && (
          <TourSection eyebrow="The story so far" title="Past venues">
            {past.map((exhibition) => (
              <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
            ))}
          </TourSection>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green.
Dev-server `/exhibitions`: full navy room; Muscarelle featured under "Now showing" (through Sept 6 2026); five venues under "Upcoming venues" in date order; extra-venues line in cream with gold links; no "Past venues" section yet (nothing has closed); date ranges formatted as before; every "Plan your visit" link opens the venue site. Check the page top/bottom edges against the (site) layout finding from Step 1 — flag any light seam in your report.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/exhibitions/page.tsx" src/components/features/exhibitions/exhibition-card.tsx
git commit -m "feat(exhibitions): dark tour centerpiece with now/next/past grouping

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Dropped/deferred (with reason)

- **Hours/admission/directions per venue** — no such data exists in frontmatter; needs Richard to supply per venue (alongside the Lorem Ipsum body copy). The card design leaves room; add fields when data arrives.
- **Tour map** — spec listed it as a follow-on; defer until per-venue data lands.
- **Promoting the two extra venues to content entries** — impossible without dates; kept as styled prose.
- **Homepage "Now on view" hero** — Plan 3b (consumes Task 1's logic).

## Final verification (after Task 3)

1. Gates green (tsc / jest incl. new suite / build).
2. Dev-server pass: /exhibitions (dark centerpiece), nav + footer (Visit first, Gallery present), /gallery reachable from nav, no other pages changed.
