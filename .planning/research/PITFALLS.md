# Domain Pitfalls: Adding 3D Virtual Gallery to Next.js

**Domain:** 3D WebGL gallery integration into existing Next.js App Router site
**Researched:** 2026-03-06
**Confidence:** HIGH (verified across official R3F docs, Three.js forums, Next.js issues)

---

## Critical Pitfalls

Mistakes that cause rewrites, crashes, or broken production deployments.

### Pitfall 1: SSR Hydration Crash from Three.js Imports

**What goes wrong:** Any file that imports from `three` or `@react-three/fiber` will crash during server-side rendering because Three.js requires `window`, `document`, and WebGL APIs that do not exist in Node.js. With Next.js App Router, the boundary between server and client components is implicit -- a single forgotten import path can pull Three.js into the server bundle.

**Why it happens:** Next.js App Router renders components on the server by default. The `"use client"` directive marks the client boundary, but all imports within that boundary (and their transitive dependencies) must also be client-safe. Developers often create a wrapper component with `"use client"` but then import it from a Server Component layout without `next/dynamic`.

**Consequences:** Build failures, hydration mismatches, or runtime crashes (`ReferenceError: document is not defined`). Can appear to work in dev mode but fail in production builds.

**Prevention:**
1. Create a dedicated `components/gallery/` directory where ALL 3D-related code lives.
2. The gallery entry point MUST use `"use client"` directive.
3. Import the gallery component into pages using `next/dynamic` with `ssr: false`:
   ```typescript
   const Gallery3D = dynamic(() => import('@/components/gallery/Gallery3D'), {
     ssr: false,
     loading: () => <GalleryLoadingSkeleton />,
   });
   ```
4. Never import Three.js types at the module level in server components -- use `import type` for TypeScript types only.
5. Test with `next build` early and often, not just `next dev` (dev mode is more forgiving of SSR issues).

**Detection:** Run `next build` after every integration step. If it succeeds, you are safe. If you see `ReferenceError` for browser APIs, Three.js leaked into the server bundle.

**Phase:** Must be addressed in Phase 1 (initial 3D scaffold). Get the dynamic import pattern right from day one.

---

### Pitfall 2: WebGL Memory Leaks from Improper Disposal

**What goes wrong:** Navigating away from the gallery page and back causes GPU memory to climb with each visit. After several navigations, the tab becomes sluggish or crashes. With 13 high-res tapestry textures, this can consume hundreds of MB of VRAM per visit.

**Why it happens:** Three.js creates GPU-side resources (buffers, shader programs, textures) that are NOT released by JavaScript garbage collection. You must explicitly call `.dispose()` on geometries, materials, textures, and the renderer. React Three Fiber handles some cleanup on Canvas unmount (it disposes the renderer and scene tree), but textures loaded via `useLoader` or `useTexture` are cached globally and survive unmount by design.

**Consequences:** Progressive memory growth, eventual `WebGL context lost` errors, browser tab crashes. Especially severe on machines with limited VRAM.

**Prevention:**
1. Use R3F's `useTexture` hook (from `@react-three/drei`) which provides caching. Clear the cache explicitly when the gallery unmounts:
   ```typescript
   useEffect(() => {
     return () => {
       // Clear R3F's texture cache on unmount
       useLoader.clear(TextureLoader, textureUrls);
     };
   }, []);
   ```
2. Listen for the `webglcontextlost` event on the canvas and show a recovery UI rather than a blank screen.
3. Monitor GPU memory during development using Chrome DevTools > Performance > GPU memory.
4. Avoid creating new `WebGLRenderer` instances -- R3F's `<Canvas>` handles this, but if you ever drop to raw Three.js, ensure single-renderer discipline.

**Detection:** Open Chrome DevTools > Task Manager, watch GPU memory while navigating to/from the gallery page 5+ times. Memory should return to baseline each time.

**Phase:** Must be addressed in Phase 1 (scaffold) with proper cleanup patterns. Retrofitting disposal is painful.

---

### Pitfall 3: VRAM Explosion from Uncompressed High-Res Textures

**What goes wrong:** Loading 13 tapestry images at full resolution (e.g., 4096x4096) consumes enormous GPU memory. A single uncompressed 4K texture uses ~64MB of VRAM. Thirteen of them = ~832MB, which exceeds the VRAM of many integrated GPUs and will crash on mid-range laptops.

