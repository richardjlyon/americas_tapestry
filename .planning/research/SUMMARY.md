# Research Summary: Technical Debt Cleanup

**Project:** America's Tapestry
**Analyzed:** 2026-01-17
**Research Type:** Codebase refactoring analysis

## Executive Summary

Deep analysis of the America's Tapestry codebase reveals **151 distinct issues** across four dimensions: type safety (35), code duplication (15+), dead code (38), and code quality (78). The codebase has accumulated significant technical debt through incremental development, with the fragile image handling system being the most impactful pain point.

**Estimated cleanup effort:** 20-30 hours of focused refactoring work.

## Key Findings by Dimension

### Type Safety (35 issues)
- **22 `any` annotations** in production code
- **19 `as any` type assertions** bypassing TypeScript
- **0 `@ts-ignore`** comments (good discipline)
- **Main problem areas:** External APIs (Navigator, web-vitals, Mapbox GeoJSON), dynamic frontmatter

### Code Duplication (15+ patterns)
- **2 exact duplicate files:** `use-toast.ts` and `use-mobile.tsx` exist in both `/hooks/` and `/components/ui/`
- **5 content loaders** follow nearly identical patterns (~500 lines duplicated)
- **9 identical layout files** (intentional per Next.js conventions)
- **Form response display pattern** repeated in 3 components

### Dead Code (38 instances, ~500 lines)
- **Empty useEffect** in hero-carousel.tsx with "Debugging code removed" comment
- **6 unused exports** in image-utils.ts and cloudflare-loader.ts
- **Large commented-out features:** InteractiveTimeline, ColonialDataExplorer, SupportMerchandise, SupportVolunteer
- **Debug file:** `/debug-carousel.js` in project root

### Code Quality (78 issues)
- **7 files exceed 300 lines** (largest: sidebar.tsx at 771 lines)
- **57 console statements** across 17 files
- **26 synchronous fs operations** blocking event loop
- **6 dangerouslySetInnerHTML** without explicit sanitization
- **No error.tsx or not-found.tsx** - runtime errors crash the app

## Highest Priority Items

### Security (Do First)
1. **Add DOMPurify sanitization** to 6 dangerouslySetInnerHTML usages
2. **Add error boundaries** (error.tsx, not-found.tsx) - prevents full app crashes

### Reliability (Do Second)
3. **Remove duplicate hooks** - prevents import confusion and divergence
4. **Fix silent error handling** in 6 content loaders
5. **Remove dead code** - empty useEffect, unused exports, debug files

### Maintainability (Do Third)
6. **Split large components:** member-card.tsx (497 lines), colonial-data-explorer.tsx (453 lines)
7. **Consolidate content loading patterns** - reduce 500 lines to ~100
8. **Replace console.* with structured logging**

### Type Safety (Do Fourth)
9. **Create type definitions** for NetworkInformation, web-vitals Metric, GeoJSON features
10. **Fix easy `any` usages** in colonial-data-explorer, optimized-image, responsive-picture
11. **Define frontmatter interfaces** per content type

## Fragile Image System Analysis

The image handling system spans multiple files and has accumulated complexity:

| File | Lines | Concern |
|------|-------|---------|
| `image-utils.ts` | 438 | Path conversion, responsive images, placeholders |
| `cloudflare-loader.ts` | ~100 | R2 integration, manifest lookups |
| `optimized-image.tsx` | ~200 | Component with fallback chain |
| `responsive-picture.tsx` | ~100 | Picture element wrapper |
| `tapestries.ts` | 421 | Image finding for tapestries |
| `team/member-card.tsx` | 497 | Custom image handling per variant |

**Root cause of fragility:**
- Multiple overlapping conventions (relative paths, /images/, /content/)
- Group-specific special cases hardcoded in member-card.tsx
- Silent failures when images not found
- No central source of truth for image path resolution

**Recommended approach:** Consolidate image logic into single tested module with explicit path resolution rules.

## Estimated Effort by Phase

| Phase | Focus | Estimated Hours |
|-------|-------|-----------------|
| 1 | Security & Error Handling | 4-6 hours |
| 2 | Dead Code & Duplicates | 3-4 hours |
| 3 | Content Loader Consolidation | 4-6 hours |
| 4 | Image System Cleanup | 4-6 hours |
| 5 | Type Safety | 3-4 hours |
| 6 | Large Component Splits | 4-6 hours |
| **Total** | | **22-32 hours** |

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `TYPE-SAFETY.md` | 320 | Complete `any` inventory with fixes |
| `DUPLICATION.md` | 280 | Duplicate code analysis |
| `DEAD-CODE.md` | 180 | Unused code inventory |
| `CODE-QUALITY.md` | 450 | Quality issues and priorities |

## Test Strategy Recommendation

Given the user's emphasis on red/green/refactor:

1. **Before each refactor:** Write visual regression tests for affected areas
2. **Image system:** Add Playwright tests that verify image rendering
3. **Content loaders:** Add unit tests that verify data transformation
4. **Components:** Add component tests that verify rendering without crashes

The current test coverage is <20%. The refactoring project should increase this significantly.

## Success Criteria

When complete, the codebase should have:
- [ ] Zero `any` in production code (except test mocks)
- [ ] No duplicate files
- [ ] No commented-out features (removed or enabled)
- [ ] Error boundaries on all routes
- [ ] Sanitized HTML rendering
- [ ] Structured logging replacing console.*
- [ ] No file over 400 lines
- [ ] Single source of truth for image paths
- [ ] Test coverage for critical paths (content loading, image resolution)
