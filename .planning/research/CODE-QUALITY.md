# Code Quality Analysis

**Project:** America's Tapestry Website
**Analyzed:** 2026-01-17
**Total files analyzed:** ~100+ TypeScript/TSX files
**Total lines:** ~18,842 lines in src/

## Summary

| Metric | Count |
|--------|-------|
| Quality issues found | 78 |
| High priority | 12 |
| Medium priority | 34 |
| Low priority | 32 |
| Files needing refactoring | 15 |

### Key Findings

1. **Large files:** 7 files exceed 300 lines, largest is sidebar.tsx at 771 lines
2. **Console statements:** 57 instances across 17 files in production code
3. **Synchronous fs operations:** 26 synchronous file system calls in content loaders
4. **Missing error boundaries:** No error.tsx or not-found.tsx files exist
5. **Duplicate code:** use-toast.ts exists identically in two locations
6. **Security concerns:** 8 dangerouslySetInnerHTML usages, most without explicit sanitization

---

## Large Files (>200 lines)

| File | Lines | Responsibilities | Recommended Split |
|------|-------|------------------|-------------------|
| `src/components/ui/sidebar.tsx` | 771 | Context provider, 20+ sidebar components, variants, styles | Split into: `sidebar-context.tsx`, `sidebar-primitives.tsx`, `sidebar-menu.tsx` |
| `src/__tests__/mobile-optimization.test.tsx` | 624 | Multiple test suites for mobile optimization | Split by feature area into separate test files |
| `src/components/features/team/member-card.tsx` | 497 | Grid variant, full variant, simple variant, image handling, markdown processing | Extract: `MemberCardGrid.tsx`, `MemberCardFull.tsx`, `useImageFallback.ts` hook |
| `src/components/shared/colonial-data-explorer.tsx` | 453 | Summary view, grid view, timeline view, filtering, sorting | Extract view components: `ColonySummaryView.tsx`, `ColonyGridView.tsx`, `ColonyTimelineView.tsx` |
| `src/lib/image-utils.ts` | 438 | Path conversion, responsive sizes, blur placeholders, mobile detection, format detection | Split into: `image-paths.ts`, `responsive-images.ts`, `device-detection.ts` |
| `src/lib/tapestries.ts` | 421 | Image finding, audio finding, carousel images, getAllTapestries, getTapestryBySlug | Extract: `tapestry-media.ts` for image/audio finding logic |
| `src/components/features/tapestries/interactive-timeline.tsx` | 387 | Timeline rendering, event navigation, colony filtering, scroll handling | Consider extracting scroll/navigation logic into custom hook |
| `src/components/features/tapestries/interactive-colonies-map.tsx` | 370 | GeoJSON loading, map rendering, tooltips, legend | Extract: `ColoniesMapLegend.tsx`, `useGeoJSONData.ts` hook |
| `src/components/ui/chart.tsx` | 366 | Multiple chart components, theme handling | Standard Recharts wrapper - acceptable size |
| `src/lib/content-core.ts` | 355 | Content reading, metadata extraction, nested content processing | Consider async refactor, extract excerpt generation |
| `src/components/features/support/support-volunteer.tsx` | 343 | Volunteer opportunities display, static data | Extract opportunity data to separate data file |
| `src/lib/performance.ts` | 316 | Web vitals tracking, image performance, timing utilities | Acceptable - cohesive responsibility |
| `src/lib/team.ts` | 289 | Team group reading, member reading, multiple traversal functions | Similar to content-core, consider consolidation |
| `src/components/shared/hero-carousel.tsx` | 276 | Carousel logic, image display, autoplay, touch handling | Moderately complex but cohesive |

---

## Complex Functions (>50 lines)

### `src/lib/tapestries.ts`

- `findImageInDirectory` (~90 lines) - Searches for image files with format priority
  - **Issue:** Deeply nested conditionals, duplicated size-variant exclusion patterns
  - **Recommendation:** Extract size-variant checking into helper function, use early returns

- `getAllTapestries` (~120 lines) - Loads all tapestry content with images
  - **Issue:** Duplicates much of thumbnail-finding logic from findImageInDirectory
  - **Recommendation:** Reuse findImageInDirectory or extract shared thumbnail logic

### `src/components/features/team/member-card.tsx`

- Component body (~475 lines) - Renders three different variants
  - **Issue:** Three completely different render paths in one component
  - **Recommendation:** Split into three separate components sharing common utilities

### `src/lib/content-core.ts`

