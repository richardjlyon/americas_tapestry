# Phase 1: Foundation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Behavior-preserving cleanup of the content-loading layer, dead code, repo hygiene, and toolchain — the clean foundation the Phase 2/3 restyle builds on.

**Architecture:** The repo already has a good abstraction (`defineContentLoader` in `src/lib/content-loader.ts` + Zod schemas in `src/lib/content-schemas.ts`); `sponsors.ts` and `exhibitions.ts` use it. This plan migrates the two pre-abstraction modules (`tapestries.ts`, `team.ts`) onto it, guarded by characterization tests written first against current behavior. Nothing user-visible changes.

**Tech Stack:** Next 16 App Router, TypeScript 5.9 (strict + all rigor flags), Zod, gray-matter, Jest 29 (`npx jest`), Biome (format) + ESLint (lint).

## Global Constraints

- **Behavior-preserving:** every page must render identically after each task. The characterization tests (Task 3) are the gate; they must pass unchanged from Task 4 onward (Task 5 adds one assertion).
- **Commit scope:** the working tree carries unrelated uncommitted changes (shop work, content edits). `git add` ONLY the files named in each task — never `git add -A` or `git add .`.
- **Verification per task:** `npx tsc --noEmit` (expect exit 0) and `npx jest` (expect all suites pass; 101 tests pre-existing + new ones) before each commit.
- **tsconfig flags are load-bearing:** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` are ON. Frontmatter access uses bracket syntax (`data['title']`) where types are index signatures.
- **Formatter decision (recorded, no change):** Biome is the formatter (`npm run format`), ESLint the linter (`npm run lint`). They serve different roles; do not consolidate.
- Conventional commits; end commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Repo hygiene

**Files:**
- Modify: `.gitignore`
- Delete from git index (keep on disk): `tsconfig.tsbuildinfo`
- Move: `tapestry-all-people-by-surname.txt`, `tapestry-core-stitchers-by-ratification.txt`, `tapestry-directors-by-ratification.txt` → `scratch/`

**Interfaces:** none (no code).

- [ ] **Step 1: Untrack the build artifact and ignore it**

```bash
git rm --cached tsconfig.tsbuildinfo
```

Append to `.gitignore` (it currently ignores `scratch/` at line ~67; add near the TypeScript section or at the end):

```gitignore
# TypeScript incremental build info
*.tsbuildinfo
```

- [ ] **Step 2: Move the untracked data dumps into scratch/**

```bash
mv tapestry-all-people-by-surname.txt tapestry-core-stitchers-by-ratification.txt tapestry-directors-by-ratification.txt scratch/
```

These three files are untracked (never committed), so `mv` is sufficient. `scratch/` is already gitignored.

- [ ] **Step 3: Verify**

Run: `git status --short | grep -E "tsbuildinfo|tapestry-.*\.txt"`
Expected: one `D  tsconfig.tsbuildinfo` (staged deletion) and one `M .gitignore` line when staged; NO `??` entries for the txt files.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: untrack tsconfig.tsbuildinfo and move data dumps to scratch/

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(`git rm --cached` already staged the deletion.) Note: `.gitignore` has pre-existing uncommitted modifications from another session — inspect `git diff .gitignore` first; if unrelated hunks exist, stage only the `*.tsbuildinfo` hunk via `git add -p .gitignore` (accept only that hunk).

---

### Task 2: Delete dead code

**Files:**
- Modify: `src/lib/content-core.ts` (delete `getContentMetadata` lines 127–188 and the `ContentMetadata` interface lines 12–15)
- Delete: `src/components/features/shop/print-card.tsx`
- Delete: `src/components/features/shop/shopify-product-card.tsx`

**Interfaces:** removes `getContentMetadata` and `ContentMetadata` exports (verified unused).

- [ ] **Step 1: Verify the three items really are orphans**

```bash
grep -rn "getContentMetadata\|ContentMetadata" src --include="*.ts" --include="*.tsx" | grep -v "src/lib/content-core.ts"
grep -rn "print-card\|PrintCard" src --include="*.ts" --include="*.tsx" | grep -v "features/shop/print-card.tsx"
grep -rn "shopify-product-card\|ShopifyProductCard" src --include="*.ts" --include="*.tsx" | grep -v "features/shop/shopify-product-card.tsx"
```

Expected: all three commands output nothing. If any produce hits, STOP — do not delete that item; report the importer.

- [ ] **Step 2: Delete**

In `src/lib/content-core.ts`, remove the `ContentMetadata` interface:

```typescript
export interface ContentMetadata {
  slug: string;
  frontmatter: Record<string, any>;
}
```

and the entire `getContentMetadata` function (the block starting with the `/** Get content metadata only ... */` doc comment through its closing brace — it contains its own duplicate `processDirectory` walker).

```bash
rm src/components/features/shop/print-card.tsx src/components/features/shop/shopify-product-card.tsx
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3`
Expected: tsc exit 0; `Tests: 101 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/content-core.ts src/components/features/shop/print-card.tsx src/components/features/shop/shopify-product-card.tsx
git commit -m "chore: delete dead code (getContentMetadata, superseded shop cards)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Note: `print-card.tsx`/`shopify-product-card.tsx` may be untracked (check `git status`); if untracked, plain `rm` suffices and they need no `git add`.

