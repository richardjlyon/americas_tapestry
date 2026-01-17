# Roadmap: Technical Debt Cleanup

**Version:** 1.0.0
**Created:** 2026-01-17
**Approach:** Aggressive refactoring with red/green/refactor discipline

---

## Phase 1: Testing Foundation

**Goal:** Establish visual regression and unit test infrastructure before any refactors

**Deliverables:**
- Playwright visual regression tests for all key pages
- Unit test setup for content loaders
- Baseline screenshots captured
- Test commands documented

**Success Criteria:**
- [ ] Visual tests pass on current state
- [ ] Can detect visual changes from refactors
- [ ] Content loader test stubs in place

**Estimated Effort:** 4-6 hours

---

## Phase 2: Security Hardening

**Goal:** Close security gaps identified in research

**Deliverables:**
- DOMPurify sanitization for all 6 dangerouslySetInnerHTML locations
- Error boundaries (error.tsx, not-found.tsx) for all route segments
- Rate limiting on contact and newsletter server actions

**Success Criteria:**
- [ ] All HTML rendering sanitized
- [ ] Runtime errors show error UI instead of crashing
- [ ] Server actions protected from abuse

**Estimated Effort:** 4-6 hours

---

## Phase 3: Duplicate Removal

**Goal:** Eliminate duplicate code that causes confusion and drift

**Deliverables:**
- Remove duplicate use-toast.ts (keep one location)
- Remove duplicate use-mobile.tsx (keep one location)
- Update all imports to use canonical location
- Document hook locations in conventions

**Success Criteria:**
- [ ] No duplicate hook files
- [ ] All imports point to single source
- [ ] Build passes

**Estimated Effort:** 2-3 hours

---

## Phase 4: Dead Code Cleanup

**Goal:** Remove unreachable and unused code

**Deliverables:**
- Remove empty useEffect in hero-carousel.tsx
- Remove unused exports from image-utils.ts and cloudflare-loader.ts
- Delete debug-carousel.js from project root
- Decision on commented-out features (remove or create issues to enable)

**Success Criteria:**
- [ ] No empty useEffect hooks
- [ ] No unused exports
- [ ] No debug files in production
- [ ] No large commented-out feature blocks

**Estimated Effort:** 2-3 hours

---

## Phase 5: Error Handling

**Goal:** Surface errors instead of swallowing them silently

**Deliverables:**
- Fix silent error handling in 6 content loaders
- Add error context to all catch blocks
- Implement proper error returns instead of empty arrays
- Add error logging with context

**Success Criteria:**
- [ ] Content loading errors are visible
- [ ] No catch blocks that only log and return []
- [ ] Error messages include file/function context

**Estimated Effort:** 3-4 hours

---

## Phase 6: Content Loader Consolidation

**Goal:** Reduce duplication in content loading patterns

**Deliverables:**
- Extract common content loading logic into reusable functions
- Consolidate getAllContent, getContentMetadata, getAllNestedContent
- Create typed content loader factory
- Reduce ~500 lines of duplicate patterns to ~100

**Success Criteria:**
- [ ] Single source of truth for content loading
- [ ] Type-safe content access
- [ ] Tests for content loading logic

**Estimated Effort:** 4-6 hours

---

## Phase 7: Type Safety

**Goal:** Eliminate all `any` usage in production code

**Deliverables:**
- Define NetworkInformation interface for Navigator API
- Define proper types for web-vitals Metric
- Define GeoJSON feature types for Mapbox
- Replace all 22 `any` annotations with proper types
- Replace all 19 `as any` assertions with type guards

**Success Criteria:**
- [ ] Zero `any` in production code
- [ ] tsc --noEmit passes with strict mode
- [ ] No type assertion warnings

**Estimated Effort:** 4-6 hours

---

## Phase 8: Large File Decomposition

**Goal:** Break down files exceeding 400 lines

**Deliverables:**
- Split sidebar.tsx (771 lines) into logical components
- Split member-card.tsx (497 lines) by variant
- Split colonial-data-explorer.tsx (453 lines) by concern
- Split image-utils.ts (438 lines) by function group

**Success Criteria:**
- [ ] No file exceeds 400 lines
- [ ] Each file has single responsibility
- [ ] Visual regression tests pass

**Estimated Effort:** 6-8 hours

---

## Phase 9: Console Cleanup

**Goal:** Replace console.* with structured logging

**Deliverables:**
- Create logging utility with levels
- Replace 57 console statements with logger calls
- Configure log levels for dev/production
- Remove unnecessary debug logging

**Success Criteria:**
- [ ] No raw console.* in production code
- [ ] Log levels respected in production
- [ ] Error context preserved in logs

**Estimated Effort:** 3-4 hours

---

## Summary

| Phase | Focus | Hours | Cumulative |
|-------|-------|-------|------------|
| 1 | Testing Foundation | 4-6 | 4-6 |
| 2 | Security Hardening | 4-6 | 8-12 |
| 3 | Duplicate Removal | 2-3 | 10-15 |
| 4 | Dead Code Cleanup | 2-3 | 12-18 |
| 5 | Error Handling | 3-4 | 15-22 |
| 6 | Content Loader Consolidation | 4-6 | 19-28 |
| 7 | Type Safety | 4-6 | 23-34 |
| 8 | Large File Decomposition | 6-8 | 29-42 |
| 9 | Console Cleanup | 3-4 | 32-46 |

**Total Estimated Effort:** 32-46 hours

---

## Milestone: v1.0.0 - Clean Codebase

**Definition of Done:**
- [ ] All 9 phases completed
- [ ] Visual regression tests pass
- [ ] Zero TypeScript any usage
- [ ] No duplicate files
- [ ] No dead code
- [ ] All files under 400 lines
- [ ] Structured logging implemented
- [ ] Security hardening complete

---
*Roadmap created: 2026-01-17*
