# Phase 3c: Tapestries Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Richard's structural critiques to the tapestry pages: the index becomes a dark gallery of framed fine-art photographs (status key, badges, and the interactive map deleted), and each detail page leads with the framed fine-art photograph plus a "Shop this panel" CTA instead of the abstract image slice.

**Architecture:** The index page inlines its grid (tapestry-grid.tsx deleted) over a rewritten dark `TapestryCard` built on shared `FramedArtwork`. The detail page swaps its `page-heading` + `FullImageViewer` top for a dark hero band; the body (audio, story, talk video, artwork, team sections) stays the light reading room it already is. Cleanup deletes the orphaned map/viewer components and dead status CSS.

**Tech Stack:** Next 16 server components, Phase 2 tokens/classes, `FramedArtwork`, `getPrintUrl` from `@/lib/shop-links`.

## Global Constraints

- Structural decisions (spec, Richard 2026-07-06): NO production-status UI anywhere (key, badges, colors — all 13 panels are Finished); the interactive map is deleted; cards and detail heroes use the fine-art photographs (`imagePath`, which prefers `{slug}-photo.*`).
- `src/components/features/shop/buy-print-callout.tsx` carries the USER'S UNCOMMITTED WIP — do not edit, delete, or commit that file. Task 2 merely stops rendering it on the detail page (the hero carries the shop CTA now).
- Cascade trap: no competing font/color/bg utilities on `.gallery-heading`/`.gallery-lead`/`.eyebrow` elements.
- `TapestryStatus`, `isValidStatus`, and the `status` field STAY in `src/lib/tapestries.ts` (the loader validates frontmatter with them; characterization tests pin them). Only UI consumption of status is removed.
- Commit scope per task; never `git add -A`. Verification per task: `npx tsc --noEmit` exit 0; `npx jest 2>&1 | tail -3` (13 suites, 117 tests, snapshots unchanged); `npx next build` succeeds; dev-server checks as specified.
- Conventional commits ending `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Dark tapestry index

**Files:**
- Modify: `src/app/(site)/tapestries/page.tsx` (full rewrite below)
- Modify: `src/components/features/tapestries/tapestry-card.tsx` (full rewrite below)
- Delete: `src/components/features/tapestries/tapestry-grid.tsx` (single consumer, inlined)
- Modify: `src/components/ui/site-breadcrumb.tsx` (suppress on /tapestries routes)

**Interfaces:**
- Produces: `TapestryCard({ tapestry })` — dark plate variant; consumed here and nowhere else (grep to confirm before rewriting; the homepage uses its own `TapestryPlate`).
- Consumes: `FramedArtwork`, Phase 2 classes, `getAllTapestries`.

- [ ] **Step 1: Confirm TapestryCard's only consumer is tapestry-grid.tsx**

```bash
grep -rn "TapestryCard" src --include="*.tsx" | grep -v "tapestries/tapestry-card.tsx"
```

Expected: hits only in `tapestry-grid.tsx`. Other hits → STOP, report BLOCKED.

- [ ] **Step 2: Rewrite `src/components/features/tapestries/tapestry-card.tsx`**

```tsx
import Link from 'next/link';
import { Headphones } from 'lucide-react';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import type { TapestryEntry } from '@/lib/tapestries';

interface TapestryCardProps {
  tapestry: TapestryEntry;
}

/**
 * A colony panel hung in the collection gallery: the framed fine-art
 * photograph with title and summary beneath. Dark-room treatment.
 */
export function TapestryCard({ tapestry }: TapestryCardProps) {
  const hasAudio = !!tapestry.audioPath;

  return (
    <Link href={`/tapestries/${tapestry.slug}`} className="group block">
      <div className="relative">
        <FramedArtwork
          src={tapestry.imagePath || tapestry.thumbnail}
          alt={`The ${tapestry.title} tapestry panel`}
          framed
          className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        />
        {hasAudio && (
          <div className="absolute bottom-3 right-3 rounded-full bg-colonial-navy/80 p-1.5 text-colonial-parchment shadow-md ring-1 ring-white/20">
            <Headphones className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Audio description available</span>
          </div>
        )}
      </div>
      <h3 className="gallery-heading mt-4 text-center text-xl">
        {tapestry.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-center font-serif text-sm text-colonial-parchment/70">
        {tapestry.summary}
      </p>
    </Link>
  );
}
```

(Status colors, status badge, `isClickable`, the tinted overlay, and the white card chrome are all deliberately gone.)

- [ ] **Step 3: Rewrite `src/app/(site)/tapestries/page.tsx`**

```tsx
import { TapestryCard } from '@/components/features/tapestries/tapestry-card';
import { getAllTapestries } from '@/lib/tapestries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Tapestry Collection',
  description:
    "Explore all thirteen embroidered panels of America's Tapestry — one for each original colony, photographed as fine art.",
  path: '/tapestries',
});