---

### Task 3: Characterization tests for tapestry and team loaders

**Files:**
- Test (create): `src/__tests__/content-loaders.characterization.test.ts`

**Interfaces:**
- Consumes: `getAllTapestries()`, `getTapestryBySlug(slug)` from `@/lib/tapestries`; `getTeamGroups()`, `getTeamMembersByGroup(group)`, `getTeamMembersByState(state)` from `@/lib/team`.
- Produces: the safety net Tasks 4–8 must keep green. These tests run against the REAL `content/` directory (existing suites like `stitchers.test.ts` already do this).

- [ ] **Step 1: Write the tests**

```typescript
/**
 * Characterization tests: pin the CURRENT observable behavior of the
 * tapestries and team content loaders before the Phase 1 refactor
 * (docs/superpowers/plans/2026-07-06-phase1-foundation-cleanup.md).
 * They run against the real content/ directory. If one of these fails
 * after a refactor task, the refactor changed behavior — fix the code,
 * not the test (except where a task explicitly strengthens a test).
 */
import { getAllTapestries, getTapestryBySlug } from '@/lib/tapestries';
import {
  getTeamGroups,
  getTeamMembersByGroup,
  getTeamMembersByState,
} from '@/lib/team';

describe('tapestries loader (characterization)', () => {
  it('loads all 13 colonies sorted by title, finished, with images', async () => {
    const all = await getAllTapestries();
    expect(all.map((t) => t.slug).sort()).toMatchSnapshot('tapestry-slugs');
    expect(all).toHaveLength(13);
    const titles = all.map((t) => t.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    for (const t of all) {
      expect(t.status).toBe('Finished');
      expect(t.title).toBeTruthy();
      expect(t.summary).toBeTruthy();
      expect(t.thumbnail).toBeTruthy();
      expect(t.imagePath).toBeTruthy();
      expect(t.content.length).toBeGreaterThan(100);
    }
  });

  it('getTapestryBySlug agrees with getAllTapestries entry field-by-field', async () => {
    const all = await getAllTapestries();
    for (const entry of all) {
      const single = await getTapestryBySlug(entry.slug);
      expect(single).not.toBeNull();
      // NOTE: `thumbnail` deliberately excluded — the two code paths
      // currently disagree on thumbnail selection. Task 5 unifies them
      // and adds the thumbnail assertion.
      const fields = [
        'slug',
        'title',
        'summary',
        'status',
        'background_color',
        'imagePath',
        'artworkPath',
        'audioPath',
        'audioDescription',
        'colony',
        'content',
      ] as const;
      for (const f of fields) {
        expect(single![f]).toEqual(entry[f]);
      }
      expect(single!.timelineEvents).toEqual(entry.timelineEvents);
      expect(single!.resources).toEqual(entry.resources);
    }
  });
});

describe('team loader (characterization)', () => {
  it('returns groups in order with required fields', async () => {
    const groups = await getTeamGroups();
    expect(groups.map((g) => g.slug).sort()).toMatchSnapshot('team-group-slugs');
    for (const g of groups) {
      expect(g.name).toBeTruthy();
      expect(g.description).toBeTruthy();
    }
    const orders = groups.map((g) => g.order || 999);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('returns members per group with name/role/groupSlug, excluding group indexes', async () => {
    const groups = await getTeamGroups();
    const counts: Record<string, number> = {};
    for (const g of groups) {
      const members = await getTeamMembersByGroup(g.slug);
      counts[g.slug] = members.length;
      for (const m of members) {
        expect(m.name).toBeTruthy();
        expect(m.role).toBeTruthy();
        expect(m.groupSlug).toBe(g.slug);
        expect(m.slug).not.toBe(g.slug); // group index never leaks in as a member
      }
    }
    expect(counts).toMatchSnapshot('team-member-counts');
  });

  it('resolves state rosters (Virginia)', async () => {
    const virginia = await getTeamMembersByState('Virginia');
    expect(virginia.stateDirectors.length).toBeGreaterThan(0);
    expect(virginia.stitchers.length).toBeGreaterThan(0);
    expect({
      stateDirectors: virginia.stateDirectors.length,
      historicalPartners: virginia.historicalPartners.length,
      illustrators: virginia.illustrators.length,
      stitchingGroups: virginia.stitchingGroups.length,
      stitchers: virginia.stitchers.length,
      commissionPartners: virginia.commissionPartners.length,
      stitchingVenues: virginia.stitchingVenues.length,
    }).toMatchSnapshot('virginia-roster-counts');
  });
});
```

