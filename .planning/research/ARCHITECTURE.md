# Architecture: 3D Virtual Gallery Integration

**Project:** America's Tapestry - Virtual Gallery (v2.0)
**Researched:** 2026-03-06
**Confidence:** HIGH (verified with official R3F docs, Next.js patterns, and existing codebase analysis)

## Executive Summary

The 3D gallery integrates as an isolated client-side subtree within the existing Next.js App Router site. Three.js and React Three Fiber are entirely client-side technologies that cannot run in server components. The integration strategy uses a server component page that loads tapestry data, then passes it as props into a dynamically imported client component tree containing the entire 3D scene. This keeps the 3D bundle (~500KB+ gzipped) out of the initial site bundle and loads it only when users navigate to the gallery route.

## Integration Architecture

### The Boundary Pattern

```
Server Component Layer (existing)          Client Component Layer (new)
================================          ==============================
app/gallery/page.tsx                      components/features/gallery/
  |-- getAllTapestries()                     |-- GalleryScene.tsx ('use client')
  |-- Prepare gallery data                  |    |-- <Canvas>
  |-- dynamic(() => import(...))            |    |-- <GalleryRoom />
      with { ssr: false }                   |    |-- <TapestryFrames />
  |-- <MobileFallback /> (SSR)              |    |-- <FirstPersonControls />
                                            |    |-- <GalleryLighting />
                                            |-- GalleryOverlay.tsx ('use client')
                                            |-- MobileFallback.tsx (can be server)
```

### Critical Integration Point: SSR Boundary

Three.js accesses `window`, `document`, and WebGL APIs that do not exist on the server. The entire 3D scene must be loaded with `ssr: false`:

```typescript
// app/gallery/page.tsx (SERVER component)
import dynamic from 'next/dynamic';
import { getAllTapestries } from '@/lib/tapestries';

const GalleryScene = dynamic(
  () => import('@/components/features/gallery/GalleryScene'),
  {
    ssr: false,
    loading: () => <GalleryLoadingScreen />,
  }
);

export default async function GalleryPage() {
  const tapestries = await getAllTapestries();
  const galleryData = prepareGalleryData(tapestries);

  return (
    <>
      {/* Desktop: 3D gallery */}
      <div className="hidden md:block h-screen">
        <GalleryScene tapestries={galleryData} />
      </div>
      {/* Mobile: Fallback gallery */}
      <div className="md:hidden">
        <MobileFallbackGallery tapestries={galleryData} />
      </div>
    </>
  );
}
```

### Next.js Config Addition

The project uses Next.js 16. For R3F integration, add `transpilePackages` to `next.config.mjs`:

```javascript
const nextConfig = {
  // ...existing config
  transpilePackages: ['three'],
}
```

This is required for Next.js 13.1+ to properly handle Three.js ESM imports (verified from R3F installation docs).

## Component Structure

### New Components (all in `src/components/features/gallery/`)

| Component | Type | Responsibility |
|-----------|------|----------------|
| `GalleryScene.tsx` | Client ('use client') | Top-level Canvas wrapper, scene setup, Suspense boundaries |
| `GalleryRoom.tsx` | Client (child) | Wall geometry, floor, ceiling meshes from room definition |
| `TapestryFrame.tsx` | Client (child) | Single framed tapestry: frame geometry + texture plane |
| `TapestryFrames.tsx` | Client (child) | Maps tapestry data to positioned TapestryFrame instances |
| `GalleryLighting.tsx` | Client (child) | Ambient + spot lights for museum aesthetic |
| `FirstPersonCamera.tsx` | Client (child) | PointerLockControls + WASD movement + collision |
| `GalleryOverlay.tsx` | Client ('use client') | HTML overlay for tapestry detail panel on click |
| `GalleryLoadingScreen.tsx` | Server or Client | Loading state while 3D bundle downloads |
| `MobileFallbackGallery.tsx` | Server | Grid/carousel view of tapestries for mobile |

### New Library Files (in `src/lib/`)

| File | Purpose |
|------|---------|
| `gallery-data.ts` | Transform TapestryEntry[] into gallery placement data |
| `gallery-room.ts` | Room geometry definition (wall segments, dimensions) |

### Modified Files

| File | Change |
|------|--------|
| `next.config.mjs` | Add `transpilePackages: ['three']` |
| `package.json` | Add three, @react-three/fiber, @react-three/drei |

No existing components need modification. The gallery is a new route with its own component tree.

## Data Flow

