# Tapestry Photographs — Design

**Date:** 2026-06-20
**Status:** Approved, ready for implementation planning

## Context

America's Tapestry exhibition opened the weekend of 2026-06-20. We have
photographs of each of the 13 mounted, finished tapestries (raw `.DNG` files in
`~/Downloads/America_s Tapestry Photos/`, one per state). Until now the tapestry
pages have shown the **original design illustration** (the artwork the stitchers
worked from) as the main image.

## Goal (two parts)

1. **Replace** the main image on each tapestry page with the photograph of the
   finished, mounted tapestry — and carry that photo through to the `/tapestries`
   grid and the homepage carousel ("photos everywhere").
2. **Preserve** the original artwork in a new, dedicated section on each tapestry
   page so the design illustration is not lost.

## Non-goals

- No redesign of the hero `FullImageViewer` (the photo is the same portrait
  aspect ratio as the artwork, so existing crop/expand behavior is unchanged).
- No changes to the dedicated `/images/carousel/` hero images.
- No re-processing of the existing artwork assets (already optimized + in R2).

## Key facts discovered

- Detail page: `src/app/tapestries/[slug]/page.tsx` renders one hero image via
  `FullImageViewer`, sourced from `tapestry.imagePath`.
- `imagePath` is resolved by `findImageInDirectory(slug)` in
  `src/lib/tapestries.ts`. That function **already prefers** a file whose name
  contains `main` (a branch that is currently never exercised, because existing
  files are all named `{slug}-tapestry-*` and resolution falls through to a
  generic "any non-thumbnail" fallback).
- `tapestry.thumbnail` falls back to `imagePath` when no `*thumbnail*` file
  exists (none do), so the grid (`tapestry-card.tsx`) and the homepage carousel
  (tapestry items in `src/app/page.tsx`) follow the main image automatically.
- No source file hardcodes a `{slug}-tapestry-*` path; everything goes through
  the resolved fields.
- Images are served from Cloudflare R2 via `src/lib/image-manifest.json`. New
  images are published with `node scripts/optimize-and-upload.mjs` (drop file in
  `public/images/...`, run script → WebP variants at 640/1024/1920 uploaded to
  R2, manifest updated; already-listed paths are skipped).
- Existing artwork (e.g. `connecticut-tapestry-1024w.jpg`) is portrait
  (1024×1317 ≈ 0.78). The photos are portrait too (≈0.75). Like-for-like swap.

## Chosen approach (A): convention via the `main` keyword

The photo becomes the main image by exploiting the resolver's existing,
intended-but-unused `main` branch. The old artwork files stay exactly where they
are and gain a new accessor.

This was chosen over:
- **B (explicit frontmatter `photo:`/`artwork:` per `index.md`)** — edits 13
  content files and adds manual bookkeeping for a uniform convention. YAGNI.
- **C (swap files in place)** — overwrites ~150 artwork files and forces a full
  manifest/R2 re-upload of artwork that is already correct. More risk, no
  benefit.

## Design

### 1. Photo processing (13 states)

- Convert each `*.DNG` → high-resolution JPEG, **cropped tight to the navy
  tapestry border**, removing the surrounding wall margin. Per-image crop with a
  spot-check pass for the user to confirm before upload.
- Output to `public/images/tapestries/{slug}/{slug}-main.jpg`, where `{slug}` is
  the existing content slug (e.g. `connecticut`, `new-hampshire`).
- State → slug mapping derived from the `_XX.DNG` postal codes
  (CT, DE, GA, MD, MA, NH, NJ, NY, NC, PA, RI, SC, VA → the 13 content dirs).
- Run `node scripts/optimize-and-upload.mjs --path=tapestries`. Generates WebP
  variants, uploads to R2, updates `src/lib/image-manifest.json`. Existing
  artwork entries are skipped (already in manifest).
- Commit the new `{slug}-main.jpg` sources and the updated manifest.

### 2. Data layer (`src/lib/tapestries.ts`)

- Add `artworkPath?: string` to the `TapestryEntry` interface.
- Add `findArtworkInDirectory(slug)`: returns the existing artwork variant
  (`{slug}-tapestry-1024w.webp`, with sensible format/width fallback within the
  state dir) or `null`.
- Populate `artworkPath` in both `getTapestryBySlug` and `getAllTapestries`.
- `imagePath` / `thumbnail` require **no change** — once `{slug}-main.jpg`
  exists, the resolver's `main` branch returns the photo, and `thumbnail` follows
  it. (Verify the resolver returns the photo, not the artwork, for a state that
  has both files.)

### 3. UI — new "Original Artwork" section

- File: `src/app/tapestries/[slug]/page.tsx`. Add a new **pin-separated section
  placed immediately before the Team section**, rendered only when
  `artworkPath` is present.
- Section heading: **"Original Artwork"**.
- Display: a **contained, centered card** (≈`max-w-2xl`) holding the
  illustration, styled to match the existing card/parchment idiom. No status
  badge, no expand/collapse toggle.
- Caption beneath the image **names the artist and links to their illustrator
  detail page**:
  - One illustrator: *"The original illustration by [Artist Name], the artwork
    our stitchers worked from."* — `[Artist Name]` is a `<Link>` to
    `/team/illustrators/{slug}`.
  - Multiple illustrators: list all names (each linked), joined naturally.
  - No illustrator on record: graceful fallback to *"The original illustration
    our stitchers worked from."* (no link).
- The page already fetches `illustrators` for the state via
  `getTeamMembersByState(tapestry.title)` (used by the Team section) — reuse that
  array; no new data fetch. Derive `{ name, href }` per illustrator where
  `href = /team/illustrators/{illustrator.slug}`.
- Extract a small presentational component
  `src/components/features/tapestries/artwork-card.tsx` to keep the page file
  focused. Props: resolved artwork image `src`, `alt`, and an `artists`
  array (`{ name, href }[]`). The component renders the caption (with `<Link>`s)
  and falls back to the generic caption when `artists` is empty.

### 4. Unchanged

- Hero `FullImageViewer` (16:9 collapsed, expand toggle, status badge) — now
  shows the photo with identical behavior.
- Grid (`tapestry-card.tsx`) and homepage carousel — show the photo via
  `thumbnail` fallback, no code change.

## Verification

- `npm run build` succeeds (clear `.next` cache and rebuild if webpack/cache
  errors appear — do not disable features).
- `/tapestries/connecticut` and 1–2 other states: hero shows the photograph; the
  new "Original Artwork" card shows the illustration with a caption naming the
  artist; the artist name links to `/team/illustrators/{slug}`.
- A state with no illustrator on record falls back to the generic caption with no
  broken link.
- `/tapestries` grid and the homepage show photographs.
- All 13 photo crops spot-checked and confirmed by the user.
- `src/lib/image-manifest.json` gained 13 `{slug}-main.jpg` entries; existing
  artwork entries unchanged.

## Open questions / risks

- **Crop accuracy:** tight cropping to the navy border is per-image judgement;
  the spot-check pass mitigates this. Keep the original DNGs as the source of
  truth in case a re-crop is needed.
- **Resolver determinism:** confirm during implementation that, for a dir
  containing both `{slug}-main.jpg` and `{slug}-tapestry-*`, `imagePath`
  resolves to the photo. If any edge case fails, fall back to making the resolver
  preference explicit (prefer `*-main*` over the generic fallback) rather than
  renaming files.
