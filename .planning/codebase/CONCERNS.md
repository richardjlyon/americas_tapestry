# Codebase Concerns

**Analysis Date:** 2026-01-17

## Tech Debt

**TypeScript `any` Usage:**
- Issue: Multiple uses of `any` type bypass type safety
- Files: `src/lib/performance.ts:63`, `src/lib/performance.ts:126`, `src/hooks/use-connection-aware.ts:43-45`, `src/components/shared/colonial-data-explorer.tsx:204`, `src/components/ui/optimized-image.tsx:187-188`, `src/components/features/tapestries/interactive-colonies-map.tsx:116,124`
- Impact: Potential runtime type errors, reduced IDE assistance
- Fix approach: Define proper interfaces for web-vitals metrics, Navigator connection API, and GeoJSON features

**Console Logging in Production Code:**
- Issue: Extensive console.log/warn/error statements throughout the codebase
- Files: `src/lib/performance.ts`, `src/lib/exhibitions.ts`, `src/lib/tapestries.ts`, `src/lib/content-core.ts`, `src/lib/sponsors.ts`, `src/lib/team.ts`, `src/lib/blog.ts`, `src/lib/cloudflare-loader.ts`, `src/lib/markdown.ts`, `src/app/actions/newsletter-actions.ts`, `src/app/actions/contact-actions.ts`
- Impact: Log noise in production, potential information leakage
- Fix approach: Implement structured logging with log levels, conditionally disable in production

**Duplicate use-mobile and use-toast Hooks:**
- Issue: Same hooks exist in both `src/hooks/` and `src/components/ui/`
- Files: `src/hooks/use-mobile.tsx` and `src/components/ui/use-mobile.tsx`, `src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts`
- Impact: Confusion about which to import, potential inconsistent behavior
- Fix approach: Remove duplicates, standardize on single location

**Large Component Files:**
- Issue: Several files exceed 400 lines, indicating multiple responsibilities
- Files: `src/components/ui/sidebar.tsx` (771 lines), `src/components/features/team/member-card.tsx` (497 lines), `src/components/shared/colonial-data-explorer.tsx` (453 lines), `src/lib/image-utils.ts` (438 lines), `src/lib/tapestries.ts` (421 lines)
- Impact: Difficult to maintain, test, and understand
- Fix approach: Extract sub-components and utility functions into separate files

**Empty useEffect in Hero Carousel:**
- Issue: Empty useEffect with comment "Debugging code removed"
- Files: `src/components/shared/hero-carousel.tsx:32-34`
- Impact: Dead code, indicates incomplete cleanup
- Fix approach: Remove the empty useEffect entirely

**Content-core Duplicate Functionality:**
- Issue: `getAllContent`, `getContentMetadata`, and `getAllNestedContent` have significant code duplication
- Files: `src/lib/content-core.ts`
- Impact: Changes need to be made in multiple places, risk of inconsistent behavior
- Fix approach: Refactor into composable utility functions

## Known Bugs

**Silent Error Swallowing:**
- Symptoms: Errors caught but only logged, returns empty arrays/null
- Files: `src/lib/exhibitions.ts:104-105`, `src/lib/tapestries.ts:339-340`, `src/lib/blog.ts:140-141`, `src/lib/team.ts:151-152`, `src/lib/sponsors.ts:81-82`
- Trigger: Any filesystem error when reading content
- Workaround: Check logs for error messages

**Image Fallback Chain May Fail Silently:**
- Symptoms: Images may show broken state without user feedback
- Files: `src/components/features/team/member-card.tsx:63-80`
- Trigger: When both fallback images also fail to load
- Workaround: Ensure placeholder images exist at `/images/placeholders/placeholder-user.jpg`

## Security Considerations

**No Rate Limiting on API Actions:**
- Risk: Contact form and newsletter signup exposed to spam/abuse
- Files: `src/app/actions/contact-actions.ts`, `src/app/actions/newsletter-actions.ts`
- Current mitigation: None detected
- Recommendations: Add rate limiting middleware, implement CAPTCHA or honeypot fields

**dangerouslySetInnerHTML Usage:**
- Risk: XSS vulnerabilities if content is not properly sanitized
- Files: `src/app/tapestries/[slug]/page.tsx:121`, `src/components/features/team/member-card.tsx:209,402`, `src/components/features/sponsors/sponsor-card.tsx:88`, `src/components/features/news/markdown-content.tsx:12`, `src/app/sponsors/[slug]/page.tsx:111`
- Current mitigation: Content comes from markdown files via remark/remark-html
- Recommendations: Verify remark-html sanitizes output, consider explicit sanitization with DOMPurify

**Environment File Committed to Git:**
- Risk: Default `.env` file with placeholder values is committed
- Files: `.env` (585 bytes, committed)
- Current mitigation: Sensitive values in `.env.local` (gitignored)
- Recommendations: Verify `.env` contains no real credentials, document which file takes precedence

**API Keys in Frontend:**
- Risk: Mapbox token exposed via NEXT_PUBLIC_ prefix
- Files: `.env.example:10` - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Current mitigation: Mapbox allows domain restrictions
- Recommendations: Configure Mapbox URL restrictions in dashboard

