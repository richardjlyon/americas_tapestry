# Stitchers Pages — Working Plan & Recovery File

> This file is a live working/recovery document. If the session crashes, read this
> first to restore context, then continue from the "Current Status" section.

## Original User Instructions (verbatim intent)

We are creating **two new types of page** to document all of the stitchers.

### 1. Per-state stitchers page
- On a tapestry page (e.g. https://www.americastapestry.com/tapestries/connecticut),
  there is a grid titled **"The team behind the tapestry"** showing chips.
- Add a **last chip** to that grid with an appropriate label and matching styling.
- Clicking that chip opens a **new page** (one per state) that we will create.
- The page content comes from the spreadsheet:
  `/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx`
- Find the tab whose name matches the state's name.
- On the new page, create three sections:
  1. **State Directors**
  2. **CORE volunteers**
  3. **Guest volunteers**
- Formatting: **all plain text, no chrome or adornment.**
  - Bold the group name.
  - On the next line, list the individuals from the spreadsheet.

### 2. Aggregate "all stitchers" page
- At the bottom of the grid, create **another new chip**.
- Similar format / same label idea: **"Meet all of the stitchers"**.
- This chip opens a **single page** (site-wide, not per-state).
- Same format as the per-state page (the three bold sections + names).
- **Aggregate all the names** from every state into the appropriate sections.

### Process instructions from user
- This is potentially complex — plan it with the brainstorm skill (in progress).
- **Save a plan file to disk as we go** (this file) so we can recover from a crash.
- NOTE: Previous crash was caused by malformed JSON, possibly while recommending
  artefacts to remove like asterisks. Be careful with tool-call JSON — avoid
  pasting raw spreadsheet content with special characters directly into tool args.

## Key Files Discovered So Far
- Tapestry detail route: `src/app/tapestries/[slug]/page.tsx`
  - Uses `tapestry.title` (e.g. "Connecticut") and `tapestry.slug` (e.g. "connecticut").
  - Renders `<TeamCard stateName={tapestry.title} ... />` inside the Team section.
  - Static site: `generateStaticParams()` from `getAllTapestries()`.
- Team grid component: `src/components/features/tapestries/team-card.tsx`
  - Renders "The Team Behind the Tapestry" heading + flex-wrap grid of `<Link><Card>` chips.
  - Each chip: circular image, role, name, "Read more →"; links to `/team/{groupSlug}/{slug}`.
- Content convention: markdown files under `./content` parsed with gray-matter.
- Build scripts live in `./scripts/*.mjs`.
- Spreadsheet: `/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx` (~87k)

## Spreadsheet Structure (CONFIRMED)
- 13 state tabs (exact state names) + "State Directors" + "Summary" tabs.
- Each state tab layout:
  - Row 0: legend `* Stitchers marked with an asterisk have contributed to more than one panel.`
  - Row 2: title `AMERICA'S TAPESTRY — <STATE> PANEL VOLUNTEERS`
  - Row 3: header `#, First Name, Last Name, Category, Notes`
  - Section marker rows in col A: `▶  STATE DIRECTOR(S)`, `▶  CORE VOLUNTEERS`, `▶  GUEST VOLUNTEERS`
  - Data rows: `#, First, Last, Category, Notes`
- Names may carry a trailing `*` (multi-panel contributor) — usually on the Last Name.
- Counts per state (Directors / Core / Guest):
  CT 1/8/161, DE 2/5/550, GA 1/6/8, MD 5/29/79, MA 1/5/27, NH 2/18/60,
  NJ 2/5/101, NY 1/13/44, NC 1/9/124, PA 2/24/242, RI 1/5/164, SC 1/27/100, VA 1/5/112.
- Aggregate page will list ~1700+ names total.

## Design Decisions (CONFIRMED with user)
- Asterisk handling: **Strip entirely** (no markers, no legend)
- Name list format: **Comma-separated flowing paragraph**
- URL/route structure: **/stitchers (aggregate) + /stitchers/[state] (per-state)**
- Per-state chip label: **"Meet the {State} Stitchers"**
- Aggregate chip label: **"Meet all of the stitchers"**
- Aggregate dedupe: **Dedupe + sort alphabetically by last name** per section
- Data pipeline: **One-time Node script (scripts/build-stitchers.mjs) → committed src/lib/data/stitchers.json**

## Full design spec
See `2026-06-20-stitchers-pages-design.md` (approved by user). Implementation
order is listed at the bottom of that spec.

## Current Status
- [x] Wrote this recovery file
- [x] Explored team-card.tsx + tapestry page structure
- [x] Inspected spreadsheet tabs and column layout
- [x] Brainstormed design decisions with user (all confirmed above)
- [x] Wrote final design spec (design.md) — approved by user
- [ ] User reviews written spec
- [ ] Write implementation plan (writing-plans skill)
- [ ] Implement
