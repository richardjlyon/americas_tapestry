---
phase: quick-260422-rdd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/team.ts
  - src/components/features/team/member-card.tsx
  - src/components/features/tapestries/team-card.tsx
  - content/team/SCHEMA.md
autonomous: true
requirements:
  - QUICK-260422-RDD
must_haves:
  truths:
    - "TeamMember interface exposes optional portrait and portraitPosition fields"
    - "When a member has portrait set, member-card primary image (grid/simple/full single-image) renders /images/team/{groupSlug}/{portrait} instead of images[0] or {slug}.{ext}"
    - "When a member has portrait set, team-card (state page thumbnail) renders the portrait instead of {slug}.jpg"
    - "When portrait is set without portraitPosition, objectPosition falls back to imagePosition, then to the component's existing default"
    - "Gallery thumbnails and lightbox in full variant continue to use images[] only (portrait is not substituted there)"
    - "SCHEMA.md documents portrait and portraitPosition in Optional Fields and explains the override semantics in Image Handling"
    - "Project typechecks cleanly with npm run typecheck"
  artifacts:
    - path: "src/lib/team.ts"
      provides: "Extended TeamMember interface with portrait?: string and portraitPosition?: string"
      contains: "portrait?: string"
    - path: "src/components/features/team/member-card.tsx"
      provides: "getImageSrc and objectPosition logic honoring portrait"
      contains: "member.portrait"
    - path: "src/components/features/tapestries/team-card.tsx"
      provides: "getImageSrc and objectPosition logic honoring portrait"
      contains: "member.portrait"
    - path: "content/team/SCHEMA.md"
      provides: "Docs for portrait and portraitPosition fields"
      contains: "portrait"
  key_links:
    - from: "content/team/{group}/{member}/index.md frontmatter"
      to: "TeamMember.portrait / TeamMember.portraitPosition"
      via: "gray-matter parse in getTeamMembersByGroup (spread ...data)"
      pattern: "portrait"
    - from: "TeamMember.portrait"
      to: "member-card.tsx getImageSrc(0) return value"
      via: "conditional branch before images[] fallback"
      pattern: "member.portrait"
    - from: "TeamMember.portrait"
      to: "team-card.tsx getImageSrc(member) return value"
      via: "conditional branch before {slug}.jpg fallback"
      pattern: "member.portrait"
    - from: "TeamMember.portraitPosition"
      to: "objectPosition style on portrait-rendering <Image>"
      via: "portraitPosition ?? imagePosition ?? default"
      pattern: "portraitPosition"
---

<objective>
Add optional `portrait` and `portraitPosition` frontmatter fields to team members. When set, `portrait` becomes the primary/thumbnail image (replacing the `images[0]` / `{slug}.{ext}` fallback) in both the member-card component (grid, simple, and full single-image variants) and the team-card component (state-page thumbnail). `portraitPosition` controls cropping for the portrait image, falling back to `imagePosition` then to the component's existing default when absent. Gallery thumbnails and the lightbox in the full variant remain unchanged (continue using `images[]`).

Purpose: Gives content editors a way to specify a dedicated headshot/portrait image independent of the gallery `images[]` array, with independent cropping control.

Output: Extended TeamMember interface, updated rendering logic in two components, and updated SCHEMA.md documentation. All verified by typecheck.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@content/team/SCHEMA.md
@src/lib/team.ts
@src/components/features/team/member-card.tsx
@src/components/features/tapestries/team-card.tsx

<interfaces>
<!-- Current TeamMember interface (src/lib/team.ts, lines 6-18) -->

```typescript
export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  content: string;
  groupSlug: string;
  imagePosition?: string; // Control image positioning (e.g., "center", "top", "left 30% center")
  state?: string;
  states?: string[];
  moreInformation?: string;
  images?: string[];
  [key: string]: any;
}
```

<!-- member-card.tsx getImageSrc (lines 30-40) -->

```typescript
const getImageSrc = (imageIndex: number = 0) => {
  // For stitching groups, use the single image field if available
  if (member.groupSlug === 'stitching-groups' && member['image']) {
    return `/images/team/${member.groupSlug}/${member['image']}`;
  }
  // For other groups, use existing logic with images array
  const imageExtension =
    member.groupSlug === 'stitching-venues' ? 'png' : 'jpg';
  const images = member.images || [`${member.slug}.${imageExtension}`];
  return `/images/team/${member.groupSlug}/${images[imageIndex]}`;
};
```

<!-- team-card.tsx getImageSrc (lines 37-54) -->

