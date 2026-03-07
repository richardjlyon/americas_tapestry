# Project Research Summary

**Project:** America's Tapestry - Virtual Gallery (v2.0)
**Domain:** First-person 3D virtual museum gallery (WebGL, web-based)
**Researched:** 2026-03-06
**Confidence:** HIGH

## Executive Summary

America's Tapestry v2.0 adds a first-person 3D walkthrough of Gallery 7 (~26'x23') displaying 13 colony tapestries. The recommended approach uses React Three Fiber v8 (the React 18-compatible line) with Three.js ~0.170 and drei v9.x, loaded exclusively on a single `/gallery` route via dynamic import with `ssr: false`. This keeps the ~250KB gzipped 3D bundle completely isolated from the rest of the content site. The room is simple enough that no physics engine, no HDRI environment maps, and no compressed texture formats (KTX2) are needed -- raycasting handles collision, SpotLights handle museum lighting, and standard 1024w JPGs from the existing R2 pipeline serve as textures.

The architecture is a clean client-side subtree within the existing Next.js App Router site. A server component page loads tapestry data via the existing `getAllTapestries()` function and passes it into the dynamically imported 3D scene. Room geometry is data-driven (TypeScript constants, not 3D model files), making layout iteration fast without 3D artist involvement. Mobile users get a 2D fallback gallery, not a degraded 3D experience. The gallery has zero coupling to existing components -- adding or removing it affects nothing else on the site.

The top risks are SSR hydration crashes (Three.js leaking into server bundle), VRAM exhaustion from oversized textures on integrated GPUs, and first-person controls that feel wrong to non-gamers. All three are well-understood problems with documented prevention strategies. The SSR boundary must be correct from day one. Textures must stay at 1024w (not 4K). Controls need 2-3 iterations with real user testing.

## Key Findings

### Recommended Stack

The project runs React 18.3.1 on Next.js 16.0.10. This constrains all 3D libraries to their React 18-compatible versions. The version pairing is non-negotiable: R3F v8 = React 18, R3F v9 = React 19.

**Core technologies:**
- `three@^0.170.0`: 3D engine -- pin to ~0.170, not latest 0.183 which has breaking API changes untested with R3F v8
- `@react-three/fiber@^8.17.10`: React renderer for Three.js -- v8 line for React 18 compatibility
- `@react-three/drei@^9.117.0`: Helpers (PointerLockControls, useTexture, Html) -- v9.x for R3F v8, NOT v10.x
- `@types/three@^0.170.0`: TypeScript types (dev dependency)
- `leva@^0.9.35`: Debug GUI for tuning lights/materials (dev dependency, optional but recommended)