### Content Files to 3D Scene

```
content/tapestries/{state}/index.md     (existing markdown files)
        |
        v
lib/content-core.ts + lib/tapestries.ts  (existing: reads frontmatter + content)
        |
        v
getAllTapestries(): TapestryEntry[]       (existing: returns typed array)
        |
        v
lib/gallery-data.ts                      (NEW: transforms for gallery)
  - Maps each tapestry to a wall position
  - Selects appropriate image URL for texture
  - Adds frame dimensions based on tapestry aspect ratio
        |
        v
GalleryScene receives GalleryTapestry[]   (NEW: client component)
  - Each item has: position, rotation, textureUrl, title, etc.
        |
        v
TapestryFrame loads texture via useTexture (drei helper)
  - Creates plane geometry with texture
  - Adds frame mesh around it
```

### Gallery Data Interface

```typescript
// lib/gallery-data.ts
interface GalleryTapestry {
  slug: string;
  title: string;
  summary: string;
  colony: string;
  textureUrl: string;        // URL to image for WebGL texture
  wallPosition: [number, number, number];  // [x, y, z] in gallery space
  wallRotation: [number, number, number];  // Euler rotation to face correct direction
  frameWidth: number;        // In gallery units (feet)
  frameHeight: number;       // In gallery units (feet)
}

interface GalleryRoomDefinition {
  walls: WallSegment[];
  floorWidth: number;
  floorDepth: number;
  ceilingHeight: number;
  spawnPoint: [number, number, number];
  spawnDirection: [number, number, number];
}

interface WallSegment {
  start: [number, number];   // 2D floor plan coordinates
  end: [number, number];
  height: number;
  hasDoorway?: boolean;
  doorwayWidth?: number;
}
```

## Room Geometry Definition

### Encoding the Floor Plan

Gallery 7 dimensions (~26'x23' with wall segments) should be defined as a data structure, not hardcoded geometry. This allows iteration on layout without changing component code.

**Recommended approach:** Define wall segments as a TypeScript constant in `lib/gallery-room.ts`. Each wall segment is a start point, end point, and height. The component reads this data and generates `<mesh>` elements with `BoxGeometry` for each wall.

```typescript
// lib/gallery-room.ts
export const GALLERY_7: GalleryRoomDefinition = {
  // 1 unit = 1 foot for intuitive mapping from floor plan
  floorWidth: 26,
  floorDepth: 23,
  ceilingHeight: 10,  // Typical gallery ceiling
  spawnPoint: [13, 1.7, 20],  // Center-back of room, eye height
  spawnDirection: [0, 0, -1], // Looking into the room

  walls: [
    // South wall (bottom of floor plan) - three segments
    { start: [0, 23], end: [13.167, 23], height: 10 },
    { start: [13.167, 23], end: [20.167, 23], height: 10 },
    { start: [20.167, 23], end: [26, 23], height: 10 },
    // East wall
    { start: [26, 23], end: [26, 0], height: 10 },
    // North wall (top of floor plan)
    { start: [26, 0], end: [0, 0], height: 10 },
    // West wall
    { start: [0, 0], end: [0, 23], height: 10 },
    // ... alcove walls if applicable
  ],
};
```

**Why data-driven, not model-based:** A `.glb` model would be overkill for rectangular walls. Data-driven geometry is:
- Easier to iterate (change a number, see result)
- Smaller bundle (no model file to load)
- Simpler collision detection (axis-aligned walls)
- More maintainable by developers who are not 3D artists

### Tapestry Placement Strategy

Tapestries are placed along wall segments. Define placement as offsets along each wall:

```typescript
export const TAPESTRY_PLACEMENTS: TapestryPlacement[] = [
  { wallIndex: 0, offsetAlongWall: 0.5, heightCenter: 5, slug: 'connecticut' },
  { wallIndex: 0, offsetAlongWall: 0.8, heightCenter: 5, slug: 'delaware' },
  // ... 13 placements total
];
```

The gallery-data transform converts these placements + wall segment geometry into world-space positions and rotations.

## Texture Loading Strategy

### Which Image Sizes to Use

The existing image pipeline provides variants at 640w, 1024w, 1920w, 2560w in webp/jpg/avif.

**Recommendation: Use 1024w JPG for textures.**

