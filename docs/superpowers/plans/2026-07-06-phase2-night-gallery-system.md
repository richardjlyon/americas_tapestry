# Phase 2: Night Gallery Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the shop's proven "Night Gallery" treatment (dark navy exhibition rooms, framed plates, gold thresholds, letterspaced eyebrows) into named tokens and shared components, consolidate typography, and unify the site chrome — the vocabulary Phase 3 restyles every page with.

**Architecture:** Codify, don't invent: every value comes from the shop's existing treatment (`shop/page.tsx`, `shop/[product]/page.tsx`, `framed-artwork.tsx`). Tokens land in `tailwind.config.js` + `globals.css`; components move from `features/shop/` to `ui/`; the shop is refactored to consume the shared versions with ZERO visual change. The only intended visual changes in this phase: the header goes navy (Task 4) and light reading surfaces lose their SVG noise textures (Task 5).

**Tech Stack:** Tailwind 3.4 (config is `tailwind.config.js`, NOT .ts), shadcn-style ui/ components, Jest 29, Playwright.

## Global Constraints

- **Shop must not change visually** in Tasks 1–3 (token adoption must be value-identical). Tasks 4–5 make exactly the two intended changes above and nothing else.
- **Motion:** CSS-only transitions; every animation/hover respects `motion-reduce:` (no framer-motion).
- **Commit scope:** the working tree carries unrelated uncommitted changes (shop WIP). `git add` only the files named in each task — never `git add -A`.
- **Verification per task:** `npx tsc --noEmit` exit 0; `npx jest 2>&1 | tail -3` (12 suites, 107 tests); `npx next build` succeeds. Visual checks against the dev server as specified per task.
- **Lint note:** `npm run lint` currently has 2 pre-existing errors in untracked shop-WIP files and 11 react-hooks warnings — neither is yours to fix; introduce no NEW errors.
- Conventional commits; end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Design vocabulary (source of truth, extracted from the shop)