- `processDirectory` (nested function, ~65 lines) - Recursively processes markdown files
  - **Issue:** Nested function with side effects, difficult to test
  - **Recommendation:** Extract as standalone function, add unit tests

- `getAllNestedContent` (~50 lines) - Handles categorized content
  - **Issue:** Duplicates directory traversal pattern from getAllContent
  - **Recommendation:** Create shared directory walker utility

### `src/components/shared/colonial-data-explorer.tsx`

- Component body (~450 lines) - Contains three complete views
  - **Issue:** Each tab view is substantial, making the component hard to maintain
  - **Recommendation:** Extract each TabsContent into separate component

---

## Deep Nesting (3+ levels)

### `src/lib/tapestries.ts`
- Lines 55-148: `findImageInDirectory` - 4 levels deep (function > for > if > if)
  - **Simplification:** Use flatMap for format/file combinations, early returns

### `src/components/features/team/member-card.tsx`
- Lines 102-224: Grid variant rendering - 4 levels deep (component > condition > condition > ternary)
  - **Simplification:** Extract conditional rendering into separate components

### `src/lib/content-core.ts`
- Lines 33-99: `processDirectory` - 4 levels deep (function > for > if > try)
  - **Simplification:** Use async/await with Promise.all, extract file processing

### `src/components/shared/colonial-data-explorer.tsx`
- Lines 280-390: Data grid table - 4 levels deep (Tabs > Table > Header > Button)
  - **Acceptable:** JSX nesting for UI structure

---

## Console Statements

**Total: 57 statements across 17 files**

| File | Count | Types | Recommendation |
|------|-------|-------|----------------|
| `src/lib/performance.ts` | 7 | log, warn | **Keep** - Guarded by NODE_ENV checks |
| `src/lib/content-core.ts` | 6 | warn, error | Replace with structured logger |
| `src/lib/team.ts` | 9 | warn, error | Replace with structured logger |
| `src/lib/tapestries.ts` | 4 | warn, error | Replace with structured logger |
| `src/lib/exhibitions.ts` | 4 | warn, error | Replace with structured logger |
| `src/lib/blog.ts` | 4 | error | Replace with structured logger |
| `src/lib/sponsors.ts` | 2 | error | Replace with structured logger |
| `src/lib/markdown.ts` | 2 | error | Replace with structured logger |
| `src/lib/cloudflare-loader.ts` | 1 | warn | Replace with structured logger |
| `src/app/actions/newsletter-actions.ts` | 6 | error | Replace with structured logger, add monitoring |
| `src/app/actions/contact-actions.ts` | 2 | error | Replace with structured logger |
| `src/app/actions/team-actions.ts` | 1 | error | Replace with structured logger |
| `src/components/features/*.tsx` | 5 | warn, error | Replace with error boundary or toast |
| `src/components/ui/optimized-image.tsx` | 1 | warn | Replace with monitoring callback |

**Recommendation:** Create a `src/lib/logger.ts` utility:
- Development: console output
- Production: Send to logging service (Sentry, LogRocket, etc.)
- Remove direct console.* calls from production code

---

## Silent Error Handling

### Critical (errors swallowed, no user feedback)

| File | Line | Pattern | Recommended Fix |
|------|------|---------|-----------------|
| `src/lib/exhibitions.ts` | 103-106 | `catch { return [] }` | Add error tracking, show user notification |
| `src/lib/blog.ts` | 139-142 | `catch { return [] }` | Add error tracking, return error state |
| `src/lib/sponsors.ts` | 80-83 | `catch { return [] }` | Add error tracking, return error state |
| `src/lib/tapestries.ts` | 338-341 | `catch { return [] }` | Add error tracking, return error state |
| `src/lib/team.ts` | 150-153 | `catch { return [] }` | Add error tracking, return error state |
| `src/components/shared/colonial-map.tsx` | 28-30 | `catch { return false }` | Add error logging at minimum |

### Moderate (logged but not surfaced)

| File | Line | Pattern | Recommended Fix |
|------|------|---------|-----------------|
| `src/lib/content-core.ts` | 95-97 | `catch { console.error; continue }` | Add error aggregation, surface in dev |
| `src/lib/team.ts` | 56-57, 73-75 | `catch { console.error }` | Return partial results with error info |
| `src/app/actions/*.ts` | Multiple | `catch { console.error; return error }` | Add server-side monitoring |

**Recommendation:** Implement Result type pattern:
```typescript
type Result<T> = { success: true; data: T } | { success: false; error: Error };
```

---