## Performance Bottlenecks

**Synchronous File System Operations:**
- Problem: Content reading uses sync fs operations
- Files: `src/lib/content-core.ts:34,56,143,163`, `src/lib/tapestries.ts`, `src/lib/team.ts`, `src/lib/blog.ts`
- Cause: `fs.readdirSync`, `fs.readFileSync` block event loop
- Improvement path: Convert to async operations with `fs.promises` or use streaming

**Multiple Full Content Loads:**
- Problem: `getContentBySlug` loads all content then filters
- Files: `src/lib/content-core.ts:109-115`
- Cause: `getAllContent` called to find single item
- Improvement path: Add direct file path resolution for single-item lookups

**Client-Side Markdown Processing:**
- Problem: Member card processes markdown on client with useEffect
- Files: `src/components/features/team/member-card.tsx:83-100`
- Cause: Content imported as raw markdown, processed per-render
- Improvement path: Process markdown at build time or server-side

**GeoJSON Fetch on Every Map Render:**
- Problem: Colonies map fetches 500k GeoJSON file each mount
- Files: `src/components/features/tapestries/interactive-colonies-map.tsx:92`
- Cause: useEffect fetches data without caching
- Improvement path: Implement SWR/React Query caching, or load at build time

## Fragile Areas

**Content Directory Structure Dependencies:**
- Files: `src/lib/content-core.ts`, `src/lib/team.ts`, `src/lib/tapestries.ts`
- Why fragile: Hardcoded assumptions about directory structure, file naming patterns (YYMMDD- prefix), index.md conventions
- Safe modification: Document expected structure, add validation
- Test coverage: No unit tests for content loading functions

**Image Path Resolution:**
- Files: `src/lib/content-core.ts:314-339`, `src/components/features/team/member-card.tsx:30-40`
- Why fragile: Multiple path conventions (relative, /images/, /content/), group-specific logic
- Safe modification: Test with all team groups, verify fallback chain
- Test coverage: Minimal - only smoke tests exist

**Member Card Variant Logic:**
- Files: `src/components/features/team/member-card.tsx`
- Why fragile: 497 lines with complex conditional rendering for grid/full/simple variants, group-specific special cases (stitching-groups, 250-commission)
- Safe modification: Test all variants with all team groups
- Test coverage: None - component not directly tested

## Scaling Limits

**File-Based Content Storage:**
- Current capacity: Works for current content volume (~50-100 items per type)
- Limit: Performance degrades with thousands of content files
- Scaling path: Consider headless CMS or database for large-scale content

**Static Generation:**
- Current capacity: All pages statically generated at build time
- Limit: Build time increases linearly with content volume
- Scaling path: Implement ISR (Incremental Static Regeneration) for dynamic content

## Dependencies at Risk

**No Major Concerns Detected:**
- Dependencies appear current based on package.json
- Framework versions (Next.js, React) are modern
- UI library (Radix, shadcn/ui components) actively maintained

**Potential Concern - web-vitals:**
- Risk: Dynamically imported, may fail silently if unavailable
- Impact: Performance monitoring disabled
- Migration plan: Already has error handling, acceptable risk

## Missing Critical Features

**No CSRF Protection:**
- Problem: Server actions lack CSRF tokens
- Blocks: Cannot safely deploy contact/newsletter forms without spam risk
- Note: Next.js Server Actions have built-in CSRF protection by default

**No Input Sanitization Layer:**
- Problem: HTML from markdown rendered directly
- Blocks: Safe user-generated content expansion

**No Error Boundary Implementation:**
- Problem: Only basic error handling in components
- Files: `src/app/error.tsx` exists but component-level error boundaries not implemented

## Test Coverage Gaps

**Content Loading Functions:**
- What's not tested: `src/lib/content-core.ts`, `src/lib/tapestries.ts`, `src/lib/team.ts`, `src/lib/blog.ts`, `src/lib/sponsors.ts`
- Risk: File system changes could break content loading silently
- Priority: High

**Server Actions:**
- What's not tested: `src/app/actions/contact-actions.ts`, `src/app/actions/newsletter-actions.ts`
- Risk: API integration failures not caught before deployment
- Priority: High

**Feature Components:**
- What's not tested: Most components in `src/components/features/`
- Files: member-card, interactive-colonies-map, interactive-timeline, hero-carousel
- Risk: UI regressions in complex interactive components
- Priority: Medium

**Current Test Files:**
- `src/__tests__/component-integrity.test.tsx` - Basic rendering tests (mocks)
- `src/__tests__/mobile-optimization.test.tsx` - Connection-aware strategy tests
- `src/__tests__/simple-smoke.test.tsx` - Minimal smoke tests
- `e2e/mobile-optimization.spec.ts`, `e2e/refactor-safety.spec.ts` - Playwright E2E

**Overall Coverage:**
- Estimated: Low (<20% of source files have direct tests)
- Critical gap: No tests for content loading or data transformation logic

---

*Concerns audit: 2026-01-17*