| Token/pattern | Value (verbatim from shop code) | Meaning |
|---|---|---|
| Room surface | `bg-colonial-navy` (#102542) | dark exhibition room |
| Frame tone | `#0b0d12` (framed-artwork.tsx:44) | near-black moulding |
| Text on dark | `text-colonial-parchment` (+ /80, /70 tints) | cream |
| Plate shadow | `shadow-[0_18px_44px_-22px_rgba(0,0,0,0.85)]` | unframed plate |
| Plate shadow, framed | `shadow-[0_28px_64px_-24px_rgba(0,0,0,0.9)]` | framed plate |
| Card shadow | `shadow-[0_22px_48px_-18px_rgba(11,15,32,0.5)]` | physical card (postcards) |
| Eyebrow | `font-sans text-sm font-semibold uppercase tracking-[0.2em]` + `text-colonial-burgundy` (light) / `text-colonial-gold` (dark) | kicker label |
| Stitch rule | `block h-0 w-16 border-t-2 border-dashed border-colonial-gold` | dashed gold ornament |
| Gold threshold | `h-px w-16 bg-colonial-gold/60` | hairline divider |

---

### Task 1: Night Gallery tokens

**Files:**
- Modify: `tailwind.config.js` (colors + boxShadow in `theme.extend`)
- Modify: `src/app/globals.css` (new NIGHT GALLERY block in `@layer components`)

**Interfaces:**
- Produces (used by Tasks 2–5 and Phase 3): Tailwind color `colonial-frame` (#0b0d12); shadows `shadow-plate`, `shadow-plate-lg`, `shadow-card`; CSS classes `.eyebrow`, `.eyebrow-burgundy`, `.eyebrow-gold`, `.gold-threshold`, `.gallery-heading`, `.gallery-lead`.

- [ ] **Step 1: Add tokens to tailwind.config.js**

In `theme.extend.colors.colonial` add one key after `parchment`:

```js
        colonial: {
          navy: '#102542', // Deep navy blue - primary brand color
          burgundy: '#711322', // Rich burgundy - accent color
          gold: '#e8b903', // Bright gold - highlight color
          stone: '#d8d3c8', // Stone/neutral - secondary background
          linenTexture: '#f5f1e6',
          linenWoven: '#f7f3ea',
          vintagePaper: '#f8f3e6',
          parchment: '#f4e9d5',
          frame: '#0b0d12', // Night Gallery near-black moulding
        },
```

In `theme.extend` (sibling of `colors`), add:

```js
      boxShadow: {
        // Night Gallery museum shadows (values from the shop treatment)
        plate: '0 18px 44px -22px rgba(0,0,0,0.85)',
        'plate-lg': '0 28px 64px -24px rgba(0,0,0,0.9)',
        card: '0 22px 48px -18px rgba(11,15,32,0.5)',
      },
```

- [ ] **Step 2: Add the component classes to globals.css**

In `@layer components`, after the `/* Status indicators */` block, insert:

```css
  /***************************************
   * NIGHT GALLERY (exhibition-phase design system)
   * Dark navy rooms for art, cream plates for reading. Values
   * codified verbatim from the shop treatment (2026-07).
   ***************************************/

  /* Kicker label above a heading. Pair with a color variant. */
  .eyebrow {
    @apply font-sans text-sm font-semibold uppercase tracking-[0.2em];
  }

  .eyebrow-burgundy {
    @apply text-colonial-burgundy; /* on light surfaces */
  }

  .eyebrow-gold {
    @apply text-colonial-gold; /* on dark surfaces */
  }

  /* Hairline gold divider — the "threshold" into a gallery room. */
  .gold-threshold {
    @apply h-px w-16 bg-colonial-gold/60;
  }

  /* Display heading inside a dark room: serif, cream, letterspaced. */
  .gallery-heading {
    @apply font-serif font-medium tracking-[0.08em] text-colonial-parchment;
  }

  /* Supporting copy inside a dark room. */
  .gallery-lead {
    @apply font-serif text-lg md:text-xl text-colonial-parchment/80;
  }
```

- [ ] **Step 3: Verify (tokens are additive — nothing may change)**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3`
Expected: all green. No component consumes the tokens yet, so every page is pixel-identical.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/app/globals.css
git commit -m "feat(design): add Night Gallery tokens (frame color, museum shadows, eyebrow/threshold/gallery classes)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Promote FramedArtwork and StitchRule to shared UI

**Files:**
- Create: `src/components/ui/framed-artwork.tsx` (moved from features/shop, arbitrary values → Task 1 tokens)
- Create: `src/components/ui/stitch-rule.tsx` (extracted from shop/page.tsx)
- Delete: `src/components/features/shop/framed-artwork.tsx`
- Modify: every importer of the old paths (find with grep; at minimum `src/app/(site)/shop/page.tsx` and its product pages/components)

**Interfaces:**
- Produces: `FramedArtwork({ src, alt, framed?, className? })` from `@/components/ui/framed-artwork` — SAME props as today; `StitchRule({ className? })` from `@/components/ui/stitch-rule`.

- [ ] **Step 1: Find all current usages**

```bash
grep -rn "framed-artwork\|FramedArtwork" src --include="*.tsx" | grep -v "features/shop/framed-artwork.tsx"
grep -rn "function StitchRule\|<StitchRule" src --include="*.tsx"
```

Record the importer list — every hit must be updated in Step 2/3.

- [ ] **Step 2: Create the shared components**

`src/components/ui/framed-artwork.tsx` — identical to the current `src/components/features/shop/framed-artwork.tsx` except the two arbitrary values become tokens (same rendered values):

- `bg-[#0b0d12]` → `bg-colonial-frame`
- `shadow-[0_28px_64px_-24px_rgba(0,0,0,0.9)]` → `shadow-plate-lg`
- `shadow-[0_18px_44px_-22px_rgba(0,0,0,0.85)]` → `shadow-plate`

Everything else (props, JSDoc, 4:5 box, bevel rings) is copied unchanged.

`src/components/ui/stitch-rule.tsx`:

```tsx
/** A dashed gold rule evoking a running embroidery stitch. */
export function StitchRule({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-0 w-16 border-t-2 border-dashed border-colonial-gold ${className}`}
    />
  );
}
```

- [ ] **Step 3: Update importers, delete originals**

Point every importer found in Step 1 at `@/components/ui/framed-artwork` / `@/components/ui/stitch-rule`; delete the local `StitchRule` definition in `shop/page.tsx` (and any duplicate found elsewhere) and `rm src/components/features/shop/framed-artwork.tsx`.

- [ ] **Step 4: Verify zero visual change on the shop**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3`
Expected: green. Then with the dev server running, eyeball `/shop` and one `/shop/[product]` page (e.g. /shop/print): plates, shadows, stitch rules identical (token values are byte-equal to the old arbitrary ones).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/framed-artwork.tsx src/components/ui/stitch-rule.tsx src/components/features/shop/framed-artwork.tsx <each modified importer>
git commit -m "refactor(design): promote FramedArtwork and StitchRule to shared ui/

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Typography consolidation

