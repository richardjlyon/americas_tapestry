# Code Duplication Analysis

**Project:** America's Tapestry Website
**Analyzed:** 2026-01-17
**Scope:** Next.js/TypeScript codebase

## Summary

- **2** exact duplicate file pairs (hooks in two locations)
- **9** near-identical layout files
- **15+** repeated patterns requiring consolidation
- **HIGH** consolidation opportunity with moderate effort

## Exact Duplicates

### Hook Files (Critical - Fix Immediately)

| File 1 | File 2 | Lines | Status |
|--------|--------|-------|--------|
| `src/hooks/use-mobile.tsx` | `src/components/ui/use-mobile.tsx` | 22 | **IDENTICAL** |
| `src/hooks/use-toast.ts` | `src/components/ui/use-toast.ts` | 193 | **IDENTICAL** |

**Impact:** Import confusion, maintenance burden, potential for divergence
**Resolution:** Delete one copy, update imports to canonical location (`src/hooks/`)
**Effort:** Low (30 minutes)

### Layout Files (Intentional but Redundant)

Nine layout files are functionally identical, differing only in function name:

```typescript
// All 9 files follow this exact pattern:
import type React from 'react';
import { PageLayout } from '@/components/layout/page-layout';

export default function [Name]Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
```

**Files:**
1. `src/app/about/layout.tsx`
2. `src/app/contact/layout.tsx`
3. `src/app/news/layout.tsx`
4. `src/app/sponsors/layout.tsx`
5. `src/app/resources/layout.tsx`
6. `src/app/support/layout.tsx`
7. `src/app/tapestries/layout.tsx`
8. `src/app/privacy-policy/layout.tsx`
9. `src/app/team/layout.tsx`

**Impact:** Low risk (Next.js pattern), but maintenance overhead
**Status:** Intentional duplication (Next.js App Router convention)
**Resolution Options:**
1. Leave as-is (acceptable for Next.js)
2. Create shared layout utility if customization needed later

---

## Near Duplicates (Similar Patterns)

### 1. Content Loading Functions

**Pattern:** `getAll[ContentType]()` and `get[ContentType]BySlug()` functions

| File | Functions | Lines Duplicated |
|------|-----------|------------------|
| `src/lib/tapestries.ts` | `getAllTapestries`, `getTapestryBySlug` | ~180 lines of similar logic |
| `src/lib/sponsors.ts` | `getAllSponsors`, `getSponsorBySlug` | ~90 lines |
| `src/lib/exhibitions.ts` | `getAllExhibitions`, `getExhibitionBySlug` | ~90 lines |
| `src/lib/blog.ts` | `getAllBlogPosts`, `getBlogPostBySlug` | ~140 lines |
| `src/lib/team.ts` | Multiple team functions | ~200 lines |

**Common Pattern:**
```typescript
export async function getAll[Type](): Promise<[Type][]> {
  try {
    const content = await getAllContent('[type]');
    const items: [Type][] = content
      .filter(...)
      .map((item) => {
        const data = item.frontmatter;
        // Transform frontmatter to typed object
        return { ... } as [Type];
      });
    return items.sort(...);
  } catch (error) {
    console.error('Error getting all [type]:', error);
    return [];
  }
}
```

**Consolidation Approach:**
```typescript
// Create generic content loader in content-core.ts
export async function loadContent<T>(
  contentType: string,
  transformer: (item: ContentItem) => T,
  filter?: (item: ContentItem) => boolean,
  sort?: (a: T, b: T) => number,
): Promise<T[]>
```

**Effort:** Medium (2-3 hours)
**Impact:** Reduces ~500 lines to ~100 lines

### 2. content-core.ts Internal Duplication

**Problem:** `getAllContent` and `getContentMetadata` have nearly identical `processDirectory` functions.

| Function | Lines | Similarity |
|----------|-------|------------|
| `getAllContent.processDirectory` | 33-100 | Reference |
| `getContentMetadata.processDirectory` | 142-186 | ~95% similar |

