# Phase 1: 3D Foundation & Navigation - Research

**Researched:** 2026-03-06
**Domain:** Three.js / React Three Fiber first-person 3D gallery with Next.js App Router
**Confidence:** HIGH

## Summary

This phase establishes a first-person navigable 3D room in the browser using React Three Fiber (R3F) with Three.js, integrated into the existing Next.js 16 App Router site. The room models Gallery 7 from the floor plan -- an L-shaped space approximately 26'x23' with an upper alcove extending to 13'x16'.

The standard approach is: R3F v8 as the React renderer for Three.js, drei v9 for helper components (PointerLockControls, KeyboardControls), simple position-clamping collision detection (no physics engine needed for rectangular walls), and Next.js `dynamic()` with `ssr: false` inside a Client Component to isolate Three.js from the server bundle and other routes.

Key constraints verified: R3F v9 requires React 19 (incompatible), drei v9 works with R3F v8 + React 18 (compatible), `@react-three/rapier` v2 requires R3F v9 (incompatible -- use v1.5.0 if physics are ever needed, but simple clamping is better here).

**Primary recommendation:** Use `@react-three/fiber@8.18.0` + `@react-three/drei@9.122.0` + `three@0.170.0`, with PointerLockControls for mouse look, KeyboardControls + useFrame for WASD movement, and axis-aligned bounding box clamping for wall collision.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.170.0 | 3D rendering engine | Locked decision from roadmap; peer dep satisfied by R3F v8 (requires >=0.133) |
| @react-three/fiber | 8.18.0 | React renderer for Three.js | Latest v8 release; requires react>=18; v9 requires React 19 so v8 is mandatory |
| @react-three/drei | 9.122.0 | Helper components (controls, etc.) | Latest v9; peer deps: react ^18, @react-three/fiber ^8 or ^9 -- fully compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/dynamic | (bundled with Next.js 16) | Dynamic import with ssr:false | Required for code-splitting the 3D scene away from other routes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Simple clamping for walls | @react-three/rapier@1.5.0 | Rapier adds WASM bundle (~2MB), physics sim overhead; overkill for rectangular wall boundaries |
| Custom key handler | drei KeyboardControls | KeyboardControls provides Zustand-based key state distribution; cleaner than raw addEventListener |
| drei PointerLockControls | Custom PointerLock API wrapper | drei handles edge cases (ESC recovery, selector binding, raycast centering) |

**Installation:**
```bash
npm install three@0.170.0 @react-three/fiber@8.18.0 @react-three/drei@9.122.0
npm install -D @types/three@0.170.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── gallery/
│       └── page.tsx              # Server Component - dynamically imports GalleryClient
├── components/
│   └── features/
│       └── gallery/
│           ├── GalleryClient.tsx  # 'use client' - dynamic() wrapper with ssr:false
│           ├── GalleryScene.tsx   # Canvas + scene composition
│           ├── GalleryRoom.tsx    # Room geometry (walls, floor, ceiling)
│           ├── PlayerControls.tsx # PointerLockControls + WASD movement + collision
│           └── constants.ts      # Room dimensions, camera start position
```

### Pattern 1: SSR-Safe Dynamic Import (Critical)
**What:** Three.js cannot run in Node.js (no WebGL). The `ssr: false` option in `next/dynamic` MUST be used in a Client Component, NOT a Server Component.
**When to use:** Always, for any component that imports Three.js/R3F.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/lazy-loading (Next.js 16.1.6 docs)

// app/gallery/page.tsx (Server Component - NO 'use client')
import GalleryClient from '@/components/features/gallery/GalleryClient';

export default function GalleryPage() {
  return <GalleryClient />;
}

// components/features/gallery/GalleryClient.tsx
'use client';

import dynamic from 'next/dynamic';

const GalleryScene = dynamic(
  () => import('./GalleryScene'),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen">Loading gallery...</div>,
  }
);

export default function GalleryClient() {
  return <GalleryScene />;
}
```

### Pattern 2: First-Person Controls Composition
**What:** Combine drei's PointerLockControls (mouse look) with KeyboardControls (WASD state) and useFrame (movement application).
**When to use:** Any first-person walkthrough experience.
**Example:**
```typescript
// Source: drei docs + verified R3F patterns

// GalleryScene.tsx
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function GalleryScene() {
  return (
    <KeyboardControls map={keyMap}>
      <Canvas camera={{ fov: 75, position: [startX, eyeHeight, startZ] }}>
        <GalleryRoom />
        <PlayerControls />
      </Canvas>
    </KeyboardControls>
  );
}
```

### Pattern 3: Movement with Boundary Clamping
**What:** Apply WASD movement relative to camera direction, then clamp position to room boundaries.
**When to use:** Simple room with axis-aligned walls.
**Example:**
```typescript
// Source: Verified R3F movement patterns