export default async function TapestriesPage() {
  const tapestries = await getAllTapestries();

  return (
    <div className="bg-colonial-navy">
      <div className="container mx-auto py-16 md:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <span className="eyebrow eyebrow-gold">The Collection</span>
          <h1 className="gallery-heading mt-3 text-4xl md:text-5xl">
            America&rsquo;s Tapestry Collection
          </h1>
          <p className="gallery-lead mx-auto mt-4">
            Thirteen panels, one for each original colony — each telling a
            lesser-known story of our nation&rsquo;s journey towards
            independence.
          </p>
          <div className="gold-threshold mx-auto mt-6" />
        </header>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {tapestries.map((tapestry) => (
            <TapestryCard key={tapestry.slug} tapestry={tapestry} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

(The `InteractiveColoniesMap` section, its status key, and the commented-out timeline/data-explorer blocks are gone; the map component itself is deleted in Task 3.)

- [ ] **Step 4: Delete `src/components/features/tapestries/tapestry-grid.tsx`**

```bash
rm src/components/features/tapestries/tapestry-grid.tsx
```

- [ ] **Step 5: Suppress the light breadcrumb on the now-dark tapestry routes**

In `src/components/ui/site-breadcrumb.tsx`, the early return currently reads:

```tsx
if (pathname === '/' || pathname === '/exhibitions') return null;
```

Replace with:

```tsx
// Dark Night Gallery routes render without the light breadcrumb bar; a
// site-wide dark breadcrumb treatment lands in Phase 3d.
if (
  pathname === '/' ||
  pathname === '/exhibitions' ||
  pathname.startsWith('/tapestries')
) return null;
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green.
Dev-server `/tapestries`: dark room; 13 framed photographs alphabetical; titles/summaries in cream; audio badge on panels that have narration; NO status badges, NO status key, NO map; no light breadcrumb bar. `curl -s localhost:3000/tapestries | grep -c "status-badge\|In Production\|Not Started"` → 0.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(site)/tapestries/page.tsx" src/components/features/tapestries/tapestry-card.tsx src/components/features/tapestries/tapestry-grid.tsx src/components/ui/site-breadcrumb.tsx
git commit -m "feat(tapestries): dark gallery index — fine-art plates, status UI and map removed

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Detail-page hero — framed fine art + Shop this panel

**Files:**
- Modify: `src/app/(site)/tapestries/[slug]/page.tsx`

**Interfaces:**
- Consumes: `FramedArtwork`, `getPrintUrl(colonySlug)` from `@/lib/shop-links` (same helper BuyPrintCallout uses), Phase 2 classes, `Button`.

- [ ] **Step 1: Replace the page top**

In `src/app/(site)/tapestries/[slug]/page.tsx`:

1. DELETE the `statusColors` / `statusTextColors` maps (lines ~20-33) and the `statusColor`/`statusTextColor` derivations in the component body.
2. DELETE these imports: `FullImageViewer`, `BuyPrintCallout`. ADD:

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import { getPrintUrl } from '@/lib/shop-links';
```

3. Replace this block:

```tsx
      <h1 className="page-heading">{tapestry.title}</h1>

      <div className="lead-text">{tapestry.summary}</div>

      <PageSection spacing="normal">
        {/* Tapestry image */}
        <div className="mb-8 md:mb-12">
          <FullImageViewer
            imageSrc={imageSrc}
            altText={tapestry.title}
            status={tapestry.status}
            statusColor={statusColor}
            statusTextColor={statusTextColor}
          />
        </div>
```

with:

```tsx
      {/* Dark gallery hero: the panel as framed fine art, with the shop ask */}
      <div className="bg-colonial-navy">
        <div className="container mx-auto py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16">
            <FramedArtwork
              src={imageSrc}
              alt={`The ${tapestry.title} tapestry panel, photographed as fine art`}
              framed
              className="mx-auto w-full max-w-[26rem]"
            />
            <div className="text-center md:text-left">
              <span className="eyebrow eyebrow-gold">
                The Tapestry Collection
              </span>
              <h1 className="gallery-heading mt-3 text-4xl md:text-5xl">
                {tapestry.title}
              </h1>
              <p className="gallery-lead mt-4">{tapestry.summary}</p>
              <div className="gold-threshold mx-auto mt-6 md:mx-0" />
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <Button
                  asChild
                  variant="colonial-gold"
                  size="lg"
                  className="text-base"
                >
                  <Link href={getPrintUrl(tapestry.slug)}>
                    Shop this panel
                  </Link>
                </Button>
                <Link
                  href="/shop"
                  className="inline-flex items-center font-medium text-colonial-parchment/80 transition-colors hover:text-colonial-gold"
                >
                  Visit the shop →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageSection spacing="normal">
```

4. DELETE the mid-page BuyPrintCallout block (the hero now carries the ask):

```tsx
        <div className="pt-6">
          <BuyPrintCallout colonySlug={slug} colonyName={tapestry.title} />
        </div>
```

and the pin-separator `div` pair immediately ABOVE it (the `{/* Pin separator */}` + `page-section-pin-bottom` block that precedes it). Do NOT touch `src/components/features/shop/buy-print-callout.tsx` itself — it carries user WIP.

Everything else (audio player inside ReadingContainer, story content, resources, Tapestry Talk, Original Artwork, team/commission/venue sections, remaining pins) stays untouched.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green (tsc will catch any leftover status references).
Dev-server `/tapestries/virginia`: dark hero with the framed photograph, colony title in cream, summary, gold "Shop this panel" → `/shop/...` print URL; light reading room below with audio + story unchanged; NO status badge, NO duplicate mid-page print callout. Also spot-check `/tapestries/new-hampshire`. `curl -s localhost:3000/tapestries/virginia | grep -c "Own this panel as a fine-art print"` → 0 (callout gone).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/tapestries/[slug]/page.tsx"
git commit -m "feat(tapestries): framed fine-art hero with shop CTA on detail pages

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Delete orphaned map, viewer, and status CSS

**Files:**
- Delete: `src/components/features/tapestries/interactive-colonies-map.tsx`
- Delete: `src/components/shared/full-image-viewer.tsx`
- Modify: `src/app/globals.css` (remove `.status-*` classes if orphaned)

**Interfaces:** none.

- [ ] **Step 1: Orphan gate (including untracked files)**

```bash
grep -rn "interactive-colonies-map\|InteractiveColoniesMap" src --include="*.tsx" | grep -v "tapestries/interactive-colonies-map.tsx"
grep -rn "full-image-viewer\|FullImageViewer" src --include="*.tsx" | grep -v "shared/full-image-viewer.tsx"
grep -rn "status-badge\|status-not-started\|status-designed\|status-in-production\|status-finished" src --include="*.tsx" --include="*.ts"
```

First two must be empty (any hit → BLOCKED). For the third: hits mean those `.status-*` CSS classes are still consumed — delete from globals.css ONLY the classes with zero hits; report which were kept.

- [ ] **Step 2: Delete**

```bash
rm src/components/features/tapestries/interactive-colonies-map.tsx src/components/shared/full-image-viewer.tsx
```

In `src/app/globals.css`, remove the `/* Status indicators */` block (`.status-badge`, `.status-not-started`, `.status-designed`, `.status-in-production`, `.status-finished`) — subject to Step 1's grep results.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3` → green, snapshots unchanged.
Run `npm run lint 2>&1 | tail -3` — the map and viewer carried react-hooks warnings; report the before/after count with the file list (measure BEFORE deleting in Step 2, so the comparison is real).

- [ ] **Step 4: Commit**

```bash
git add src/components/features/tapestries/interactive-colonies-map.tsx src/components/shared/full-image-viewer.tsx src/app/globals.css
git commit -m "chore(tapestries): delete map, image viewer, and status CSS

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Dropped/deferred (with reason)

- **BuyPrintCallout component deletion** — its only render is removed, but the file carries the user's uncommitted WIP; leave the file untouched and let the shop session decide its fate.
- **Needle-pin separators on the detail page body** — old ornament, but swapping them for StitchRule belongs to the 3d sweep with the rest of the light-surface polish.
- **`TapestryStatus`/`isValidStatus`/frontmatter `status`** — retained: the loader validates against them and the characterization suite pins the behavior. Removing the *frontmatter field* across 13 content files is content churn with zero user-facing effect now that no UI reads it; revisit only if the schema is next touched.
- **Detail-page breadcrumbs** — suppressed with the rest of /tapestries (Task 1) until 3d's site-wide dark breadcrumb.

## Final verification (after Task 3)

1. Gates green; snapshots unchanged.
2. Dev-server pass: `/tapestries` (dark gallery, 13 plates), `/tapestries/virginia` + one other (dark hero, shop CTA, light body intact), `/` (homepage plates unaffected), `/exhibitions` (unaffected).
3. Lint: warning count reduced (map + viewer warnings gone); no new errors.