- [ ] **Step 2: Run — these must PASS against the current code**

Run: `npx jest content-loaders.characterization -v`
Expected: all 5 tests PASS (snapshots written on first run). If any fail, the test encodes a wrong assumption — investigate and adjust the TEST (this is the only task where adjusting tests is correct).

- [ ] **Step 3: Run the full suite**

Run: `npx jest 2>&1 | tail -3`
Expected: 12 suites, 106 tests pass.

- [ ] **Step 4: Commit (include the generated snapshot)**

```bash
git add src/__tests__/content-loaders.characterization.test.ts src/__tests__/__snapshots__/content-loaders.characterization.test.ts.snap
git commit -m "test: characterization tests for tapestries and team loaders

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Consolidate image resolution in tapestries.ts

**Files:**
- Modify: `src/lib/tapestries.ts:59-262` (the four finder helpers)

**Interfaces:**
- Produces (module-internal, used by Task 5): `listTapestryImageFiles(slug): string[]`, `findTapestryFile(files, opts): string | undefined` with `opts: { match: (lowerFile: string) => boolean; preferWidth?: string; fallback: 'original' | 'any' }`, plus the existing finder signatures unchanged: `findImageInDirectory(slug)`, `findPhotoInDirectory(slug)`, `findArtworkInDirectory(slug)`, `findAudioInDirectory(slug)` — all `(slug: string) => string | null`.

Replaces the format-priority array declared 6× and the 10-condition width-exclusion list pasted 3× with one constant and one regex.

- [ ] **Step 1: Replace the helper block**

In `src/lib/tapestries.ts`, delete the current `findImageInDirectory` (lines 59–159), `findPhotoInDirectory` (161–183), `findArtworkInDirectory` (185–232), and `findAudioInDirectory` (234–262), and insert:

```typescript
// Format preference: webp/jpg/png route through the R2 manifest; avif is a
// last-resort fallback (served by Vercel) so a missing webp/jpg variant
// doesn't silently fall back to the placeholder SVG.
const IMAGE_FORMAT_PRIORITY = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

// Responsive variants carry a -<width>w suffix before the extension
// (e.g. colony-main-1024w.webp), generated by scripts/optimize-and-upload.mjs.
const RESPONSIVE_VARIANT_RE = /-\d+w\.[a-z0-9]+$/i;

function isResponsiveVariant(file: string): boolean {
  return RESPONSIVE_VARIANT_RE.test(file);
}