import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const MOVE_SPEED = 5; // units per second
const WALL_PADDING = 0.3; // prevent camera clipping through walls

function PlayerControls() {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys();

    // Calculate movement direction relative to camera facing
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta)
      .applyEuler(camera.rotation);

    // Apply movement
    camera.position.x += direction.x;
    camera.position.z += direction.z;
    // Keep Y fixed (no flying/falling)

    // Clamp to room boundaries
    camera.position.x = Math.max(ROOM_MIN_X + WALL_PADDING, Math.min(ROOM_MAX_X - WALL_PADDING, camera.position.x));
    camera.position.z = Math.max(ROOM_MIN_Z + WALL_PADDING, Math.min(ROOM_MAX_Z - WALL_PADDING, camera.position.z));
  });

  return <PointerLockControls />;
}
```

### Anti-Patterns to Avoid
- **Importing R3F in a Server Component:** Causes build failure. Three.js requires WebGL which is browser-only. Always use dynamic import with ssr:false.
- **Using `ssr: false` in a Server Component:** Next.js explicitly errors on this. The dynamic() call with ssr:false MUST live inside a file marked `'use client'`.
- **Updating camera position via setState:** Never use React state for per-frame updates. Use refs and useFrame for 60fps camera movement.
- **Using a physics engine for rectangular room collision:** Adds bundle size and complexity for a problem solved by 4 lines of Math.max/Math.min clamping.
- **Placing KeyboardControls inside Canvas:** KeyboardControls must wrap Canvas, not be inside it. It provides context that Canvas children consume.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pointer lock mouse look | Custom PointerLock API wrapper | drei PointerLockControls | Handles ESC recovery, lock/unlock events, selector binding, raycast centering |
| Keyboard state management | Raw addEventListener with useState | drei KeyboardControls | Provides efficient Zustand-based state; transient access avoids re-renders; integrates with R3F ecosystem |
| React-Three.js bridge | Manual scene/renderer/camera setup | @react-three/fiber Canvas | Handles resize, pixel ratio, render loop, React reconciliation, cleanup |
| Code splitting Three.js | Manual webpack config or React.lazy | next/dynamic with ssr:false | Handles SSR exclusion + code splitting + loading state in one API |

**Key insight:** R3F and drei exist specifically to bridge React and Three.js. Hand-rolling any of their core concerns (render loop, controls, keyboard input) results in bugs around cleanup, resize handling, and React lifecycle integration.

## Common Pitfalls

### Pitfall 1: ssr:false in Wrong Component Layer
**What goes wrong:** `ssr: false` is placed on a Server Component's dynamic import, causing Next.js to throw: "ssr: false is not allowed with next/dynamic in Server Components"
**Why it happens:** Developers put the dynamic() call in the page.tsx (which is a Server Component by default)
**How to avoid:** Create a separate `'use client'` wrapper component that contains the dynamic() call. The Server Component page.tsx imports that wrapper normally.
**Warning signs:** Build error mentioning "ssr: false is not allowed in Server Components"

### Pitfall 2: Three.js Leaking Into Other Routes
**What goes wrong:** Three.js (~600KB) gets bundled into shared chunks, loaded on every page
**Why it happens:** Importing Three.js types or components at the top level of shared files
**How to avoid:** Keep ALL Three.js imports inside the gallery component tree. Never import Three.js types in shared utility files. Verify with bundle analyzer.
**Warning signs:** Three.js appearing in webpack bundle analysis for non-gallery routes

### Pitfall 3: Frame-Rate Dependent Movement
**What goes wrong:** Movement speed varies with monitor refresh rate (faster on 144Hz than 60Hz)
**Why it happens:** Using fixed position increments per frame instead of multiplying by delta time
**How to avoid:** Always multiply movement by `delta` from useFrame's second argument: `SPEED * delta`
**Warning signs:** Movement feels different on different machines/monitors

### Pitfall 4: KeyboardControls Outside Canvas
**What goes wrong:** useKeyboardControls() returns undefined or throws context error inside Canvas children
**Why it happens:** KeyboardControls is placed inside Canvas instead of wrapping it
**How to avoid:** KeyboardControls wraps Canvas: `<KeyboardControls><Canvas>...</Canvas></KeyboardControls>`
**Warning signs:** "useKeyboardControls must be used within KeyboardControls" error

### Pitfall 5: Camera Y-axis Drift
**What goes wrong:** Looking up/down while moving causes camera to fly off the ground plane
**Why it happens:** Movement direction includes the camera's pitch (X rotation), so looking up + pressing W moves the camera upward
**How to avoid:** Only apply movement to X and Z axes. Explicitly keep camera.position.y constant at eye height.
**Warning signs:** Camera gradually rises or sinks during gameplay

### Pitfall 6: Gallery 7 Is L-Shaped, Not Rectangular
**What goes wrong:** Simple min/max clamping allows walking through the upper-right wall where the alcove meets the main room
**Why it happens:** The floor plan shows Gallery 7 is L-shaped -- the main area is ~26'x23' but there is an upper alcove (~13'x16') offset to the left
**How to avoid:** Use a polygon-based boundary check or define the room as two overlapping rectangles. Clamp position to whichever rectangle the player is currently in.
**Warning signs:** Player walks through walls at the L-shape junction

## Code Examples

### Room Geometry Construction
```typescript
// Source: Three.js BoxGeometry + verified R3F patterns

