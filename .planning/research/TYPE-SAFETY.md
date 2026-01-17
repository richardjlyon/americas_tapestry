# Type Safety Issues

**Project:** America's Tapestry
**Researched:** 2026-01-17
**Overall confidence:** HIGH

## Summary

**35 total type safety issues found**
- **22** `any` type annotations
- **19** `as any` type assertions
- **0** `@ts-ignore` or `@ts-nocheck` comments
- **2** `Record<string, any>` patterns

The codebase has accumulated type safety issues primarily in three areas:
1. **External API boundaries** - Navigator API, web-vitals library, Mapbox GeoJSON
2. **Test mocks** - Jest test files using `any` for flexibility
3. **Dynamic frontmatter** - CMS content with flexible schemas

## Issues by File

### Production Code Issues

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/lib/performance.ts`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 8 | `gtag(...args: any[]): void` - Global gtag function declaration | MEDIUM - Define proper gtag parameter types |
| 63 | `const handleMetric = (metric: any)` - web-vitals callback | EASY - Import `Metric` type from web-vitals |
| 126 | `(window as any).va.track` - Vercel Analytics | MEDIUM - Declare VA interface or use optional chaining |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/lib/team.ts`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 17 | `[key: string]: any` in TeamMember interface | HARD - Define explicit optional fields |
| 26 | `[key: string]: any` in TeamGroup interface | HARD - Define explicit optional fields |
| 39 | `const content: any[]` - Content array | EASY - Define content item interface |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/lib/content-core.ts`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 7 | `frontmatter: Record<string, any>` in ContentItem | HARD - Requires schema-aware typing |
| 14 | `frontmatter: Record<string, any>` in ContentMetadata | HARD - Requires schema-aware typing |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/hooks/use-connection-aware.ts`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 43 | `(navigator as any).connection` | MEDIUM - Declare NetworkInformation interface |
| 44 | `(navigator as any).mozConnection` | MEDIUM - Declare NetworkInformation interface |
| 45 | `(navigator as any).webkitConnection` | MEDIUM - Declare NetworkInformation interface |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/components/shared/colonial-data-explorer.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 204 | `onValueChange={(value: any) => setActiveView(value)}` | EASY - Use proper union type |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/components/ui/optimized-image.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 187 | `(imageProps as any).placeholder = 'blur'` | EASY - Use type-safe property assignment |
| 188 | `(imageProps as any).blurDataURL = ...` | EASY - Use type-safe property assignment |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/components/ui/responsive-picture.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 66 | `const imageProps: any = { ... }` | EASY - Use OptimizedImageProps type |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/components/features/tapestries/interactive-colonies-map.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 81 | `useState<any>(null)` - geoJsonData state | MEDIUM - Define GeoJSON feature collection type |
| 82 | `useState<any>(null)` - hoveredColony state | MEDIUM - Define colony feature type |
| 83 | `useState<any>(null)` - selectedColony state | MEDIUM - Define colony properties type |
| 116 | `(feature: any)` in filter callback | MEDIUM - Define GeoJSON feature type |
| 124 | `(feature: any)` in map callback | MEDIUM - Define GeoJSON feature type |

### Test File Issues

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/__tests__/component-integrity.test.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 20 | `(props: any)` - Mock Image component | LOW PRIORITY - Test file |
| 25 | `({ children, ...props }: any)` - Mock Link component | LOW PRIORITY - Test file |
| 135 | `items?: any[]` - Test prop type | LOW PRIORITY - Test file |
| 136 | `config?: any` - Test prop type | LOW PRIORITY - Test file |
| 157 | `{ items: any[] }` - Test component prop | LOW PRIORITY - Test file |

#### `/Users/richardlyon/dev/projects/americas_tapestry/src/__tests__/mobile-optimization.test.tsx`
| Line | Issue | Fix Complexity |
|------|-------|----------------|
| 31 | Mock component with `any` props | LOW PRIORITY - Test file |
| 52 | `connection?: any` in mock | LOW PRIORITY - Test file |
| 96, 112, 127, 135, 157, 176, 192, 244, 287, 354, 395, 538, 569, 581 | Various `} as any);` patterns for mocking window/navigator | LOW PRIORITY - Test file |

## Recommended Fixes

### Group 1: Easy Fixes (No External Dependencies)

**1. Fix colonial-data-explorer.tsx value type**
```typescript
// Before
onValueChange={(value: any) => setActiveView(value)}

// After
onValueChange={(value: 'timeline' | 'grid' | 'summary') => setActiveView(value)}
```

**2. Fix optimized-image.tsx property assignments**
```typescript
// Before
(imageProps as any).placeholder = 'blur';
(imageProps as any).blurDataURL = getContextualBlurPlaceholder(currentSrc);

// After - Define complete type including optional properties
interface ExtendedImageProps extends ImageProps {
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const imageProps: ExtendedImageProps = { ... };
if (shouldUseBlurPlaceholder && !('placeholder' in props)) {
  imageProps.placeholder = 'blur';
  imageProps.blurDataURL = getContextualBlurPlaceholder(currentSrc);
}
```

**3. Fix responsive-picture.tsx imageProps type**
```typescript
// Before
const imageProps: any = { ... };

// After
const imageProps: Partial<OptimizedImageProps> = { ... };
```

**4. Fix team.ts content array type**
```typescript
// Before
const content: any[] = [];

// After
interface TeamContentItem {
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
}
const content: TeamContentItem[] = [];
```