Rationale:
- **Why 1024w:** WebGL textures should be power-of-two friendly. 1024px is a standard GPU texture size. The tapestries are viewed from several feet away in gallery space -- 1024px provides sufficient detail for the viewing distance. Loading 13 textures at 1920w would be ~40MB+; at 1024w it is ~10-15MB.
- **Why JPG (not WebP/AVIF):** Three.js `TextureLoader` and drei's `useTexture` natively support JPG. WebP support in WebGL requires additional handling. JPG is universally supported across all WebGL implementations. The existing 1024w JPG variants are already generated and available.
- **Why not AVIF:** Three.js does not natively decode AVIF for textures. You would need to decode to ImageBitmap first, adding complexity for marginal benefit in a WebGL context where textures are decoded to GPU format anyway.

### Loading Pattern

```typescript
// In TapestryFrame.tsx
import { useTexture } from '@react-three/drei';

function TapestryFrame({ textureUrl, ...props }: TapestryFrameProps) {
  const texture = useTexture(textureUrl);
  // useTexture handles loading, caching, and disposal
  // Wrap parent in <Suspense> for loading states

  return (
    <group {...props}>
      <mesh>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Frame border meshes */}
    </group>
  );
}
```

### Progressive Loading Strategy

1. **Phase 1:** Load room geometry immediately (no textures needed -- solid colors)
2. **Phase 2:** Load tapestry textures via `<Suspense>` -- each frame shows a placeholder color until its texture loads
3. **Phase 3 (future):** When user approaches a tapestry, swap to 1920w texture for close-up detail (LOD pattern, defer to later milestone)

### Texture URL Construction

The gallery-data transform builds texture URLs from existing image paths:

```typescript
function getTextureUrl(tapestry: TapestryEntry): string {
  // Use the 1024w JPG variant directly from public directory
  return `/images/tapestries/${tapestry.slug}/${tapestry.slug}-tapestry-main-1024w.jpg`;
}
```

This uses the local public path, not the Cloudflare R2 URL. For WebGL textures loaded via Three.js TextureLoader, the custom Next.js image loader is bypassed entirely -- Three.js fetches the URL directly. The local public path works for development; in production, these are served from the CDN via Vercel's static asset hosting.

## Camera and Navigation

### Recommended: PointerLockControls + Custom WASD

Drei provides `PointerLockControls` for mouse-look. WASD movement must be implemented manually via `useFrame` + keyboard event listeners:

```typescript
// FirstPersonCamera.tsx
'use client';

import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function FirstPersonCamera() {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, back: false, left: false, right: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    moveState.current.forward = true; break;
        case 'KeyS': case 'ArrowDown':  moveState.current.back = true; break;
        case 'KeyA': case 'ArrowLeft':  moveState.current.left = true; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = true; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    moveState.current.forward = false; break;
        case 'KeyS': case 'ArrowDown':  moveState.current.back = false; break;
        case 'KeyA': case 'ArrowLeft':  moveState.current.left = false; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = false; break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 5; // feet per second
    const { forward, back, left, right } = moveState.current;

    direction.current.z = Number(forward) - Number(back);
    direction.current.x = Number(right) - Number(left);
    direction.current.normalize();

    // Apply camera rotation to movement direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const sideDirection = new THREE.Vector3().crossVectors(
      camera.up, cameraDirection
    ).normalize();

    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(cameraDirection, direction.current.z * speed * delta);
    velocity.current.addScaledVector(sideDirection, direction.current.x * speed * delta);

    camera.position.add(velocity.current);
    camera.position.y = 1.7; // Lock to eye height (5'7")

    // TODO: Wall collision detection (Phase 2)
  });

  return <PointerLockControls />;
}
```

### Collision Detection

Simple approach for rectangular rooms: clamp camera position to room bounds minus a margin. For wall segments, use 2D line-segment distance tests on the XZ plane. This is computed per-frame in `useFrame` and does not require a physics engine.

```typescript
// Clamp to room bounds (simple version)
camera.position.x = Math.max(margin, Math.min(roomWidth - margin, camera.position.x));
camera.position.z = Math.max(margin, Math.min(roomDepth - margin, camera.position.z));
```

**Do not use a physics engine** (Cannon, Rapier) for this use case. The room is simple rectangular geometry -- a physics engine adds ~200KB+ to the bundle for zero benefit.

## Tapestry Click Interaction

### Raycasting + HTML Overlay

When user clicks while in pointer-lock mode, cast a ray from camera center. If it hits a tapestry mesh, show an HTML overlay with tapestry details.

Drei's `<Html>` component can render React DOM elements positioned in 3D space, but for a full-screen detail overlay, use a regular React state + portal pattern:

