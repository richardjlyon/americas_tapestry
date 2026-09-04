# America's Tapestry — operational state

Read at session start. Update when state changes. Durable knowledge lives in the vault hub `Projects/America's Tapestry.md` and its spokes; this is live working state only.

Audited against live sources 2026-09-01 (`audit-project-memory`). Claims below were checked against the filesystem, the Plane API, the running dev server and Seton Hill's own site — not against other documents.

## Live deadline

- **Exhibition opens 14 September 2026, Harlan Gallery, Seton Hill Arts Center, Greensburg PA**, running to 27 September. Gallery talk **19 September, 2pm**, given by the two Pennsylvania co-directors (Three Rivers Chapter); registration at `alumni.setonhill.edu/e/gallery-talk/`. Extended hours during the run: Mon–Thu 12–8pm, Fri 12–4, Sat 1–4, Sun 2–5. Source: Seton Hill Art Galleries page, read 2026-09-01. The talk, the registration link and the extended hours are **not yet on our exhibitions page**.
- **Street number unresolved (TAPSTRY-3).** Seton Hill contradict themselves: their galleries page (the one carrying our listing) says **201** W. Otterman Street; their arts-venue page and the Harlan Gallery Facebook page say **205**; the gallery Instagram still says 1 Seton Hill Drive, which is the main campus, not the Arts Center. Settle with Emily Franicola, Gallery Director, efranicola@setonhill.edu, before 14 September.

## In-flight

- Four uncommitted content changes, present before this session and so attributable to Richard, all verified rendering correctly on the dev server: Seton Hill address `1 Seton Hill Drive` → `201 West Otterman Street`; Georgia stitcher `Dorothy Wise` → `Dorothy Waits`; North Carolina + `Mary W. Cohn`, + `Lauren Thie`; South Carolina + `Monica Debbi`. Held pending the address question above. **Superseded in part 2026-09-04: Monica Debbi is a Pennsylvania stitcher, not South Carolina — see below.**
- `next-env.d.ts` and `package-lock.json` also show as modified: both are machine-regenerated (Next 16 moved route types to `.next/dev/`), not authored edits.
- **The Jest suite is broken and was broken before these changes** (TAPSTRY-4): 47 of 117 tests fail, identically with the changes stashed. Cause is `React.act is not a function` — React 19.2.4 removed `react-dom/test-utils`, which `@testing-library/react` 16.3.2 still reaches for.

## Verified facts

- Plane project key is **`TAPSTRY`**, confirmed against the live API 2026-09-01. Earlier documents said `TAP`; no such project exists. Board stood up 2026-09-01 from the audit: TAPSTRY-1 to TAPSTRY-6.
- Images **are committed**: 628 files, 165 MB under `public/images`. The claim in `AGENTS.md` that they are "not committed to `public/`" was false and has been corrected. R2 serves them at `images.americastapestry.com` via `src/lib/cloudflare-loader.ts`; the repo holds them too.
- The `add-shop-product` skill named as the operational contract in `AGENTS.md` and in the vault **is not loadable** (TAPSTRY-5). It survives only at `~/AIOS-hermes/archives/parked-skills/add-shop-product` and `archives/claude-system-import/skills/add-shop-product`. Any shop work will fall back to improvisation until it is restored.
- Repo remote is `github.com/richardjlyon/americas_tapestry` (public, GitHub — not Gitea). AI layer adopted 2026-08-28, not 2026-08-26 as previously recorded; `work-products-index.md` corrected to match 2026-09-01.
- The old `~/Code/web-americas-tapestry` location was **not parked** as `_migrated-` per the migration skill. It is simply gone.

## A wrong bio sat on a named person's page and nothing caught it

2026-09-04. `content/team/stitchers/monica-debbi/index.md` held Nancy Cook's bio
verbatim — same 900 characters, same Charlotte NC, same goldwork. It was live on
a public page under Monica Debbi's name, and it had already been ingested into
the printed bio binders for the 14 September exhibition. She is also a
**Pennsylvania** stitcher, not South Carolina, so `src/lib/data/stitchers.json`
listed her under the wrong panel too. Both fixed (`0ac77c1`, `fc313e2`),
verified by a full `npm run build` and then by polling the live URL until it
served the new text. Exhibition binders regenerated via `just ingest`
(`4ed4f66` there), not hand-edited — the `.typ` files are generated.

