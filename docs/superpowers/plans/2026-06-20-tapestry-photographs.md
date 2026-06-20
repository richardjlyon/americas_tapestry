# Tapestry Photographs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the main image on each tapestry page (and the grid + homepage carousel) with a photograph of the finished, mounted tapestry, and add a new "Original Artwork" section that preserves the original design illustration with an artist credit.

**Architecture:** Drop each cropped photograph as `public/images/tapestries/{slug}/{slug}-main.jpg`; the existing image resolver's unused `main` branch then selects it as the main image with no resolver change. The existing artwork files (`{slug}-tapestry-*`) stay put and are exposed through a new `artworkPath` field rendered in a new `ArtworkCard` component. Images publish to Cloudflare R2 via the existing optimize-and-upload script.

**Tech Stack:** Next.js App Router (Server Components), TypeScript, Tailwind, Sharp (via `scripts/optimize-and-upload.mjs`), Cloudflare R2, Jest + React Testing Library, `sips` + ImageMagick (`magick`) for DNG conversion/cropping.

## Global Constraints

- Image source-of-truth: original `.DNG` files in `~/Downloads/America_s Tapestry Photos/` — never delete; keep for re-crops.
- Photo output path convention: `public/images/tapestries/{slug}/{slug}-photo.jpg` (lowercase, spaces→hyphens; `{slug}` matches existing content dirs in `content/tapestries/`). All 13 photos are portrait-oriented (Task 1, already committed).
- Do NOT modify `findImageInDirectory()` or rename/overwrite any existing `{slug}-tapestry-*` file (artwork stays put). The photo becomes the main image via a new `findPhotoInDirectory()` that the data getters PREFER over the existing resolver — not by relying on the resolver's `main` branch.
- Existing artwork filenames are INCONSISTENT across states: some are `{slug}-tapestry-{w}w.{ext}` (e.g. connecticut), others `{slug}-tapestry-main-{w}w.{ext}` with dedicated `{slug}-tapestry-thumbnail-{w}w.{ext}` variants (e.g. georgia). `findArtworkInDirectory()` must match `-tapestry-` AND exclude `thumbnail`.
- Caption copy (exact): `The original illustration by {artist}, the artwork our stitchers worked from.` Fallback when no artist: `The original illustration our stitchers worked from.`
- Section heading (exact): `Original Artwork`.
- Artist link target: `/team/illustrators/{slug}` (i.e. `/team/{groupSlug}/{slug}`).
- New "Original Artwork" section is placed immediately **before** the Team section and renders only when `artworkPath` is present.
- Webpack/cache build errors: clear `.next` and rebuild (`npm run build:clean`) — never disable features to work around them.
- Run from project root: `/Users/rjl/Code/github/americas_tapestry`.

## State → slug → postal code map (13 states)

| DNG file | slug |
|---|---|
| `CONNECTICUT_CT.DNG` | `connecticut` |
| `DELAWARE_DE.DNG` | `delaware` |
| `GEORGIA_GA.DNG` | `georgia` |
| `MARYLAND_MD.DNG` | `maryland` |
| `MASSACHUSETTS_MA.DNG` | `massachusetts` |
| `NEW HAMPSHIRE_NH.DNG` | `new-hampshire` |
| `NEW JERSEY_NJ.DNG` | `new-jersey` |
| `NEW YORK_NY.DNG` | `new-york` |
| `NORTH CAROLINA_NC.DNG` | `north-carolina` |
| `PENNSYLVANIA_PA.DNG` | `pennsylvania` |
| `RHODE ISLAND_RI.DNG` | `rhode-island` |
| `SOUTH CAROLINA_SC.DNG` | `south-carolina` |
| `VIRGINIA_VA.DNG` | `virginia` |

## File Structure

- `public/images/tapestries/{slug}/{slug}-photo.jpg` — **create** (13 files): the cropped photograph source. (Done in Task 1, committed.)
- `src/lib/image-manifest.json` — **modify**: gains 13 `{slug}-photo.jpg` → R2 variant entries (written by the script).
- `src/lib/tapestries.ts` — **modify**: add `artworkPath` to `TapestryEntry`, add `findPhotoInDirectory()` and `findArtworkInDirectory()`, make `imagePath`/`thumbnail` prefer the photo, populate `artworkPath` in `getTapestryBySlug` and `getAllTapestries`.
- `src/components/features/tapestries/artwork-card.tsx` — **create**: presentational card for the original artwork + artist caption.
- `src/app/tapestries/[slug]/page.tsx` — **modify**: derive artist links from `illustrators`, render the new "Original Artwork" section before the Team section.
- `src/__tests__/tapestry-artwork.test.tsx` — **create**: unit tests for `findArtworkInDirectory` / `artworkPath` and the `ArtworkCard` component.

