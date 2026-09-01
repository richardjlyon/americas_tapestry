# America's Tapestry — operational state

Read at session start. Update when state changes. Durable knowledge lives in the vault hub `Projects/America's Tapestry.md` and its spokes; this is live working state only.

Audited against live sources 2026-09-01 (`audit-project-memory`). Claims below were checked against the filesystem, the Plane API, the running dev server and Seton Hill's own site — not against other documents.

## Live deadline

- **Exhibition opens 14 September 2026, Harlan Gallery, Seton Hill Arts Center, Greensburg PA**, running to 27 September. Gallery talk **19 September, 2pm**, given by the two Pennsylvania co-directors (Three Rivers Chapter); registration at `alumni.setonhill.edu/e/gallery-talk/`. Extended hours during the run: Mon–Thu 12–8pm, Fri 12–4, Sat 1–4, Sun 2–5. Source: Seton Hill Art Galleries page, read 2026-09-01. The talk, the registration link and the extended hours are **not yet on our exhibitions page**.
- **Street number unresolved.** Seton Hill contradict themselves: their galleries page (the one carrying our listing) says **201** W. Otterman Street; their arts-venue page and the Harlan Gallery Facebook page say **205**; the gallery Instagram still says 1 Seton Hill Drive, which is the main campus, not the Arts Center. Settle with Emily Franicola, Gallery Director, efranicola@setonhill.edu, before 14 September.

## In-flight

- Four uncommitted content changes, present before this session and so attributable to Richard, all verified rendering correctly on the dev server: Seton Hill address `1 Seton Hill Drive` → `201 West Otterman Street`; Georgia stitcher `Dorothy Wise` → `Dorothy Waits`; North Carolina + `Mary W. Cohn`, + `Lauren Thie`; South Carolina + `Monica Debbi`. Held pending the address question above.
- `next-env.d.ts` and `package-lock.json` also show as modified: both are machine-regenerated (Next 16 moved route types to `.next/dev/`), not authored edits.
- **The Jest suite is broken and was broken before these changes**: 47 of 117 tests fail, identically with the changes stashed. Cause is `React.act is not a function` — React 19.2.4 removed `react-dom/test-utils`, which `@testing-library/react` 16.3.2 still reaches for. Not yet ticketed.

## Verified facts

- Plane project key is **`TAPSTRY`**, confirmed against the live API 2026-09-01. Earlier documents said `TAP`; no such project exists. **The TAPSTRY board is empty — zero items** — so nothing in this project is currently tracked.
- Images **are committed**: 628 files, 165 MB under `public/images`. The claim in `AGENTS.md` that they are "not committed to `public/`" was false and has been corrected. R2 serves them at `images.americastapestry.com` via `src/lib/cloudflare-loader.ts`; the repo holds them too.
- The `add-shop-product` skill named as the operational contract in `AGENTS.md` and in the vault **is not loadable**. It survives only at `~/AIOS-hermes/archives/parked-skills/add-shop-product` and `archives/claude-system-import/skills/add-shop-product`. Any shop work will fall back to improvisation until it is restored.
- Repo remote is `github.com/richardjlyon/americas_tapestry` (public, GitHub — not Gitea). AI layer adopted 2026-08-28, not 2026-08-26 as previously recorded; `work-products-index.md` still carries the 26th.
- The old `~/Code/web-americas-tapestry` location was **not parked** as `_migrated-` per the migration skill. It is simply gone.

## Watch

- **The merchandise licence is still a draft.** Seton Hill University owns the name, marks, designs and images; the shop sells goods derived from them. Shop confirmed live (`/shop` returns 200). Thirteen days from an exhibition on their own premises, an unexecuted licence is the largest exposure on this project. Vault: `America's Tapestry — Seton Hill Merchandise Licence (draft)`.
- Vercel bandwidth from image originals — see `VERCEL_USAGE_INVESTIGATION.md` in the repo.

## Sibling project, outside the estate

`americas-tapestry-exhibition-products` — the printed exhibition materials (display panels, state quote plaques, banners), all **due September 2026**. It pulls its source content from *this* repo, so content gaps here become gaps in the print run. It lives at `~/Resilio/Projects/americas-tapestry-exhibition-items`, has never been migrated into the AIOS estate, and its Gitea repo is `rjl/americas-tapestry-exhibition-products` under a legacy org. Vault: `America's Tapestry — Exhibition Materials`.
