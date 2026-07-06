# Phase 3b: Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a dark Night Gallery room: a static hero with a live "Now on view" spotlight, the tapestry collection as framed plates, a slimmed project strip, news, a shop strip, and a visitor-oriented contact ask — replacing the Ken-Burns carousel and creation-era sections.

**Architecture:** Spotlight selection logic lands in `src/lib/exhibitions.ts` (TDD). The page becomes one continuous `bg-colonial-navy` room composed of new/rewritten `features/home/` components using Phase 2 vocabulary. Old components (hero-carousel, about-section, vision-section) are deleted once orphaned. ISR (`revalidate = 86400`) keeps the spotlight tracking the calendar.

**Tech Stack:** Next 16 server components, Phase 2 tokens/classes, shared `FramedArtwork`, Jest 29.

## Global Constraints

- **NO 3D-gallery promotion** (Richard, 2026-07-06): the walk-through is a prototype; no "Walk the Gallery" block anywhere on the homepage. Nav/footer links (3a) are its only exposure.
- Phase 2 cascade trap: no competing font/color/bg Tailwind utilities on elements carrying `.gallery-heading` / `.gallery-lead` / `.eyebrow` (size/spacing utilities are fine).
- Hero CTA links are RELATIVE (`/exhibitions`, `/tapestries`) — the old absolute `https://www.americastapestry.com/tapestries` URL must not survive.
- Motion: CSS-only, `motion-reduce:` respected. The Ken-Burns/embla carousel goes away entirely.
- Commit scope: only files named per task; unrelated shop WIP stays uncommitted. Never `git add -A`.
- Verification per task: `npx tsc --noEmit` exit 0; `npx jest 2>&1 | tail -3` (13 suites/114 tests + additions); `npx next build` succeeds; dev-server checks as specified.
- Conventional commits ending `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Exhibition spotlight selection (TDD)

**Files:**
- Modify: `src/lib/exhibitions.ts` (append after `groupExhibitionsByStatus`)
- Test: `src/__tests__/exhibition-status.test.ts` (append a describe block)

**Interfaces:**
- Produces: `getExhibitionSpotlight(exhibitions: Exhibition[], now?: Date): { kind: 'current' | 'upcoming'; exhibition: Exhibition } | null` — the venue on view now (first current), else the next to open (first upcoming), else null.
- Consumes: Task 3a-1's `groupExhibitionsByStatus`.

- [ ] **Step 1: Append failing tests to `src/__tests__/exhibition-status.test.ts`**

```typescript
describe('getExhibitionSpotlight', () => {
  const JULY_6_2026 = new Date('2026-07-06T12:00:00');
  const current = {
    ...ex('19 June 2026', '6 September 2026'),
    slug: 'muscarelle',
  };
  const next = { ...ex('12 September 2026', '27 September 2026'), slug: 'seton' };
  const later = { ...ex('November 2027', 'February 2028'), slug: 'nysm' };
  const closed = { ...ex('1 January 2026', '1 February 2026'), slug: 'done' };

  it('prefers the venue on view now', () => {
    const spot = getExhibitionSpotlight(
      [later, next, current, closed] as Exhibition[],
      JULY_6_2026,
    );
    expect(spot).toEqual({ kind: 'current', exhibition: current });
  });

  it('falls back to the next venue to open', () => {
    const spot = getExhibitionSpotlight(
      [later, next, closed] as Exhibition[],
      new Date('2026-09-08T12:00:00'),
    );
    expect(spot?.kind).toBe('upcoming');
    expect(spot?.exhibition.slug).toBe('seton');
  });

  it('returns null when the tour is over', () => {
    expect(
      getExhibitionSpotlight([closed] as Exhibition[], JULY_6_2026),
    ).toBeNull();
  });
});
```

(`getExhibitionSpotlight` joins the existing import list at the top of the file.)

- [ ] **Step 2: Run — FAIL (not exported)**

Run: `npx jest exhibition-status -v` → the three new tests fail.

- [ ] **Step 3: Implement in `src/lib/exhibitions.ts`**

```typescript
/**
 * The single venue the homepage spotlights: on view now if any, else the
 * next to open. Null once the tour has fully concluded.
 */
