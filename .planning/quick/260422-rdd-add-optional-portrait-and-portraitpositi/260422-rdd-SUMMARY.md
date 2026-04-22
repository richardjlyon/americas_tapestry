---
phase: quick-260422-rdd
plan: 01
subsystem: team-content
tags: [team, portrait, member-card, team-card, frontmatter, schema]
dependency_graph:
  requires: []
  provides:
    - "TeamMember.portrait / TeamMember.portraitPosition optional fields"
    - "Portrait-aware primary image rendering in member-card and team-card"
  affects:
    - "Any future team member whose index.md sets `portrait:` frontmatter"
tech_stack:
  added: []
  patterns:
    - "Fallback chain: portraitPosition ?? imagePosition ?? <component default>"
    - "hasPortrait helper guarding primary-image-only substitution"
key_files:
  created: []
  modified:
    - src/lib/team.ts
    - src/components/features/team/member-card.tsx
    - src/components/features/tapestries/team-card.tsx
    - content/team/SCHEMA.md
decisions:
  - "D-01..D-07 from PLAN carried through unchanged: field names exact, primary-only override, images[] gallery untouched, stitching-groups excluded, center/bottom->top transform preserved when portrait absent"
metrics:
  duration_minutes: 2
  completed_date: 2026-04-22
---

# Quick Task 260422-rdd: Add Optional Portrait and PortraitPosition Summary

Added optional `portrait` and `portraitPosition` frontmatter fields to team members; when `portrait` is set, the primary (non-gallery) image in both the member detail/listing card and the state-page thumbnail renders `/images/team/{groupSlug}/{portrait}` instead of the `images[0]` / `{slug}.{ext}` fallback, with `portraitPosition` controlling object-position via a `portraitPosition ?? imagePosition ?? <existing default>` fallback chain. Gallery thumbnails and the lightbox are intentionally untouched and continue to iterate over `images[]`.

## Files Modified (4)

- `src/lib/team.ts` — Extended `TeamMember` interface with `portrait?: string` and `portraitPosition?: string`, placed immediately after `imagePosition`.
- `src/components/features/team/member-card.tsx` — Added `hasPortrait` helper; added portrait branch to `getImageSrc` (imageIndex === 0, non-stitching-groups only); updated 7 primary-image `objectPosition` call sites (grid 250-commission, grid default, full multi-image main, full single-image 250-commission, full single-image default with preserved center/bottom→top transform when portrait absent, full placeholder fallback, simple variant) to use the portraitPosition fallback chain when `hasPortrait` is true. Gallery thumbnails (`member.images!.slice(1)`) and lightbox untouched.
- `src/components/features/tapestries/team-card.tsx` — Added portrait branch in `getImageSrc` (after stitching-groups early-return, before `{slug}.jpg` fallback); updated the single avatar `objectPosition` to use the portraitPosition fallback chain when `member.portrait` is set; preserved `failedImages` guard as first check.
- `content/team/SCHEMA.md` — Added `portrait` and `portraitPosition` to Optional Fields YAML block; added new `#### Portrait Override` subsection under Image Handling (after Multi-Image Support, before URLs) documenting the primary-only override semantics, gallery non-impact, fallback chain, and stitching-groups exclusion.

## Override Semantics Implemented (cross-check vs. D-01..D-07)

- **D-01 (field names):** `portrait: string` and `portraitPosition: string`, both optional — added exactly as specified.
- **D-02 (path pattern):** `/images/team/{groupSlug}/{portrait}` in both `member-card.tsx` (line ~44) and `team-card.tsx` (line ~54) — matches.
- **D-03 (primary-only override):** `member-card.tsx` guards with `imageIndex === 0`; gallery thumbnails iterate `member.images!.slice(1)` unchanged; lightbox reads `getImageSrc(currentImageIndex)` so when user navigates past index 0 the portrait is naturally not substituted (matches "images[] unchanged").
- **D-04 (fallback chain):** `portraitPosition ?? imagePosition ?? <default>` applied at all seven member-card primary-image call sites and the one team-card call site. Default is `'center'` everywhere except the full single-image default branch (`member-card.tsx` ~line 365) where the default is `'top'`. Center/bottom→top transform is preserved verbatim when `hasPortrait` is false.
- **D-05 (stitching-groups untouched):** `hasPortrait` forces `false` for `groupSlug === 'stitching-groups'`; the portrait branch in `getImageSrc` also checks `groupSlug !== 'stitching-groups'` defensively; `team-card.tsx` stitching-groups branch returns early before the portrait check so stitching-groups `image` field still wins. State-director `{member}-face.jpg` resolution is not present in either of the two files touched, so it is untouched.
- **D-06 (verification):** `npm run typecheck` only — ran and passed.
- **D-07 (out of scope):** No existing member markdown files were populated with `portrait:`. Lightbox/gallery logic unchanged. No tests added.

## Typecheck Result

`npm run typecheck` — PASS (tsc --noEmit exit 0, no new errors).

## Deviations from Plan

None. Plan executed exactly as written. Every line specified in the `<action>` blocks was applied at the specified location; no auto-fixes (Rule 1/2/3) triggered; no architectural checkpoints (Rule 4) were reached.

## Commits

| Task | Hash    | Type | Description |
|------|---------|------|-------------|
| 1    | 4671499 | feat | Add portrait and portraitPosition to TeamMember rendering |
| 2    | 3864d3c | docs | Document portrait and portraitPosition fields in team SCHEMA |

## Self-Check: PASSED

- File `src/lib/team.ts` exists and contains `portrait?: string` and `portraitPosition?: string` on lines 13–14.
- File `src/components/features/team/member-card.tsx` exists and contains `hasPortrait` (line 29) and `member.portrait` branches in `getImageSrc`.
- File `src/components/features/tapestries/team-card.tsx` exists and contains `member.portrait` branch in `getImageSrc` (line ~53) and portrait-aware `objectPosition` (line ~100).
- File `content/team/SCHEMA.md` exists, contains `^portrait: string`, `^portraitPosition: string`, and the `Portrait Override` subsection (all four grep checks from Task 2 verify block passed).
- Commits `4671499` and `3864d3c` present in `git log` on current branch.
- `npm run typecheck` exits 0.