**Difference:** `getContentMetadata` skips content extraction and excerpt generation.

**Consolidation Approach:**
```typescript
// Shared directory processor with options
function processDirectory(
  dir: string,
  options: { includeContent?: boolean; generateExcerpt?: boolean }
)
```

**Effort:** Low (1 hour)

### 3. Form Components

**Pattern:** Newsletter and Contact forms share identical structure

| Component | File | Shared Pattern |
|-----------|------|----------------|
| `NewsletterSignup` | `newsletter-signup.tsx` | Form state, validation, response handling |
| `ContactForm` | `contact-form.tsx` | Form state, validation, response handling |
| `FooterNewsletter` | `footer-newsletter.tsx` | Simplified version of same pattern |

**Shared Code:**
- `useState` for `isSubmitting`, `formResponse`
- `useForm` with `zodResolver` setup
- `onSubmit` async handler pattern
- Response display component (success/error)

**Response Display Pattern (duplicated):**
```tsx
{formResponse && (
  <div className={`p-4 rounded-lg ${formResponse.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
    <div className="flex items-start">
      {formResponse.success ? (
        <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
      )}
      <p>{formResponse.message}</p>
    </div>
  </div>
)}
```

**Consolidation Approach:**
1. Create `useFormSubmission` hook for state management
2. Create `FormResponse` component for response display

**Effort:** Medium (1-2 hours)

### 4. Resource Card Components

**Pattern:** Three resource cards with identical structure

| Component | Icon | Color |
|-----------|------|-------|
| `EducationalResourcesCard` | `BookOpen` | `colonial-burgundy` |
| `TapestryGlossariesCard` | `Gauge` | `colonial-gold` |
| `RelatedArtefactsGalleryCard` | `History` | `colonial-navy` |

**All follow this structure:**
```tsx
<Card className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col">
  <CardHeader className="pb-2">
    <div className="w-12 h-12 rounded-full bg-[color]/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-[color]" />
    </div>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent className="flex-grow">
    <p className="font-serif text-colonial-navy/80">...</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full rounded-full bg-[color]" ...>
      Link Text <ArrowRight />
    </Button>
  </CardFooter>
</Card>
```

**Consolidation Approach:**
```tsx
interface ResourceCardProps {
  icon: LucideIcon;
  color: 'burgundy' | 'gold' | 'navy';
  title: string;
  description: string;
  content: string;
  linkHref: string;
  linkText: string;
}

function ResourceCard({ icon: Icon, color, ... }: ResourceCardProps) { ... }
```

**Effort:** Low (1 hour)

### 5. Responsive Image Size Exclusion Pattern

**Pattern:** Checking for responsive variant suffixes appears 3x in tapestries.ts

```typescript
// Repeated 3 times with same suffix list
!file.includes('-640w') &&
!file.includes('-1024w') &&
!file.includes('-1920w') &&
!file.includes('-2560w') &&
!file.includes('-400w') &&
!file.includes('-1280w') &&
!file.includes('-200w') &&
!file.includes('-600w') &&
!file.includes('-300w') &&
!file.includes('-900w')
```

**Also appears in `image-utils.ts` `hasResponsiveVariants`**

**Consolidation Approach:**
```typescript
// In image-utils.ts
const RESPONSIVE_SUFFIXES = ['-640w', '-1024w', '-1920w', '-2560w', '-400w', '-1280w', '-200w', '-600w', '-300w', '-900w'];

