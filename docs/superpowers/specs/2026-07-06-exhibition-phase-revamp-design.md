# Exhibition-Phase Revamp — Design Spec

**Date:** 2026-07-06
**Status:** Approved (design conversation, 2026-07-06)

## Context

America's Tapestry has completed its creation phase. All 13 panels are finished and the
two-year exhibition tour (2026–2028) is live — the Muscarelle Museum opened June 19, 2026;
five further venues are confirmed through February 2028. The site's data layer already
reflects this (statuses "Finished", real venue dates), but its messaging layer is frozen in
the creation phase, and its design splits into two languages: the original
colonial-parchment treatment on marketing pages, and the newer, stronger "Night Gallery"
treatment (dark navy exhibition rooms, framed art plates, gold thresholds, letterspaced
cream headings) in the shop and the 3D `/gallery` walk-through.

The site's jobs now: advertise the tour (venues, dates, plan-your-visit), serve press and
educators, and sell merchandise.

## Decisions (user-approved)

1. **Full site restyle** into the Night Gallery language — not a targeted refresh.
2. **Dark-led, light reading rooms**: art-forward surfaces (home, exhibitions, tapestry
   pages, gallery, shop showrooms) go dark; long-form reading surfaces (news article
   bodies, team bios, resources, checkout) stay light — cream plates inside the dark
   museum — restyled to the same type system.
3. **Debt first, then restyle**: foundation cleanup precedes any visual work.
4. **3D gallery promoted to flagship** — "Walk the Gallery" on home and in the nav, with a
   mobile/no-WebGL fallback.
5. **Contextual merch cross-sell**: "Take it home" strips on tapestry detail pages, a
   book/poster callout on exhibitions, one shop feature section on home. Museum-shop tone,
   never louder than the art.

## Phase 0 — Tier 1 copy fixes (independent; ships first)

Pure copy corrections; no design dependency. All file:line references verified 2026-07-06.

1. `src/components/features/home/about-section.tsx:11,19-20` — "In 2026, Americans will
   celebrate…", "are stitching the panels over 18 months", "will be exhibited… 2026 and
   2027" → past tense, completed panels, tour now running 2026–2028.
2. `src/app/(site)/about/page.tsx` — full tense pass (L36-39, L54, L60-66, L80-87, L95-98);
   retire the volunteer-recruitment CTA (L89-93); fix metadata "creating" (L9).
3. `src/components/shared/hero-carousel.tsx:144,219` — "Be a part of America's 250th
   Anniversary" → visit-oriented line (interim; hero rebuilt in Phase 3).
4. `src/components/features/home/sponsorship-section.tsx:47-62` — remove "Partner With Us"
   recruitment block (component renders on /sponsors); keep past-tense gratitude framing.
5. `content/news/project-updates/welcome-to-our-blog.md` — remove `featured: true`
   (the only pinned post); leave as dated archive.
6. `src/lib/seo.ts:16` + `src/app/(site)/page.tsx:14-16` — site description and homepage
   title lead with the completed tapestry now on tour 2026–2028; anniversary becomes origin
   context. Homepage title drops present-continuous "Embroidering".
7. `src/app/(site)/shop/page.tsx:208-221` — calendar teaser: resolve per user decision
   (rename 2027 / ship / drop). **Open: ask user at implementation.**
8. `content/news/videos/231120-documentary-preview.md:10` — rewrite "footage we will be
   compiling… Stay tuned!" as a retrospective intro.