---

### Task 1: Convert and crop the 13 photographs

**Files:**
- Create: `public/images/tapestries/{slug}/{slug}-main.jpg` (13 files)

**Interfaces:**
- Consumes: `.DNG` files in `~/Downloads/America_s Tapestry Photos/`.
- Produces: 13 cropped JPEGs at the convention path, each tightly cropped to the navy tapestry border (white wall removed).

This task is asset processing, not TDD. Its "test" is a visual spot-check.

- [ ] **Step 1: Convert + auto-trim all 13 DNGs in one pass**

Run this from project root. It maps each DNG to its slug, converts DNG→JPEG with `sips`, then trims the near-white wall margin with ImageMagick (the navy fabric border is preserved because trim only removes the uniform light surround):

```bash
SRC="$HOME/Downloads/America_s Tapestry Photos"
declare -A MAP=(
  [CONNECTICUT_CT]=connecticut [DELAWARE_DE]=delaware [GEORGIA_GA]=georgia
  [MARYLAND_MD]=maryland [MASSACHUSETTS_MA]=massachusetts ["NEW HAMPSHIRE_NH"]=new-hampshire
  ["NEW JERSEY_NJ"]=new-jersey ["NEW YORK_NY"]=new-york ["NORTH CAROLINA_NC"]=north-carolina
  [PENNSYLVANIA_PA]=pennsylvania ["RHODE ISLAND_RI"]=rhode-island ["SOUTH CAROLINA_SC"]=south-carolina
  [VIRGINIA_VA]=virginia
)
mkdir -p /tmp/tap_full
for key in "${!MAP[@]}"; do
  slug="${MAP[$key]}"
  dest="public/images/tapestries/$slug"
  mkdir -p "$dest"
  sips -s format jpeg "$SRC/$key.DNG" --out "/tmp/tap_full/$slug.jpg" >/dev/null
  magick "/tmp/tap_full/$slug.jpg" -fuzz 12% -trim +repage -quality 92 "$dest/$slug-main.jpg"
  echo "done: $slug-main.jpg"
done
```

Expected: 13 lines `done: {slug}-main.jpg`. (Keep `/tmp/tap_full/*.jpg` — the un-trimmed full conversions — for manual re-crops in Step 3.)

- [ ] **Step 2: Verify all 13 files exist with sane dimensions**

```bash
for d in public/images/tapestries/*/; do s=$(basename "$d"); [ -f "$d$s-main.jpg" ] && echo "$s: $(sips -g pixelWidth -g pixelHeight "$d$s-main.jpg" | grep -o '[0-9]*' | tr '\n' 'x')"; done
```

Expected: 13 lines, each with portrait-ish dimensions (height > width), widths in the low thousands of px.

- [ ] **Step 3: Visual spot-check each crop (use the Read tool on each `{slug}-main.jpg`)**

For each of the 13 files, view it and confirm the crop sits tight to the navy fabric border with no wall margin and nothing of the tapestry clipped. For any that failed auto-trim (uneven lighting, shadow, non-white surround), re-crop manually from the saved full conversion using explicit geometry:

```bash
# Determine crop box visually, then:
magick "/tmp/tap_full/<slug>.jpg" -crop WIDTHxHEIGHT+X+Y +repage -quality 92 "public/images/tapestries/<slug>/<slug>-main.jpg"
```

Do not proceed until all 13 crops are confirmed acceptable.

- [ ] **Step 4: Commit the photo sources**

```bash
git add public/images/tapestries/*/*-main.jpg
git commit -m "feat: add cropped photographs of mounted tapestries"
```

---

### Task 2: Optimize and publish photographs to R2

**Files:**
- Modify: `src/lib/image-manifest.json` (written by the script)