export function getExhibitionSpotlight(
  exhibitions: Exhibition[],
  now: Date = new Date(),
): { kind: 'current' | 'upcoming'; exhibition: Exhibition } | null {
  const { current, upcoming } = groupExhibitionsByStatus(exhibitions, now);
  if (current[0]) return { kind: 'current', exhibition: current[0] };
  if (upcoming[0]) return { kind: 'upcoming', exhibition: upcoming[0] };
  return null;
}
```

- [ ] **Step 4: Verify**

Run: `npx jest exhibition-status -v` → 10/10 pass. `npx jest 2>&1 | tail -3` → 13 suites, 117 tests. `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exhibitions.ts src/__tests__/exhibition-status.test.ts
git commit -m "feat(exhibitions): getExhibitionSpotlight for the homepage hero

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Dark homepage

**Files:**
- Create: `src/components/features/home/gallery-hero.tsx`
- Create: `src/components/features/home/project-strip.tsx`
- Create: `src/components/features/home/shop-strip.tsx`
- Create: `src/components/features/home/tapestry-plate.tsx`
- Modify: `src/app/(site)/page.tsx` (full rewrite below)
- Modify: `src/components/features/home/latest-news-section.tsx` (heading tone only)
- Modify: `src/components/features/home/get-in-touch-section.tsx` (full rewrite below)

**Interfaces:**
- Consumes: Task 1's `getExhibitionSpotlight`; `getAllExhibitions`, `formatDateRange` from `@/lib/exhibitions`; `getAllTapestries`, `TapestryEntry` from `@/lib/tapestries`; shared `FramedArtwork`, `StitchRule`; Phase 2 classes; `SectionHeader` with `tone="dark"` (dormant since Phase 2 — first consumer); `VideoPlayer` from `@/components/shared/video-player`; `OptimizedImage`, `Button`.
- Produces: `GalleryHero({ spotlight, backdrop })`, `ProjectStrip()`, `ShopStrip()`, `TapestryPlate({ tapestry })`.

INTENDED VISUAL CHANGE: the whole homepage.

- [ ] **Step 1: `src/components/features/home/tapestry-plate.tsx`**

```tsx
import Link from 'next/link';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import type { TapestryEntry } from '@/lib/tapestries';

/** A colony panel hung in the homepage gallery: framed photo + caption. */
export function TapestryPlate({ tapestry }: { tapestry: TapestryEntry }) {
  return (
    <Link href={`/tapestries/${tapestry.slug}`} className="group block">
      <FramedArtwork
        src={tapestry.imagePath || tapestry.thumbnail}
        alt={`The ${tapestry.title} tapestry panel`}
        framed
        className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
      />
      <p className="gallery-heading mt-4 text-center text-lg">
        {tapestry.title}
      </p>
    </Link>
  );
}
```

- [ ] **Step 2: `src/components/features/home/gallery-hero.tsx`**

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/lib/exhibitions';
import type { Exhibition } from '@/lib/exhibitions';

interface GalleryHeroProps {
  spotlight: { kind: 'current' | 'upcoming'; exhibition: Exhibition } | null;
  /** Full-bleed backdrop: a fine-art tapestry photograph. */
  backdrop: { src: string; alt: string } | null;
}

/**
 * The homepage hero: a dark gallery wall with a live exhibition spotlight.
 * Static (no carousel); the backdrop is one tapestry photograph dimmed
 * behind navy glass.
 */
