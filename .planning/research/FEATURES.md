# Feature Landscape: 3D Virtual Gallery

**Domain:** First-person 3D virtual museum gallery (web-based)
**Project:** America's Tapestry -- Gallery 7 walkthrough
**Researched:** 2026-03-06

## Table Stakes

Features users expect from a virtual gallery. Missing any of these makes the experience feel broken or incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| First-person camera movement (WASD + arrow keys) | Standard FPS-style navigation; every virtual walkthrough uses this | Medium | Three.js PointerLockControls or equivalent | Must include collision detection so user cannot walk through walls |
| Mouse-look (pointer lock) | Users expect to look around by moving the mouse after clicking into the scene | Low | PointerLockControls built-in to Three.js | Requires click-to-engage since browsers require user gesture for pointer lock |
| Room geometry matching real dimensions | A gallery that feels spatially wrong destroys immersion | Medium | Floor plan measurements (already documented: ~26'x23') | Proportions matter more than absolute scale |
| Tapestries rendered on walls as framed images | The entire point of the gallery; must look like real artwork on walls | Medium | Existing tapestry images from R2 (640w-2560w available) | Use 1024w or 1920w as textures; frame geometry around each |
| Click-to-inspect tapestry detail overlay | Users expect to interact with artwork; Google Arts & Culture and Matterport both use tap/click to reveal info cards | Medium | Existing tapestry content (title, colony, summary) | Raycasting for click detection; overlay dims background per Google Arts & Culture pattern |
| Gallery lighting | Museum feel requires directional/spot lighting, not flat ambient | Medium | None | Combination of ambient + spotlights aimed at tapestries; subtle shadows |
| Floor and wall materials | Bare untextured geometry looks like a prototype, not a gallery | Low | None | White/cream walls, wood-tone floor; simple materials, no complex textures needed |
| Loading screen with progress indicator | 3D scenes take seconds to load; users need visual feedback that something is happening | Low | None | Show loading percentage or progress bar; microcopy like "Entering the gallery..." reduces perceived wait |
| Entry point / initial camera position | User needs a clear starting position facing into the gallery | Low | None | Place camera at entrance facing inward; user immediately sees the room |
| Instructions overlay on first visit | Users need to know WASD/mouse controls exist; not everyone knows FPS conventions | Low | None | Brief overlay: "Use WASD to move, mouse to look around, click artwork to learn more" -- dismissable |
| Exit / close button | Users must be able to leave the 3D experience and return to the main site | Low | Next.js routing | Persistent UI element (top corner) that exits back to main site or gallery index |
| Mobile fallback view | Mobile devices cannot run pointer-lock FPS controls well; users on mobile need an alternative | Medium | Existing tapestry images and content | Image gallery grid or horizontal scroll showing all 13 tapestries with tap-to-detail; NOT a degraded 3D experience |

## Differentiators

Features that would make this gallery stand out from typical virtual tours. Not expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Tapestry detail zoom (high-res viewer) | Let users zoom into needlework detail -- the craft is the art; seeing stitch-level detail is compelling | Medium | 2560w images from R2 | On detail overlay, allow pinch/scroll zoom into high-res version; similar to Google Arts & Culture "microscope view" |
| Smooth camera transitions | Instead of instant teleport, lerp the camera when user clicks a tapestry (move closer to it) | Low | None | GSAP or manual lerp; feels polished vs abrupt |
| Ambient environment details | Bench in center of room, baseboards, crown molding, subtle ceiling detail | Medium | None | Adds realism but each element is modeling work; diminishing returns past basics |
| Mini-map or room overview | Small inset showing user's position in the room and which tapestries are nearby | Medium | None | Helpful for orientation; shows which tapestries user hasn't visited |
| Tapestry glow/highlight on proximity | Subtle highlight effect when user walks near a tapestry they haven't clicked yet | Low | None | Visual affordance that tapestries are interactive; encourages exploration |
| Keyboard shortcut for next/previous tapestry | Tab or number keys to cycle between tapestries in the detail overlay | Low | None | Power user feature; lets someone quickly browse all 13 without walking |
| Guided tour mode | Auto-walk path that visits each tapestry in colonial order with narration or text | High | All tapestry content, camera path system | Passive experience for users who want to be guided; could reuse existing tapestry narrative text |
| Ambient sound | Subtle gallery ambience (quiet footsteps, room tone) | Low | Audio files | Enhances immersion but some users find it annoying; needs mute toggle |
| Crossfade transition from 2D site to 3D gallery | When navigating to the gallery page, transition feels intentional rather than a hard page load | Medium | None | Loading screen can serve this purpose; a "doors opening" animation would be premium |

## Anti-Features

Features to deliberately NOT build for v1. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Mobile 3D controls (virtual joystick, gyroscope) | Mobile FPS controls are universally frustrating; touch joysticks are imprecise, gyroscope is disorienting | Build a quality 2D mobile fallback gallery instead; better UX than a bad 3D experience |
| VR headset support (WebXR) | Massive complexity increase for a tiny audience; requires different interaction model, testing on hardware | Keep as browser-only; revisit only if there is demonstrated demand |
| Multiplayer / avatars | Social features add enormous complexity (networking, state sync, moderation) with minimal value for an art gallery | Single-user contemplative experience is the right tone for this content |
| Photorealistic rendering (PBR materials, ray tracing) | Dramatically increases load time and GPU requirements; diminishing returns for a clean gallery aesthetic | Simple, clean materials with good lighting; museum aesthetic is minimalist by nature |
| Complex room geometry (multiple rooms, hallways, doors) | Scope explosion; each room needs layout, tapestry placement, collision geometry, testing | Gallery 7 only; single room, well-executed |
| Audio guide / narration in 3D | Requires recording or TTS for 13 tapestries, audio sync with position, playback controls | If audio is desired later, add it to the detail overlay as a play button, not a spatial audio system |
| Tapestry animations (fabric waving, shimmer effects) | Distracting from the art itself; adds GPU cost; needlework is meant to be still and studied | Static display in frames is authentic to how tapestries are actually exhibited |
| Physics engine | Gravity, object collision beyond walls -- completely unnecessary for a gallery walkthrough | Simple bounding-box wall collision is sufficient; no need for a physics library |
| User-generated content (comments, ratings on tapestries) | Moderation burden, database requirements, off-topic for a curated museum experience | Link to existing contact form if users want to engage |
| Customizable gallery (rearrange tapestries, change wall colors) | Engineering complexity with no clear user value; the curation IS the experience | Fixed, intentional layout matching real gallery plans |
| Procedural generation | Generating room layouts or placing art algorithmically | Hand-place every tapestry for curatorial control; this is 13 fixed pieces in a known room |

