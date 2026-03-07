# Phase 2: Tapestries on Walls - Research

**Researched:** 2026-03-07
**Domain:** React Three Fiber texture loading, 3D gallery artwork display
**Confidence:** HIGH

## Summary

This phase involves displaying 13 colony tapestry images as framed artwork on the walls of the L-shaped Gallery 7 room built in Phase 1. The primary technical challenges are: (1) loading 13 textures efficiently, (2) positioning them correctly on wall segments with proper aspect ratios, and (3) creating convincing picture frames.

The established approach uses drei's `useTexture` hook for texture loading (with Suspense integration) and simple box geometry for frames. The drei `Image` component is an alternative but `useTexture` with manual mesh construction gives more control over frame composition. All 13 tapestries have 1024w JPG variants available in the public directory.

**Primary recommendation:** Use `useTexture` for texture loading with a data-driven wall placement system. Define tapestry positions/dimensions in a configuration array, then render each as a framed mesh group positioned on the appropriate wall segment.

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-three/fiber | ^9.5.0 | React renderer for Three.js | Already in project |
| @react-three/drei | ^10.7.7 | useTexture hook, Image component | Already in project |
| three | ^0.183.2 | TextureLoader, mesh/geometry/material | Already in project |

### Supporting
No additional libraries needed. Everything required is available in the existing stack.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useTexture + manual mesh | drei `<Image>` component | Image is simpler but harder to compose with frame geometry; useTexture gives full control |
| Individual useTexture calls | Single useTexture with array | Array form loads all at once but returns in fixed order; individual calls are clearer for named textures |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Project Structure
```
src/components/features/gallery/
├── constants.ts          # Add TAPESTRY_POSITIONS config
├── GalleryRoom.tsx       # Existing room geometry
├── GalleryScene.tsx      # Add <Suspense> wrapper for texture loading
├── PlayerControls.tsx    # Existing controls
├── TapestryWall.tsx      # NEW: Renders all 13 framed tapestries
└── FramedTapestry.tsx    # NEW: Single framed tapestry component
```

### Pattern 1: Data-Driven Wall Placement
**What:** Define all 13 tapestry positions in a typed configuration array in constants.ts, then map over it to render.
**When to use:** Always -- this is the core pattern for this phase.
**Example:**
```typescript
// constants.ts
interface TapestryPlacement {
  slug: string;
  imagePath: string;
  wall: 'south-left' | 'west' | 'east-main' | 'north-main' | 'east-alcove' | 'north-alcove';
  /** Center position of the tapestry on the wall [x, y, z] */
  position: [number, number, number];
  /** Rotation to face into the room [x, y, z] in radians */
  rotation: [number, number, number];
  /** Display width in feet */
  displayWidth: number;
  /** Display height in feet (computed from aspect ratio) */
  displayHeight: number;
}

export const TAPESTRY_PLACEMENTS: TapestryPlacement[] = [
  // ... 13 entries
];
```

### Pattern 2: useTexture with Suspense Boundary
**What:** Wrap texture-loading components in React Suspense so the scene shows a loading state while textures load.
**When to use:** Always when using useTexture (it suspends by default).
**Example:**
```typescript
// GalleryScene.tsx - add Suspense around tapestry components
import { Suspense } from 'react';

<Canvas ...>
  <GalleryRoom />
  <Suspense fallback={null}>
    <TapestryWall />
  </Suspense>
  <PlayerControls />
</Canvas>
```

### Pattern 3: Framed Artwork as Grouped Meshes
**What:** Each framed tapestry is a `<group>` containing: (1) a plane mesh with the texture, (2) box meshes forming a picture frame around the edges.
**When to use:** For every tapestry display.
**Example:**
```typescript
// FramedTapestry.tsx
function FramedTapestry({ texture, width, height, position, rotation }: Props) {
  const FRAME_DEPTH = 0.15;    // 0.15 feet (~1.8 inches) frame depth
  const FRAME_WIDTH = 0.2;     // 0.2 feet (~2.4 inches) frame molding width
  const FRAME_COLOR = '#3D2B1F'; // dark wood
  const WALL_OFFSET = 0.05;    // slight offset from wall to prevent z-fighting

  return (
    <group position={position} rotation={rotation}>
      {/* Tapestry image plane */}
      <mesh position={[0, 0, WALL_OFFSET]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Frame: top, bottom, left, right box meshes */}
      {/* ... 4 box meshes forming the frame border */}
    </group>
  );
}
```

