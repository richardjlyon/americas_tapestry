# Requirements: Virtual Gallery v2.0

**Defined:** 2026-03-06
**Core Value:** Bring the tapestries to life through an immersive 3D gallery experience

## v1 Requirements

### 3D Scene

- [ ] **SCENE-01**: Gallery room rendered with correct Gallery 7 floor plan dimensions (~26'x23')
- [ ] **SCENE-02**: White/cream walls and wood-tone floor materials applied
- [ ] **SCENE-03**: Museum-quality lighting (ambient + spotlights on tapestries)
- [ ] **SCENE-04**: Camera starts at gallery entrance facing inward

### Navigation

- [ ] **NAV-01**: User can move with WASD and arrow keys
- [ ] **NAV-02**: User can look around with mouse (pointer lock on click)
- [ ] **NAV-03**: User cannot walk through walls (collision detection)
- [ ] **NAV-04**: Instructions overlay shown on first visit ("WASD to move, mouse to look, click artwork")
- [ ] **NAV-05**: Exit button returns user to main site

### Tapestry Display

- [ ] **TAP-01**: All 13 colony tapestries displayed as framed images on gallery walls
- [ ] **TAP-02**: Tapestry textures loaded from existing 1024w images
- [ ] **TAP-03**: User can click a tapestry to open detail overlay
- [ ] **TAP-04**: Detail overlay shows tapestry title, colony, and description

### Loading & Performance

- [ ] **PERF-01**: Loading screen with progress indicator while 3D scene initializes
- [ ] **PERF-02**: 3D bundle code-split and dynamically imported (no impact on other pages)
- [ ] **PERF-03**: Gallery route isolated behind `ssr: false` dynamic import

### Mobile Fallback

- [ ] **MOB-01**: Mobile devices shown a 2D gallery grid instead of 3D scene
- [ ] **MOB-02**: Mobile gallery displays all 13 tapestries with tap-to-detail

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Polish & Differentiators

- **DIFF-01**: Smooth camera transitions (lerp toward tapestry on click)
- **DIFF-02**: Proximity highlight glow on unvisited tapestries
- **DIFF-03**: High-res zoom in detail overlay (2560w pinch/scroll zoom)
- **DIFF-04**: Mini-map showing user position and tapestry locations
- **DIFF-05**: Guided tour mode (auto-walk path visiting each tapestry in colonial order)
- **DIFF-06**: Ambient gallery sound with mute toggle

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile 3D controls (virtual joystick, gyroscope) | Universally frustrating UX; 2D fallback is better |
| VR headset support (WebXR) | Massive complexity for tiny audience |
| Multiplayer / avatars | Social features add enormous complexity with minimal gallery value |
| Photorealistic rendering (PBR, ray tracing) | Overkill for clean museum aesthetic; increases load time |
| Multiple rooms / hallways | Scope explosion; Gallery 7 only for v2.0 |
| Audio guide / spatial narration | Requires recording/TTS for 13 tapestries; defer to overlay play button later |
| Tapestry animations (fabric waving) | Distracting; needlework is meant to be still |
| Physics engine | Simple wall collision is sufficient for rectangular room |
| User-generated content | Moderation burden; off-topic for curated museum |
| Customizable gallery layout | Fixed curatorial layout matches real gallery |
| Procedural room generation | 13 fixed pieces in a known room; hand-place everything |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCENE-01 | TBD | Pending |
| SCENE-02 | TBD | Pending |
| SCENE-03 | TBD | Pending |
| SCENE-04 | TBD | Pending |
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| NAV-03 | TBD | Pending |
| NAV-04 | TBD | Pending |
| NAV-05 | TBD | Pending |
| TAP-01 | TBD | Pending |
| TAP-02 | TBD | Pending |
| TAP-03 | TBD | Pending |
| TAP-04 | TBD | Pending |
| PERF-01 | TBD | Pending |
| PERF-02 | TBD | Pending |
| PERF-03 | TBD | Pending |
| MOB-01 | TBD | Pending |
| MOB-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18

---
*Requirements defined: 2026-03-06*