**Why it happens:** JPEG/PNG files may be small on disk (200KB-2MB), but they decompress fully in GPU memory. A 200KB PNG can occupy 20MB+ of VRAM. Developers see small file sizes and assume GPU cost is proportional -- it is not.

**Consequences:** `WebGL context lost` on machines with <1GB VRAM (common on integrated Intel GPUs). Massive initial load times. Frame rate drops to single digits during texture upload.

**Prevention:**
1. Resize textures to 2048x2048 maximum for gallery wall display. For a virtual gallery viewed from several "feet" away, 2K is indistinguishable from 4K.
2. Use KTX2 with Basis Universal compression, which stays compressed on the GPU and reduces VRAM by ~10x. Three.js has built-in `KTX2Loader`.
3. Implement progressive loading: show low-res (512px) thumbnails first, swap to full resolution as the user approaches a specific tapestry.
4. Only load textures for tapestries currently visible or nearby -- not all 13 at once.
5. Check `renderer.capabilities.maxTextureSize` at runtime and downscale accordingly.

**Detection:** Test on a machine with integrated Intel graphics (not just your development machine with a discrete GPU). Monitor `renderer.info.memory.textures` in the render loop.

**Phase:** Must be designed in Phase 1, implemented in Phase 2 (texture pipeline). The texture strategy affects the entire architecture.

---

### Pitfall 4: Bundle Size Explosion

**What goes wrong:** Adding Three.js + React Three Fiber + drei + postprocessing can add 500KB-1MB+ to the JavaScript bundle. For a content site like America's Tapestry, this destroys Core Web Vitals for ALL pages, not just the gallery.

**Why it happens:** Three.js is inherently large (~150KB gzipped for the core), and tree-shaking yields limited results because of how the library is structured. Adding `@react-three/drei` (which re-exports many Three.js addons) and `@react-three/postprocessing` compounds the problem. If these imports leak into shared bundles, every page pays the cost.

**Consequences:** Lighthouse score drops. Time to Interactive increases on non-gallery pages. Mobile users download megabytes of JavaScript they may never use.

**Prevention:**
1. The gallery MUST be code-split via `next/dynamic` with `ssr: false`. This ensures Three.js code is only downloaded when the user visits the gallery page.
2. Import from specific paths, not barrel exports:
   ```typescript
   // BAD - pulls in everything
   import { OrbitControls, useTexture, Html } from '@react-three/drei';

   // BETTER - still pulls from barrel but code-split page limits blast radius
   // drei doesn't support deep imports well, so code-splitting the page is the primary defense
   ```
3. Use `@next/bundle-analyzer` to verify Three.js code stays isolated to the gallery chunk.
4. Consider whether `@react-three/postprocessing` is truly needed -- it adds significant weight for effects that may not matter in a gallery context.

**Detection:** Run `npm run analyze` (bundle analyzer already configured in this project) before and after adding 3D dependencies. The Three.js chunk should appear ONLY in the gallery route's chunk.

**Phase:** Phase 1 (scaffold). Set up code splitting correctly from the start. Verify with bundle analyzer before proceeding.

---

## Moderate Pitfalls

Mistakes that cause poor UX, delays, or technical debt.

### Pitfall 5: First-Person Controls That Feel Wrong

**What goes wrong:** Mouse sensitivity is either too high (nauseating) or too low (sluggish). The camera clips through gallery walls. Walking speed feels unnatural. Users get "stuck" in corners. The Pointer Lock API prompt confuses users who have never seen it.

**Why it happens:** Three.js's built-in `PointerLockControls` provides raw mouse-to-rotation mapping but NO collision detection, NO movement smoothing, and NO boundary enforcement. Developers must build all of this from scratch. The difference between "functional" and "comfortable" first-person controls is substantial.

**Prevention:**
1. Do NOT use raw `PointerLockControls` for movement -- use it only for look direction. Implement movement separately with WASD/arrow keys.
2. Implement raycaster-based collision detection: cast rays in the movement direction and prevent movement if a wall is within a threshold distance (0.3-0.5 units).
3. Add movement smoothing with lerp/damping rather than instant position changes.
4. Set mouse sensitivity to a conservative default (0.002 rad/pixel is a good starting point) and consider exposing a sensitivity slider.
5. Clamp vertical look angle to prevent users from looking straight up/down (confusing in a gallery).
6. Provide a clear "Click to enter" prompt before engaging Pointer Lock, and show controls overlay (WASD + mouse) on first entry.
7. Add an "Exit" button visible at all times (ESC already exits Pointer Lock, but users may not know this).
8. Consider offering an alternative orbit/click-to-move mode for users who find first-person controls disorienting.