### Anti-Patterns to Avoid
- **Loading textures in useFrame:** Never load textures inside the render loop. Always use useTexture at component mount time.
- **Z-fighting with walls:** Always offset artwork planes slightly from the wall surface (0.05 feet minimum). Without this, the tapestry plane and wall plane will flicker.
- **Hardcoding positions inline:** Put all placement data in constants.ts for maintainability.
- **Using meshBasicMaterial for tapestries:** Use meshStandardMaterial so tapestries respond to gallery lighting and look natural.

## Tapestry Image Analysis

### Image Dimensions (measured from actual files)
Two aspect ratio groups exist among the 13 tapestries:

**Group A - 1024x1317 pixels (aspect ~0.777:1, portrait):**
connecticut, maryland, massachusetts, new-hampshire, new-jersey, north-carolina, rhode-island, south-carolina, virginia

**Group B - 1024x1434 pixels (aspect ~0.714:1, taller portrait):**
delaware, georgia, new-york, pennsylvania

### Image Paths (exact filenames verified)
```typescript
const TAPESTRY_IMAGES: Record<string, string> = {
  'connecticut': '/images/tapestries/connecticut/connecticut-tapestry-1024w.jpg',
  'delaware': '/images/tapestries/delaware/delaware-tapestry-1024w.jpg',
  'georgia': '/images/tapestries/georgia/georgia-tapestry-main-1024w.jpg',
  'maryland': '/images/tapestries/maryland/maryland-tapestry-1024w.jpg',
  'massachusetts': '/images/tapestries/massachusetts/massachusetts-tapestry-main-1024w.jpg',
  'new-hampshire': '/images/tapestries/new-hampshire/new-hampshire-tapestry-main-1024w.jpg',
  'new-jersey': '/images/tapestries/new-jersey/new-jersey-tapestry-main-1024w.jpg',
  'new-york': '/images/tapestries/new-york/new-york-tapestry-main-1024w.jpg',
  'north-carolina': '/images/tapestries/north-carolina/north-carolina-tapestry-main-1024w.jpg',
  'pennsylvania': '/images/tapestries/pennsylvania/pennsylvania-tapestry-main-1024w.jpg',
  'rhode-island': '/images/tapestries/rhode-island/rhode-island-tapestry-main-1024w.jpg',
  'south-carolina': '/images/tapestries/south-carolina/south-carolina-tapestry-main-1024w.jpg',
  'virginia': '/images/tapestries/virginia/viginia-tapestry-main-1024w.jpg',
};
```
Note: Virginia has a typo in the filename ("viginia" not "virginia"). Do NOT rename; use the existing path.

### Available Formats
Each tapestry has .avif, .jpg, and .webp variants at 1024w. Use .jpg for Three.js TextureLoader compatibility (reliable cross-browser support, no special decoder needed).

## Wall Segment Analysis

### Available Wall Segments for Hanging Tapestries

| Wall Segment | Length (ft) | Usable? | Notes |
|--------------|-------------|---------|-------|
| South wall LEFT | 13.17 | Yes | Good for 2-3 tapestries |
| South wall RIGHT | 6.0 | Yes | Good for 1 tapestry |
| West wall | 39.04 | Yes | Longest wall, good for 5-6 tapestries |
| East wall main | 23.0 | Yes | Good for 3-4 tapestries |
| North wall main (east) | 13.17 | Yes | Good for 2 tapestries |
| East wall alcove | 16.04 | Yes | Good for 2-3 tapestries |
| North wall alcove | 13.0 | Yes | Good for 2 tapestries |

**Total usable wall length: ~123 feet** -- more than enough for 13 tapestries.

### Recommended Tapestry Size
- Real tapestries vary, but for gallery legibility: display width ~3.5-4 feet, height ~4.5-5.5 feet (depending on aspect ratio)
- At 4 ft wide: Group A tapestries would be ~5.14 ft tall, Group B would be ~5.6 ft tall
- Center height at eye level (5.5 ft Y), so center Y ~5.0 ft (tapestry top ~7.5-7.8 ft, bottom ~2.2-2.5 ft from floor) -- typical gallery hanging height
- Minimum spacing between tapestries: ~2 feet edge-to-edge