9. Small tense fixes: `src/app/(site)/stitchers/[state]/page.tsx:30` ("stitching" → "who
   stitched"); `src/lib/blog.ts:48,72` category descriptions;
   `src/app/(site)/contact/page.tsx:67-70` ("project's progress");
   `content/sponsors/yarn-tree/index.md` stale "March 7-9, 2025" event line;
   `src/components/features/team/questionnaire-section.tsx` participation framing
   (retire or re-frame as alumni feedback).

Verification: build + tests green; manual read of every touched page; no visual changes.

## Phase 1 — Foundation cleanup (no visual changes)

1. **Repo hygiene**: `git rm --cached tsconfig.tsbuildinfo`; add `*.tsbuildinfo` to
   `.gitignore`; move root `tapestry-*.txt` dumps into `scratch/`.
2. **Dead code**: delete `getContentMetadata` (content-core.ts, never imported),
   `src/components/features/shop/print-card.tsx`,
   `src/components/features/shop/shopify-product-card.tsx` (superseded, never imported).
3. **Content-loader unification**: migrate `src/lib/tapestries.ts` (514 lines) and
   `src/lib/team.ts` (358 lines) onto the existing `defineContentLoader` + Zod pattern
   (as `sponsors.ts`/`exhibitions.ts` already do). Single `mapTapestry()` shared by list
   and single-item entry points (they currently disagree on thumbnail selection — the
   list-path behavior is canonical). Single `resolveTapestryImage(slug, opts)` replacing
   the ~5 pasted copies of the variant-exclusion list and format-priority array.
4. **Type safety**: loaders return `z.infer<schema>` types; drop `Record<string, any>`
   frontmatter and `[key: string]: any` catch-alls in `content-core.ts` / `team.ts`;
   replace string-index access (`data['title']`) with typed properties.
5. **SEO**: add `generateMetadata` via existing `pageMetadata()` to the six dynamic routes
   lacking it: `tapestries/[slug]`, `stitchers/[state]`, `team/[group]`,
   `team/[group]/[member]`, `shop/[product]`, `news/category/[category]`.
6. **Toolchain**: settle on one formatter (Biome vs ESLint — pick at implementation);
   bump `eslint-config-next` and `@next/bundle-analyzer` to Next-16-compatible majors.

Success criterion: tests and build green; every page renders identically (this phase is
behavior-preserving). Excerpt/walker dedup in `content-core.ts` included (one
`walkContentDir`, one `deriveExcerpt` reusing `markdown.extractExcerpt`).

## Phase 2 — Night Gallery design system

Generalize the shop's proven treatment into named, shared tokens and components:

1. **Tokens** (tailwind.config.ts + globals.css): dark exhibition surface (base
   `colonial-navy #102542` room, near-black frame tone `#0b0d12`), cream text tokens,
   gold threshold hairline, letterspaced-eyebrow utility, museum shadow scale (replacing
   ad-hoc `shadow-[0_28px_64px…]` arbitrary values).
2. **Shared components**: promote `FramedArtwork`, `StitchRule`, and the
   plate/eyebrow/threshold patterns from `src/components/features/shop/` into shared UI
   (`src/components/ui/` or `shared/`). Shop imports move to the shared versions.
3. **Light reading-room recipe**: cream content plate on dark chrome, same type system;
   used by news bodies, team bios, resources, checkout surfaces. Parchment SVG textures
   retired from the light recipe.
4. **Typography consolidation**: one heading system built on `SectionHeader`; fix
   `.section-title` double font-size (`text-2xl text-3xl`, globals.css:93-95); resolve the
   serif/sans heading conflict (base h1–h4 vs hero `font-serif`); document the scale.
5. **Chrome**: header and footer go dark site-wide so the "museum building" is constant.
6. **Motion**: CSS-only, `motion-reduce` respected (no framer-motion dependency).

## Phase 3 — Page-by-page restyle + exhibition features

**Working principle (per Richard, 2026-07-06): every page gets a structural critique
before it gets restyled** — the review an experienced designer applies: does each
element still earn its place in the exhibition phase? Remove/simplify first, then
apply the Night Gallery treatment to what remains. Concrete decisions already made:

- **/tapestries**: DELETE the production-status key and per-card status badges — all
  13 panels are Finished, so the entire status UI is dead machinery (also retire the
  `status !== 'Not Started'` filters and, where it becomes unreferenced, the
  TapestryStatus badge vocabulary in tapestry-card.tsx). DELETE the interactive
  map/zoom component ("the whole map zoom thing is annoying — it can go").
- **Tapestry cards**: use the fine-art tapestry photographs themselves
  (the `{slug}-photo.*` images `findPhotoInDirectory` already prefers), not the
  abstract cropped slices.
- **Tapestry detail pages**: drop the arbitrary image slice at the top; lead with the
  fine-art photograph suitably framed (FramedArtwork treatment) combined with a
  "Shop it now" CTA — this merges with the planned "Take it home" strip.

1. **Home**: dark gallery hero replaces the Ken-Burns carousel — "Now on view" with
   current/next venue + dates computed from `exhibitions.ts`, "Plan your visit" CTA.
   Section order: hero → tapestry collection (framed plates) → Walk the Gallery feature →
   latest news → one shop feature strip → contact. Vision/About sections rewritten or
   folded into About page.
2. **Exhibitions (tour centerpiece)**: "On view now / Coming next / Past" grouping (date
   logic exists in `lib/exhibitions.ts`); framed-plate venue cards with hours, admission,
   directions; promote the two hardcoded prose venues (Maryland Center for History and
   Culture, Atlanta History Center) to real dated content entries. **Blocker: real venue
   copy — all six `content/exhibitions/*/index.md` bodies are "Lorum Ipsum"; user
   supplies.**
3. **Tapestries index + detail**: dark gallery presentation (panels as lit plates);
   detail pages get a "Take it home" strip (state print, postcards, book).
4. **Team / news / about / resources**: light reading rooms per Phase 2 recipe.
5. **Navigation**: Exhibitions promoted and likely renamed "Visit"; "Gallery" (3D) added;
   Team/Sponsors demoted; footer gains Exhibitions + Gallery links (Exhibitions is
   currently absent from footer Quick Links).
6. **Shop**: trust signals (shipping/returns line, payment-method badges); receives
   cross-sell traffic. Already on-language otherwise. Returns policy (per Richard,
   2026-07-06): during a four-week fulfilment-testing period, replacements but NO
   refunds for products not up to quality standards — word gently, framed around
   the volunteer nature of the organization; policy is temporary and revisited
   after the four weeks.
7. **3D gallery**: linked from home + nav; graceful mobile/no-WebGL fallback (static
   panorama or image grid) verified before promotion; confirm dynamic import keeps
   three.js out of the main bundle.

## Open items (user decisions/inputs)

- Calendar product fate (Phase 0 item 7).
- Venue body copy for six (→ eight) exhibition entries (Phase 3 item 2).
- "Visit" vs "Exhibitions" nav label — decide at Phase 3 nav work.

## Out of scope

- Cart/reviews infrastructure for the shop (direct-to-checkout stays).
- Real dark-mode toggle (`dark:` variants site-wide) — the dark surfaces are per-section
  design, not a user preference.
- New CMS; content stays markdown + Zod.

## Verification strategy

- Phases 0–1: build + full test suite + visual spot-check (pages identical for Phase 1).
- Phases 2–3: per-page visual review in dev server; Playwright e2e kept green;
  Lighthouse/bundle check after gallery promotion (three.js must stay code-split);
  `motion-reduce` and mobile checks on hero, exhibitions, gallery fallback.