## Security Issues

### dangerouslySetInnerHTML Usage

| File | Line | Risk Level | Remediation |
|------|------|------------|-------------|
| `src/app/tapestries/[slug]/page.tsx` | 121 | **MEDIUM** | Add DOMPurify sanitization |
| `src/components/ui/chart.tsx` | 81 | LOW | SVG content from trusted source |
| `src/components/features/team/member-card.tsx` | 209, 402 | **MEDIUM** | Add DOMPurify sanitization |
| `src/components/features/sponsors/sponsor-card.tsx` | 88 | **MEDIUM** | Add DOMPurify sanitization |
| `src/components/features/news/markdown-content.tsx` | 12 | **MEDIUM** | Add DOMPurify sanitization |
| `src/app/sponsors/[slug]/page.tsx` | 111 | **MEDIUM** | Add DOMPurify sanitization |

**Immediate Action Required:**
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Create sanitization utility:
```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';
export const sanitizeHtml = (html: string) => DOMPurify.sanitize(html);
```
3. Apply to all markdown-rendered content

### Unvalidated User Inputs

| Location | Issue | Fix |
|----------|-------|-----|
| `src/app/actions/newsletter-actions.ts` | Email validated only by Zod | **OK** - Zod validation is sufficient |
| `src/app/actions/contact-actions.ts` | Form inputs validated by Zod | **OK** - Zod validation is sufficient |

---

## React Anti-Patterns

### Missing Error Boundaries

**Issue:** No error.tsx or not-found.tsx files found in the app directory.

**Impact:**
- Runtime errors will crash the entire app
- 404 pages show default Next.js error
- No graceful degradation for component failures

**Fix:**
```typescript
// src/app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// src/app/not-found.tsx
export default function NotFound() {
  return <div>Page not found</div>;
}
```

### Duplicate Code

**Issue:** `use-toast.ts` exists in two identical locations:
- `src/hooks/use-toast.ts` (192 lines)
- `src/components/ui/use-toast.ts` (192 lines)

**Fix:** Delete `src/components/ui/use-toast.ts`, update all imports to use `@/hooks/use-toast`

### Index as Key (Minor)

Found in:
- `src/components/shared/colonial-data-explorer.tsx:424` - `key={index}` for timeline events
- `src/components/features/support/support-volunteer.tsx:149` - `key={index}` for requirements
- `src/components/features/support/support-sponsorship.tsx:134` - `key={index}` for benefits

**Impact:** Low - these are static lists that don't reorder. Consider using composite keys for better React reconciliation if lists become dynamic.

### Unused State Dependencies

**Issue:** `src/hooks/use-toast.ts:182` - useEffect depends on `state` but only uses it to register/unregister listener.

**Fix:** Remove `state` from dependency array:
```typescript
React.useEffect(() => {
  listeners.push(setState);
  return () => {
    const index = listeners.indexOf(setState);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}, []); // Empty dependency array - only run on mount/unmount
```

---

## Performance Anti-Patterns

### Synchronous File System Operations

**Issue:** 26 synchronous fs operations found in:
- `src/lib/content-core.ts` (12 calls)
- `src/lib/team.ts` (5 calls)
- `src/lib/tapestries.ts` (9 calls)

**Impact:** Blocks the event loop during content loading, can cause slow page generation.

**Fix:** Convert to async versions:
```typescript
// Before
const items = fs.readdirSync(dir, { withFileTypes: true });

// After
import { readdir } from 'fs/promises';
const items = await readdir(dir, { withFileTypes: true });
```

### Missing Memoization Opportunities

| File | Component | Issue |
|------|-----------|-------|
| `src/components/features/support/support-volunteer.tsx` | SupportVolunteer | Static `volunteerOpportunities` array recreated each render |
| `src/components/features/support/support-sponsorship.tsx` | SupportSponsorship | Static `sponsorshipTiers` array recreated each render |
| `src/components/features/support/support-merchandise.tsx` | SupportMerchandise | Static `merchandiseItems` array recreated each render |

**Fix:** Move static data outside component or use useMemo:
```typescript
// Move outside component
const volunteerOpportunities = [...];

// Or use useMemo if computed
const opportunities = useMemo(() => computeOpportunities(), [dependencies]);
```

### Memoization Usage Summary