### Wall Orientation Reference
Each wall segment needs specific rotation to face INTO the room:
```
South walls:    rotation [0, 0, 0]         -- faces north (into room) ✓ (already face Z-)
West wall:      rotation [0, Math.PI/2, 0] -- faces east (into room)
East wall main: rotation [0, -Math.PI/2, 0] -- faces west (into room)
North main:     rotation [0, Math.PI, 0]   -- faces south (into room)
East alcove:    rotation [0, -Math.PI/2, 0] -- faces west (into room)
North alcove:   rotation [0, Math.PI, 0]   -- faces south (into room)
```

### Suggested Distribution (13 tapestries across walls)
This is a starting point -- exact placement is implementer discretion:
- **West wall (39 ft):** 5 tapestries (most prominent wall, longest)
- **East wall main (23 ft):** 3 tapestries
- **South wall left (13 ft):** 2 tapestries
- **North wall main east (13 ft):** 1 tapestry
- **East wall alcove (16 ft):** 1 tapestry
- **North wall alcove (13 ft):** 1 tapestry
- **South wall right (6 ft):** 0 (too narrow once framed, or 1 if desired)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Texture loading | Custom fetch + TextureLoader | drei `useTexture` | Handles Suspense, caching, error states automatically |
| Image aspect ratio | Manual pixel math | Pre-computed in constants | Aspect ratios are known (measured above), no runtime computation needed |
| Loading states | Custom loading spinners | React `<Suspense fallback={...}>` | useTexture integrates with Suspense natively |

## Common Pitfalls

### Pitfall 1: Z-Fighting Between Tapestry and Wall
**What goes wrong:** The tapestry plane and wall plane occupy the same Z position, causing flickering.
**Why it happens:** Two coplanar surfaces confuse the depth buffer.
**How to avoid:** Offset the tapestry plane 0.05 feet (0.6 inches) from the wall surface.
**Warning signs:** Shimmering/flickering on tapestry surfaces when camera moves.

### Pitfall 2: Texture Appears Blurry Up Close
**What goes wrong:** Tapestry images look pixelated or blurry when the player walks up close.
**Why it happens:** Default minFilter/magFilter settings or insufficient image resolution.
**How to avoid:** 1024w images should be adequate at 3.5-4 ft display width. Set `texture.minFilter = THREE.LinearMipmapLinearFilter` (default, good). If still blurry, ensure `texture.anisotropy` is set to `renderer.capabilities.getMaxAnisotropy()` for better quality at oblique angles.
**Warning signs:** Text on tapestries unreadable when standing 2-3 feet away.

### Pitfall 3: All Textures Load Before Scene Renders
**What goes wrong:** Scene is blank for several seconds while 13 textures load.
**Why it happens:** useTexture suspends the component until ALL textures are loaded.
**How to avoid:** Either (a) accept this with a loading indicator via Suspense fallback, or (b) split into multiple Suspense boundaries so tapestries appear progressively. Option (a) is simpler and recommended for 13 images at 1024w (~50-150KB each JPG).
**Warning signs:** Long blank screen before gallery appears.

### Pitfall 4: Incorrect Rotation Causes Tapestry to Face Wall
**What goes wrong:** Tapestry texture faces outward (away from room) instead of into the room.
**Why it happens:** Rotation set incorrectly for wall orientation.
**How to avoid:** Test each wall segment's rotation. A plane's default normal is [0,0,1] (faces positive Z). Rotate to face into the room based on wall orientation (see Wall Orientation Reference above).
**Warning signs:** Tapestry invisible from inside the room, visible only from outside.

### Pitfall 5: Tapestry Texture Color Appears Wrong
**What goes wrong:** Colors look washed out or too dark.
**Why it happens:** Three.js color management. By default R3F 9 uses `SRGBColorSpace` for the renderer, but textures loaded with useTexture may default to `LinearSRGBColorSpace`.
**How to avoid:** Ensure `texture.colorSpace = THREE.SRGBColorSpace` after loading. In R3F 9 / Three.js 0.183, the renderer's `outputColorSpace` is `SRGBColorSpace` by default. Verify textures match.
**Warning signs:** Tapestries look darker or more saturated than the original images.

## Code Examples

### Loading a Single Texture
```typescript
// Source: drei docs - useTexture
import { useTexture } from '@react-three/drei';

function TapestryMesh({ imagePath, width, height }: Props) {
  const texture = useTexture(imagePath);
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
```

### Loading Multiple Textures at Once
```typescript
// Source: drei docs - useTexture array form
import { useTexture } from '@react-three/drei';

function TapestryWall() {
  const textures = useTexture([
    '/images/tapestries/connecticut/connecticut-tapestry-1024w.jpg',
    '/images/tapestries/delaware/delaware-tapestry-1024w.jpg',
    // ... all 13 paths
  ]);
  // textures[0] = connecticut, textures[1] = delaware, etc.
}
```