**Detection:** Have someone unfamiliar with FPS games test the controls. If they get stuck, feel sick, or cannot figure out how to move, the controls need work.

**Phase:** Phase 2 (controls and navigation). Expect 2-3 iterations to get controls feeling right. Budget time for playtesting.

---

### Pitfall 6: Blank Screen During 3D Initialization

**What goes wrong:** User navigates to the gallery and sees a white/blank screen for 3-10 seconds while WebGL context initializes, shaders compile, and textures load. They assume the page is broken and leave.

**Why it happens:** WebGL initialization is not instant. Shader compilation can take 1-3 seconds on some GPUs. Texture uploads block the main thread. If no loading state is shown, the user sees nothing.

**Consequences:** Users bounce. The experience feels broken. On slower machines, the blank period can exceed 10 seconds.

**Prevention:**
1. The `next/dynamic` loading prop is the first defense -- show a styled skeleton or preview image while the JS chunk loads.
2. Use R3F's `<Suspense>` with a fallback UI inside the Canvas for asset loading:
   ```typescript
   <Canvas>
     <Suspense fallback={<LoadingRoom />}>
       <GalleryScene />
     </Suspense>
   </Canvas>
   ```
3. Use Three.js `LoadingManager` to track texture load progress and display a progress bar.
4. Load essential textures (floor, walls) first, then tapestry textures progressively.
5. Show a 2D preview image of the gallery as a placeholder that fades out when 3D is ready.
6. Consider a brief "intro" animation that masks remaining asset loading.

**Detection:** Throttle network to 3G in DevTools and navigate to the gallery. If you see blank screen for >2 seconds, the loading state needs improvement.

**Phase:** Phase 1 (scaffold) for basic loading state. Phase 3 for polished loading UX with progress tracking.

---

### Pitfall 7: Canvas Sizing and Resize Glitches

**What goes wrong:** The 3D canvas does not fill its container correctly, shows black bars, or flickers/redraws visibly when the browser window resizes. Aspect ratio distortion makes tapestries look stretched.

**Why it happens:** R3F's `<Canvas>` uses a ResizeObserver on its parent container. If the parent doesn't have explicit dimensions (e.g., `height: 100%` without a sized parent chain), the canvas collapses to 0 or uses wrong dimensions. CSS layout changes (navigation bar appearing/disappearing) can trigger rapid resize events that cause flickering.

**Prevention:**
1. Wrap the Canvas in a container with explicit dimensions:
   ```typescript
   <div className="w-full h-screen relative">
     <Canvas>...</Canvas>
   </div>
   ```
2. Ensure the full parent chain has defined heights (html, body, layout containers).
3. Use `style={{ position: 'absolute', top: 0, left: 0 }}` on the Canvas wrapper if it's within a flex/grid layout that might collapse.
4. Set `dpr={[1, 2]}` on Canvas to handle high-DPI displays without over-rendering.
5. Debounce any custom resize handlers to prevent rapid recomputations.
6. Test the gallery page at various viewport sizes and during resize -- not just at your default development resolution.

**Detection:** Resize the browser window rapidly. If the canvas flickers, shows wrong aspect ratio, or leaves gaps, the sizing is wrong.

**Phase:** Phase 1 (scaffold). Get container sizing right immediately; it is painful to fix later.

---

### Pitfall 8: Accessibility Failure -- No Fallback for Non-Visual Users

**What goes wrong:** The 3D gallery is a `<canvas>` element that provides zero semantic information to screen readers. Keyboard-only users cannot navigate. Users who cannot use a mouse are locked out entirely. This is both an ethical failure and a legal risk for a publicly funded cultural project.

**Why it happens:** WebGL canvas content is invisible to the accessibility tree. Three.js has no built-in accessibility layer. Developers build the visual experience and forget that not everyone can see it.

**Consequences:** WCAG violations. Exclusion of users with disabilities from cultural content. Potential legal liability under ADA/Section 508.