/** List files in public/images/tapestries/{slug}, or [] if the dir is absent. */
function listTapestryImageFiles(tapestrySlug: string): string[] {
  const dir = path.join(
    process.cwd(),
    'public/images/tapestries',
    tapestrySlug,
  );
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

/**
 * Find one image file by format priority. Per format: prefer the
 * `preferWidth` responsive variant when given, then fall back to either a
 * non-variant original (`fallback: 'original'`) or any matching file
 * (`fallback: 'any'`).
 */
function findTapestryFile(
  files: string[],
  opts: {
    match: (lowerFile: string) => boolean;
    preferWidth?: string;
    fallback: 'original' | 'any';
  },
): string | undefined {
  for (const format of IMAGE_FORMAT_PRIORITY) {
    if (opts.preferWidth) {
      const variant = files.find(
        (file) =>
          path.extname(file).toLowerCase() === format &&
          opts.match(file.toLowerCase()) &&
          file.includes(opts.preferWidth as string),
      );
      if (variant) return variant;
    }
    const fallbackHit = files.find(
      (file) =>
        path.extname(file).toLowerCase() === format &&
        opts.match(file.toLowerCase()) &&
        (opts.fallback === 'any' || !isResponsiveVariant(file)),
    );
    if (fallbackHit) return fallbackHit;
  }
  return undefined;
}

// Main display image: prefer a file named *main* (1024w variant, then
// original), else any non-thumbnail image.
function findImageInDirectory(tapestrySlug: string): string | null {
  const files = listTapestryImageFiles(tapestrySlug);
  if (files.length === 0) return null;

  const file =
    findTapestryFile(files, {
      match: (lower) => lower.includes('main'),
      preferWidth: '-1024w',
      fallback: 'original',
    }) ??
    findTapestryFile(files, {
      match: (lower) => !lower.includes('thumbnail'),
      preferWidth: '-1024w',
      fallback: 'original',
    });

  return file ? `/images/tapestries/${tapestrySlug}/${file}` : null;
}

// PHOTOGRAPH of the finished, mounted tapestry: {slug}-photo.*. Preferred
// over the resolver for main image and thumbnail.
export function findPhotoInDirectory(tapestrySlug: string): string | null {
  const files = listTapestryImageFiles(tapestrySlug);
  const file = findTapestryFile(files, {
    match: (lower) => lower.includes('-photo'),
    fallback: 'any',
  });
  return file ? `/images/tapestries/${tapestrySlug}/${file}` : null;
}

// ORIGINAL ARTWORK (the design illustration the stitchers worked from):
// {slug}-tapestry-* files excluding thumbnails. Artwork naming is
// inconsistent across states, so match on "-tapestry-" and exclude
// "thumbnail".
export function findArtworkInDirectory(tapestrySlug: string): string | null {
  const files = listTapestryImageFiles(tapestrySlug);
  const file = findTapestryFile(files, {
    match: (lower) =>
      lower.includes('-tapestry-') && !lower.includes('thumbnail'),
    preferWidth: '-1024w',
    fallback: 'any',
  });
  return file ? `/images/tapestries/${tapestrySlug}/${file}` : null;
}

function findAudioInDirectory(tapestrySlug: string): string | null {
  const files = listTapestryImageFiles(tapestrySlug);
  const audioFile = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return (
      ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext) &&
      (file.toLowerCase().includes('audio') ||
        file.toLowerCase().includes('description'))
    );
  });
  return audioFile ? `/images/tapestries/${tapestrySlug}/${audioFile}` : null;
}
```

Known acceptable deviation: the old code interleaved variant/original per format inside a single loop and enumerated ten explicit widths; the new code uses two sequential preference passes and a width regex. On the real content tree (uniformly generated variants) results are identical — the Task 3 tests prove it.

- [ ] **Step 2: Verify behavior unchanged**

Run: `npx tsc --noEmit && npx jest content-loaders.characterization -v`
Expected: tsc exit 0; all 5 characterization tests PASS with UNCHANGED snapshots (no `--ci` snapshot rewrites; if Jest reports snapshot mismatch, the refactor changed image selection — fix the code).

- [ ] **Step 3: Full suite**

Run: `npx jest 2>&1 | tail -3`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/tapestries.ts
git commit -m "refactor(lib): consolidate tapestry image resolution helpers

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Migrate tapestries.ts onto defineContentLoader with a single mapTapestry

**Files:**
- Modify: `src/lib/tapestries.ts` (replace `getAllTapestries` + `getTapestryBySlug`, lines ~301–514 pre-Task-4 numbering)
- Test: `src/__tests__/content-loaders.characterization.test.ts` (strengthen: add thumbnail equality)

**Interfaces:**
- Consumes: Task 4's `listTapestryImageFiles`, `findTapestryFile`, finder functions; `defineContentLoader` from `./content-loader` (signature in `src/lib/content-loader.ts:35-41`); `tapestrySchema` from `./content-schemas`.
- Produces: `getAllTapestries: () => Promise<TapestryEntry[]>` and `getTapestryBySlug: (slug: string) => Promise<TapestryEntry | null>` — signatures unchanged; all consumers (pages) untouched.

The list-path thumbnail logic is CANONICAL (responsive-variant-aware); the single-item path's simpler lookup is the drift being eliminated.

- [ ] **Step 1: Replace the two loader functions**

In `src/lib/tapestries.ts`:

Replace the imports at the top of the file with:

```typescript
import type { z } from 'zod';
import type { ContentItem } from './content-core';
import { tapestrySchema } from './content-schemas';
import { defineContentLoader } from './content-loader';
import fs from 'fs';
import path from 'path';
```

(`getAllContent`, `getContentBySlug`, `validateFrontmatter`, and `FrontmatterValidationError` are no longer imported — `defineContentLoader` owns validation and the error contract.)

Delete the whole of `getAllTapestries` and `getTapestryBySlug` and insert:

```typescript
// Thumbnail: frontmatter override, then finished-photo, then a *thumbnail*
// file (640w variant preferred), then the main image, then the placeholder.
function resolveThumbnail(
  slug: string,
  files: string[],
  frontmatterThumbnail: string | undefined,
  photoPath: string | null,
  imagePath: string | null,
): string {
  if (frontmatterThumbnail) return frontmatterThumbnail;
  if (photoPath) return photoPath;

  const thumbnailFile = findTapestryFile(files, {
    match: (lower) => lower.includes('thumbnail'),
    preferWidth: '-640w',
    fallback: 'original',
  });
  if (thumbnailFile) return `/images/tapestries/${slug}/${thumbnailFile}`;
  if (imagePath) return imagePath;
  return '/images/placeholders/tapestry-placeholder.svg?height=600&width=800';
}