**Files:**
- Modify: `src/app/globals.css` (`.section-title`, documentation comment)
- Modify: `src/components/ui/section-header.tsx` (add `tone` prop)

**Interfaces:**
- Produces: `SectionHeader({ title, description, className?, tone? })` where `tone?: 'light' | 'dark'` (default `'light'` — current behavior).

- [ ] **Step 1: Fix the double-font-size bug**

In `globals.css`, `.section-title` currently reads:

```css
  .section-title {
    @apply text-2xl text-3xl md:text-4xl font-bold tracking-tight text-foreground;
  }
```

Remove the dead `text-2xl` (the later `text-3xl` wins today, so this is a no-op visually):

```css
  .section-title {
    @apply text-3xl md:text-4xl font-bold tracking-tight text-foreground;
  }
```

- [ ] **Step 2: Document the heading system**

Directly above `.page-heading` in globals.css, replace the `/* Heading styles */` comment with:

```css
  /* HEADING SYSTEM
   * Light surfaces (reading rooms): bold Montserrat (font-sans) via the
   * semantic h1-h6 base styles, .page-heading, .section-title.
   * Dark surfaces (gallery rooms): .gallery-heading — serif, cream,
   * letterspaced (the shop's Night Gallery convention).
   * Components should reach for SectionHeader (ui/section-header.tsx)
   * rather than hand-rolling heading class strings.
   */
```

- [ ] **Step 3: Add the tone prop to SectionHeader**

Replace `src/components/ui/section-header.tsx` with:

```tsx
interface SectionHeaderProps {
  title: string;
  description: string | React.ReactNode;
  className?: string;
  /** 'light' = navy-on-cream (default); 'dark' = cream-on-navy gallery room. */
  tone?: 'light' | 'dark';
}

export function SectionHeader({
  title,
  description,
  className = '',
  tone = 'light',
}: SectionHeaderProps) {
  if (tone === 'dark') {
    return (
      <div className={className}>
        <h2 className="gallery-heading text-3xl md:text-4xl text-center mb-content-sm">
          {title}
        </h2>
        <div className="gallery-lead max-w-3xl mx-auto text-center mb-content-md">
          {description}
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      <h2 className="section-title text-center mb-content-sm">{title}</h2>
      <div className="lead-text mb-content-md">{description}</div>
    </div>
  );
}
```

Note: `gallery-heading` sets `font-medium`; the semantic `h2` base sets `font-bold font-sans` — the class list above must override BOTH, and `.gallery-heading` already carries `font-serif font-medium`, which wins over the base because component-layer classes beat base-layer styles in the cascade. Verify visually in Step 4.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3`
Expected: green. Dev-server check: any page using SectionHeader (e.g. `/` "The Tapestry Collection") — identical to before (tone defaults to 'light'; the dark path has no consumers yet — Phase 3 adopts it). To smoke-test the dark path, temporarily view it via the shop product page headings? No — do not wire it anywhere in this phase.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/ui/section-header.tsx
git commit -m "refactor(design): consolidate heading system, add SectionHeader dark tone

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Dark chrome — header joins the museum

**Files:**
- Modify: `src/components/layout/header.tsx:51-138`

**Interfaces:** none new (visual change only). INTENDED VISUAL CHANGE: header burgundy → navy, site-wide.

- [ ] **Step 1: Swap the header surfaces**

In `header.tsx`, three changes, nothing else:

1. Desktop bar (lines 52-58): replace

```tsx
        isScrolled
          ? 'bg-colonial-burgundy shadow-md'
          : 'bg-colonial-burgundy/90 backdrop-blur-sm',