### Picture Frame with Box Geometry
```typescript
// Verified pattern: 4 box meshes forming a rectangular frame
function PictureFrame({ width, height }: { width: number; height: number }) {
  const FRAME_W = 0.2;    // frame molding width in feet
  const FRAME_D = 0.15;   // frame depth in feet
  const color = '#3D2B1F'; // dark wood brown

  return (
    <group>
      {/* Top */}
      <mesh position={[0, height / 2 + FRAME_W / 2, 0]}>
        <boxGeometry args={[width + FRAME_W * 2, FRAME_W, FRAME_D]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -(height / 2 + FRAME_W / 2), 0]}>
        <boxGeometry args={[width + FRAME_W * 2, FRAME_W, FRAME_D]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left */}
      <mesh position={[-(width / 2 + FRAME_W / 2), 0, 0]}>
        <boxGeometry args={[FRAME_W, height, FRAME_D]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + FRAME_W / 2, 0, 0]}>
        <boxGeometry args={[FRAME_W, height, FRAME_D]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
```

### Complete FramedTapestry Component Pattern
```typescript
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface FramedTapestryProps {
  imagePath: string;
  displayWidth: number;
  displayHeight: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

function FramedTapestry({ imagePath, displayWidth, displayHeight, position, rotation }: FramedTapestryProps) {
  const texture = useTexture(imagePath);

  // Ensure correct color space
  texture.colorSpace = THREE.SRGBColorSpace;

  const FRAME_W = 0.2;
  const FRAME_D = 0.15;
  const WALL_OFFSET = 0.05;

  return (
    <group position={position} rotation={rotation}>
      {/* Tapestry image */}
      <mesh position={[0, 0, WALL_OFFSET]}>
        <planeGeometry args={[displayWidth, displayHeight]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Frame */}
      <PictureFrame width={displayWidth} height={displayHeight} />
    </group>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useLoader(TextureLoader, url)` | `useTexture(url)` from drei | drei v9+ | Simpler API, built-in Suspense |
| `texture.encoding = sRGBEncoding` | `texture.colorSpace = SRGBColorSpace` | Three.js r152 | Old encoding property deprecated |
| Manual THREE.Color management | R3F 9 auto color management | R3F 9.0 | Colors correct by default, but verify texture colorSpace |

## Open Questions

1. **Exact tapestry-to-wall assignment**
   - What we know: 13 tapestries, 7 wall segments, plenty of space
   - What's unclear: Whether the user has a preferred arrangement (e.g., chronological order of colony founding, geographic grouping)
   - Recommendation: Use chronological order of colony founding dates as default, planner can adjust

2. **Display size**
   - What we know: 3.5-4 ft wide works well for the room scale
   - What's unclear: Whether all tapestries should be the same display width or varied
   - Recommendation: Same display width (4 ft) for visual consistency; height varies by aspect ratio

3. **Anisotropic filtering**
   - What we know: Improves texture quality at oblique viewing angles
   - What's unclear: Performance impact with 13 textures on target hardware
   - Recommendation: Enable anisotropy; 1024w textures are small enough that this is negligible

## Sources

### Primary (HIGH confidence)
- drei official docs: Image component - https://drei.docs.pmnd.rs/abstractions/image
- drei official docs: useTexture - https://drei.docs.pmnd.rs/loaders/texture-use-texture
- Actual codebase files: constants.ts, GalleryRoom.tsx, GalleryScene.tsx (read directly)
- Actual image files: measured pixel dimensions via `sips` on all 13 tapestry images

### Secondary (MEDIUM confidence)
- R3F texture loading tutorial - https://docs.pmnd.rs/react-three-fiber/tutorials/loading-textures
- Three.js forum discussions on plane geometry + texture sizing

### Tertiary (LOW confidence)
- Community gallery examples (Psaemiyan/Gallary) - general pattern validation only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - already installed, versions verified from package.json
- Architecture: HIGH - patterns verified against drei docs and existing codebase structure
- Image paths/dimensions: HIGH - measured directly from actual files on disk
- Wall placement math: HIGH - computed from constants.ts values
- Pitfalls: MEDIUM - based on Three.js general knowledge and community patterns

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable domain, no fast-moving dependencies)