/**
 * Map validated tapestry frontmatter + raw item to a TapestryEntry. Shared by
 * getAllTapestries and getTapestryBySlug so image/status/thumbnail rules live
 * in exactly one place.
 */
function mapTapestry(
  data: z.infer<typeof tapestrySchema>,
  item: ContentItem,
): TapestryEntry {
  const slug = item.slug;
  const files = listTapestryImageFiles(slug);

  const status =
    data['status'] && isValidStatus(data['status'])
      ? data['status']
      : 'Not Started';

  const photoPath = findPhotoInDirectory(slug);
  const imagePath = photoPath || findImageInDirectory(slug);
  const audioPath = findAudioInDirectory(slug);
  const thumbnail = resolveThumbnail(
    slug,
    files,
    data['thumbnail'],
    photoPath,
    imagePath,
  );

  return {
    slug,
    title: data['title'],
    summary: data['summary'],
    thumbnail,
    background_color: data['background_color'],
    content: item.content,
    imagePath: imagePath ?? undefined,
    artworkPath: findArtworkInDirectory(slug) ?? undefined,
    audioPath: audioPath ?? undefined,
    audioDescription:
      data['audioDescription'] ||
      `Audio description of the ${data['title']} tapestry`,
    colony: data['colony'] || null,
    status,
    timelineEvents: data['timelineEvents'] || [],
    resources: data['resources'] || [],
  };
}

const tapestriesLoader = defineContentLoader<
  TapestryEntry,
  typeof tapestrySchema
>({
  contentType: 'tapestries',
  label: 'tapestry',
  schema: tapestrySchema,
  map: mapTapestry,
  sort: (a, b) => a.title.localeCompare(b.title),
});

