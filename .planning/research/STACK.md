# Technology Stack: 3D Virtual Gallery

**Project:** America's Tapestry - Virtual Gallery (Gallery 7)
**Researched:** 2026-03-06
**Overall confidence:** HIGH

## Critical Compatibility Constraint

The project runs **React 18.3.1** on **Next.js 16.0.10**. Next.js 16 supports React 18 (minimum 18.2.0) but is optimized for React 19.2. All library selections below are pinned to versions compatible with React 18. Upgrading to React 19 is NOT recommended as part of this milestone -- it would affect the entire site and is out of scope.

**Version pairing rule:**
- `@react-three/fiber` v8.x = React 18
- `@react-three/fiber` v9.x = React 19 (DO NOT USE)
- `@react-three/rapier` v1.x = React 18 + R3F v8
- `@react-three/rapier` v2.x = React 19 + R3F v9 (DO NOT USE)

## Recommended Stack

### Core 3D Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `three` | ^0.170.0 | 3D engine (WebGL/WebGPU renderer, scene graph, materials, lights) | Industry standard, 2.7M weekly npm downloads, no real competition. R3F v8 supports three >= 0.133. Pin to ~0.170 for stability -- latest 0.183 has breaking API changes (Clock deprecated, PostProcessing renamed) that may cause issues with R3F v8/drei. |
| `@react-three/fiber` | ^8.17.10 | React renderer for Three.js | Declarative Three.js in React. v8 is the React 18 compatible line. Provides Canvas component, useFrame/useThree hooks, automatic disposal. |
| `@react-three/drei` | ^9.117.0 | Helper library (controls, loaders, abstractions) | Provides PointerLockControls, useTexture, Environment, lighting helpers. Use v9.x series which is compatible with R3F v8. Do NOT use v10.x which targets R3F v9/React 19. |

### First-Person Camera and Controls

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `PointerLockControls` (from drei) | included | Mouse look (FPS-style camera rotation) | Built into drei. Uses browser Pointer Lock API for raw mouse input. Click to engage, ESC to exit. Standard FPS control pattern. |
| Custom WASD movement handler | n/a (custom code) | Keyboard-based walking movement | Drei's PointerLockControls handles mouse look only. WASD movement requires a custom `useFrame` hook that reads keyboard state and translates the camera. Well-documented pattern with multiple reference implementations. |

**Why NOT drei's `FirstPersonControls`:** FirstPersonControls is a port of Three.js's `FirstPersonControls` which uses mouse position (not pointer lock) for look direction -- feels like a flight simulator, not a museum walkthrough. PointerLockControls + WASD is the correct pattern for gallery walkthroughs.

### Collision Detection

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Three.js `Raycaster` (built-in) | included with three | Wall/boundary collision detection | For a simple rectangular room with flat walls, raycasting is sufficient and adds zero bundle weight. Cast 4-8 rays from camera position toward movement direction; if they intersect wall geometry within a threshold, block movement. |

**Why NOT `@react-three/rapier`:**
- Rapier adds ~2-3 MB (WASM binary + JS wrapper) to bundle size
- Physics simulation (gravity, rigid bodies, forces) is overkill for "don't walk through walls"
- The gallery is a single rectangular room with no moving objects, no gravity simulation needed
- Raycasting collision is ~50 lines of code and handles this scenario perfectly
- If future phases add multiple rooms, stairs, or interactive objects, reconsider Rapier then

### Texture Loading and Optimization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `useTexture` (from drei) | included | Load tapestry images as Three.js textures | Handles async loading, caching, and disposal. Works with standard image formats (JPEG, PNG, WebP). Integrates with React Suspense for loading states. |
| Standard JPEG/WebP via R2 | n/a | Texture source format | The tapestry images are already hosted on Cloudflare R2. For 13 tapestries on walls, standard web formats are fine. Max texture size should be 2048x2048 or 4096x4096 for detail. |