| File | useMemo | useCallback | React.memo |
|------|---------|-------------|------------|
| `src/components/shared/hero-carousel.tsx` | 1 | 2 | 0 |
| `src/components/shared/colonial-data-explorer.tsx` | 4 | 0 | 0 |
| `src/components/features/tapestries/interactive-timeline.tsx` | 1 | 3 | 0 |
| `src/components/features/tapestries/interactive-colonies-map.tsx` | 3 | 3 | 0 |
| `src/components/ui/carousel.tsx` | 1 | 3 | 0 |
| `src/components/ui/sidebar.tsx` | 2 | 2 | 0 |

**Observation:** Memoization is used in complex components. No immediate performance issues detected, but consider React.memo for frequently re-rendered child components.

---

## TypeScript Issues

### `any` Type Usage

| File | Line | Usage | Fix |
|------|------|-------|-----|
| `src/lib/team.ts` | 17, 26 | `[key: string]: any` in interfaces | Define specific frontmatter types |
| `src/lib/team.ts` | 39 | `const content: any[]` | Use `ContentItem[]` type |
| `src/lib/performance.ts` | 8, 63 | gtag declaration, metric handler | Define proper gtag types |
| `src/components/shared/colonial-data-explorer.tsx` | 204 | `(value: any)` | Use `'timeline' \| 'grid' \| 'summary'` |
| `src/components/features/tapestries/interactive-colonies-map.tsx` | 116, 124 | GeoJSON feature typing | Define proper GeoJSON types |
| `src/components/ui/responsive-picture.tsx` | 66 | `const imageProps: any` | Define ImageProps interface |
| `src/lib/content-core.ts` | 7, 14 | `Record<string, any>` for frontmatter | Define content-specific frontmatter interfaces |

**Recommendation:** Create typed interfaces for frontmatter per content type:
```typescript
interface TapestryFrontmatter {
  title: string;
  summary: string;
  status: TapestryStatus;
  // ...specific fields
}
```

---

## Priority Refactoring Order

### High Priority (Do First)

1. **Add error boundaries** - Prevents full app crashes
   - Create `src/app/error.tsx`
   - Create `src/app/not-found.tsx`
   - Add route-level error boundaries for critical pages

2. **Sanitize dangerouslySetInnerHTML** - Security vulnerability
   - Install DOMPurify
   - Create sanitization utility
   - Apply to all 6 affected locations

3. **Remove duplicate use-toast.ts** - Confusion and maintenance burden
   - Delete `src/components/ui/use-toast.ts`
   - Update imports

4. **Replace console.* with structured logging** - Production debugging
   - Create `src/lib/logger.ts`
   - Replace 50+ console calls
   - Add production monitoring integration

### Medium Priority (Do Second)

5. **Split large components** - Maintainability
   - `member-card.tsx` into 3 variant components
   - `colonial-data-explorer.tsx` into view components
   - `sidebar.tsx` into logical groupings (optional - this is a UI library pattern)

6. **Convert sync fs to async** - Performance
   - Update `content-core.ts`, `team.ts`, `tapestries.ts`
   - Benchmark before/after build times

7. **Add error context to catch blocks** - Debugging
   - Replace empty returns with error tracking
   - Implement Result type pattern

8. **Extract complex functions** - Testability
   - `findImageInDirectory` helper functions
   - Directory traversal utilities

### Low Priority (Do Later)

9. **Replace `any` types** - Type safety
   - Define frontmatter interfaces
   - Type GeoJSON features
   - Type gtag properly

10. **Move static data outside components** - Minor performance
    - Volunteer opportunities
    - Sponsorship tiers
    - Merchandise items

11. **Split image-utils.ts** - Organization
    - Separate concerns into smaller modules

12. **Add composite keys to lists** - React best practices
    - Replace index keys where appropriate

---

## Appendix: File Metrics

### Largest Files by Line Count

```
771 src/components/ui/sidebar.tsx
624 src/__tests__/mobile-optimization.test.tsx
497 src/components/features/team/member-card.tsx
453 src/components/shared/colonial-data-explorer.tsx
438 src/lib/image-utils.ts
421 src/lib/tapestries.ts
387 src/components/features/tapestries/interactive-timeline.tsx
370 src/components/features/tapestries/interactive-colonies-map.tsx
366 src/components/ui/chart.tsx
355 src/lib/content-core.ts
```

### Console Statement Distribution

```
lib/: 35 statements (61%)
app/actions/: 9 statements (16%)
components/: 7 statements (12%)
Other: 6 statements (11%)
```

### Error Handling Patterns

```
Silent catch (return []): 6 locations
Logged catch (continue): 8 locations
Logged catch (re-throw): 0 locations
Proper error propagation: 12 locations
```
