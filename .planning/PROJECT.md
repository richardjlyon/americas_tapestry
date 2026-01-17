# America's Tapestry — Technical Debt Cleanup

## What This Is

A comprehensive codebase cleanup and hardening project for the America's Tapestry website. The site has grown incrementally over time and accumulated significant technical debt. This project addresses that debt systematically to create a maintainable, trustworthy codebase where changes can be made with confidence.

## Core Value

**Confidence to change code without fear of breaking things.**

Every refactor must maintain visual and functional continuity. If a change breaks something, tests catch it before deployment.

## Requirements

### Validated

Existing site functionality (must be preserved through all refactors):

- ✓ Tapestry content pages with images, timelines, maps — existing
- ✓ Team pages with member cards and group organization — existing
- ✓ Blog/news section with categories and featured posts — existing
- ✓ Interactive colonial map with GeoJSON data — existing
- ✓ Contact form with email delivery via Resend — existing
- ✓ Newsletter signup with MailerLite integration — existing
- ✓ Hero carousel on homepage — existing
- ✓ Responsive design across devices — existing
- ✓ Image optimization via Cloudflare R2 — existing
- ✓ Static site generation with Next.js App Router — existing

### Active

Technical debt cleanup goals:

- [ ] Extend CONCERNS.md with deep codebase analysis
- [ ] Eliminate all TypeScript `any` usage with proper types
- [ ] Remove duplicate code (hooks, content loaders, utilities)
- [ ] Remove dead code (empty useEffects, unused exports)
- [ ] Simplify large files (break down 400+ line components)
- [ ] Consolidate image handling into single, tested system
- [ ] Add proper error handling (no silent error swallowing)
- [ ] Implement structured logging (replace console.* calls)
- [ ] Add rate limiting to server actions
- [ ] Sanitize markdown HTML output
- [ ] Add comprehensive test coverage for critical paths
- [ ] Document fragile areas and conventions

### Out of Scope

- New features — cleanup only, no feature additions
- Database migration — keep file-based content system
- CMS integration — not addressing content management workflow
- Performance optimization beyond debt cleanup — focus is maintainability
- UI/UX changes — visual appearance stays the same

## Context

**Current State:**
The codebase has accumulated debt through incremental development. Key pain points identified in `.planning/codebase/CONCERNS.md`:

- **Image handling is fragile** — multiple path conventions, group-specific logic, recent refactor caused rotation issues
- **Type safety gaps** — `any` usage bypasses TypeScript benefits
- **Duplicate code** — same hooks in multiple locations, similar content loading patterns repeated
- **Large files** — several components exceed 400 lines with multiple responsibilities
- **Silent failures** — errors caught and logged but return empty arrays, hiding problems
- **No tests for critical paths** — content loading, image resolution untested
- **Security gaps** — no rate limiting, unverified HTML sanitization

**Test Coverage:**
Currently <20% of source files have direct tests. E2E tests exist but unit/integration coverage is minimal. The red/green/refactor approach will build coverage as we go.

**Fragile Areas (highest risk):**
1. `src/lib/image-utils.ts` — 438 lines, complex path resolution
2. `src/components/features/team/member-card.tsx` — 497 lines, variant logic
3. `src/lib/content-core.ts` — duplicate functionality, hardcoded assumptions
4. `src/components/ui/sidebar.tsx` — 771 lines

## Constraints

- **Testing discipline**: Red/green/refactor — write tests that capture current behavior before any refactor
- **Visual continuity**: All refactors must pass visual regression tests
- **No feature changes**: Refactors must not alter user-visible behavior
- **Incremental commits**: Each refactor is a discrete, revertible commit
- **Aggressive approach**: Fix problems properly even if it means bigger changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Red/green/refactor discipline | Prevents breakages like the image rotation issue | — Pending |
| Aggressive refactoring | Half-measures leave debt; do it right | — Pending |
| Extend CONCERNS.md first | Need complete picture before prioritizing | — Pending |
| Visual regression testing | Site is image-heavy; visual continuity matters | — Pending |

---
*Last updated: 2026-01-17 after initialization*
