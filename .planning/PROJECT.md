# America's Tapestry

## What This Is

A website showcasing America's Tapestry — a series of 13 needlework tapestries depicting the history of each of the original American colonies. The site features tapestry content pages with images, timelines, and maps; team pages; a blog; an interactive colonial map; and community engagement features.

## Core Value

**Bring the tapestries to life through immersive digital experiences that let people explore the art and history from anywhere.**

## Current Milestone: v2.0 Virtual Gallery

**Goal:** Create a first-person 3D virtual gallery experience where visitors can walk through a museum-style room and view all 13 colony tapestries mounted on the walls.

**Target features:**
- First-person 3D walkthrough of Gallery 7 (based on real floor plan dimensions)
- WASD/arrow key + mouse look navigation
- Clean museum aesthetic — white walls, wood floors, gallery lighting
- All 13 tapestries displayed in frames on gallery walls
- Click tapestry for detail overlay (title, colony, description)
- Desktop-only 3D experience with mobile fallback gallery view

## Requirements

### Validated

Existing site functionality (preserved):

- Tapestry content pages with images, timelines, maps
- Team pages with member cards and group organization
- Blog/news section with categories and featured posts
- Interactive colonial map with GeoJSON data
- Contact form with email delivery via Resend
- Newsletter signup with MailerLite integration
- Hero carousel on homepage
- Responsive design across devices
- Image optimization via Cloudflare R2
- Static site generation with Next.js App Router

### Active

Virtual gallery goals:

- [ ] 3D gallery room modeled from Gallery 7 floor plan dimensions
- [ ] First-person camera with keyboard + mouse navigation
- [ ] Museum-style environment (walls, floor, lighting)
- [ ] 13 tapestries rendered as framed textures on walls
- [ ] Clickable tapestries with detail overlay
- [ ] Mobile fallback (non-3D gallery view)
- [ ] Performance optimization for WebGL rendering

### Out of Scope

- Multiplayer/social features — single-user experience only
- VR headset support — browser-based only
- Audio guide integration — visual experience only for now
- Touch/mobile 3D controls — desktop only, mobile gets fallback
- Other gallery rooms — Gallery 7 only for this milestone
- Tapestry animations — static display in frames

## Context

**Gallery 7 Dimensions (from floor plan):**
- Main room: ~26' x 23' rectangular space
- Wall segments vary (13'-2", 7'-0", 6'-0" along bottom; similar along top)
- Upper alcove area with additional wall space
- 13 tapestries need to be distributed across available wall space

**Tapestry Content:**
- 13 tapestries (one per original colony)
- Each has responsive images at 640w, 1024w, 1920w, 2560w in avif/jpg/webp
- Content includes title, summary, colony code, timeline events, and narrative text
- Some tapestries are "In Production" status

**Tech Stack:**
- Next.js App Router with static site generation
- Tailwind CSS for styling
- TypeScript throughout
- Cloudflare R2 for image hosting

## Constraints

- **3D Library**: Must work with Next.js SSR/SSG (likely Three.js + React Three Fiber)
- **Performance**: Must load and run smoothly on modern desktop browsers
- **Bundle size**: 3D library adds significant JS — needs code splitting/lazy loading
- **Image quality**: Tapestry textures must be high-res enough to look good up close
- **Accessibility**: Non-3D fallback required for mobile and assistive technology users

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Desktop-only 3D | Mobile 3D controls are poor UX; fallback gallery is better | -- Pending |
| Gallery 7 only | Scope to one room for v2.0; expand later if desired | -- Pending |
| Floor plan as source of truth | Real dimensions create authentic feel | -- Pending |

---
*Last updated: 2026-03-06 after milestone v2.0 initialization*