export function GalleryHero({ spotlight, backdrop }: GalleryHeroProps) {
  const spotlightLine = spotlight
    ? spotlight.kind === 'current'
      ? `On view now · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
      : `Opening soon · ${spotlight.exhibition.name}, ${spotlight.exhibition.state}`
    : 'The Exhibition Tour · 2026–2028';

  return (
    <section className="relative flex min-h-[75vh] items-center bg-colonial-navy">
      {backdrop && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <OptimizedImage
            src={backdrop.src}
            alt=""
            fill
            role="hero"
            className="object-cover opacity-40"
            priority
            quality={75}
            enableBlurPlaceholder
          />
          <div className="absolute inset-0 bg-gradient-to-t from-colonial-navy via-colonial-navy/60 to-colonial-navy/30" />
        </div>
      )}

      <div className="container relative mx-auto py-24 text-center">
        <span className="eyebrow eyebrow-gold">{spotlightLine}</span>
        {spotlight && (
          <p className="mt-2 font-serif text-colonial-parchment/70">
            {formatDateRange(
              spotlight.exhibition.startDate,
              spotlight.exhibition.endDate,
            )}
          </p>
        )}
        <h1 className="gallery-heading mx-auto mt-6 max-w-4xl text-5xl md:text-6xl lg:text-7xl">
          America&rsquo;s Tapestry
        </h1>
        <p className="gallery-lead mx-auto mt-6 max-w-2xl">
          Thirteen hand-embroidered panels telling the story of the original
          colonies — stitched by over a thousand volunteers, now touring the
          nation through 2028.
        </p>
        <div className="gold-threshold mx-auto mt-8" />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="colonial-gold" size="lg" className="text-base">
            <Link href="/exhibitions">Plan your visit</Link>
          </Button>
          <Link
            href="/tapestries"
            className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
          >
            Explore the tapestries
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `src/components/features/home/project-strip.tsx`** (folds About + Vision into one strip; the full story lives at /about)

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VideoPlayer } from '@/components/shared/video-player';

/** Compact project introduction: one paragraph, the documentary excerpt, a link. */
export function ProjectStrip() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div>
        <span className="eyebrow eyebrow-gold">The Project</span>
        <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
          A nation&rsquo;s story, stitched by hand
        </h2>
        <div className="gold-threshold mt-4" />
        <p className="gallery-lead mt-6">
          Created to commemorate America&rsquo;s 250th anniversary,{' '}
          <em>America&rsquo;s Tapestry</em> weaves together stories from our
          nation&rsquo;s founding. Panels were designed with historical
          organizations in each of the original colonies and stitched over 18
          months by volunteer embroiderers aged 5 to 96.
        </p>
        <Link
          href="/about"
          className="mt-6 inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
        >
          About the project
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mx-auto w-full max-w-[350px] lg:max-w-[400px]">
        <VideoPlayer
          src="https://github.com/richardjlyon/americas_tapestry/releases/download/video-assets-v1.0/250305-short-promotional-v2-lowres.mp4"
          highResSrc="https://github.com/richardjlyon/americas_tapestry/releases/download/video-assets-v1.0/250305-short-promotional-v2.mp4"
          poster="/video/250305-short-promotional/250305-short-promotional-v2-poster.png"
          className="aspect-[9/16] w-full"
        />
        <p className="mt-2 text-center font-serif text-sm italic text-colonial-parchment/60 sm:text-base">
          Documentary excerpt: &ldquo;The Making of America&rsquo;s
          Tapestry&rdquo;
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `src/components/features/home/shop-strip.tsx`** (no Shopify data dependency — links only)

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StitchRule } from '@/components/ui/stitch-rule';

/** Museum-shop strip: the book and fine-art prints, one quiet ask. */
export function ShopStrip() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="eyebrow eyebrow-gold">The Shop</span>
      <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
        Take the Tapestry home
      </h2>
      <StitchRule className="mx-auto mt-4" />
      <p className="gallery-lead mx-auto mt-6">
        The hardcover book, fine-art prints of every colony panel, and
        postcards — printed on demand and shipped to your door.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild variant="colonial-gold" size="lg" className="text-base">
          <Link href="/shop">Visit the shop</Link>
        </Button>
        <Link
          href="/shop/book"
          className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
        >
          Explore the book
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `src/components/features/home/get-in-touch-section.tsx`** (visitor ask, dark tone)

```tsx
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/section-header';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GetInTouchSection() {
  return (
    <>
      <SectionHeader
        tone="dark"
        title="Get in Touch"
        description="Questions about visiting, group and school visits, or press enquiries? We'd love to hear from you."
      />

      <div className="text-center">
        <Button
          asChild
          variant="colonial-gold"
          className="text-base py-2 px-5"
        >
          <Link href="/contact">
            <Mail className="mr-2 h-4 w-4" /> Contact Us
          </Link>
        </Button>
      </div>
    </>
  );
}
```

- [ ] **Step 6: `latest-news-section.tsx` heading tone**

In `src/components/features/home/latest-news-section.tsx`, find its `SectionHeader` usage and add `tone="dark"`. Change NOTHING else (BlogCards are white plates on the navy wall — correct museum treatment). If the empty-state `ContentCard` shows navy-on-white text it's fine (it only renders with zero posts).

- [ ] **Step 7: Rewrite `src/app/(site)/page.tsx`**

```tsx
import { GalleryHero } from '@/components/features/home/gallery-hero';
import { ProjectStrip } from '@/components/features/home/project-strip';
import { ShopStrip } from '@/components/features/home/shop-strip';
import { TapestryPlate } from '@/components/features/home/tapestry-plate';
import { LatestNewsSection } from '@/components/features/home/latest-news-section';
import { GetInTouchSection } from '@/components/features/home/get-in-touch-section';
import { getAllTapestries } from '@/lib/tapestries';
import {
  getAllExhibitions,
  getExhibitionSpotlight,
} from '@/lib/exhibitions';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Story of the 13 Colonies in Embroidery — Now on Exhibition',
  description:
    "America's Tapestry tells the stories of the original thirteen colonies through embroidery. Created for America's 250th anniversary, the completed panels are now touring on a two-year exhibition through 2028.",
  path: '/',
});