**Explicitly excluded:** `@react-three/rapier` (2-3MB WASM, overkill), `@react-three/postprocessing` (unnecessary effects), `@react-three/xr` (VR out of scope), KTX2 tooling (13 textures doesn't justify it), any physics engine.

**Config change:** Add `transpilePackages: ['three']` to `next.config.mjs`. That is the only existing file modification.

### Expected Features

**Must have (table stakes):**
- First-person WASD + mouse-look navigation with wall collision
- Room geometry matching Gallery 7 floor plan proportions
- 13 tapestries rendered as framed images on walls
- Click-to-inspect detail overlay with tapestry content
- Museum-style lighting (ambient + spot per tapestry)
- Loading screen with progress indicator
- Instructions overlay ("WASD to move, mouse to look, click artwork")
- Exit button back to main site
- Mobile fallback (2D gallery, not degraded 3D)

**Should have (differentiators, low effort):**
- Smooth camera transitions when approaching tapestries
- Tapestry proximity highlight (glow on approach)
- Keyboard shortcuts for cycling tapestries in detail overlay

**Defer to post-v2.0:**
- Guided tour mode (high complexity)
- Mini-map (medium complexity)
- Ambient sound (needs content)
- High-res zoom in detail overlay (good v2.1 feature)
- VR/WebXR, multiplayer, audio narration, fabric animations (anti-features)

### Architecture Approach

The gallery is an isolated client-side subtree. Server component page fetches tapestry data, passes it as props to a dynamically imported client component tree. All 3D code lives in `src/components/features/gallery/`. Room geometry is defined as TypeScript data in `src/lib/gallery-room.ts`, not as 3D model files. Tapestry placement is data-driven: wall segment index + offset along wall. Textures use 1024w JPG from existing `public/images/tapestries/` paths, loaded via drei's `useTexture` with Suspense boundaries for progressive loading.

**Major components:**
1. `GalleryScene.tsx` -- Canvas wrapper, Suspense boundaries, overlay state management
2. `GalleryRoom.tsx` -- Wall/floor/ceiling meshes generated from room data definition
3. `TapestryFrame.tsx` / `TapestryFrames.tsx` -- Texture-mapped planes with frame geometry, click handlers
4. `FirstPersonCamera.tsx` -- PointerLockControls (mouse) + custom WASD movement + collision clamping
5. `GalleryLighting.tsx` -- Ambient fill + directional + per-tapestry spots
6. `GalleryOverlay.tsx` -- HTML detail panel outside Canvas, triggered by tapestry click
7. `MobileFallbackGallery.tsx` -- Server-renderable 2D grid for mobile users

**New lib files:**
- `lib/gallery-data.ts` -- Transforms `TapestryEntry[]` into `GalleryTapestry[]` with wall positions
- `lib/gallery-room.ts` -- Gallery 7 room definition (wall segments, dimensions, spawn point)

### Critical Pitfalls

1. **SSR hydration crash** -- Three.js imports in server bundle cause build failures or runtime `ReferenceError`. Prevention: `dynamic()` with `ssr: false` from day one, all 3D code in dedicated directory, test with `next build` after every integration step.

2. **VRAM explosion from oversized textures** -- A 4K texture uses ~64MB VRAM; 13 of them = 832MB, crashing integrated GPUs. Prevention: cap at 1024w (fits ~10-15MB total VRAM), use progressive loading, test on machines with integrated graphics.

3. **Bundle size contamination** -- Three.js (~150KB gzipped) leaking into shared chunks penalizes all pages. Prevention: code-split via dynamic import, verify isolation with `@next/bundle-analyzer`.

4. **First-person controls that feel wrong** -- Mouse sensitivity, wall clipping, disorienting movement. Prevention: PointerLockControls for look only, custom WASD with damping, conservative mouse sensitivity (0.002 rad/px), vertical look clamping, budget 2-3 tuning iterations.

5. **WebGL memory leaks on navigation** -- GPU resources not released on unmount. Prevention: clear useLoader texture cache on unmount, monitor GPU memory via Chrome DevTools Task Manager across navigation cycles.

## Implications for Roadmap

### Phase 1: 3D Foundation and Empty Room
**Rationale:** Proves the SSR boundary, dynamic import, Canvas setup, and basic navigation work. Every subsequent phase depends on this being correct. This is where the most dangerous pitfalls live (SSR crash, bundle contamination, canvas sizing).
**Delivers:** A white room matching Gallery 7 proportions that you can walk around in with WASD + mouse-look. Mobile detection routing to a placeholder.
**Addresses:** Room geometry, first-person controls, wall collision, loading screen, mobile detection
**Avoids:** SSR crash (#1), bundle explosion (#4), canvas sizing (#7), mobile 3D (#9)
**Stack:** Install three, R3F, drei. Add transpilePackages to next.config.mjs.

### Phase 2: Tapestries on Walls
**Rationale:** Depends on room geometry from Phase 1. This is the core visual content -- everything else is navigation chrome around it. Texture loading strategy must be designed here.
**Delivers:** All 13 tapestries visible as framed images on walls, positioned according to gallery layout.
**Addresses:** Tapestry textures, frame geometry, progressive texture loading, Suspense boundaries
**Avoids:** VRAM explosion (#3), blank screen during load (#6)
**Uses:** useTexture from drei, existing 1024w JPG images from R2 pipeline

### Phase 3: Interaction and Detail Overlay
**Rationale:** Requires tapestries on walls (Phase 2) to have something to click on. This completes the core user journey: walk, look, click, learn.
**Delivers:** Click a tapestry to see detail overlay with title, colony, description. Exit overlay to return to gallery.
**Addresses:** Click-to-inspect raycasting, detail overlay, exit button, instructions overlay
**Avoids:** Memory leaks from overlay toggling (#2)

### Phase 4: Lighting and Visual Polish
**Rationale:** Museum aesthetic matters but is not structural. Better to get placement and interaction right first, then tune the look. Use leva debug GUI for live tuning.
**Delivers:** Museum-quality lighting (ambient fill + per-tapestry spots), refined wall/floor materials, ceiling geometry, smooth camera transitions.
**Addresses:** Gallery lighting, floor/wall materials, camera transitions (differentiator), proximity highlights (differentiator)

### Phase 5: Mobile Fallback and Accessibility
**Rationale:** The 2D fallback requires tapestry content to be finalized (Phases 2-3). Accessibility can be tested once the full experience exists.
**Delivers:** 2D gallery grid for mobile, screen reader support, keyboard-only navigation, skip links, prefers-reduced-motion support.
**Addresses:** Mobile fallback view, ARIA attributes, keyboard navigation
**Avoids:** Accessibility failure (#8), mobile 3D disaster (#9)

### Phase 6: Performance and Cross-Browser QA
**Rationale:** Optimization and polish after feature-complete. Measure real performance, fix real problems.
**Delivers:** Loading progress bar, cross-browser pointer lock fixes, bundle analysis verification, GPU memory testing, integrated GPU testing.
**Avoids:** Pointer lock Safari/Firefox issues (#12), frame-rate drops (#11)

### Phase Ordering Rationale

- Phases 1-3 form a strict dependency chain: room -> tapestries -> interaction. Cannot be reordered.
- Phase 4 (lighting) is separated from Phase 1 (room) because tuning lighting with tapestries already on walls is far more productive than tuning an empty room.
- Phase 5 (mobile/accessibility) is late because the 2D fallback reuses content from the completed 3D experience, but its design should be considered from Phase 1.
- Phase 6 is last because optimization without measurement is guesswork.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** First-person controls tuning -- well-documented pattern but needs iteration with real users. Multiple reference implementations exist.
- **Phase 2:** Tapestry placement along wall segments -- the gallery-data transform (wall offset to world-space coordinates) needs careful geometry math. Consider using leva to position tapestries visually.

Phases with standard patterns (skip research-phase):
- **Phase 3:** Raycasting click detection is a standard R3F pattern. Detail overlay is standard React.
- **Phase 4:** Lighting is pure tuning work, no research needed.
- **Phase 5:** Mobile fallback is a standard responsive design problem. Accessibility patterns for Canvas are documented.
- **Phase 6:** Performance profiling is measurement-driven, not research-driven.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Version pairing (R3F v8 = React 18) verified from official docs. Three.js ~0.170 pinning based on known breaking changes in 0.183. |
| Features | HIGH | Table stakes verified against Google Arts & Culture, Matterport, and virtual museum research. Anti-features well-justified. |
| Architecture | HIGH | SSR boundary pattern verified from official R3F + Next.js docs. Data-driven room geometry is pragmatic for a single rectangular room. |
| Pitfalls | HIGH | All critical pitfalls sourced from official R3F pitfalls guide, Three.js forums, and Next.js GitHub issues. |

**Overall confidence:** HIGH

### Gaps to Address

- **drei v9.x exact compatible version:** The cutoff between v9 (React 18) and v10 (React 19) needs verification at install time. Pin after confirming.
- **Three.js 0.170 with Turbopack:** Next.js 16 defaults to Turbopack. Three.js ecosystem is reported as compatible, but should be verified in Phase 1 build.
- **Gallery 7 floor plan accuracy:** The ~26'x23' dimensions need to be confirmed against the actual floor plan. Wall segments (alcoves, doorways) need precise measurement.
- **Tapestry aspect ratios:** The 13 tapestry images have varying aspect ratios. Frame geometry needs to accommodate this per-tapestry, not use a fixed size.
- **1024w JPG availability:** Confirm all 13 tapestry images have 1024w JPG variants in the existing image pipeline.
- **Cross-browser Pointer Lock:** Safari and Firefox have known quirks. Testing plan needed for Phase 2, not deferred to Phase 6.

## Sources

### Primary (HIGH confidence)
- [React Three Fiber Installation Docs](https://r3f.docs.pmnd.rs/getting-started/installation) -- version pairing, Next.js setup
- [React Three Fiber Pitfalls Guide](https://r3f.docs.pmnd.rs/advanced/pitfalls) -- performance anti-patterns
- [Drei Controls Documentation](https://drei.docs.pmnd.rs/controls/introduction) -- PointerLockControls API
- [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) -- optimization patterns
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Turbopack, React 18 support

### Secondary (MEDIUM confidence)
- [Three.js SpotLight Docs](https://threejs.org/docs/pages/SpotLight.html) -- museum lighting implementation
- [Google Arts & Culture Pocket Gallery](https://artsandculture.google.com/project/pocket-gallery) -- interaction pattern reference
- [Virtual Art Gallery (GitHub)](https://github.com/rahel-yab/Virtual-art-gallery) -- implementation reference
- [PointerLockControls Tutorial](https://sbcode.net/react-three-fiber/pointerlock-controls/) -- FPS controls implementation
- [R3F Bundle Size Discussion](https://github.com/pmndrs/react-three-fiber/discussions/812) -- bundle impact assessment

### Tertiary (needs validation)
- Three.js 0.170 stability with R3F v8 -- community reports, not officially tested matrix
- drei v9.x/v10.x React version boundary -- needs verification at install time

---
*Research completed: 2026-03-06*
*Ready for roadmap: yes*