```typescript
const getImageSrc = (member: TeamMember) => {
  if (failedImages[member.slug]) {
    return personSvgFallback;
  }
  if (member.groupSlug === 'stitching-groups') {
    if (member['image']) {
      return `/images/team/${member.groupSlug}/${member['image']}`;
    }
    return personSvgFallback;
  }
  return `/images/team/${member.groupSlug}/${member.slug}.jpg`;
};
```

<!-- objectPosition call sites in member-card.tsx -->
<!-- Grid variant: line 136 (250-commission), line 148 (default) -->
<!-- Full variant multi-image main: line 274 -->
<!-- Full variant single-image 250-commission: line 346 -->
<!-- Full variant single-image default: lines 359-364 (special case: center/bottom mapped to top) -->
<!-- Full variant placeholder fallback: line 382 -->
<!-- Simple variant: line 470 -->

<!-- objectPosition call site in team-card.tsx: line 94 -->
</interfaces>

<locked_decisions>
<!-- From user_confirmed_scope in planning request: -->

- D-01: Field names are exactly `portrait` (string) and `portraitPosition` (string). Both optional.
- D-02: Portrait image path pattern: `/images/team/{groupSlug}/{portrait}` (same as `images[]` pattern).
- D-03: Portrait overrides `images[0]` and `{slug}.{ext}` for the PRIMARY display image only. Gallery thumbnails and lightbox continue to iterate over `images[]` unchanged.
- D-04: `portraitPosition` fallback chain: `portraitPosition ?? imagePosition ?? <existing_default>`. The existing default is `"center"` everywhere EXCEPT the full-variant single-image default branch (member-card.tsx lines 359-364) where the default is `"top"` (with center/bottom in imagePosition mapped to top — preserve that transform when portrait is absent).
- D-05: Stitching-groups and state-directors `{member}-face.jpg` logic untouched. Portrait does NOT apply to stitching-groups (they use the `image` field already) or override the face.jpg path in team-card (team-card doesn't handle face.jpg — only {slug}.jpg — so portrait applies whenever member.portrait is set and member is not a stitching-group).
- D-06: Verification is `npm run typecheck` only. Do NOT run `npm run build`.
- D-07: Out of scope: populating portrait on any existing member markdown files; changing lightbox/gallery; creating tests.
</locked_decisions>

</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend TeamMember interface and update both card components to honor portrait/portraitPosition</name>
  <files>src/lib/team.ts, src/components/features/team/member-card.tsx, src/components/features/tapestries/team-card.tsx</files>
  <action>
**A. src/lib/team.ts (per D-01):**

In the `TeamMember` interface (lines 6-18), add two optional fields adjacent to `imagePosition` and `images`:

```typescript
imagePosition?: string; // Control image positioning (e.g., "center", "top", "left 30% center")
portrait?: string; // Optional dedicated portrait filename under /images/team/{groupSlug}/ — overrides images[0] and {slug}.{ext} for the primary display image only
portraitPosition?: string; // CSS object-position for the portrait image; falls back to imagePosition when absent
```

Place `portrait` and `portraitPosition` directly after `imagePosition` and before `state`. Do not reorder any other fields. Do not change the `[key: string]: any` index signature.

**B. src/components/features/team/member-card.tsx (per D-02, D-03, D-04, D-05):**

1. Modify `getImageSrc(imageIndex: number = 0)` (lines 30-40). Add a new branch AFTER the stitching-groups branch (line 32-34) and BEFORE the images-array branch (lines 36-39):

```typescript
// Dedicated portrait overrides images[0] / {slug}.{ext} for the primary image only
if (imageIndex === 0 && member.portrait && member.groupSlug !== 'stitching-groups') {
  return `/images/team/${member.groupSlug}/${member.portrait}`;
}
```

The stitching-groups check in the new branch is defensive (D-05 says portrait doesn't apply to stitching-groups). Do NOT modify the existing stitching-groups branch or the images-array branch.

2. Introduce a small helper at the top of the component body (just above the `getImageSrc` declaration — inside the `MemberCard` function, after the `placeholderPath` const on line 27) that computes whether the currently-rendered primary image is the portrait:

```typescript
const hasPortrait = Boolean(member.portrait) && member.groupSlug !== 'stitching-groups';
```

3. Update each `objectPosition` call site that renders the PRIMARY image (imageIndex 0 / single-image variants). For each, when `hasPortrait` is true, use `member.portraitPosition ?? member.imagePosition ?? <existing_default>`. When `hasPortrait` is false, leave behavior exactly as today.

Specific edits:

- **Line 136** (grid variant, 250-commission branch): current `member.imagePosition || 'center'` becomes
  ```typescript
  objectPosition: hasPortrait
    ? (member.portraitPosition ?? member.imagePosition ?? 'center')
    : (member.imagePosition || 'center'),
  ```

- **Line 148** (grid variant, default branch): same pattern as line 136.

- **Line 274** (full variant, multi-image MAIN image — this is the first image, imageIndex 0): same pattern as line 136. Note: this branch only runs when `getImageCount() > 1`, but imageIndex 0 is still the primary image so portrait override applies.

- **Line 346** (full variant, single-image, 250-commission): same pattern as line 136.

- **Lines 359-364** (full variant, single-image, default — the special case that maps center/bottom → top). Preserve the center/bottom→top transform when portrait is absent. When portrait is present, use the D-04 fallback with default `'top'` and NO transform:
  ```typescript
  objectPosition: hasPortrait
    ? (member.portraitPosition ?? member.imagePosition ?? 'top')
    : (member.imagePosition
        ? member.imagePosition
            .replace(/center$/, 'top')
            .replace(/bottom$/, 'top')
        : 'top'),
  ```

- **Line 382** (full variant, placeholder fallback branch): same pattern as line 136 (default `'center'`).

- **Line 470** (simple variant): same pattern as line 136.

Do NOT change:
- Gallery thumbnails (lines 282-311) — these iterate over `member.images!.slice(1)` which is strictly from the images array; portrait does not appear here.
- Lightbox `src={getImageSrc(currentImageIndex)}` (line 427) — when `currentImageIndex===0` the updated `getImageSrc` will naturally return the portrait, which is acceptable behavior (lightbox just shows whatever getImageSrc returns). This is consistent — no extra code needed.
- `getImageCount()` — portrait does not add to the gallery count.

**C. src/components/features/tapestries/team-card.tsx (per D-02, D-04, D-05):**

1. Modify `getImageSrc(member: TeamMember)` (lines 37-54). Add a portrait branch BEFORE the `{slug}.jpg` fallback at line 53 and AFTER the stitching-groups branch (lines 44-49):

```typescript
// Dedicated portrait overrides the {slug}.jpg convention for the primary thumbnail
if (member.portrait) {
  return `/images/team/${member.groupSlug}/${member.portrait}`;
}
```

Note: the stitching-groups branch returns early, so this new branch only runs for non-stitching-groups members (matches D-05). The `failedImages[member.slug]` guard at line 39 stays first and remains unchanged.

2. Update line 94 (`objectPosition: member.imagePosition || 'center'`) to honor portraitPosition when portrait is set:

```typescript
objectPosition: member.portrait
  ? (member.portraitPosition ?? member.imagePosition ?? 'center')
  : (member.imagePosition || 'center'),
```

Do NOT change anything else in team-card.tsx.

**Style:** Follow existing formatting conventions in each file (2-space indent, single quotes, no trailing commas on last property where existing code omits them). Preserve existing comments that remain accurate. Do not remove the "Simplified function to get image source - single image per person" comment in team-card.tsx — add a short note after it acknowledging portrait: `// Portrait field overrides the default {slug}.jpg when set.`
  </action>
  <verify>
    <automated>cd /Users/rjl/Code/github/americas_tapestry && npm run typecheck</automated>
  </verify>
  <done>
- `TeamMember` interface in `src/lib/team.ts` has `portrait?: string` and `portraitPosition?: string` placed immediately after `imagePosition`.
- `member-card.tsx` `getImageSrc` returns `/images/team/{groupSlug}/{portrait}` when `imageIndex===0`, `member.portrait` is set, and group is not stitching-groups. All other branches unchanged.
- `member-card.tsx` primary-image `objectPosition` call sites (lines 136, 148, 274, 346, 359-364, 382, 470) resolve through `portraitPosition ?? imagePosition ?? <default>` when `hasPortrait` is true; behavior when `hasPortrait` is false is byte-identical to the current code (including the center/bottom→top transform at lines 359-364).
- Gallery thumbnails (lines 282-311) and the lightbox navigation are structurally unchanged.
- `team-card.tsx` `getImageSrc` returns `/images/team/{groupSlug}/{portrait}` when `member.portrait` is set and member is not a stitching-group. `failedImages` guard still runs first. Stitching-groups branch unchanged.
- `team-card.tsx` line 94 `objectPosition` resolves through `portraitPosition ?? imagePosition ?? 'center'` when `member.portrait` is set; unchanged otherwise.
- `npm run typecheck` exits 0 with no new errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Document portrait and portraitPosition fields in SCHEMA.md</name>
  <files>content/team/SCHEMA.md</files>
  <action>
Update `content/team/SCHEMA.md` to document the new optional fields (per D-01, D-03, D-04).

**Edit 1 — Optional Fields block (currently lines 48-56):**

Add `portrait` and `portraitPosition` to the YAML block. Place them adjacent to `imagePosition`. Updated block:

```yaml
---
state: string | string[]  # State assignment (single string or array)
summary: string          # Brief description for listings
order: number           # Display order within group
imagePosition: string   # CSS object-position (e.g., "left center", "top")
portrait: string        # Optional dedicated portrait image filename (under /images/team/[group]/); overrides images[0] and the {slug}.{ext} fallback for the primary display image only
portraitPosition: string # CSS object-position for the portrait image; falls back to imagePosition if absent
visible: boolean        # Hide from display (default: true)
---
```

**Edit 2 — Image Handling section (currently lines 87-101):**

After the existing "Multi-Image Support" subsection (lines 93-101), add a new "Portrait Override" subsection explaining the semantics:

```markdown
#### Portrait Override

```yaml
portrait: string         # Optional dedicated portrait image filename
portraitPosition: string # Optional CSS object-position for the portrait
```

- If `portrait` is set, it overrides `images[0]` and the `{slug}.{ext}` convention for the **primary display image only** — this includes the thumbnail in listings (grid variant), the single image on the member detail page, and the avatar on state/colony pages.
- The `images[]` gallery (thumbnail strip and lightbox on the full member page) is **not** affected by `portrait` — galleries continue to iterate over `images[]` as usual.
- Images should be placed in `/public/images/team/[group]/` (same directory as `images[]`).
- `portraitPosition` controls cropping for the portrait image. If omitted, it falls back to `imagePosition`, and then to the component's default (`center`, or `top` on the full member page).
- Does not apply to stitching groups (which use the `image` field) or override state-director `{member}-face.jpg` resolution elsewhere in the site.
```

Place this new subsection immediately after the existing `#### Multi-Image Support` block and before the next top-level section (`### URLs`).

Do NOT change any other content in SCHEMA.md.
  </action>
  <verify>
    <automated>test -f /Users/rjl/Code/github/americas_tapestry/content/team/SCHEMA.md && grep -q "^portrait: string" /Users/rjl/Code/github/americas_tapestry/content/team/SCHEMA.md && grep -q "^portraitPosition: string" /Users/rjl/Code/github/americas_tapestry/content/team/SCHEMA.md && grep -q "Portrait Override" /Users/rjl/Code/github/americas_tapestry/content/team/SCHEMA.md</automated>
  </verify>
  <done>
- `content/team/SCHEMA.md` Optional Fields YAML block contains both `portrait: string` and `portraitPosition: string` lines with inline comments matching the specification.
- A new `#### Portrait Override` subsection exists under `### Image Handling`, placed after `#### Multi-Image Support`.
- The new subsection clearly states: (1) portrait overrides images[0] / {slug}.{ext} for primary image only, (2) images[] galleries unaffected, (3) portraitPosition falls back to imagePosition then to the component default, (4) does not apply to stitching groups.
- No other content in SCHEMA.md is modified.
  </done>
</task>

</tasks>

<verification>
Automated:
- `npm run typecheck` exits 0.
- SCHEMA.md contains the new field definitions (grep-verified in Task 2).

Manual (out of scope per D-06, D-07 — no checkpoint): user may optionally add `portrait:` to a real team member after this plan ships and visually confirm rendering; not required for this plan to be considered complete.
</verification>

<success_criteria>
- `TeamMember` interface exports `portrait?: string` and `portraitPosition?: string`.
- Setting `portrait: "headshot.jpg"` on a non-stitching-group member makes `/images/team/{group}/headshot.jpg` the primary image in both `MemberCard` (grid/simple/full single-image) and `TeamCard` (state thumbnail). The `images[]` gallery on the full member page is not affected.
- Setting `portraitPosition: "top"` alongside a portrait produces `object-position: top` on the portrait image. Omitting it falls back to `imagePosition`, then to the component default (preserving the full-variant center/bottom→top special case when portrait is absent).
- `npm run typecheck` passes.
- `content/team/SCHEMA.md` documents both fields in the Optional Fields block and explains the override semantics in the Image Handling section.
</success_criteria>

<output>
After completion, create `.planning/quick/260422-rdd-add-optional-portrait-and-portraitpositi/260422-rdd-SUMMARY.md` with:
- List of files modified (4 files).
- Brief note on the override semantics actually implemented (cross-check against D-01 through D-07).
- Typecheck result.
- Any deviations from the plan (should be none).
</output>
