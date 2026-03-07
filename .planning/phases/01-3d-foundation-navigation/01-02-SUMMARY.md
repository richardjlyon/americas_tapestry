---
phase: 01-3d-foundation-navigation
plan: 02
subsystem: ui
tags: [three.js, gallery-room, first-person-controls, collision, pointer-lock, keyboard-controls]

# Dependency graph
requires: ["01-01"]
provides:
  - "L-shaped Gallery 7 room geometry (26.17x23 main + 13x16.04 alcove)"
  - "First-person WASD/arrow movement with wall collision"
  - "Pointer lock mouse look controls"
  - "Room constants and collision boundary system"
affects:
  - Phase 2 (tapestry placement on walls)
  - Phase 3 (click interaction with artwork)
  - Phase 4 (lighting/materials refinement)

# Tech tracking
tech-stack:
  added: []
  upgraded: [react@19.2.4, react-dom@19.2.4, "@react-three/fiber@9.5.0", "@react-three/drei@10.7.7", three@0.183.2, vaul@1.1.2, react-day-picker@9.14.0]
  removed: [react-leaflet, leaflet, "@types/leaflet"]
  patterns: [first-person-controls, l-shape-collision, keyboard-controls-wrapping-canvas, module-level-vector-reuse]

key-files:
  created:
    - src/components/features/gallery/constants.ts
    - src/components/features/gallery/GalleryRoom.tsx
    - src/components/features/gallery/PlayerControls.tsx
  modified:
    - src/components/features/gallery/GalleryScene.tsx
    - package.json
    - package-lock.json
    - src/components/ui/calendar.tsx

key-decisions:
  - "React 18→19 upgrade required: Next.js 16 ships compiled React 19 internally, R3F 8.x react-reconciler incompatible"
  - "R3F 8→9, drei 9→10, three 0.170→0.183 to match React 19"
  - "Removed unused react-leaflet (React 18 only peer dep, not imported anywhere)"
  - "Feet as scene units (1 unit = 1 foot) for intuitive gallery proportions"
  - "MOVE_SPEED=5 ft/s for comfortable gallery walking pace"

patterns-established:
  - "L-shape collision via two overlapping rectangles with slide-along-wall"
  - "Module-level Vector3 reuse to avoid GC in useFrame"
  - "KeyboardControls wraps Canvas (not inside it) per drei requirements"
  - "Camera Y locked to eyeHeight every frame to prevent flying"

# Metrics
duration: 5min
completed: 2026-03-07
---

# Phase 1 Plan 2: Gallery 7 Room & First-Person Navigation Summary

**L-shaped Gallery 7 room with first-person WASD/mouse navigation and wall collision, verified by human checkpoint**

## Performance

- **Duration:** ~5 min (tasks) + React 19 upgrade troubleshooting
- **Started:** 2026-03-07
- **Completed:** 2026-03-07
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 8

## Accomplishments
- Built L-shaped Gallery 7 room: main 26.17'x23' + alcove 13'x16.04', 10' ceiling height
- Cream walls (#F5F0E8), wood-tone floor (#8B7355), near-white ceiling (#FAFAFA)
- Entrance gap in south wall (7' wide) with camera starting position
- WASD/arrow key movement with pointer lock mouse look
- Wall collision with slide-along-wall behavior for L-shape
- Upgraded React 18→19 + R3F 8→9 + drei 9→10 to resolve Next.js 16 compatibility
- Verified on Vercel preview deploy — production build passes, live site unaffected

## Task Commits

1. **Task 1: Create room constants and Gallery 7 geometry** - `c4600d7` (feat)
2. **Task 2: Create player controls and compose the scene** - `07bae2d` (feat)
3. **Task 3: Human verification checkpoint** - approved
4. **React 19 upgrade** - `8b2d7c6`, `6a5b3ca`, `c8e3c34` (chore/fix)

## Files Created/Modified
- `src/components/features/gallery/constants.ts` - Room dimensions, collision, start position, key map
- `src/components/features/gallery/GalleryRoom.tsx` - L-shaped room walls, floor, ceiling
- `src/components/features/gallery/PlayerControls.tsx` - WASD movement, pointer lock, collision
- `src/components/features/gallery/GalleryScene.tsx` - Composed scene with KeyboardControls, Canvas, Room, Controls
- `package.json` - React 19, R3F 9, drei 10, three 0.183
- `src/components/ui/calendar.tsx` - Updated for react-day-picker v9 API

## Deviations from Plan

- **React 19 upgrade**: Next.js 16 ships compiled React 19 internally, causing R3F 8.x's react-reconciler to crash on `ReactSharedInternals`. Upgraded entire React stack to 19 + R3F 9 + drei 10. Verified on Vercel preview deploy.
- **Removed react-leaflet**: Unused package with React 18-only peer dep, not imported anywhere in src/

## Issues Encountered

- `ReactSharedInternals` undefined error: Next.js 16's compiled React 19 doesn't expose `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` which R3F 8.x's react-reconciler 0.27 requires. Fixed by upgrading to React 19 + R3F 9.x.
- Vercel peer dep failures: `--legacy-peer-deps` used locally produced a lockfile Vercel rejected. Fixed by clean `rm -rf node_modules && npm install`.

## User Setup Required

None.

## Next Phase Readiness
- Navigable 3D gallery room at /gallery ready for tapestry placement (Phase 2)
- Wall surfaces ready for framed artwork meshes
- Room constants available for tapestry positioning calculations

---
*Phase: 01-3d-foundation-navigation*
*Completed: 2026-03-07*
