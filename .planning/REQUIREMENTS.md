# Requirements: Technical Debt Cleanup

**Derived from:** Research analysis (2026-01-17)

## Functional Requirements

### FR-1: Preserve All Existing Functionality
All current site features must continue to work identically after refactoring:
- Tapestry pages with images, timelines, maps
- Team pages with member cards and group organization
- Blog/news section with categories
- Interactive colonial map
- Contact form and newsletter signup
- Hero carousel
- Responsive design
- Image optimization via Cloudflare R2

**Validation:** Visual regression tests, E2E tests

### FR-2: Error Visibility
Errors must be surfaced to developers, not swallowed silently:
- Content loading failures must log with context
- Image loading failures must show fallback state
- API failures must return meaningful error messages

**Validation:** Unit tests for error paths

## Non-Functional Requirements

### NFR-1: Type Safety
Zero `any` usage in production code:
- All 22 explicit `any` annotations replaced with proper types
- All 19 `as any` assertions replaced with type guards or proper types
- External APIs (Navigator, web-vitals, Mapbox) have proper type definitions

**Validation:** `tsc --noEmit` with strict mode, no `any` in grep results

### NFR-2: No Duplicate Code
Single source of truth for all utilities:
- Remove duplicate hook files (use-toast.ts, use-mobile.tsx)
- Consolidate 5 content loader patterns into reusable functions
- No identical code blocks across components

**Validation:** No duplicate files, similarity analysis tools

### NFR-3: No Dead Code
All code must be reachable and necessary:
- Remove empty useEffect hooks
- Remove unused exports
- Remove or enable commented-out features
- Remove debug files from production

**Validation:** Static analysis, no commented feature blocks

### NFR-4: Security Hardening
Protect against common vulnerabilities:
- Sanitize all HTML rendered via dangerouslySetInnerHTML (6 locations)
- Add error boundaries to prevent full app crashes
- Implement rate limiting on server actions

**Validation:** Security audit, error boundary coverage

### NFR-5: Maintainable File Sizes
No file exceeds 400 lines:
- sidebar.tsx (771 lines) must be split
- member-card.tsx (497 lines) must be split
- colonial-data-explorer.tsx (453 lines) must be split
- image-utils.ts (438 lines) must be split

**Validation:** Line count analysis

### NFR-6: Production Logging
Replace console.* with structured logging:
- Remove or replace 57 console statements
- Implement log levels (error, warn, info, debug)
- Conditionally disable verbose logging in production

**Validation:** No console.* in grep results (except intentional)

### NFR-7: Async File Operations
No synchronous filesystem operations:
- Replace 26 sync fs operations with async equivalents
- Use fs.promises API

**Validation:** No readdirSync/readFileSync in grep results

## Constraints

### C-1: Red/Green/Refactor Discipline
Every refactor must:
1. Have tests that capture current behavior (RED would fail if behavior changed)
2. Make the change
3. Verify tests still pass (GREEN)

### C-2: Visual Continuity
No visual changes to the site:
- Playwright visual regression tests for key pages
- Screenshot comparison before/after each refactor phase

### C-3: Incremental Commits
Each refactor is a discrete, revertible commit:
- One logical change per commit
- Clear commit messages explaining the refactor

### C-4: No Feature Changes
Refactors must not alter user-visible behavior:
- No new features
- No UI/UX changes
- No functionality additions

## Priority Matrix

| Requirement | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| NFR-4 Security | High | Low | 1 - Critical |
| FR-2 Error Visibility | High | Low | 2 - High |
| NFR-2 Duplicates | Medium | Low | 3 - High |
| NFR-3 Dead Code | Low | Low | 4 - Medium |
| NFR-6 Logging | Medium | Medium | 5 - Medium |
| NFR-1 Type Safety | Medium | Medium | 6 - Medium |
| NFR-5 File Sizes | Medium | High | 7 - Low |
| NFR-7 Async FS | Low | High | 8 - Low |

---
*Requirements derived from research: 2026-01-17*