export function isOriginalImage(filename: string): boolean {
  return !RESPONSIVE_SUFFIXES.some(suffix => filename.includes(suffix));
}
```

**Effort:** Low (30 minutes)

### 6. Placeholder Path Strings

**Problem:** Placeholder paths scattered across 15+ files

| Placeholder | Occurrences |
|-------------|-------------|
| `/images/placeholders/placeholder.svg` | 12 |
| `/images/placeholders/tapestry-placeholder.svg` | 2 |
| `/images/placeholders/placeholder-user.jpg` | 2 |
| `/images/placeholders/placeholder-state-director.svg` | 1 |

**Consolidation Approach:**
```typescript
// In image-utils.ts or constants.ts
export const PLACEHOLDER_IMAGES = {
  default: '/images/placeholders/placeholder.svg',
  tapestry: '/images/placeholders/tapestry-placeholder.svg',
  user: '/images/placeholders/placeholder-user.jpg',
  stateDirector: '/images/placeholders/placeholder-state-director.svg',
} as const;
```

**Effort:** Low (30 minutes)

---

## Repeated Patterns

### Card Component Styling Pattern

**Pattern:** Multiple card components use similar base styling

```tsx
// Appears in 5+ components
className="bg-white shadow-md border border-colonial-navy/10 rounded-lg overflow-hidden"
```

**Consolidation:** Already have `ContentCard` component but not consistently used.

### Error Handling in Content Loaders

**Pattern:** All content loaders follow same try-catch pattern

```typescript
try {
  // Load content
} catch (error) {
  console.error('Error [action]:', error);
  return []; // or null
}
```

**Consolidation:** Create error boundary wrapper for content loading

### Image Fallback Pattern

**Pattern:** Handling missing images with fallback

```tsx
{item.image ? (
  <OptimizedImage src={item.image} ... />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-colonial-navy/40 text-center p-4">
      {item.title}
    </div>
  </div>
)}
```

**Found in:** `tapestry-card.tsx`, `blog-card.tsx`, `support-merchandise.tsx`

**Consolidation:** Enhance `OptimizedImage` to handle fallback rendering internally

---

## Recommended Consolidations

### Priority 1: Quick Wins (< 1 hour each)

| Task | Files | Lines Saved | Risk |
|------|-------|-------------|------|
| Delete duplicate hooks | 2 files | 215 lines | Low |
| Create `RESPONSIVE_SUFFIXES` constant | 2 files | 30 lines | Low |
| Create `PLACEHOLDER_IMAGES` constant | 15+ files | N/A (cleaner) | Low |

### Priority 2: Medium Effort (1-3 hours each)

| Task | Files | Lines Saved | Risk |
|------|-------|-------------|------|
| Refactor content-core `processDirectory` | 1 file | 40 lines | Low |
| Create `ResourceCard` component | 3 files | 100 lines | Low |
| Create `FormResponse` component | 3 files | 50 lines | Low |
| Create `useFormSubmission` hook | 3 files | 60 lines | Medium |

### Priority 3: Larger Refactors (3+ hours)

| Task | Files | Lines Saved | Risk |
|------|-------|-------------|------|
| Generic content loader function | 5 files | 400 lines | Medium |
| Consolidate image finding logic in tapestries.ts | 1 file | 150 lines | Medium |

---

## Summary by Category

| Category | Count | Effort to Fix |
|----------|-------|---------------|
| Exact duplicates (files) | 2 | 30 min |
| Identical layouts | 9 | Leave as-is |
| Similar content loaders | 5 | 3 hours |
| Repeated UI patterns | 6 | 4 hours |
| Hardcoded constants | 17+ | 1 hour |

**Total estimated cleanup effort:** 8-10 hours

---

## Intentional Duplications (Do Not Consolidate)

1. **Layout files** - Next.js App Router convention
2. **Action files** (`newsletter-actions.ts`, `contact-actions.ts`) - Different external services (MailerLite vs Resend)
3. **Card components** (`tapestry-card.tsx`, `sponsor-card.tsx`, `blog-card.tsx`) - Sufficiently different data shapes and behaviors
4. **Support tab components** - Each has unique content and interaction patterns

---

## Next Steps

1. **Immediate:** Delete duplicate hooks in `src/components/ui/`, update imports
2. **This sprint:** Create shared constants for placeholders and responsive suffixes
3. **Next sprint:** Refactor content-core internal duplication
4. **Later:** Consider generic content loader if adding more content types