### Group 2: Medium Fixes (Require Type Definitions)

**1. Create NetworkInformation type for use-connection-aware.ts**
```typescript
// Add to src/types/web-api.d.ts
interface NetworkInformation extends EventTarget {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

interface NavigatorNetworkInformation {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

declare global {
  interface Navigator extends NavigatorNetworkInformation {}
}
```

**2. Import web-vitals types for performance.ts**
```typescript
// Before
const handleMetric = (metric: any) => { ... }

// After
import type { Metric } from 'web-vitals';
const handleMetric = (metric: Metric) => { ... }
```

**3. Define GeoJSON types for interactive-colonies-map.tsx**
```typescript
// Add custom types
interface ColonyProperties {
  NAME: string;
  name?: string;
  slug?: string;
  status?: string;
  details?: string;
}

interface ColonyFeature extends GeoJSON.Feature<GeoJSON.Geometry, ColonyProperties> {}

interface ColonyFeatureCollection extends GeoJSON.FeatureCollection<GeoJSON.Geometry, ColonyProperties> {}

// Use in state
const [geoJsonData, setGeoJsonData] = useState<ColonyFeatureCollection | null>(null);
const [hoveredColony, setHoveredColony] = useState<ColonyFeature | null>(null);
```

**4. Declare gtag and Vercel Analytics types**
```typescript
// Add to src/types/analytics.d.ts
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_map?: Record<string, string>;
  [key: string]: unknown;
}

declare function gtag(
  command: 'event',
  eventName: string,
  params?: GtagEventParams
): void;

interface VercelAnalytics {
  track(eventName: string, properties?: Record<string, unknown>): void;
}

declare global {
  interface Window {
    va?: VercelAnalytics;
  }
}
```

### Group 3: Hard Fixes (Architectural Changes)

**1. Type-safe frontmatter handling**

The `[key: string]: any` pattern in TeamMember and TeamGroup interfaces allows flexible frontmatter but bypasses type checking. Options:

**Option A: Explicit optional fields (Recommended)**
```typescript
interface TeamMember {
  slug: string;
  name: string;
  role: string;
  content: string;
  groupSlug: string;
  imagePosition?: string;
  state?: string;
  states?: string[];
  moreInformation?: string;
  images?: string[];
  order?: number;
  visible?: boolean;
  // Remove index signature
}
```

**Option B: Unknown type with type guards**
```typescript
interface TeamMember {
  slug: string;
  name: string;
  // ... required fields
  additionalFields?: Record<string, unknown>;
}

// Use type guard for access
function getTeamMemberField<T>(member: TeamMember, key: string): T | undefined {
  return member.additionalFields?.[key] as T | undefined;
}
```

**2. Content-core frontmatter typing**

Replace `Record<string, any>` with `Record<string, unknown>` as a minimum improvement, then use type guards:

```typescript
// Minimal improvement
frontmatter: Record<string, unknown>;

// With type guard utilities
function getFrontmatterString(fm: Record<string, unknown>, key: string): string | undefined {
  const value = fm[key];
  return typeof value === 'string' ? value : undefined;
}
```

## Priority Order

### Phase 1: Quick Wins (1-2 hours)
1. **colonial-data-explorer.tsx:204** - Simple type annotation fix
2. **optimized-image.tsx:187-188** - Use proper type instead of assertion
3. **responsive-picture.tsx:66** - Use Partial<OptimizedImageProps>
4. **team.ts:39** - Define content array type

### Phase 2: Type Definitions (2-4 hours)
5. **Create src/types/web-api.d.ts** - NetworkInformation types
6. **Create src/types/analytics.d.ts** - gtag and Vercel Analytics types
7. **performance.ts:63** - Import web-vitals Metric type
8. **use-connection-aware.ts:43-45** - Use declared types

### Phase 3: GeoJSON Types (2-3 hours)
9. **interactive-colonies-map.tsx** - Define colony feature types
10. Replace all `any` state types with proper GeoJSON types

### Phase 4: Frontmatter Refactoring (4-6 hours)
11. **team.ts:17,26** - Define explicit TeamMember/TeamGroup fields
12. **content-core.ts:7,14** - Upgrade to `Record<string, unknown>`
13. Add type guard utilities for safe frontmatter access

### Phase 5: Test File Cleanup (Optional, 1-2 hours)
14. Consider defining shared mock types for test files
15. Low priority - test file `any` usage is acceptable

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Issue identification | HIGH | Direct code analysis via grep |
| Fix complexity ratings | HIGH | Based on code structure review |
| Recommended fixes | HIGH | Standard TypeScript patterns |
| Priority ordering | MEDIUM | Based on risk/effort balance |

## Metrics After Fixes

If all production code fixes are implemented:
- `any` annotations: 22 -> 2 (only in test mocks)
- `as any` assertions: 19 -> 0 in production code
- Type coverage improvement: Estimated +15-20%

## Related Files to Create

1. `/Users/richardlyon/dev/projects/americas_tapestry/src/types/web-api.d.ts` - Browser API extensions
2. `/Users/richardlyon/dev/projects/americas_tapestry/src/types/analytics.d.ts` - Analytics types
3. `/Users/richardlyon/dev/projects/americas_tapestry/src/types/geojson.d.ts` - Extended GeoJSON types (optional, can use @types/geojson)