**Nothing in this repo detects a duplicated body.** The fault surfaced only
because the project emailed to complain. A hash of every content body found the
same shape elsewhere: `barbara-bass`, `bonnie-berman` and `stefan-romero` each
appear twice with byte-identical text (plausibly intentional — one person, two
roles), and twenty `stitching-groups` pages have empty bodies that render as a
bare heading. TAPSTRY-14 proposes the build-time check.

## The R2 migration has a bite: deleting from public/ breaks filesystem lookups

Images live in two places — committed under `public/images` and served from R2
via `src/lib/image-manifest.json`. Removing a file from `public/` once it is on
the CDN is correct for bandwidth **and silently breaks any code that resolves
images by reading the filesystem.**

This has now cost twice in one day (2026-09-01):

- **Tapestry photographs vanished for nineteen days.** All thirteen mounted-panel
  photographs went to R2 on 20 June and were deleted from `public/` on 13 August
  by commit `235abb8`. `listTapestryImageFiles` used `fs.readdirSync` only, so
  `findPhotoInDirectory` found nothing and every tapestry page fell through to
  the original design illustration — exactly as designed, and wrong. The
  photographs were live on R2 the entire time. Fixed in `6717656`: the function
  now unions the filesystem with the manifest.
- **The bandwidth deletion could not be verified safe.** See TAPSTRY-9.

Before deleting anything from `public/`, check what resolves it. `tapestries.ts`
was the only image resolver reading the filesystem, and it is now fixed, but the
homepage still depends on build-time filesystem access for anything **not** yet
on R2 (see the ISR comment in `src/app/(site)/page.tsx` — do not add
`revalidate` there).

## The bandwidth leak — fixed 2026-09-01, and the method matters

`38948e6` excludes **142.4MB** of R2 duplicates from the Vercel deployment via
`.vercelignore`. Deployment images fall from 171.7MB to 29.4MB. **Nothing was
deleted** — the files remain in git and on disk at 165MB, so a wrong answer
costs a redeploy rather than a file. Verified live: 30 of 30 sampled excluded
files now 404 at the origin, all 293 pages still 200.

**Two earlier attempts that day tried to derive a safe-to-DELETE set and were
both confidently wrong.** First from crawled HTML (545 files — broke 74 image
references), then from content markdown plus `src/` plus the crawl (403 files —
still included `/images/exhibitions/muscarelle/conversation.webp`, which is
listed in that venue's own frontmatter gallery). The reason is structural:
`exhibitions.ts:186`, `tapestries.ts:134`, `sponsors.ts:51`,
`shop-products.ts:131` and `content-core.ts:261` all build asset paths at render
time from a slug plus a bare filename, so a required path exists in no file
anywhere. **No static or crawl-based analysis can establish the set.**

What worked was measurement: build and serve the site twice, once intact and
once with every candidate moved aside, then diff the image references on all 293
pages. Zero lost across 292; the 293rd is the homepage, whose hero carousel
rotates a random slide and swapped one candid for another in both directions.

`scripts/generate-vercelignore.mjs` regenerates the block and **refuses to run
without measured evidence** — no `--refs`, a missing file, or a refs file with no
`/images/` paths all exit 2. `--check` makes it a CI gate.

## Deploys are not automatic — check, never assume

A push to this repo usually triggers a Vercel build, but **not reliably**. On
2026-09-01 three pushes deployed automatically and the fourth did not: the
commit sat on the remote while production stayed on the previous one. Confirm
with `vercel ls americas-tapestry --scope richardjlyons-projects` after any
push, and deploy explicitly with `vercel deploy --prod --yes` if no build
appears.

## Watch

- **The merchandise licence is still a draft** (TAPSTRY-1). Seton Hill University owns the name, marks, designs and images; the shop sells goods derived from them. Shop confirmed live (`/shop` returns 200). Thirteen days from an exhibition on their own premises, an unexecuted licence is the largest exposure on this project. Vault: `America's Tapestry — Seton Hill Merchandise Licence (draft)`.
- Vercel bandwidth from image originals — see `VERCEL_USAGE_INVESTIGATION.md` in the repo.

## Sibling project

`americas-tapestry-exhibition` (Plane `TAPEX`) — the printed exhibition materials. **Migrated into the estate 2026-09-01**; lives at `~/AIOS/Projects/americas-tapestry-exhibition`. It reads *this* repo's `content/team/` through its `just ingest` recipe, so a content fix here does not reach the print products until that ingest is re-run. Two of its four product families due this month are empty directories (TAPEX-1, TAPEX-2). Vault: `America's Tapestry — Exhibition Materials`.