// Re-render daily so the exhibition spotlight tracks the calendar without a deploy.
export const revalidate = 86400;

export default async function Home() {
  const [tapestries, exhibitions] = await Promise.all([
    getAllTapestries(),
    getAllExhibitions(),
  ]);
  const spotlight = getExhibitionSpotlight(exhibitions);

  const withImages = tapestries.filter((t) => t.imagePath || t.thumbnail);
  const shuffled = [...withImages].sort(() => 0.5 - Math.random());
  const heroTapestry = shuffled[0];
  const plateTapestries = shuffled.slice(1, 4);

  return (
    <div className="bg-colonial-navy">
      <GalleryHero
        spotlight={spotlight}
        backdrop={
          heroTapestry
            ? {
                src: heroTapestry.imagePath || heroTapestry.thumbnail,
                alt: heroTapestry.title,
              }
            : null
        }
      />

      <section className="container mx-auto py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Collection</span>
          <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
            Thirteen colonies, thirteen panels
          </h2>
          <p className="gallery-lead mx-auto mt-4">
            Each panel is 35&Prime; × 45&Prime; of hand embroidery, telling a
            lesser-known story of its colony&rsquo;s road to independence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {plateTapestries.map((tapestry) => (
            <TapestryPlate key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="/tapestries"
            className="inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
          >
            Explore all thirteen colonies →
          </a>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <ProjectStrip />
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <LatestNewsSection />
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <ShopStrip />
      </section>

      <section className="container mx-auto pb-24 pt-8">
        <GetInTouchSection />
      </section>
    </div>
  );
}
```

Implementer notes:
- `heroTapestry.imagePath || heroTapestry.thumbnail` — `thumbnail` is always a string, so the union stays `string`; no non-null assertions needed.
- The old page's `getCarouselImages`, `HeroCarousel`, `PageSection`, `AboutSection`, `VisionSection`, `TapestriesSection` imports all go away — Task 3 deletes the orphaned components; this task only stops importing them.
- The home page previously filtered `status !== 'Not Started'` — dropped deliberately (all panels are Finished; status machinery is being retired per spec).

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green (build must list `/` as ISR/revalidate).
Dev server `/`: dark room top to bottom; eyebrow reads "On view now · Muscarelle Museum of Art, Virginia" with the June–September dates; hero CTAs relative; three framed plates with titles, hover lift; project strip with video; news cards on navy; shop strip; visitor-oriented contact. No carousel, no Ken Burns, no "Walk the Gallery" block anywhere. Check `curl -s localhost:3000 | grep -c "americastapestry.com/tapestries"` → 0 (absolute URL gone).

- [ ] **Step 9: Commit**

```bash
git add "src/app/(site)/page.tsx" src/components/features/home/gallery-hero.tsx src/components/features/home/project-strip.tsx src/components/features/home/shop-strip.tsx src/components/features/home/tapestry-plate.tsx src/components/features/home/latest-news-section.tsx src/components/features/home/get-in-touch-section.tsx
git commit -m "feat(home): dark gallery homepage with live exhibition spotlight

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Delete the orphaned creation-era components

**Files:**
- Delete: `src/components/shared/hero-carousel.tsx`
- Delete: `src/components/features/home/about-section.tsx`
- Delete: `src/components/features/home/vision-section.tsx`
- Delete: `src/components/features/home/tapestries-section.tsx`
- Modify: `src/lib/tapestries.ts` (remove `getCarouselImages` and its placeholder machinery)

**Interfaces:** removes `getCarouselImages` export (page.tsx no longer imports it after Task 2).

- [ ] **Step 1: Verify orphan status (HARD GATE)**

```bash
grep -rn "hero-carousel\|HeroCarousel" src --include="*.tsx" --include="*.ts" | grep -v "shared/hero-carousel.tsx"
grep -rn "about-section\|AboutSection" src --include="*.tsx" | grep -v "features/home/about-section.tsx"
grep -rn "vision-section\|VisionSection" src --include="*.tsx" | grep -v "features/home/vision-section.tsx"
grep -rn "tapestries-section\|TapestriesSection" src --include="*.tsx" | grep -v "features/home/tapestries-section.tsx"
grep -rn "getCarouselImages" src --include="*.ts" --include="*.tsx" | grep -v "src/lib/tapestries.ts"
```

ALL must return nothing. Any hit → STOP, report BLOCKED with the importer.

- [ ] **Step 2: Delete the four components; remove `getCarouselImages` from `src/lib/tapestries.ts`**

Remove the entire `getCarouselImages` function (including its `'In Progress' as TapestryStatus` placeholder block). If `TapestryStatus`/`isValidStatus` or any import becomes unused as a result, tsc (`noUnusedLocals`) will say so — remove exactly what it flags, nothing more.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green (characterization suite must be untouched: the tapestry loader tests don't cover getCarouselImages).
Note: hero-carousel.tsx carried several of the react-hooks compiler warnings downgraded in Phase 1 — `npm run lint 2>&1 | tail -5` should show the warning count DROP; report the new count.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/hero-carousel.tsx src/components/features/home/about-section.tsx src/components/features/home/vision-section.tsx src/components/features/home/tapestries-section.tsx src/lib/tapestries.ts
git commit -m "chore(home): delete carousel and creation-era home sections

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Dropped/deferred (with reason)

- **"Walk the Gallery" feature block** — cut per Richard's 2026-07-06 decision (gallery is a prototype pending rework; nav link only).
- **TapestryCard restyle** — Plan 3c owns /tapestries; the homepage uses the new `TapestryPlate` instead and no longer imports TapestryCard.
- **BlogCard dark variant** — white cards on navy are the intended "plates on the wall"; revisit in 3d only if the final review finds it jarring.

## Final verification (after Task 3)

1. Gates green; build lists `/` with revalidate 86400.
2. Dev-server pass: `/` fully dark with live spotlight; `/exhibitions`, `/shop`, `/about` unchanged from their current state; no route 500s (deleted components truly orphaned).
3. Lint warning count reduced (hero-carousel warnings gone); zero new errors.