// constants.ts - Gallery 7 dimensions from floor plan (converted to meters at 1:1 ft scale for simplicity)
// Using feet directly as scene units for easier reasoning about dimensions

export const ROOM_CONFIG = {
  // Main rectangular area
  main: {
    width: 26.17,   // 26'-2"
    depth: 23.0,    // 23'-0"
    height: 10.0,   // assumed ~10' ceiling (typical gallery)
  },
  // Upper alcove area (extends from left side of main room)
  alcove: {
    width: 13.0,    // 13'-0"
    depth: 16.04,   // 16'-0 1/2" (extends beyond main room)
    height: 10.0,
  },
  eyeHeight: 5.5,   // ~5'6" eye height
  wallThickness: 0.5,
} as const;

// Camera start: entrance is at bottom of floor plan (south wall)
// Center of the 7'-0" opening between the 13'-2" and 6'-0" wall segments
export const START_POSITION = {
  x: 13.17 + 3.5,   // 13'-2" + half of 7'-0" opening
  y: ROOM_CONFIG.eyeHeight,
  z: -0.5,          // just inside the entrance
} as const;

export const START_LOOK_AT = {
  x: START_POSITION.x,
  y: ROOM_CONFIG.eyeHeight,
  z: -ROOM_CONFIG.main.depth / 2,  // looking toward center of room
} as const;
```

### Room Walls with BufferGeometry
```typescript
// GalleryRoom.tsx
'use client';

import * as THREE from 'three';
import { ROOM_CONFIG } from './constants';