**Prevention:**
1. Provide a parallel accessible experience: a 2D gallery page with the same tapestry images, descriptions, and navigation that screen readers can traverse.
2. Add ARIA attributes to the Canvas container: `role="img"`, `aria-label="Interactive 3D gallery of tapestry artworks"`.
3. Include a skip link: "Skip to 2D gallery view" before the Canvas.
4. Honor `prefers-reduced-motion` media query -- disable camera animations and auto-movement for users who have this set.
5. Consider using `@react-three/a11y` (pmndrs library) to create an accessible scene tree alongside the visual one.
6. Ensure keyboard navigation works even without Pointer Lock: arrow keys for movement, tab to cycle through tapestries.
7. Provide text descriptions for each tapestry that are accessible to screen readers (these can overlay the Canvas using HTML via R3F's `<Html>` component from drei).

**Detection:** Navigate the gallery using only a keyboard. Run a screen reader (VoiceOver on macOS). If you cannot access any tapestry content through these means, accessibility is broken.

**Phase:** Phase 1 (design the accessible alternative from the start). Phase 3 (implement and test with assistive technology). Do NOT bolt this on at the end.

---

### Pitfall 9: Serving 3D to Underpowered Mobile Devices

**What goes wrong:** Mobile users receive the full 3D gallery, which either crashes their browser, drains battery rapidly, or runs at <5 FPS with controls that are unusable on a touchscreen.

**Why it happens:** Developers test on desktop with discrete GPUs. Mobile devices have limited GPU memory, thermal throttling, and no mouse for first-person controls. Touchscreen first-person controls are notoriously difficult to implement well.

**Consequences:** Mobile users have a broken experience. WebGL context lost on low-end phones. Battery drain complaints.

**Prevention:**
1. Detect mobile/tablet via user agent AND screen size. Do NOT rely on WebGL capability detection alone -- a phone may "support" WebGL but run it terribly.
2. Serve a 2D gallery experience on mobile by default, with an optional "Try 3D" button for users who want to attempt it.
3. Implementation approach:
   ```typescript
   const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
     || window.innerWidth < 1024;

   return isMobile ? <Gallery2D /> : <Gallery3D />;
   ```
4. If you do serve 3D on tablets, reduce texture resolution to 1024px, lower pixel ratio to 1, and simplify the scene.
5. Check `navigator.hardwareConcurrency` and `navigator.deviceMemory` (where available) as additional signals for device capability.

**Detection:** Test on a mid-range Android phone (not just flagship devices). If the experience is not smooth, default to 2D on mobile.

**Phase:** Phase 1 (mobile detection and routing). The 2D fallback may already exist or be trivial to create from existing tapestry display components.

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major refactoring.

### Pitfall 10: R3F + Next.js Version Incompatibility

**What goes wrong:** Installing `@react-three/fiber` with Next.js 15+ and React 19 produces cryptic errors like `Cannot read properties of undefined (reading 'ReactCurrentOwner')`.

**Why it happens:** R3F v8 was built for React 18. R3F v9 supports React 19. If version alignment is wrong, React internals break.

**Prevention:**
1. Check the project's current React version before installing R3F.
2. Match versions: React 18 -> `@react-three/fiber@^8`, React 19 -> `@react-three/fiber@^9`.
3. Pin exact versions in package.json after confirming compatibility.
4. Test immediately after installation -- do not wait until deep into development.

**Detection:** `npm install` warnings about peer dependencies. Runtime errors mentioning React internals.

**Phase:** Phase 1, first step. Get the version matrix right before writing any code.

---

### Pitfall 11: Re-creating Objects Every Frame

**What goes wrong:** Performance drops to 30 FPS or lower despite a simple scene. GPU is not the bottleneck -- JavaScript garbage collection is.

**Why it happens:** Creating `new Vector3()`, `new Color()`, or `new Matrix4()` inside `useFrame` (the render loop) allocates objects 60 times per second, triggering frequent garbage collection pauses.

**Prevention:**
1. Hoist temporary math objects outside the render loop:
   ```typescript
   const tempVec = new Vector3(); // Created once

   useFrame(() => {
     tempVec.set(x, y, z); // Reused every frame
     mesh.current.position.copy(tempVec);
   });
   ```
2. Use `.set()` and `.copy()` instead of creating new instances.
3. Never use `setState` inside `useFrame` -- mutate refs directly.
4. Profile with Chrome DevTools Performance tab; look for sawtooth GC patterns.

**Detection:** Chrome DevTools Performance recording showing frequent minor GC events correlated with frame drops.

**Phase:** Phase 2 (implementation). Follow R3F's official pitfalls guide from the start.

---

### Pitfall 12: Pointer Lock Fails Silently on Safari/Firefox

**What goes wrong:** First-person controls work on Chrome but Pointer Lock does not engage on Safari, or exits unexpectedly on Firefox. Users on non-Chrome browsers cannot use the gallery.

**Why it happens:** Pointer Lock API has browser-specific quirks. Safari requires a user gesture (click) before allowing pointer lock. Firefox exits pointer lock on ESC and does not allow re-engagement for a brief cooldown period. Some browsers limit how quickly you can re-request pointer lock after the user exits.

**Prevention:**
1. Always request pointer lock in response to a user click event, never programmatically on page load.
2. Show a clear "Click to Enter Gallery" overlay that triggers pointer lock.
3. Handle the `pointerlockerror` event and show a meaningful error message.
4. Test on Safari, Firefox, and Chrome. Do not assume Chrome behavior is universal.
5. Provide a fallback control mode (click-and-drag orbit) if pointer lock is unavailable.

**Detection:** Test on Safari and Firefox. If controls do not engage or break after pressing ESC, pointer lock handling needs browser-specific fixes.

**Phase:** Phase 2 (controls). Test cross-browser early, not as a final QA step.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Initial scaffold (Phase 1) | SSR crash from Three.js imports (#1) | Dynamic import with `ssr: false` from day one |
| Initial scaffold (Phase 1) | Bundle size explosion (#4) | Verify code splitting with bundle analyzer immediately |
| Initial scaffold (Phase 1) | Canvas sizing (#7) | Set up container with explicit dimensions before adding scene content |
| Texture pipeline (Phase 2) | VRAM explosion (#3) | Design texture strategy before loading any images |
| Controls (Phase 2) | Bad first-person controls (#5) | Budget 2-3 iterations; get external playtesters early |
| Controls (Phase 2) | Pointer Lock cross-browser (#12) | Test Safari/Firefox alongside Chrome from the start |
| Loading UX (Phase 3) | Blank screen (#6) | Implement progressive loading with visible progress |
| Accessibility (Phase 3) | No fallback (#8) | Design the 2D alternative in Phase 1, implement in Phase 3 |
| Mobile (Phase 1) | Serving 3D to phones (#9) | Detect mobile and route to 2D immediately |
| Ongoing | Memory leaks (#2) | Monitor GPU memory after every major feature addition |
| Ongoing | Frame-rate drops (#11) | Follow R3F pitfalls guide; profile regularly |

## Sources

- [React Three Fiber Official Pitfalls Guide](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [R3F Canvas Documentation](https://r3f.docs.pmnd.rs/api/canvas)
- [R3F Installation / Version Compatibility](https://r3f.docs.pmnd.rs/getting-started/installation)
- [Next.js 15 + R3F Compatibility Issue](https://github.com/vercel/next.js/issues/71836)
- [R3F WebGLRenderer Leak on Unmount](https://github.com/pmndrs/react-three-fiber/issues/514)
- [useLoader Memory Leak with KTX2Loader](https://github.com/pmndrs/react-three-fiber/issues/2812)
- [Three.js Texture Disposal Discussion](https://discourse.threejs.org/t/about-the-memory-leak-when-dispose-the-texture/2543)
- [Three.js Scene Optimization / VRAM Calculations](https://discourse.threejs.org/t/three-scene-optimization-texture-size-calculation-in-gpu-compression-merge-meshes-what-the-limits/23972)
- [Three.js 8K Texture Support Discussion](https://discourse.threejs.org/t/are-8k-textures-supported-in-three-js/10705)
- [Three.js PointerLockControls Collision Issues](https://discourse.threejs.org/t/problem-in-preventing-pointer-lock-controls-from-moving-through-meshes-in-react-js/17120)
- [R3F Bundle Size Discussion](https://github.com/pmndrs/react-three-fiber/discussions/812)
- [react-three-a11y Accessibility Library](https://github.com/pmndrs/react-three-a11y)
- [Accessible WebGL (Anneka Goss)](https://annekagoss.medium.com/accessible-webgl-43d15f9caa21)
- [Three.js + Accessibility (Pip Lev)](https://medium.com/@piplev/three-js-accessibility-c4f45d83f2c6)
- [MDN: WebGLRenderingContext.isContextLost()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/isContextLost)
- [Next.js "use client" + R3F Issue](https://github.com/vercel/next.js/issues/53355)
- [R3F Canvas Resize Delay Issue](https://github.com/pmndrs/react-three-fiber/issues/2149)
