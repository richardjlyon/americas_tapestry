# Dead Code Analysis

**Project:** America's Tapestry
**Analyzed:** 2026-01-17
**Scope:** Next.js/TypeScript codebase in `/src`

## Summary

**38** dead code instances found
**22** files affected
**~500** estimated lines removable

## Empty Functions/Effects

### `/src/components/shared/hero-carousel.tsx`
- **Lines 32-34**: Empty `useEffect` with comment "Debugging code removed"
  ```typescript
  useEffect(() => {
    // Debugging code removed
  }, []);
  ```
  **Safe to remove:** YES - explicitly noted as removed debug code

## Commented-Out Code Blocks

### `/src/app/tapestries/page.tsx`
- **Lines 26-28**: Commented-out InteractiveTimeline section
- **Lines 31-40**: Commented-out ColonialDataExplorer section

### `/src/app/support/page.tsx`
- **Lines 39-62**: Commented-out Merchandise card component (~24 lines)
- **Lines 144-146**: Commented-out SupportMerchandise section
- **Lines 154-156**: Commented-out SupportVolunteer section

### `/src/app/resources/page.tsx`
- **Lines 23, 26**: Commented-out EducationalResourcesCard and RelatedArtefactsGalleryCard with empty `<div></div>` placeholders

### `/src/components/features/support/support-donations.tsx`
- **Lines 8-14**: Commented-out DonationTier interface
- **Lines 17-70**: Commented-out donationTiers array (~54 lines) marked "for future implementation"
- **Lines 73-75**: Commented-out state variables

### `/src/components/features/support/support-sponsorship.tsx`
- **Lines 178-190**: Commented-out "Download Sponsorship Prospectus" button

### `/src/app/actions/sponsor-actions.ts`
- **Lines 4**: Commented-out imports: `getSponsorTier, getSponsorTiers, getSponsorsByTier`
- **Lines 9-15**: Commented-out `getTier` and `getSponsors` functions
- **Lines 32-40**: Commented-out `getSponsorTierData` function

## Unused Exports

### `/src/lib/image-utils.ts`
- `getOptimizedImagePath` - exported but never imported anywhere
- `generateBlurPlaceholder` - exported but never imported (only `getContextualBlurPlaceholder` is used)
- `getVideoPath` - exported but never imported anywhere
- `getOptimalImageFormat` - exported but never imported anywhere

### `/src/lib/cloudflare-loader.ts`
- `getImageVariants` - exported but never imported
- `isImageMigrated` - exported but never imported
- `getR2Url` - exported but never imported

### `/src/lib/performance.ts`
- `ImagePerformanceTracker` class - exported but never instantiated outside its own file
- `measureTime` function - exported but never imported

## Duplicate Files

### Hook Duplication
Both files are **identical** (193 lines each):
- `/src/hooks/use-toast.ts`
- `/src/components/ui/use-toast.ts`

Only `/src/hooks/use-toast.ts` is imported (in `toaster.tsx`).

Both files are **identical** (22 lines each):
- `/src/hooks/use-mobile.tsx`
- `/src/components/ui/use-mobile.tsx`

Only `/src/hooks/use-mobile.tsx` is imported (in `sidebar.tsx`).

## Unused Components

### `/src/components/features/support/support-merchandise.tsx`
- `SupportMerchandise` component (139 lines) - fully commented out in usage, never rendered

### `/src/components/features/support/support-volunteer.tsx`
- `SupportVolunteer` component (344 lines) - fully commented out in usage, never rendered

### `/src/components/features/resources/educational-resources-card.tsx`
- `EducationalResourcesCard` component (47 lines) - commented out in resources page

### `/src/components/features/resources/related-artefacts-gallery-card.tsx`
- `RelatedArtefactsGalleryCard` component (47 lines) - commented out in resources page

### `/src/components/shared/colonial-data-explorer.tsx`
- `ColonialDataExplorer` component - commented out in tapestries page (never rendered)

### `/src/components/features/tapestries/interactive-timeline.tsx`
- `InteractiveTimeline` component - commented out in tapestries page (never rendered)

## Debug/Development Artifacts

### `/debug-carousel.js` (root directory)
- Debug script for carousel troubleshooting (26 lines)
- Uses `console.log` extensively
- Should be removed from production codebase

## TODO/FIXME Comments

No explicit TODO/FIXME comments found in the codebase. The commented code blocks serve as implicit TODOs for "future implementation."

## Console.log Statements (Development Code)

### Production Console Logging
The following files contain `console.log`/`console.warn`/`console.error` calls that may be intentional for error handling but should be reviewed:

- `/src/lib/performance.ts` - Intentional performance logging (appropriate)
- `/src/lib/content-core.ts` - Warning for missing directories (appropriate)
- `/src/lib/blog.ts` - Error handling (appropriate)
- `/src/lib/tapestries.ts` - Warning/error handling (appropriate)
- `/src/lib/cloudflare-loader.ts` - Line 87: `console.warn` for manifest misses (review for production)

## Safe to Remove

### Immediate Removal (No Investigation Needed)
1. **Empty useEffect in hero-carousel.tsx** - Lines 32-34
2. **Duplicate hook files:**
   - `/src/components/ui/use-toast.ts` (duplicate of `/src/hooks/use-toast.ts`)
   - `/src/components/ui/use-mobile.tsx` (duplicate of `/src/hooks/use-mobile.tsx`)
3. **Debug script:** `/debug-carousel.js`
4. **Unused exports in image-utils.ts:**
   - `getOptimizedImagePath`
   - `generateBlurPlaceholder`
   - `getVideoPath`
   - `getOptimalImageFormat`
5. **Unused exports in cloudflare-loader.ts:**
   - `getImageVariants`
   - `isImageMigrated`
   - `getR2Url`
6. **Unused exports in performance.ts:**
   - `ImagePerformanceTracker`
   - `measureTime`
7. **Commented-out imports in sponsor-actions.ts**

### Requires Business Decision
1. **Commented-out features (support page):**
   - Merchandise section - Is this feature planned?
   - Volunteer section - Is this feature planned?

2. **Commented-out features (resources page):**
   - EducationalResourcesCard - Is this feature planned?
   - RelatedArtefactsGalleryCard - Is this feature planned?

3. **Commented-out features (tapestries page):**
   - InteractiveTimeline - Is this feature planned?
   - ColonialDataExplorer - Is this feature planned?

## Needs Investigation

### Components That May Be Used Dynamically
- `SupportMerchandise`, `SupportVolunteer` - Commented out but components exist. Verify no dynamic loading.
- `InteractiveTimeline`, `ColonialDataExplorer` - Large components, verify not imported elsewhere.

### Exports That May Be Used by External Tools
- `cloudflare-loader.ts` exports - May be used by build scripts or external tooling
- `performance.ts` exports - May be used for manual debugging

## Estimated Cleanup Impact

| Category | Lines Removable | Files Affected |
|----------|-----------------|----------------|
| Empty useEffect | 3 | 1 |
| Commented code | ~200 | 6 |
| Duplicate hook files | 215 | 2 |
| Debug files | 26 | 1 |
| Unused exports | ~50 | 3 |
| **Total** | **~500** | **13 unique files** |

If unused components are also removed after business verification:
- support-merchandise.tsx: 139 lines
- support-volunteer.tsx: 344 lines
- educational-resources-card.tsx: 47 lines
- related-artefacts-gallery-card.tsx: 47 lines
- interactive-timeline.tsx: ~400 lines (estimate)
- colonial-data-explorer.tsx: ~400 lines (estimate)

**Potential additional removal:** ~1,400 lines