export function GalleryRoom() {
  const { main, height, wallThickness } = ROOM_CONFIG;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[main.width / 2, 0, -main.depth / 2]}>
        <planeGeometry args={[main.width, main.depth]} />
        <meshStandardMaterial color="#8B7355" side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[main.width / 2, height, -main.depth / 2]}>
        <planeGeometry args={[main.width, main.depth]} />
        <meshStandardMaterial color="#FAFAFA" side={THREE.DoubleSide} />
      </mesh>

      {/* Walls - each wall is a thin box or plane */}
      {/* South wall (entrance wall) - two segments with gap for entrance */}
      {/* West wall */}
      {/* North wall */}
      {/* East wall */}
      {/* ... additional walls for L-shape alcove */}
    </group>
  );
}
```

### L-Shape Collision Boundary
```typescript
// Collision check for L-shaped room (two overlapping rectangles)
interface BoundingRect {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

const PADDING = 0.3;

const mainRoom: BoundingRect = {
  minX: PADDING,
  maxX: ROOM_CONFIG.main.width - PADDING,
  minZ: -(ROOM_CONFIG.main.depth - PADDING),
  maxZ: -PADDING,
};

const alcove: BoundingRect = {
  minX: PADDING,
  maxX: ROOM_CONFIG.alcove.width - PADDING,
  minZ: -(ROOM_CONFIG.main.depth + ROOM_CONFIG.alcove.depth - PADDING),
  maxZ: -(ROOM_CONFIG.main.depth - PADDING),
};

function isInsideRoom(x: number, z: number): boolean {
  return isInsideRect(x, z, mainRoom) || isInsideRect(x, z, alcove);
}

function isInsideRect(x: number, z: number, rect: BoundingRect): boolean {
  return x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ;
}

// In useFrame: try new position, only apply if inside room
function clampToRoom(newX: number, newZ: number, oldX: number, oldZ: number): [number, number] {
  if (isInsideRoom(newX, newZ)) return [newX, newZ];
  // Try sliding along each axis independently
  if (isInsideRoom(newX, oldZ)) return [newX, oldZ];
  if (isInsideRoom(oldX, newZ)) return [oldX, newZ];
  return [oldX, oldZ]; // can't move
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| R3F v8 + drei v9 + React 18 | R3F v9 + drei v10 + React 19 | 2025 | R3F v9 dropped React 18 support; this project MUST stay on v8 |
| @react-three/cannon (physics) | @react-three/rapier (physics) | 2023 | Rapier v2 requires R3F v9; v1.5.0 works with v8 if physics are ever needed |
| next/dynamic in pages dir | next/dynamic in app router with client boundary | Next.js 13+ | ssr:false must be in 'use client' component |
| Webpack bundling | Turbopack (Next.js 16 default dev) | Next.js 15+ | Three.js compatibility with Turbopack needs verification at install time |

**Deprecated/outdated:**
- `@react-three/cannon`: Unmaintained; use `@react-three/rapier` if physics needed
- drei PointerLockControls `camera` prop: No longer needed; controls automatically use the default camera

## Open Questions

1. **Turbopack compatibility with Three.js 0.170**
   - What we know: Next.js 16 uses Turbopack by default for dev. Three.js is a large library with GLSL shader imports.
   - What's unclear: Whether Turbopack handles all Three.js import patterns correctly (GLSL, worker files)
   - Recommendation: Test immediately after installing. If issues arise, fall back to `next dev --webpack` for development.

2. **Gallery 7 exact ceiling height**
   - What we know: Floor plan shows footprint dimensions but not ceiling height
   - What's unclear: Actual ceiling height of Gallery 7 at the New England Quilt Museum
   - Recommendation: Use 10 feet as a reasonable gallery default. Can be adjusted later.

3. **Entrance location and orientation**
   - What we know: Floor plan shows openings in the south wall (bottom). There is a 7'-0" gap between wall segments.
   - What's unclear: Exactly which opening is the main entrance vs connecting to Gallery 12
   - Recommendation: Use the center 7'-0" gap in the south wall as the entrance. Camera faces north (into room).

4. **drei v9 + R3F v8.18.0 exact version compatibility**
   - What we know: drei v9.122.0 peer deps specify `@react-three/fiber ^8 || ^9.0.0-0` and `react ^18`
   - What's unclear: Whether the absolute latest drei v9 has any runtime issues with R3F 8.18.0
   - Recommendation: Install and verify. If issues, pin to a slightly older drei v9 (e.g., 9.115.0).

## Sources

### Primary (HIGH confidence)
- npm registry: `@react-three/fiber@8.18.0` peer deps verified (`react>=18`, `three>=0.133`)
- npm registry: `@react-three/drei@9.122.0` peer deps verified (`react ^18`, `@react-three/fiber ^8 || ^9`)
- npm registry: `@react-three/fiber@9.5.0` peer deps verified (`react>=19` -- confirms incompatible)
- npm registry: `@react-three/rapier@2.2.0` peer deps verified (`react ^19`, `@react-three/fiber ^9` -- incompatible)
- npm registry: `@react-three/rapier@1.5.0` peer deps verified (`react>=18`, `@react-three/fiber>=8.9.0` -- compatible if needed)
- npm registry: `three@0.170.0` exists and is valid
- Next.js 16.1.6 official docs on lazy loading (fetched 2026-03-06): https://nextjs.org/docs/app/guides/lazy-loading
- drei controls docs: https://drei.docs.pmnd.rs/controls/introduction
- Floor plan image: `/scratch/floor-plan.jpeg` (Gallery 7 dimensions verified visually)

### Secondary (MEDIUM confidence)
- PointerLockControls tutorial: https://sbcode.net/react-three-fiber/pointerlock-controls/
- First-person movement patterns: https://kylemadkins.com/blog/movement-react-three-fiber/
- R3F first person walking controls gist: https://gist.github.com/ChrisCrossCrash/cab92b6e4690412732d87665840d541f
- Three.js forum on wall collision: https://discourse.threejs.org/t/avoid-collision-with-walls-first-person-control/45161

### Tertiary (LOW confidence)
- Turbopack + Three.js compatibility: No authoritative source found; needs runtime verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified against npm registry peer dependencies
- Architecture: HIGH - SSR boundary pattern verified against Next.js 16 official docs; R3F patterns well-established
- Pitfalls: HIGH - SSR boundary is documented by Next.js; frame-rate delta is standard gamedev practice
- Collision approach: MEDIUM - Simple clamping is well-understood but L-shape boundary logic is custom
- Gallery dimensions: MEDIUM - Extracted from floor plan image; ceiling height assumed

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (30 days; stack is stable since pinned to v8)