/** Get all tapestries, sorted by title. */
export const getAllTapestries = tapestriesLoader.getAll;

/** Get a single tapestry by slug, or null if not found. */
export const getTapestryBySlug = tapestriesLoader.getBySlug;
```

Notes for the implementer:
- `TapestryEntry.imagePath/artworkPath/audioPath/audioDescription` are optional (`?:`) — with `exactOptionalPropertyTypes` on, pass `?? undefined` exactly as shown (assigning `null` fails).
- If `imagePath` is null AND no thumbnail file exists, `thumbnail` becomes the placeholder — same as the old list path.
- The old code's trailing `as TapestryEntry` casts are gone; the object literal must typecheck on its own. If tsc complains about `status`, `isValidStatus` (kept from the current file, unchanged) is the narrowing type guard.
- `getCarouselImages`, `TapestryStatus`, `TimelineEvent`, `TapestryResource`, `TapestryEntry`, `isValidStatus` stay exactly as they are.

- [ ] **Step 2: Strengthen the characterization test**

In `src/__tests__/content-loaders.characterization.test.ts`, in the field-agreement test, add `'thumbnail'` to the `fields` array and delete the NOTE comment (the paths now agree by construction):

```typescript
      const fields = [
        'slug',
        'title',
        'summary',
        'status',
        'background_color',
        'thumbnail',
        'imagePath',
        'artworkPath',
        'audioPath',
        'audioDescription',
        'colony',
        'content',
      ] as const;
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3`
Expected: tsc exit 0; all suites pass; snapshots unchanged. Then spot-check rendering:

```bash
npx next build 2>&1 | tail -5
```

Expected: build succeeds (this exercises every static page against the new loader).

- [ ] **Step 4: Commit**

```bash
git add src/lib/tapestries.ts src/__tests__/content-loaders.characterization.test.ts
git commit -m "refactor(lib): unify tapestry loaders on defineContentLoader

Single mapTapestry shared by list and single-item paths; eliminates the
thumbnail-selection drift between getAllTapestries and getTapestryBySlug.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Migrate team.ts off hand-rolled fs/gray-matter

**Files:**
- Modify: `src/lib/team.ts:39-91` (`getTeamContentForGroup`) and lines 184–199 (member filter), imports at 1–12

**Interfaces:**
- Consumes: `getAllContent(contentType)` from `./content-core` — it accepts nested paths like `'team/state-directors'` (it joins under `content/`), recurses member subdirectories, skips `images/` dirs and README/SCHEMA/IMAGE-GUIDELINES files, and derives each member's slug from its directory name.
- Produces: all existing exports unchanged: `getTeamGroup`, `getTeamGroups`, `getTeamMembersByGroup`, `getProjectDirector`, `getTeamMember`, `getTeamData`, `getTeamMemberData`, `getTeamMembersByState`.

Slug subtlety: the old `getTeamContentForGroup` gave the group's own `index.md` the slug `<group>`; `getAllContent('team/<group>')` gives it `''` (its path-derived parent is the content root). The member filter must therefore skip BOTH `''` and `<group>`.

- [ ] **Step 1: Replace the hand-rolled reader**

In `src/lib/team.ts`, delete the `getTeamContentForGroup` function (lines 39–91) and the now-unused imports `fs`, `path`, `matter` (lines 10–12). Change the top of `getTeamMembersByGroup` from:

```typescript
    // Get all team content for this specific group using direct directory processing
    const groupSpecificContent = await getTeamContentForGroup(group);
```

to:

```typescript
    // Read this group's directory via content-core (group index.md plus one
    // subdirectory per member).
    const groupSpecificContent = await getAllContent(`team/${group}`);
```

and change the group-index skip condition from:

```typescript
      if ((rawData['description'] && !rawData['role']) || item.slug === group) {
        continue;
      }
```

to:

```typescript
      // Skip the group's own index.md: it describes the group, not a person.
      // content-core derives its slug as '' (path-root index) — the old
      // reader used the group name, so tolerate both.
      if (
        (rawData['description'] && !rawData['role']) ||
        item.slug === group ||
        item.slug === ''
      ) {
        continue;
      }
```

