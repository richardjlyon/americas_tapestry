# PRP: Add Exhibitions Feature with Navbar Integration

## Context

Create a new "Exhibitions" section in the navbar between "Team" and "News" that displays exhibition venue information. The feature will include a single page showing all exhibition venues in a card layout format, similar to existing pages but with a specific horizontal card design as shown in the visual guide.

## Current State

### Existing Structure
- **Content**: Exhibition data already exists at `content/exhibitions/` with 4 venues
- **Images**: Exhibition images already exist at `public/images/exhibitions/`
- **Navbar**: Located at `src/components/layout/header.tsx` with navigation items array
- **Similar Pages**: Team (`src/app/team/page.tsx`) and News (`src/app/news/page.tsx`) follow established patterns

### Content Model Analysis
Exhibition data structure from `content/exhibitions/*/index.md`:
```yaml
---
name: "Millyard Museum"
state: "New Hampshire"
role: "exhibition"
address: "200 Bedford Street, Manchester, NH 03101"
startDate: "1 January 2027"
endDate: "28 April 2027"
moreInfo: "https://manchesterhistoric.org/millyard-museum/"
image: "millyard-museum.png"
---
```

### Visual Requirements
Based on `visual-guide-exhibitions.jpg`:
- Horizontal cards, one per row
- Image on left (~1/3 width)
- Content layout:
  - Date range in blue (e.g., "January 2027 - April 2027")
  - Venue name in large black text
  - State name in smaller text
  - Address
  - "More information -->" link in burgundy color

## Implementation Blueprint

### Phase 1: Create Exhibitions Library Module
Create `src/lib/exhibitions.ts` following the pattern from `src/lib/sponsors.ts` and `src/lib/team.ts`:

```typescript
import { getAllContent } from './content-core';

export interface Exhibition {
  slug: string;
  name: string;
  state: string;
  role: string;
  address: string;
  startDate: string;
  endDate: string;
  moreInfo?: string;
  image: string;
  imagePath: string;
  content: string;
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  // Use content-core to load exhibition data
  // Convert image field to imagePath using /images/exhibitions/
  // Sort by startDate
}
```

### Phase 2: Create Exhibition Card Component
Create `src/components/features/exhibitions/exhibition-card.tsx`:

```typescript
interface ExhibitionCardProps {
  exhibition: Exhibition;
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  // Horizontal layout matching visual guide
  // Left: Image with aspect ratio similar to visual guide
  // Right: Content with proper typography matching existing patterns
  // Date formatting and styling in blue
  // "More information -->" link in burgundy
}
```

### Phase 3: Create Exhibitions Page
Create `src/app/exhibitions/page.tsx` following pattern from `src/app/team/page.tsx`:

```typescript
import { getAllExhibitions } from '@/lib/exhibitions';
import { ExhibitionCard } from '@/components/features/exhibitions/exhibition-card';
import { PageSection } from '@/components/ui/page-section';

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();

  return (
    <>
      <h1 className="page-heading">Exhibitions</h1>
      <div className="lead-text text-center">
        Experience America's Tapestry at these exhibition venues across the original 13 states.
      </div>

      <PageSection paddingTop="small">
        <div className="space-y-6">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
          ))}
        </div>
      </PageSection>
    </>
  );
}
```

### Phase 4: Update Navigation
Update `src/components/layout/header.tsx`:

```typescript
const navigationItems = [
  { name: 'About', href: '/about' },
  { name: 'Tapestries', href: '/tapestries' },
  { name: 'Team', href: '/team' },
  { name: 'Exhibitions', href: '/exhibitions' }, // ADD THIS LINE
  { name: 'News', href: '/news' },
  { name: 'Sponsors', href: '/sponsors' },
  { name: 'Contact', href: '/contact' },
];
```

## File References

### Pattern Files to Follow
- **Page Structure**: `src/app/team/page.tsx:1-28` and `src/app/news/page.tsx:1-42`
- **Content Loading**: `src/lib/sponsors.ts:42-84` (getAllSponsors function)
- **Card Layout**: `src/components/features/sponsors/sponsor-card.tsx` (for card structure)
- **Content Core**: `src/lib/content-core.ts:21-104` (getAllContent function)
- **Image Handling**: `src/lib/image-utils.ts:13-29` (getImagePath function)

### Typography and Styling Patterns
From existing components:
- **Page Heading**: `"page-heading"` class (`src/app/team/page.tsx:9`)
- **Lead Text**: `"lead-text"` class (`src/app/news/page.tsx:15`)
- **Card Styling**: `"bg-white rounded-lg shadow-md border border-colonial-navy/10"` (`src/components/features/sponsors/sponsor-card.tsx:35-36`)
- **Typography**:
  - Large names: `"text-2xl font-bold text-colonial-navy"`
  - State/location: `"text-base text-colonial-navy/70"`
  - Links: `"text-link"` or `"text-colonial-burgundy hover:underline"`

### Date Formatting Requirements
From visual guide, dates should be formatted as "Month YYYY - Month YYYY" in blue text:
```typescript
function formatDateRange(startDate: string, endDate: string): string {
  // Convert "1 January 2027" to "January 2027"
  // Handle "31 August 2026" to "August 2026"
  // Return "January 2027 - April 2027"
}
```

## Tasks

1. **Create exhibitions library**
   ```bash
   # Create the lib file
   touch src/lib/exhibitions.ts
   ```

2. **Create exhibition card component**
   ```bash
   # Create component directory and file
   mkdir -p src/components/features/exhibitions
   touch src/components/features/exhibitions/exhibition-card.tsx
   ```