```

with

```tsx
        isScrolled
          ? 'bg-colonial-navy shadow-md border-b border-colonial-gold/20'
          : 'bg-colonial-navy/90 backdrop-blur-sm',
```

2. Mobile overlay (line ~118): `bg-colonial-burgundy` → `bg-colonial-navy`.
3. Mobile menu content (line ~123): `bg-colonial-burgundy` → `bg-colonial-navy`.

Text stays `text-colonial-parchment`, hovers stay `hover:text-colonial-gold` — already correct on navy (identical vocabulary to the footer, which is already `bg-colonial-navy border-t border-colonial-gold/30`).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3`
Expected: green. Dev-server check: header is navy at top-of-page (translucent) and when scrolled (solid + gold hairline); mobile menu overlay navy; contrast of parchment text on navy is the same pairing the footer has always used. Confirm the logo (patriotic mark) still reads against navy.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(design): navy header — unify site chrome with the Night Gallery

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Light reading-room recipe (retire SVG noise textures)

**Files:**
- Modify: `src/app/globals.css` (add `.reading-plate`)
- Modify: `src/components/ui/reading-container.tsx` (map backgrounds to the plate recipe)

**Interfaces:**
- Produces: CSS class `.reading-plate`; `ReadingContainer` keeps its exact props (`width`, `background: 'paper' | 'parchment' | 'none'`) — 'paper' and 'parchment' now BOTH render the clean plate (the distinction was texture flavor; both textures are retired). INTENDED VISUAL CHANGE: reading surfaces (About page article, contact cards using textures via ReadingContainer) lose SVG noise, gaining a clean cream plate.

- [ ] **Step 1: Add the recipe class**

In globals.css, inside the NIGHT GALLERY block added by Task 1, append:

```css
  /* Light reading room: a clean cream plate for long-form text.
   * Replaces the vintage-paper/authentic-parchment SVG noise textures
   * (which remain defined for any legacy uses until Phase 3 removes them). */
  .reading-plate {
    @apply bg-colonial-vintagePaper ring-1 ring-colonial-navy/10 shadow-md;
  }
```

- [ ] **Step 2: Point ReadingContainer at it**

In `reading-container.tsx`, replace:

```tsx
  const backgroundClasses = {
    paper: 'vintage-paper',
    parchment: 'authentic-parchment',
    none: '',
  };
```

with:

```tsx
  // Both legacy texture flavors now render the clean reading plate; the
  // prop values are kept so call sites don't churn until Phase 3.
  const backgroundClasses = {
    paper: 'reading-plate',
    parchment: 'reading-plate',
    none: '',
  };
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx jest 2>&1 | tail -3 && npx next build 2>&1 | tail -3`
Expected: green. Dev-server check: `/about` — the article body now sits on a clean cream plate (no noise texture), text unchanged. `grep -rn "ReadingContainer" src --include="*.tsx"` and eyeball each consumer page.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/ui/reading-container.tsx
git commit -m "feat(design): clean reading-plate recipe replaces textured reading surfaces

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Dropped from spec (with reason)

- **"Header and footer go dark"** — footer already IS `bg-colonial-navy` with gold border (the audit's chrome finding was half-stale); only the header changes.
- **Motion task** — the spec's motion item is a constraint (CSS-only, motion-reduce), not new work; recorded in Global Constraints. Existing shop components already honor it.
- **Retiring texture CSS definitions** (`.vintage-paper`, `.authentic-parchment`, `.linen-texture`, `.woven-linen`, needle pin) — deferred to Phase 3: `PageSection` defaults to `woven-linen` across many pages, and each page's texture leaves as that page is restyled. Deleting the classes now would change pages this phase doesn't touch.

## Final verification (after Task 5)

1. `npx tsc --noEmit`, `npx jest`, `npx next build` — all green.
2. Dev-server pass: `/shop` + one product page (identical), `/` (identical except navy header), `/about` (navy header + clean reading plate), mobile menu (navy).
3. Confirm exactly TWO intended visual changes shipped: navy chrome, clean reading plates. Anything else different = regression.