- [ ] **Step 2: Verify behavior unchanged**

Run: `npx tsc --noEmit && npx jest content-loaders.characterization -v`
Expected: tsc exit 0 (if it flags unused imports, they weren't all removed); all characterization tests pass with UNCHANGED snapshots — especially `team-member-counts` (a count change means members leaked or dropped; check the skip condition) and `virginia-roster-counts`.

- [ ] **Step 3: Full suite**

Run: `npx jest 2>&1 | tail -3`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/team.ts
git commit -m "refactor(lib): read team groups through content-core

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Deduplicate the excerpt logic in content-core.ts

**Files:**
- Modify: `src/lib/content-core.ts` (excerpt blocks at lines ~71–87 in `getAllContent` and ~276–291 in `processContentDirectory`)

**Interfaces:**
- Produces (module-internal): `deriveExcerpt(content: string): string` — the exact current regex chain. Deviation from spec recorded: the spec suggested reusing `markdown.extractExcerpt`, but that helper has DIFFERENT behavior (first paragraph, 160 chars, no bold/italic stripping) — swapping it in would change rendered excerpts site-wide. Behavior-preservation wins; we extract the local logic instead.

- [ ] **Step 1: Extract the helper**

In `src/lib/content-core.ts`, below the `ContentItem` interface, add:

```typescript
/**
 * Derive a plain-text excerpt (~150 chars) from markdown content. Used when
 * frontmatter provides no explicit `excerpt`.
 */
function deriveExcerpt(content: string): string {
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  return plainText.length > 150
    ? plainText.substring(0, 150) + '...'
    : plainText;
}
```

In `getAllContent`'s `processDirectory`, replace:

```typescript
          // Generate excerpt if not provided
          let excerpt = data['excerpt'];
          if (!excerpt && content) {
            // Extract first 150 characters of content, removing markdown syntax
            const plainText = content
              .replace(/#{1,6}\s+/g, '') // Remove headers
              .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
              .replace(/\*(.+?)\*/g, '$1') // Remove italic
              .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
              .replace(/\n+/g, ' ') // Replace newlines with spaces
              .trim();

            excerpt =
              plainText.length > 150
                ? plainText.substring(0, 150) + '...'
                : plainText;
          }
```

with:

```typescript
          // Generate excerpt if not provided
          let excerpt = data['excerpt'];
          if (!excerpt && content) {
            excerpt = deriveExcerpt(content);
          }
```

In `processContentDirectory`, replace the identical block (it uses `markdownContent` as the variable name):

```typescript
        // Generate excerpt if not provided
        let excerpt = data['excerpt'];
        if (!excerpt && markdownContent) {
          const plainText = markdownContent
            .replace(/#{1,6}\s+/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/\n+/g, ' ')
            .trim();

          excerpt =
            plainText.length > 150
              ? plainText.substring(0, 150) + '...'
              : plainText;
        }
```

with:

```typescript
        // Generate excerpt if not provided
        let excerpt = data['excerpt'];
        if (!excerpt && markdownContent) {
          excerpt = deriveExcerpt(markdownContent);
        }
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3`
Expected: tsc exit 0; all suites pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/content-core.ts
git commit -m "refactor(lib): extract shared deriveExcerpt in content-core

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Tighten team types (drop the any catch-alls)

**Files:**
- Modify: `src/lib/team.ts:14-37` (`TeamMember`/`TeamGroup`)

**Interfaces:**
- Produces:

```typescript
export type TeamMember = z.infer<typeof teamMemberSchema> & {
  slug: string;
  content: string;
  groupSlug: string;
};

export type TeamGroup = z.infer<typeof teamGroupSchema> & {
  slug: string;
  longDescription?: string;
};
```

Both schemas are `.passthrough()`, so extra frontmatter keys remain present at runtime and are typed `unknown` (not `any`) at the boundary. `state?: string | string[]` now comes from the schema (`z.union([z.string(), z.array(z.string())])`), which correctly types the array-aware state filters in `getTeamMembersByState`.

- [ ] **Step 1: Replace the interfaces**

Delete the `TeamMember` and `TeamGroup` interface declarations (with their `[key: string]: any` lines) and insert the two type aliases above. Keep the field doc comments by moving them above the aliases:

```typescript
/**
 * A team member: validated frontmatter (name, role, state(s), portrait,
 * imagePosition, images, order, ...) plus loader-derived fields. Extra
 * frontmatter keys pass through as `unknown`.
 */
export type TeamMember = z.infer<typeof teamMemberSchema> & {
  slug: string;
  content: string;
  groupSlug: string;
};

/** A team group index: validated frontmatter plus loader-derived fields. */
export type TeamGroup = z.infer<typeof teamGroupSchema> & {
  slug: string;
  longDescription?: string;
};
```

Then remove the now-redundant `as TeamMember` / `as TeamGroup` casts in `buildTeamGroup` and `getTeamMembersByGroup` (the object literals should satisfy the aliases directly; keep the spreads `...data`).

- [ ] **Step 2: Typecheck and fix fallout at call sites**

Run: `npx tsc --noEmit`

Expected fallout categories, with the fix for each:
- A component reads a member field that is real frontmatter but missing from `teamMemberSchema` → add the field to the schema in `src/lib/content-schemas.ts` (typed, optional) — do NOT cast.
- Bracket-vs-dot access: fields in the schema object are dot-accessible (`member.state`); passthrough extras require bracket access and a type guard. Prefer promoting a genuinely-used extra into the schema.
- `TeamGroup.order` was optional (`order?: number`) in the old interface but is REQUIRED in `teamGroupSchema`. `getTeamGroups`'s sort `(a.order || 999)` keeps compiling; if tsc flags a construction site missing `order`, the schema is the source of truth — every group index has it.
- The member sort in `getTeamMembersByGroup` uses `a['order']`; with the alias, use dot access `a.order` (it's in the schema).

If fallout exceeds ~10 call sites, STOP and report — the type may need to stay looser and the task gets re-scoped.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3`
Expected: tsc exit 0; all suites pass with unchanged snapshots.

- [ ] **Step 4: Commit**

```bash
git add src/lib/team.ts src/lib/content-schemas.ts
git commit -m "refactor(lib): type TeamMember/TeamGroup from zod schemas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Include any component files tsc forced you to touch — list them explicitly in the git add.)

---

### Task 9: Toolchain version alignment

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:** none (dev dependencies only).

- [ ] **Step 1: Bump the two Next-companion packages one major, to match next ^16**

```bash
npm install -D eslint-config-next@^16 @next/bundle-analyzer@^16
```

- [ ] **Step 2: Verify lint and build still work**

Run: `npm run lint 2>&1 | tail -5`
Expected: completes without new errors (warnings acceptable if pre-existing).

Run: `npx next build 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 3: Full test suite**

Run: `npx jest 2>&1 | tail -3`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): align eslint-config-next and bundle-analyzer with next 16

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Dropped from spec (with reason)

- **`ContentItem.frontmatter: Record<string, any>` → `unknown`** — scoped out. That field is the raw pre-validation boundary consumed by many modules (blog.ts, news pages); switching to `unknown` ripples widely for no domain-type gain. After Tasks 5/6/8 every domain loader validates through Zod, so the `any` no longer leaks past the boundary. Revisit only if a future bug traces to it.
- **generateMetadata for six dynamic routes** — verified 2026-07-06: ALL dynamic routes (`tapestries/[slug]`, `stitchers/[state]`, `team/[group]`, `team/[group]/[member]`, `shop/[product]`, `news/category/[category]`, `news/[slug]`) already export `generateMetadata`. The audit finding was stale.
- **Formatter consolidation** — Biome formats, ESLint lints; distinct roles, no overlap worth touching. Recorded in Global Constraints.

## Final verification (after Task 9)

1. `npx tsc --noEmit` — exit 0.
2. `npx jest` — all suites pass, snapshots unchanged since Task 5.
3. `npx next build` — succeeds.
4. Boot `npx next dev` and spot-check `/`, `/tapestries`, `/tapestries/virginia`, `/team`, `/team/stitchers`, `/stitchers/virginia`, `/sponsors`, `/news` — identical rendering to production (this phase changes no visuals).