## Feature Dependencies

```
Loading Screen
  --> Room Geometry (must load before scene renders)
  --> Tapestry Textures (loaded as room assets)

Room Geometry
  --> Wall Collision Detection (walls must exist before collision works)
  --> Tapestry Placement (walls must exist to mount tapestries on)

First-Person Controls
  --> Pointer Lock (browser API, triggered by click)
  --> Wall Collision (prevents walking through walls)
  --> Raycasting for Click (detects which tapestry was clicked)

Tapestry Click Detection (raycasting)
  --> Detail Overlay (what appears when tapestry is clicked)
  --> Existing Tapestry Content (title, colony, summary from content files)

Detail Overlay
  --> Exit/Close Button (overlay needs dismiss mechanism)
  --> Optional: High-res Zoom (enhancement within overlay)

Mobile Detection
  --> Mobile Fallback View (shown instead of 3D scene)
  --> Existing Tapestry Images (reused for fallback gallery)

Instructions Overlay
  --> Shown before pointer lock engages
  --> Dismissed on first click (which also engages pointer lock)
```

## MVP Recommendation

For MVP (v2.0), prioritize all table stakes features. They form a complete, if minimal, experience.

**Phase 1 -- Core 3D Scene (build first):**
1. Room geometry from floor plan dimensions
2. Floor and wall materials
3. Gallery lighting (ambient + spots)
4. Loading screen with progress

**Phase 2 -- Navigation (build second, depends on Phase 1):**
5. First-person camera (WASD + mouse look)
6. Wall collision detection
7. Entry point camera position
8. Instructions overlay
9. Exit button

**Phase 3 -- Tapestry Display (build third, depends on Phase 1):**
10. Tapestry textures on walls with frames
11. Click-to-inspect raycasting
12. Detail overlay with tapestry content

**Phase 4 -- Mobile & Polish (build last):**
13. Mobile detection + fallback gallery view
14. Performance optimization (texture compression, lazy loading)
15. Smooth camera transitions (differentiator, low effort)
16. Tapestry proximity highlight (differentiator, low effort)

**Defer to post-v2.0:**
- Guided tour mode (High complexity)
- Mini-map (Medium complexity, nice-to-have)
- Ambient sound (Low complexity but needs content)
- High-res zoom in detail overlay (Medium complexity, good v2.1 feature)

## Sources

- [Google Arts & Culture Pocket Gallery](https://artsandculture.google.com/project/pocket-gallery) -- Interaction patterns for artwork info cards, zoom, gallery navigation
- [Google Pocket Gallery Editor announcement](https://blog.google/outreach-initiatives/arts-culture/taking-curation-to-the-next-level-with-pocket-gallery-editor/) -- Customization features for virtual gallery spaces
- [Design Critique: Google Arts & Culture](https://ixd.prattsi.org/2025/02/design-critique-google-arts-culture-website/) -- UX analysis of overlay patterns, background dimming, magnifier
- [Three.js PointerLockControls example](https://threejs.org/examples/misc_controls_pointerlock.html) -- Reference implementation for FPS controls
- [Three.js forum: Gallery showcase](https://discourse.threejs.org/t/the-gallery-an-interactive-3d-art-gallery/21214) -- Community example of interactive 3D art gallery
- [Three.js forum: Showroom navigation with walkpoints](https://discourse.threejs.org/t/which-controls-to-use-for-virtual-showroom-navigation-with-walkpoints/21080) -- Discussion of control schemes for virtual spaces
- [Matterport 3D Tours](https://matterport.com/blog/best-virtual-tour-software-for-real-estate) -- Hotspot/Mattertag interaction patterns
- [CAPTUR3D Matterport overlays](https://captur3d.io/features/creator-studio/overlays/) -- Information overlay implementation
- [3DVista Accessibility for Virtual Tours](https://www.3dvista.com/en/blog/3dvista-improved-accessibility-for-virtual-tours/) -- Keyboard navigation and screen reader support for virtual tours
- [Kano analysis of VR museum user needs](https://link.springer.com/chapter/10.1007/978-3-032-12808-9_13) -- Research on must-have vs attractive features in virtual museums
- [Virtual Walkthrough Museum guide](https://www.wonderfulmuseums.com/museum/virtual-walkthrough-museum/) -- Comprehensive overview of virtual museum technology landscape
- [Optimizing 3D Models for Web](https://www.uni.agency/post/3d-web-optimization) -- glTF, LOD, progressive loading best practices
- [WebGL Performance Optimization](https://blog.pixelfreestudio.com/how-to-optimize-webgl-for-high-performance-3d-graphics/) -- Draw calls, texture compression, frustum culling
- [Loading Screen UX](https://userpilot.com/blog/loading-screen/) -- Progress indicators reduce perceived wait time