3. **Create exhibitions page**
   ```bash
   # Create page directory and file
   mkdir -p src/app/exhibitions
   touch src/app/exhibitions/page.tsx
   ```

4. **Update navigation**
   - Edit `src/components/layout/header.tsx:11-18` (navigationItems array)

5. **Implement date formatting utility**

6. **Style cards to match visual guide exactly**

## Validation Gates

```bash
# 1. TypeScript compilation
npm run build

# 2. Development server
npm run dev

# 3. Navigation verification
# - Check navbar shows "Exhibitions" between "Team" and "News"
# - Verify link navigates to /exhibitions

# 4. Page content verification
# - Visit http://localhost:3000/exhibitions
# - Verify all 4 exhibitions display
# - Check image loading (no 404 errors in console)
# - Verify horizontal card layout matches visual guide
# - Check date formatting displays correctly
# - Test "More information -->" links

# 5. Responsive testing
# - Test mobile responsiveness
# - Verify cards stack properly on small screens

# 6. Accessibility testing
# - Check keyboard navigation
# - Verify alt text on images
# - Test with screen reader
```

## Detailed Implementation Notes

### Content Loading Pattern
Following the exact pattern from `src/lib/sponsors.ts:42-84`:
- Use `getAllContent('exhibitions')` from content-core
- Map exhibition data to Exhibition interface
- Handle image path conversion using `getImagePath()`
- Sort by startDate for chronological order

### Image Handling
Following `src/lib/image-utils.ts:13-29`:
- Images already exist at `public/images/exhibitions/`
- Use `getImagePath()` to ensure proper path resolution
- Apply `getImageSizes('card')` for responsive sizing

### Card Layout Specifics
From visual guide analysis:
- Container: Full width with margin between cards
- Left side: Fixed aspect ratio image container (~1/3 width)
- Right side: Flex-grow content area (~2/3 width)
- Responsive: Stack vertically on mobile

### Typography Hierarchy
Matching existing patterns:
- Date: Small, blue text (similar to `text-colonial-navy` but blue variant)
- Name: Large, bold black (`text-2xl font-bold text-colonial-navy`)
- State: Medium gray (`text-base text-colonial-navy/70`)
- Address: Small gray (`text-sm text-colonial-navy/60`)
- Link: Burgundy with hover (`text-colonial-burgundy hover:underline`)

### Date Processing Algorithm
```typescript
function formatExhibitionDate(dateString: string): string {
  // Input: "1 January 2027" or "31 August 2026"
  // Output: "January 2027" or "August 2026"
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatExhibitionDate(startDate);
  const end = formatExhibitionDate(endDate);
  return `${start} - ${end}`;
}
```

## Gotchas and Considerations

### 1. Image Loading
- All exhibition images already exist at correct paths
- Use proper Next.js Image component with appropriate sizing
- Apply consistent aspect ratio for visual alignment

### 2. Date Handling
- Content uses full date strings ("1 January 2027")
- Visual guide shows month/year format ("January 2027 - April 2027")
- Need reliable date parsing for various input formats

### 3. Link Handling
- `moreInfo` field contains external URLs
- Use `target="_blank"` and `rel="noopener noreferrer"`
- Add external link icon if following other external link patterns

### 4. Mobile Responsiveness
- Cards must stack gracefully on small screens
- Image should resize appropriately
- Text hierarchy must remain readable

### 5. Content Structure
- Exhibition content directory already exists with proper structure
- No content migration needed
- Frontmatter fields are consistent across all exhibitions

### 6. Build Integration
- Follows existing Next.js App Router patterns
- Static generation compatible
- No dynamic routes needed for initial implementation

## External Resources

### Next.js Documentation
- **App Router Structure**: https://nextjs.org/docs/app/getting-started/project-structure
- **Page Components**: https://nextjs.org/docs/app
- **Image Component**: https://nextjs.org/docs/app/api-reference/components/image

### Reference Implementation Examples
- Similar card layouts: https://nextjsstarter.com/blog/nextjs-14-project-structure-best-practices/
- Content loading patterns: https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji

## Success Criteria

- [ ] "Exhibitions" appears in navbar between "Team" and "News"
- [ ] `/exhibitions` route displays all 4 exhibition venues
- [ ] Cards match visual guide layout exactly (horizontal, image left, content right)
- [ ] Date ranges display in blue as "Month YYYY - Month YYYY" format
- [ ] Images load correctly without 404 errors
- [ ] "More information -->" links work and open in new tabs
- [ ] Page is responsive on mobile devices
- [ ] TypeScript compiles without errors
- [ ] Build succeeds without warnings
- [ ] Navigation updates work on both desktop and mobile menus

## Implementation Timeline

1. **Setup (30 min)**: Create files and basic structure
2. **Library Implementation (45 min)**: Complete exhibitions.ts with proper typing
3. **Card Component (60 min)**: Implement horizontal card layout matching visual guide
4. **Page Implementation (30 min)**: Create exhibitions page with proper structure
5. **Navigation Update (15 min)**: Add exhibitions to navbar
6. **Styling Polish (45 min)**: Fine-tune to match visual guide exactly
7. **Testing & Validation (30 min)**: Comprehensive testing across devices and browsers

**Total Estimated Time**: 4 hours

## Confidence Score: 9/10

This implementation follows established patterns throughout the codebase. The content and images already exist, the component patterns are well-defined, and the visual requirements are clearly specified. The only complexity is ensuring the horizontal card layout matches the visual guide exactly, but this is achievable using existing Tailwind utilities and component patterns from the codebase.

The high confidence score reflects:
- Clear visual requirements with reference image
- Existing content and assets ready to use
- Well-established code patterns to follow
- Minimal external dependencies
- Straightforward page structure implementation