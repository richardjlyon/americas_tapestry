# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Bring the tapestries to life — currently through a redesigned "dark gallery" site and an online shop, rather than the 3D walkthrough.
**Current focus:** Live-site redesign + online shop (ongoing, worked in yolo mode with direct commits — no phase plans in this folder). The v2.0 3D Virtual Gallery milestone tracked below is **PARKED**.

## Current Position

**⚠️ Roadmap divergence — read this first.** This `.planning/` structure tracks the **v2.0 Virtual Gallery (3D)** milestone, which is **parked** (last advanced 2026-04-22; the gallery is now unlisted in nav — prototype only). Since early July 2026 the real work has been a separate, unplanned stream, done in yolo mode outside this roadmap:

- **"Dark gallery" redesign** — dark homepage with a rotating full-bleed hero, navy/oxblood themed "rooms" per page type, framed fine-art tapestry plates + full-size lightbox. The old tapestry status carousel and interactive Mapbox colonial map were **removed**.
- **Online shop** (`/shop`) — headless Shopify Storefront API: per-state wall art (prints/framed/posters), postcards (all 13 states), a book (coming-soon), and Stefan Romero dolls. `shop.americastapestry.com` → `/shop`. Coordinated with sister repo **`gitea/americas-tapestry-shop`** (Gelato→Shopify) via **`SHOP_COORDINATION.md`** in the repo root.
- **Vercel bandwidth leak fixed** (~189 GB/mo crawler transfer).

For live state, trust `git log` + repo-root docs (`SHOP_COORDINATION.md`, `TASK.md`, `feature.md`) — **not** the phase docs below, which describe only the parked 3D stream.

---

**Parked v2.0 milestone position (frozen 2026-04-22):**

Phase: 1 of 5 (3D Foundation & Navigation)
Plan: 2 of 2 in current phase
Status: All plans complete, awaiting verification
Last activity: 2026-04-22 - Completed quick task 260422-rdd: Add optional portrait and portraitPosition fields to team member frontmatter, and update rendering to use them as the primary/thumbnail image when set

Progress: [##........] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 3.5 min
- Total execution time: 7 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-3d-foundation-navigation | 2 | 7 min | 3.5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (2 min), 01-02 (5 min)
- Trend: --

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Desktop-only 3D with mobile 2D fallback (no mobile 3D controls)
- [Roadmap]: Gallery 7 only for v2.0 scope
- ~~[Roadmap]: R3F v8 + Three.js ~0.170 pinned for React 18 compatibility~~ SUPERSEDED
- [01-02]: Upgraded to React 19 + R3F 9 + drei 10 + three 0.183 (Next.js 16 requires React 19 internally)
- [01-01]: Two-layer SSR boundary pattern established and verified
- [01-02]: Feet as scene units, MOVE_SPEED=5 ft/s, L-shape collision via overlapping rectangles
- [01-02]: Removed unused react-leaflet (React 18 only, not imported)

### Pending Todos

None yet.

### Blockers/Concerns

- ~~SSR boundary must be correct from Phase 1~~ RESOLVED: Two-layer pattern verified in 01-01
- ~~drei v9.x exact version needs verification~~ RESOLVED: upgraded to drei 10.7.7
- ~~Three.js 0.170 compatibility with Turbopack~~ RESOLVED: React 19 + R3F 9 works with Turbopack in dev
- ~~Vercel deploy compatibility~~ RESOLVED: Preview deploy verified working

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260422-rdd | Add optional portrait and portraitPosition fields to team member frontmatter, and update rendering to use them as the primary/thumbnail image when set | 2026-04-22 | 3864d3c | [260422-rdd-add-optional-portrait-and-portraitpositi](./quick/260422-rdd-add-optional-portrait-and-portraitpositi/) |

## Session Continuity

Last GSD session (parked 3D milestone): 2026-03-07 — Phase 1 plans complete, proceeding to verification.
Live work since (redesign + shop) is tracked in `git log` and repo-root docs, not here.
Resume file: None