**Interfaces:**
- Consumes: the 13 `{slug}-photo.jpg` files from Task 1; R2 credentials in `.env.local` (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
- Produces: 13 new manifest entries keyed `/images/tapestries/{slug}/{slug}-photo.jpg`, each with R2 WebP variant URLs. Existing `{slug}-tapestry-*` entries unchanged.

- [ ] **Step 1: Dry-run to confirm exactly the 13 new files are detected**

```bash
node scripts/optimize-and-upload.mjs --path=tapestries --dry-run
```

Expected: output lists the 13 `{slug}-photo.jpg` files as new/to-process and reports existing `{slug}-tapestry-*` variants as skipped (already in manifest).

- [ ] **Step 2: Run the real optimize + upload**

```bash
node scripts/optimize-and-upload.mjs --path=tapestries
```

Expected: `Processed: 13` (one per state), `Uploaded: 39 variants` (13 × 3 widths). No errors.

- [ ] **Step 3: Verify the manifest gained the 13 entries**

```bash
node -e "const m=require('./src/lib/image-manifest.json'); const k=Object.keys(m).filter(x=>/\/[a-z-]+-photo\.jpg$/.test(x)&&x.includes('tapestries')); console.log('photo entries:',k.length); console.log(k.slice(0,3).join('\n'))"
```

Expected: `photo entries: 13` and sample paths like `/images/tapestries/connecticut/connecticut-photo.jpg`.

- [ ] **Step 4: Commit the manifest**

```bash
git add src/lib/image-manifest.json
git commit -m "chore: publish tapestry photographs to R2 (manifest)"
```

---

### Task 3: Add `artworkPath` to the data layer

**Files:**
- Modify: `src/lib/tapestries.ts`
- Test: `src/__tests__/tapestry-artwork.test.tsx`

**Interfaces:**
- Consumes: `public/images/tapestries/{slug}/` directory contents — the `{slug}-photo.jpg` from Task 1, plus existing artwork files that are named EITHER `{slug}-tapestry-{w}w.{ext}` (e.g. connecticut) OR `{slug}-tapestry-main-{w}w.{ext}` with separate `{slug}-tapestry-thumbnail-{w}w.{ext}` files (e.g. georgia).
- Produces:
  - `findPhotoInDirectory(tapestrySlug: string): string | null` — returns the public path to `{slug}-photo.*` (prefers `.webp`, then `.jpg`) or `null`.
  - `findArtworkInDirectory(tapestrySlug: string): string | null` — returns the original-artwork variant: a `-tapestry-` file that is NOT a `thumbnail` (prefers the `-1024w` variant) or `null`.
  - `TapestryEntry.artworkPath?: string` — populated in both `getTapestryBySlug` and `getAllTapestries`.
  - `TapestryEntry.imagePath` and `TapestryEntry.thumbnail` now PREFER the photo (`{slug}-photo.jpg`) when present, falling back to the existing `findImageInDirectory()` / thumbnail logic. `findImageInDirectory()` is NOT modified.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/tapestry-artwork.test.tsx`:

```tsx
import {
  getTapestryBySlug,
  findArtworkInDirectory,
  findPhotoInDirectory,
} from '@/lib/tapestries';

describe('tapestry artwork data layer', () => {
  it('findPhotoInDirectory returns the photograph for a state', () => {
    expect(findPhotoInDirectory('connecticut')).toMatch(/connecticut-photo\.jpg$/);
  });

  it('findArtworkInDirectory returns the artwork, excluding thumbnails', () => {
    // connecticut: {slug}-tapestry-{w}w naming
    expect(findArtworkInDirectory('connecticut')).toMatch(
      /\/images\/tapestries\/connecticut\/connecticut-tapestry-.*\.(webp|jpg|jpeg|png|avif)$/,
    );
    // georgia: {slug}-tapestry-main-{w}w naming, with separate -thumbnail- files
    const g = findArtworkInDirectory('georgia');
    expect(g).toMatch(/georgia-tapestry-main-/);
    expect(g).not.toMatch(/thumbnail/);
  });

  it('findArtworkInDirectory returns null for an unknown slug', () => {
    expect(findArtworkInDirectory('atlantis')).toBeNull();
  });

  it('getTapestryBySlug: imagePath/thumbnail are the photo, artworkPath is the artwork', async () => {
    const t = await getTapestryBySlug('georgia');
    expect(t).not.toBeNull();
    expect(t!.imagePath).toMatch(/georgia-photo\.jpg$/);
    expect(t!.thumbnail).toMatch(/georgia-photo\.jpg$/);
    expect(t!.artworkPath).toMatch(/georgia-tapestry-main-/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --testPathPattern=tapestry-artwork`
Expected: FAIL — `findPhotoInDirectory` / `findArtworkInDirectory` are not exported.

- [ ] **Step 3: Add `artworkPath` to the interface**

In `src/lib/tapestries.ts`, in the `TapestryEntry` interface, add after `imagePath?: string;`:

```ts
  artworkPath?: string;
```

- [ ] **Step 4: Add and export `findPhotoInDirectory` and `findArtworkInDirectory`**

In `src/lib/tapestries.ts`, directly after the `findImageInDirectory` function (do NOT modify `findImageInDirectory` itself), add:

```ts
// Find the PHOTOGRAPH of the finished, mounted tapestry: {slug}-photo.*.
// This becomes the main image and thumbnail, preferred over the resolver.
export function findPhotoInDirectory(tapestrySlug: string): string | null {
  const publicImagePath = path.join(
    process.cwd(),
    'public/images/tapestries',
    tapestrySlug,
  );

  if (!fs.existsSync(publicImagePath)) return null;

  const files = fs.readdirSync(publicImagePath);
  const formatPriority = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

  for (const format of formatPriority) {
    const file = files.find(
      (f) => path.extname(f).toLowerCase() === format && f.includes('-photo'),
    );
    if (file) return `/images/tapestries/${tapestrySlug}/${file}`;
  }

  return null;
}

// Find the ORIGINAL ARTWORK image (the design illustration the stitchers worked
// from): the {slug}-tapestry-* files, EXCLUDING the {slug}-tapestry-thumbnail-*
// variants. Artwork naming is inconsistent across states ({slug}-tapestry-{w}w
// and {slug}-tapestry-main-{w}w), so match on "-tapestry-" and exclude
// "thumbnail".
export function findArtworkInDirectory(tapestrySlug: string): string | null {
  const publicImagePath = path.join(
    process.cwd(),
    'public/images/tapestries',
    tapestrySlug,
  );

  if (!fs.existsSync(publicImagePath)) return null;

  const files = fs.readdirSync(publicImagePath);
  const formatPriority = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

  // Prefer the 1024w artwork variant.
  for (const format of formatPriority) {
    const variant = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      const lower = file.toLowerCase();
      return (
        ext === format &&
        lower.includes('-tapestry-') &&
        !lower.includes('thumbnail') &&
        file.includes('-1024w')
      );
    });
    if (variant) return `/images/tapestries/${tapestrySlug}/${variant}`;
  }

  // Fallback: any non-thumbnail artwork file.
  for (const format of formatPriority) {
    const variant = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      const lower = file.toLowerCase();
      return (
        ext === format &&
        lower.includes('-tapestry-') &&
        !lower.includes('thumbnail')
      );
    });
    if (variant) return `/images/tapestries/${tapestrySlug}/${variant}`;
  }

  return null;
}
```

- [ ] **Step 5: Prefer the photo for `imagePath`/`thumbnail` + set `artworkPath` in `getAllTapestries`**

In `src/lib/tapestries.ts`, inside `getAllTapestries`, find the line `const imagePath = findImageInDirectory(slug);` (inside the per-tapestry loop) and replace it with:

```ts
      const photoPath = findPhotoInDirectory(slug);
      const imagePath = photoPath || findImageInDirectory(slug);
```

Then, a few lines below, change the thumbnail initializer from:

```ts
      let thumbnail = data['thumbnail'];
```

to:

```ts
      let thumbnail = data['thumbnail'] || photoPath;
```

Then, in the `tapestries.push({ ... })` object, immediately after the `imagePath,` line, add:

```ts
        artworkPath: findArtworkInDirectory(slug) || undefined,
```

- [ ] **Step 6: Prefer the photo for `imagePath`/`thumbnail` + set `artworkPath` in `getTapestryBySlug`**

In `src/lib/tapestries.ts`, inside `getTapestryBySlug`, find the line `const imagePath = findImageInDirectory(slug);` and replace it with:

```ts
    const photoPath = findPhotoInDirectory(slug);
    const imagePath = photoPath || findImageInDirectory(slug);
```

Then change `let thumbnail = data['thumbnail'];` (in this function) to:

```ts
    let thumbnail = data['thumbnail'] || photoPath;
```

Then, in this function's returned object, immediately after the `imagePath,` line, add:

```ts
      artworkPath: findArtworkInDirectory(slug) || undefined,
```

(Match the surrounding indentation at each location.)

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- --testPathPattern=tapestry-artwork`
Expected: PASS (4 passing).

- [ ] **Step 8: Typecheck and commit**

```bash
npm run typecheck
git add src/lib/tapestries.ts src/__tests__/tapestry-artwork.test.tsx
git commit -m "feat: resolve original artwork path for tapestries"
```

Expected: typecheck clean; commit succeeds.

---

### Task 4: Build the `ArtworkCard` component

**Files:**
- Create: `src/components/features/tapestries/artwork-card.tsx`
- Test: `src/__tests__/tapestry-artwork.test.tsx` (extend)

**Interfaces:**
- Consumes: `getImagePath` from `@/lib/image-utils`, `OptimizedImage` from `@/components/ui/optimized-image`, `Link` from `next/link`.
- Produces:
  - `interface ArtworkArtist { name: string; href: string; }`
  - `function ArtworkCard(props: { src: string; alt: string; artists: ArtworkArtist[] }): JSX.Element`
  - Renders the image plus a caption: with ≥1 artist → `The original illustration by <links>, the artwork our stitchers worked from.`; with 0 artists → `The original illustration our stitchers worked from.`

- [ ] **Step 1: Write the failing component tests (append to the existing test file)**

Append to `src/__tests__/tapestry-artwork.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ArtworkCard } from '@/components/features/tapestries/artwork-card';

describe('ArtworkCard', () => {
  it('names one artist and links to their page', () => {
    render(
      <ArtworkCard
        src="/images/tapestries/new-hampshire/new-hampshire-tapestry-1024w.webp"
        alt="New Hampshire original artwork"
        artists={[{ name: 'Elizabeth Long', href: '/team/illustrators/elizabeth-long' }]}
      />,
    );
    const link = screen.getByRole('link', { name: 'Elizabeth Long' });
    expect(link).toHaveAttribute('href', '/team/illustrators/elizabeth-long');
    expect(screen.getByText(/our stitchers worked from/i)).toBeInTheDocument();
  });

  it('uses the generic caption with no artist and renders no link', () => {
    render(
      <ArtworkCard src="/x.webp" alt="art" artists={[]} />,
    );
    expect(
      screen.getByText('The original illustration our stitchers worked from.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links every artist when there are multiple', () => {
    render(
      <ArtworkCard
        src="/x.webp"
        alt="art"
        artists={[
          { name: 'Ada One', href: '/team/illustrators/ada-one' },
          { name: 'Bea Two', href: '/team/illustrators/bea-two' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ada One' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bea Two' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --testPathPattern=tapestry-artwork`
Expected: FAIL — `ArtworkCard` cannot be imported (module not found).

- [ ] **Step 3: Implement `ArtworkCard`**

Create `src/components/features/tapestries/artwork-card.tsx`:

```tsx
import Link from 'next/link';
import { Fragment } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';

export interface ArtworkArtist {
  name: string;
  href: string;
}

interface ArtworkCardProps {
  src: string;
  alt: string;
  artists: ArtworkArtist[];
}

/**
 * Card preserving a tapestry's original design illustration, with an artist
 * credit linking to the illustrator's page.
 *
 * @param src - Public path to the original-artwork image
 * @param alt - Alt text for the artwork image
 * @param artists - Illustrators to credit; empty array uses a generic caption
 */
export function ArtworkCard({ src, alt, artists }: ArtworkCardProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg bg-colonial-parchment p-4 shadow-md">
        <OptimizedImage
          src={getImagePath(src)}
          alt={alt}
          width={1024}
          height={1317}
          className="h-auto w-full rounded"
          role="feature"
          quality={85}
          enableBlurPlaceholder
        />
        <p className="mt-4 text-center text-sm italic text-colonial-navy/80">
          {artists.length > 0 ? (
            <>
              The original illustration by{' '}
              {artists.map((artist, index) => (
                <Fragment key={artist.href}>
                  {index > 0 &&
                    (index === artists.length - 1 ? ' and ' : ', ')}
                  <Link
                    href={artist.href}
                    className="font-medium text-colonial-burgundy underline hover:text-colonial-navy"
                  >
                    {artist.name}
                  </Link>
                </Fragment>
              ))}
              , the artwork our stitchers worked from.
            </>
          ) : (
            'The original illustration our stitchers worked from.'
          )}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --testPathPattern=tapestry-artwork`
Expected: PASS (6 passing total).

- [ ] **Step 5: Typecheck and commit**

```bash
npm run typecheck
git add src/components/features/tapestries/artwork-card.tsx src/__tests__/tapestry-artwork.test.tsx
git commit -m "feat: add ArtworkCard with artist credit"
```

---

### Task 5: Render the "Original Artwork" section on the tapestry page

**Files:**
- Modify: `src/app/tapestries/[slug]/page.tsx`

**Interfaces:**
- Consumes: `tapestry.artworkPath` (Task 3), `ArtworkCard` + `ArtworkArtist` (Task 4), the already-fetched `illustrators` array (from `getTeamMembersByState`, each item has `name`, `slug`, `groupSlug`).
- Produces: a new pin-separated "Original Artwork" section rendered before the Team section when `artworkPath` exists.

- [ ] **Step 1: Import `ArtworkCard`**

In `src/app/tapestries/[slug]/page.tsx`, add with the other component imports:

```ts
import { ArtworkCard } from '@/components/features/tapestries/artwork-card';
```

- [ ] **Step 2: Derive the artist list**

In the same file, after `illustrators` is destructured from the team members (the `const { stateDirectors, historicalPartners, illustrators, ... } = teamMembers;` block), add:

```ts
  const artworkArtists = (illustrators ?? []).map((illustrator) => ({
    name: illustrator.name,
    href: `/team/${illustrator.groupSlug}/${illustrator.slug}`,
  }));
```

- [ ] **Step 3: Render the section before the Team section**

In the JSX, locate the comment `{/* Pin separator */}` immediately followed by `{/* Team section */}` and the `{hasTeamMembers && (` block. Directly **before** that pin separator, insert:

```tsx
        {/* Original Artwork section */}
        {tapestry.artworkPath && (
          <>
            {/* Pin separator */}
            <div className="flex justify-center pt-8 pb-2">
              <div className="page-section-pin-bottom" />
            </div>

            <div className="pt-6">
              <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
                Original Artwork
              </h2>
              <ArtworkCard
                src={tapestry.artworkPath}
                alt={`${tapestry.title} original illustration`}
                artists={artworkArtists}
              />
            </div>
          </>
        )}

```

(The existing pin separator that already precedes the Team section stays as-is, so the Team section keeps its own divider.)

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean (no errors).

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds and statically generates the `/tapestries/[slug]` routes. If a webpack/cache error appears, run `npm run build:clean` and retry — do not disable features.

- [ ] **Step 6: Visual verification (dev server)**

Run `npm run dev` and check:
- `/tapestries/connecticut` — hero shows the **photograph**; lower on the page an "Original Artwork" section shows the **illustration** in a centered card with caption `The original illustration by <linked artist>, the artwork our stitchers worked from.`; the artist name links to `/team/illustrators/{slug}`.
- One more state (e.g. `/tapestries/new-hampshire`).
- `/tapestries` grid and the homepage `/` — tapestry images now show the **photographs**.

- [ ] **Step 7: Commit**

```bash
git add src/app/tapestries/[slug]/page.tsx
git commit -m "feat: add Original Artwork section to tapestry pages"
```

---

## Self-Review

**Spec coverage:**
- Replace main image with photo → Task 1 (crop, rotate to portrait), Task 2 (publish), Task 3 (`findPhotoInDirectory` makes `{slug}-photo.jpg` the `imagePath`). ✓
- Photos everywhere (grid + carousel) → Task 3 makes `thumbnail` prefer the photo too; confirmed visually in Task 5 Step 6. ✓
- New "Original Artwork" section before Team, contained card + caption → Task 4 + Task 5. ✓
- Artist name in caption, linked to illustrator page, graceful fallback → Task 4 (component logic + tests for 1/0/many) + Task 5 (derive artists). ✓
- Tight crop to navy border with spot-check → Task 1 Steps 1 & 3 (done, user-confirmed). ✓
- No resolver change, artwork untouched → Task 3 (additive only; `findImageInDirectory` unmodified). ✓
- Manifest gains 13 entries, artwork unchanged → Task 2 Step 3. ✓

**Placeholder scan:** No TBD/TODO; all code and commands are concrete. ✓

**Type consistency:** `findArtworkInDirectory` (Task 3) used in Task 3 only; `artworkPath` defined Task 3, consumed Task 5; `ArtworkCard`/`ArtworkArtist` defined Task 4, consumed Task 5; `illustrator.groupSlug`/`.slug`/`.name` match `TeamMember` (`src/lib/team.ts`). ✓