```typescript
// GalleryScene.tsx
const [selectedTapestry, setSelectedTapestry] = useState<GalleryTapestry | null>(null);

return (
  <div className="relative h-full">
    <Canvas>
      <TapestryFrames
        tapestries={galleryData}
        onTapestryClick={setSelectedTapestry}
      />
      {/* ... */}
    </Canvas>

    {/* HTML overlay outside Canvas */}
    {selectedTapestry && (
      <GalleryOverlay
        tapestry={selectedTapestry}
        onClose={() => setSelectedTapestry(null)}
      />
    )}
  </div>
);
```

Each `TapestryFrame` uses R3F's `onClick` event (which uses raycasting internally):

```typescript
<mesh onClick={() => onTapestryClick(tapestryData)}>
  {/* tapestry plane */}
</mesh>
```

## Lighting Design

Museum-style lighting for clean aesthetic:

```typescript
function GalleryLighting() {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.4} color="#fff5e6" />

      {/* Overhead directional (simulates ceiling panels) */}
      <directionalLight
        position={[13, 9.5, 11.5]}
        intensity={0.6}
        color="#ffffff"
        castShadow={false}  // Shadows are expensive for 13 lights
      />

      {/* Individual spot lights per tapestry (museum track lighting) */}
      {/* Added per-tapestry in TapestryFrame component */}
    </>
  );
}
```

Per-tapestry spotlights can be added later for dramatic effect, but start with ambient + directional for performance.

## Bundle Impact and Code Splitting

### Bundle Size Estimates

| Package | Gzipped Size | Purpose |
|---------|-------------|---------|
| three | ~150KB | Core 3D engine |
| @react-three/fiber | ~45KB | React renderer for Three.js |
| @react-three/drei | ~30KB (tree-shaken) | Helpers (useTexture, PointerLockControls, Html) |
| Gallery components | ~15KB | Custom scene code |
| **Total** | **~240KB** | Loaded only on gallery route |

### Code Splitting Strategy

The `dynamic(() => import(...), { ssr: false })` pattern ensures:
1. Zero 3D code in the initial site bundle
2. 3D bundle loads only when user navigates to `/gallery`
3. Loading screen shows while bundle downloads
4. Non-gallery pages are completely unaffected

### Webpack Configuration

Three.js works with the existing webpack config. No additional webpack plugins are needed. The `transpilePackages: ['three']` in next.config.mjs is the only configuration change.

## Suggested Build Order

### Phase 1: Empty Room (Foundation)

**Goal:** Render a white room you can walk around in.

1. Install packages: `three`, `@react-three/fiber`, `@react-three/drei`
2. Add `transpilePackages: ['three']` to next.config.mjs
3. Create `app/gallery/page.tsx` -- server component with dynamic import
4. Create `GalleryScene.tsx` -- Canvas + basic camera
5. Create `GalleryRoom.tsx` -- Floor plane + 4 walls (hardcoded box, not data-driven yet)
6. Create `FirstPersonCamera.tsx` -- PointerLockControls + WASD movement
7. Verify: Can walk around an empty white room with mouse-look

**Why first:** Proves the SSR boundary, dynamic import, and Canvas setup work. Everything else builds on this foundation.

### Phase 2: Room Geometry from Data

**Goal:** Room matches Gallery 7 floor plan dimensions.

1. Create `lib/gallery-room.ts` -- Room definition data structure
2. Encode Gallery 7 wall segments from floor plan measurements
3. Update `GalleryRoom.tsx` to generate walls from data
4. Add floor texture (wood) and wall color (white/off-white)
5. Add basic lighting (ambient + directional)
6. Add collision detection (clamp to room bounds)

**Why second:** Gets the spatial foundation right before adding tapestries. Easier to debug navigation in an empty room.

### Phase 3: Tapestries on Walls

**Goal:** All 13 tapestries visible as textures on the walls.

1. Create `lib/gallery-data.ts` -- Transform TapestryEntry[] to GalleryTapestry[]
2. Define tapestry placements along wall segments
3. Create `TapestryFrame.tsx` -- Plane with texture + frame mesh
4. Create `TapestryFrames.tsx` -- Maps data to positioned frames
5. Add Suspense boundaries for texture loading
6. Add GalleryLoadingScreen for initial bundle load
7. Verify: All 13 tapestries visible in correct positions

**Why third:** Builds on room geometry. Requires the data pipeline from existing content.