**Why NOT KTX2/Basis compressed textures:**
- KTX2 requires a WASM transcoder (~200KB) plus build-time compression tooling
- 13 tapestry textures at 2048px is ~13-26 MB total -- manageable with progressive loading
- JPEG/WebP textures are already optimized for web delivery from R2
- KTX2 shines with 50+ textures or massive scenes; this is a single room with 13 images
- Adds significant build complexity for marginal gain in this use case

### Lighting and Environment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Three.js lights (built-in) | included | Museum gallery lighting | Use `AmbientLight` for base fill + `SpotLight` per tapestry for directional gallery lighting. SpotLight supports penumbra for soft edges, matching real museum track lighting. |
| `MeshStandardMaterial` (built-in) | included | Physically-based wall/floor materials | Responds correctly to lighting. Use for white walls (low roughness) and wood floor (texture + roughness map). |

**Why NOT HDRI environment maps:**
- Museum interiors are controlled lighting environments, not outdoor scenes
- An HDRI would add 2-10 MB download for minimal visual benefit
- SpotLights pointing at artwork + ambient fill is how real museums light galleries
- Simpler to tune and more authentic to the gallery aesthetic

### Supporting Libraries

| Library | Version | Purpose | When Needed |
|---------|---------|---------|-------------|
| `@types/three` | ^0.170.0 | TypeScript types for Three.js | Always -- project uses TypeScript throughout |
| `leva` | ^0.9.35 | Debug GUI for tuning lights, camera, materials | Development only. Sliders for light intensity, position, material roughness. Remove or tree-shake in production. Optional but highly recommended for tuning the gallery aesthetic. |

## What NOT to Add

| Library | Why Not |
|---------|---------|
| `@react-three/rapier` | Overkill for rectangular room collision. Adds ~2-3 MB WASM. Use raycasting instead. |
| `@react-three/postprocessing` | Bloom, SSAO, etc. are unnecessary for clean museum aesthetic. Adds bundle weight and GPU cost. Can always add later if needed. |
| `react-three-next` (starter template) | Already have a Next.js project. This is a starter template, not a library. |
| `cannon-es` / `@react-three/cannon` | Legacy physics option. Same problem as rapier -- overkill for this use case. |
| `@react-three/xr` | VR/AR support. Out of scope -- desktop only with mobile fallback. |
| `@react-three/fiber` v9 | Requires React 19. Incompatible with current project. |
| `@react-three/drei` v10 | Targets R3F v9 / React 19. Use v9.x line instead. |

## Next.js Integration Requirements

### next.config.mjs Changes

```javascript
// Add to existing next.config.mjs
const nextConfig = {
  // ... existing config ...

  // Required: transpile Three.js ecosystem packages for Next.js compatibility
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
}
```

### Dynamic Import Strategy (Critical for Bundle Size)

Three.js + R3F + drei adds ~700KB-1MB gzipped to the JavaScript bundle. This MUST be dynamically imported to avoid penalizing non-gallery pages.

```typescript
// app/gallery/page.tsx (server component wrapper)
import dynamic from 'next/dynamic';

const GalleryScene = dynamic(
  () => import('@/components/features/gallery/GalleryScene'),
  {
    ssr: false,  // 3D canvas cannot server-render
    loading: () => <GalleryLoadingState />,
  }
);
```

**Key points:**
- `ssr: false` is mandatory -- Three.js requires browser APIs (WebGL context, DOM)
- The gallery route (`/gallery` or similar) is the only page that loads 3D dependencies
- All other site pages remain unaffected by the 3D bundle
- Use React Suspense boundaries inside the gallery component for texture loading

### Turbopack Compatibility

Next.js 16 uses Turbopack by default. Three.js ecosystem is well-supported by Turbopack. If build issues arise, add to `next.config.mjs`:

```javascript
turbopack: {
  resolveAlias: {
    // Only if needed for specific three.js addons
  }
}
```

## Bundle Size Impact Assessment

