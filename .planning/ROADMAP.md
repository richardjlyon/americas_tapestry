# Roadmap: Virtual Gallery v2.0

> **⚠️ PARKED.** This roadmap covers the v2.0 3D Virtual Gallery milestone, which is on hold (Phase 1 complete, last advanced 2026-04-22; gallery unlisted in nav). Live work since July 2026 — the "dark gallery" redesign + online shop — was done outside this roadmap in yolo mode. See `.planning/STATE.md`, `.planning/MILESTONES.md`, and `git log`. Resume this only on Richard's instruction.

## Overview

Transform the America's Tapestry site from a flat content experience into an immersive 3D virtual gallery where visitors walk through a museum-style room viewing all 13 colony tapestries. The build progresses from an empty navigable room, to tapestries on walls, to clickable detail overlays, to museum-quality lighting, and finally a mobile fallback -- each phase delivering a verifiable capability that builds on the last.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: 3D Foundation & Navigation** - Navigable empty room with SSR-safe 3D pipeline
- [ ] **Phase 2: Tapestries on Walls** - All 13 colony tapestries displayed as framed images
- [ ] **Phase 3: Interaction & Overlay** - Click-to-inspect detail panel with UX chrome
- [ ] **Phase 4: Lighting & Materials** - Museum-quality environment polish
- [ ] **Phase 5: Mobile Fallback** - 2D gallery experience for non-desktop users

## Phase Details

### Phase 1: 3D Foundation & Navigation
**Goal**: Visitor can walk around a correctly-proportioned Gallery 7 room using first-person controls
**Depends on**: Nothing (first phase)
**Requirements**: SCENE-01, SCENE-04, NAV-01, NAV-02, NAV-03, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Visiting /gallery renders a 3D room matching Gallery 7 proportions (~26'x23') with walls, floor, and ceiling visible
  2. User can move through the room with WASD/arrow keys and look around with mouse (pointer lock activates on click)
  3. User cannot walk through walls -- movement stops at wall boundaries
  4. Camera starts at the gallery entrance facing inward
  5. The 3D bundle is code-split and dynamically imported -- navigating other site pages loads zero Three.js code
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- Install R3F stack and establish SSR-safe dynamic import pipeline
- [x] 01-02-PLAN.md -- Build Gallery 7 room geometry and first-person navigation controls

### Phase 2: Tapestries on Walls
**Goal**: All 13 colony tapestries are visible as framed artwork on the gallery walls
**Depends on**: Phase 1
**Requirements**: TAP-01, TAP-02
**Success Criteria** (what must be TRUE):
  1. All 13 tapestries are displayed on gallery walls as framed images in appropriate positions
  2. Tapestry textures are loaded from existing 1024w images and are legible when the user walks close
  3. Tapestries have visible frames that distinguish them from the wall surface
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md -- Display all 13 colony tapestries as framed artwork on gallery walls

### Phase 3: Interaction & Overlay
**Goal**: Visitor can click any tapestry to learn about it, with clear guidance and navigation
**Depends on**: Phase 2
**Requirements**: TAP-03, TAP-04, NAV-04, NAV-05, PERF-01
**Success Criteria** (what must be TRUE):
  1. Clicking a tapestry opens a detail overlay showing the tapestry title, colony name, and description
  2. User can close the detail overlay and return to walking the gallery
  3. First-time visitors see an instructions overlay explaining controls ("WASD to move, mouse to look, click artwork")
  4. An exit button is visible that returns the user to the main site
  5. A loading screen with progress indicator is shown while the 3D scene initializes
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Lighting & Materials
**Goal**: The gallery feels like a real museum with proper lighting and surface materials
**Depends on**: Phase 2
**Requirements**: SCENE-02, SCENE-03
**Success Criteria** (what must be TRUE):
  1. Walls have a white/cream museum finish and the floor has a wood-tone appearance
  2. Each tapestry is illuminated by directional lighting that highlights the artwork against the walls
  3. Overall ambient lighting creates a warm, gallery-appropriate atmosphere without harsh shadows
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Mobile Fallback
**Goal**: Mobile visitors get a quality gallery experience without 3D
**Depends on**: Phase 3
**Requirements**: MOB-01, MOB-02
**Success Criteria** (what must be TRUE):
  1. Mobile devices are shown a 2D gallery grid instead of the 3D scene
  2. All 13 tapestries are displayed in the mobile gallery with images
  3. Tapping a tapestry on mobile opens the same detail view (title, colony, description)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5
Note: Phase 4 depends on Phase 2 (not Phase 3), so it could run in parallel with Phase 3 if desired.

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. 3D Foundation & Navigation | 2/2 | ✓ Complete | 2026-03-07 |
| 2. Tapestries on Walls | 0/1 | Not started | - |
| 3. Interaction & Overlay | 0/TBD | Not started | - |
| 4. Lighting & Materials | 0/TBD | Not started | - |
| 5. Mobile Fallback | 0/TBD | Not started | - |

---
*Roadmap created: 2026-03-06*
*Milestone: v2.0 Virtual Gallery*