### Phase 4: Interaction and Polish

**Goal:** Click tapestries for details, refined museum aesthetic.

1. Add click handler on tapestry meshes
2. Create `GalleryOverlay.tsx` -- Detail panel with title, colony, description
3. Add museum track lighting (per-tapestry spotlights)
4. Refine materials (wall texture, floor material)
5. Add ceiling geometry
6. Add entrance/navigation instructions overlay ("Click to enter, WASD to move")
7. Add ESC to exit pointer lock with instructions

### Phase 5: Mobile Fallback and Accessibility

**Goal:** Non-3D users get a good experience.

1. Create `MobileFallbackGallery.tsx` -- Grid or carousel of tapestry images
2. Add viewport-based switching (CSS hidden/shown, not JS detection)
3. Add keyboard-only navigation support (Tab through tapestries)
4. Add aria-labels for gallery elements
5. Add prefers-reduced-motion check to disable animations

### Phase 6: Performance Optimization

**Goal:** Fast load times, smooth rendering.

1. Measure texture load times, optimize if needed
2. Add loading progress indicator (X of 13 textures loaded)
3. Implement texture LOD if close-up viewing is needed
4. Profile frame rate, optimize draw calls if needed
5. Add `<link rel="prefetch">` for 3D bundle on tapestries page

## Anti-Patterns to Avoid

### Do Not: Use Physics Engine for Wall Collision

A physics engine (Cannon.js, Rapier) adds 200KB+ to the bundle and requires stepping a simulation each frame. For axis-aligned rectangular walls, simple position clamping or line-segment distance checks are sufficient and performant.

### Do Not: Load All Textures Before Showing Scene

Load room geometry immediately. Let textures stream in via Suspense. Users should see the room and be able to move around while textures are still loading.

### Do Not: Use `<Html>` for Tapestry Labels in 3D Space

Drei's `<Html>` component is useful but creates a separate DOM element per instance, updated every frame. For 13 labels that are always visible, this is expensive. Use `<Html>` only for the detail overlay (one element at a time), not for labels on every frame.

### Do Not: Put Canvas in Root Layout

The Canvas should exist only on the gallery page, not in the root layout. Keeping a persistent Canvas across routes (as react-three-next suggests) is not appropriate here -- the 3D experience is a single page, not site-wide.

### Do Not: Use the Custom Cloudflare Loader for Textures

Three.js TextureLoader fetches images directly via URL. It does not go through Next.js `<Image>` component or its custom loader. Use the raw public path (`/images/tapestries/...`) for texture URLs. The Cloudflare R2 URLs work too, but the local path is simpler and works in development.

## Dependency on Existing Architecture

| Existing System | How Gallery Uses It | Risk |
|-----------------|---------------------|------|
| `getAllTapestries()` | Source of tapestry data (title, slug, images) | None -- stable API, read-only |
| `content/tapestries/*.md` | Frontmatter provides metadata | None -- data format is stable |
| `public/images/tapestries/` | 1024w JPG variants used as textures | Low -- files exist for all 13 states |
| `next.config.mjs` | Needs `transpilePackages` addition | None -- additive change |
| Root layout | Gallery page uses site layout (nav, footer) | None -- standard Next.js routing |
| Tailwind CSS | Used for overlay styling, loading screen, mobile fallback | None -- already configured |

The gallery has **zero coupling** to existing components. It reads data from existing content files via existing library functions and renders in its own component tree. Removing the gallery route would leave the rest of the site completely unaffected.

## Sources

- [React Three Fiber Installation Docs](https://r3f.docs.pmnd.rs/getting-started/installation) - Next.js setup requirements (HIGH confidence)
- [Drei Controls Documentation](https://drei.docs.pmnd.rs/controls/introduction) - PointerLockControls API (HIGH confidence)
- [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) - Reference starter for R3F + Next.js patterns (HIGH confidence)
- [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) - Performance optimization patterns (HIGH confidence)
- [Three.js Texture Performance Discussion](https://discourse.threejs.org/t/texture-performance/24297) - Texture sizing and format guidance (MEDIUM confidence)
- [Virtual Art Gallery Examples](https://github.com/rahel-yab/Virtual-art-gallery) - Pattern reference for gallery implementations (MEDIUM confidence)
- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) - Version 8 pairs with React 18 (HIGH confidence)
- [@react-three/drei npm](https://www.npmjs.com/package/@react-three/drei) - Version 9.x compatible with fiber 8 (HIGH confidence)