| Package | Parsed Size | Gzipped | Notes |
|---------|-------------|---------|-------|
| `three` | ~658 KB | ~155 KB | Core engine, unavoidable |
| `@react-three/fiber` | ~120 KB | ~35 KB | React renderer |
| `@react-three/drei` | ~200 KB (tree-shaken) | ~60 KB | Only imports used components are bundled |
| `@types/three` | 0 KB (runtime) | 0 KB | Types only, stripped at build |
| **Total new JS** | **~980 KB** | **~250 KB** | **Only loaded on gallery page** |

This is significant but acceptable because:
1. Dynamic import isolates cost to the gallery route only
2. Existing site pages see zero impact
3. Gallery is a destination page (users navigate to it intentionally, expect loading)
4. A loading screen during 3D asset initialization is expected UX

## Texture Budget

| Asset | Count | Size Each | Total | Loading Strategy |
|-------|-------|-----------|-------|-----------------|
| Tapestry images | 13 | 200-500 KB (JPEG/WebP at 2048px) | 2.6-6.5 MB | Progressive via useTexture + Suspense |
| Wood floor texture | 1 | ~200 KB | 200 KB | Load with scene |
| Wall texture (white) | 0 | n/a | 0 | Use plain MeshStandardMaterial color |
| **Total textures** | **14** | | **~3-7 MB** | **Progressive loading from R2** |

Images load from existing Cloudflare R2 infrastructure. No new hosting needed.

## Installation

```bash
# Core 3D dependencies (React 18 compatible versions)
npm install three@^0.170.0 @react-three/fiber@^8.17.10 @react-three/drei@^9.117.0

# TypeScript types
npm install -D @types/three@^0.170.0

# Optional: development-only debug GUI
npm install -D leva@^0.9.35
```

## Confidence Assessment

| Decision | Confidence | Rationale |
|----------|------------|-----------|
| R3F v8 + React 18 pairing | HIGH | Official documentation explicitly states v8=React18, v9=React19 |
| drei v9.x (not v10.x) for React 18 | MEDIUM | Version pairing documented but exact cutoff version needs verification at install time |
| Three.js ~0.170 | MEDIUM | Known to work with R3F v8; latest 0.183 has API changes that may not be tested with R3F v8 |
| Raycasting over Rapier | HIGH | Standard pattern for simple room collision; well-documented in Three.js community |
| PointerLockControls + WASD | HIGH | De facto standard for first-person walkthroughs; multiple working examples exist |
| JPEG/WebP over KTX2 | HIGH | 13 textures is well within standard format capability; KTX2 tooling overhead not justified |
| Dynamic import with ssr:false | HIGH | Official R3F + Next.js integration pattern; documented and widely used |
| SpotLights for gallery lighting | HIGH | Matches real museum lighting; Three.js SpotLight has penumbra for soft edges |

## Sources

- [React Three Fiber Installation Docs](https://r3f.docs.pmnd.rs/getting-started/installation)
- [React Three Fiber npm](https://www.npmjs.com/package/@react-three/fiber)
- [Drei Controls Documentation](https://drei.docs.pmnd.rs/controls/introduction)
- [React Three Rapier GitHub](https://github.com/pmndrs/react-three-rapier)
- [Three.js npm](https://www.npmjs.com/package/three)
- [Three.js 2026 Changes](https://www.utsubo.com/blog/threejs-2026-what-changed)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [R3F + Next.js Starter](https://github.com/pmndrs/react-three-next)
- [R3F Bundle Size Discussion](https://github.com/pmndrs/react-three-fiber/discussions/812)
- [First Person Walking Controls Gist](https://gist.github.com/ChrisCrossCrash/cab92b6e4690412732d87665840d541f)
- [PointerLockControls Tutorial](https://sbcode.net/react-three-fiber/pointerlock-controls/)
- [First Person Movement in R3F Tutorial](https://dev.to/jgcarrillo/create-a-first-person-movement-in-react-three-fiber-part-1-f0c)
- [Virtual Art Gallery (Three.js)](https://github.com/rahel-yab/Virtual-art-gallery)
- [Three.js SpotLight Docs](https://threejs.org/docs/pages/SpotLight.html)
- [KTX2Loader Docs](https://threejs.org/docs/pages/KTX2Loader.html)
