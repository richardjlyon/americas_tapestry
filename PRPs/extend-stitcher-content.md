# PRP: Extend Stitcher Content with Multiple Images Support

## Overview
Extend the stitcher content management system to support multiple images per stitcher profile, migrate pending stitcher biographies from `content/team/stitchers/to-add/` to the main stitchers directory, and enhance the UI to display image galleries with lightbox functionality.

## Problem Statement
Based on comprehensive analysis of the current codebase and to-add directory:

### Current Limitations
1. **Single Image Per Stitcher**: Current system only supports one image per team member via hardcoded path pattern `/images/team/stitchers/{slug}.jpg`
2. **Pending Stitcher Content**: 11 stitcher biographies with multiple images (2-6 images each) waiting to be migrated from `to-add/` directory
3. **No Multi-Image Support**: TeamMember model and UI components lack support for image galleries or multiple image display

### Current System Analysis
**Image Handling** (`src/components/features/tapestries/team-card.tsx:37-51`):
```typescript
const getImageSrc = (member: TeamMember) => {
  // All team images follow the nested directory structure that mirrors content organization
  // /images/team/{groupSlug}/{memberSlug}.jpg
  return `/images/team/${member.groupSlug}/${member.slug}.jpg`;
};
```

**TeamMember Model** (`src/lib/team.ts:6-17`):
```typescript
export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  content: string;
  groupSlug: string;
  imagePosition?: string; // Control image positioning
  state?: string;
  // No support for multiple images
  [key: string]: any;
}
```

**Frontmatter Schema** (`content/team/SCHEMA.md:88-91`):
```yaml
# Image Handling
- Images are automatically loaded from: `/public/images/team/[group]/[member]/[member].jpg`
- Use `imagePosition` to adjust image cropping if needed
```

## Research Findings

### External Best Practices (2025)
- **Markdown Frontmatter Arrays**: Modern pattern uses YAML arrays in frontmatter: `images: ['image1.jpg', 'image2.jpg']`
- **Next.js Image Optimization**: Leverage Next.js Image component with proper `sizes` prop for responsive loading
- **Gallery Patterns**: Industry standard includes image metadata (alt text, captions) alongside src paths

### Codebase Patterns
- **Content Processing**: Uses `gray-matter` for frontmatter parsing (standard industry practice)
- **Image Lightbox**: Existing `ImageLightbox` component available in `src/components/ui/image-lightbox.tsx`
- **Testing Infrastructure**: Jest for unit tests, Playwright for E2E validation at `http://localhost:3001/team/stitchers`

## Implementation Blueprint

### Phase 1: Extend TeamMember Model & Schema

**1.1 Update TeamMember Interface** (`src/lib/team.ts`):
```typescript
export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  content: string;
  groupSlug: string;
  imagePosition?: string;
  state?: string;
  images?: string[]; // NEW: Support multiple images
  [key: string]: any;
}
```

**1.2 Update Schema Documentation** (`content/team/SCHEMA.md`):
```yaml
# Multi-Image Support
images: string[]         # Optional array of image filenames (e.g., ['portrait.jpg', 'work1.jpg'])
```

### Phase 2: Migrate Content from to-add Directory

**2.1 Process Each Stitcher Directory**:
For each directory in `content/team/stitchers/to-add/`:
- Extract name from directory (e.g., "Brunilda Rodriguez" → "brunilda-rodriguez")
- Read bio content from `bio copy*.md` files
- Create proper frontmatter with `name`, `role: "Stitcher"`, and `images` array
- Move images to `public/images/team/stitchers/` with descriptive names

**2.2 Content Processing Pattern**:
```yaml
---
name: "Brunilda Rodriguez"
role: "Stitcher"
state: "New Jersey"
images: ["brunilda-rodriguez-portrait.jpg", "brunilda-rodriguez-work1.jpg", "brunilda-rodriguez-work2.jpg"]
---

Brunilda Rodriguez is an embroiderer on the New Jersey tapestry panel...
```

**2.3 Image Processing Strategy**:
- Rename images from cryptic names to descriptive format: `{slug}-{description}.{ext}`
- Optimize images for web (ensure reasonable file sizes)
- Maintain original quality for lightbox display

### Phase 3: Update UI Components for Multi-Image Support

**3.1 Enhance MemberCard Component** (`src/components/features/team/member-card.tsx`):

For **Grid Variant** (line 86):
- Keep single primary image for grid view (use first image in array)
- Add subtle indicator for multiple images (e.g., "+3 more" overlay)

For **Full Variant** (line 199):
- Replace single image section with image gallery
- Use horizontal scrollable grid for multiple images
- Each image clickable for lightbox
- Maintain existing responsive layout

**3.2 Implementation Pattern**:
```typescript
// Enhanced getImageSrc function
const getImageSrc = (member: TeamMember, imageIndex: number = 0) => {
  const images = member.images || [`${member.slug}.jpg`];
  return `/images/team/${member.groupSlug}/${images[imageIndex]}`;
};

// Gallery component for full variant
const ImageGallery = ({ member }: { member: TeamMember }) => {
  const images = member.images || [`${member.slug}.jpg`];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
      {images.map((image, index) => (
        <Image
          key={index}
          src={getImageSrc(member, index)}
          alt={`${member.name} ${index + 1}`}
          className="cursor-pointer hover:opacity-90"
          onClick={() => openLightbox(index)}
        />
      ))}
    </div>
  );
};
```

**3.3 Backwards Compatibility**:
- If `images` array is empty/undefined, fall back to current single image pattern
- Existing stitchers without `images` frontmatter continue working unchanged
- New stitchers can use either single image (current) or multiple images (new)

### Phase 4: Image Optimization & Path Management

**4.1 Image Path Strategy**:
- **Primary image**: `/images/team/stitchers/{slug}.jpg` (backwards compatible)
- **Additional images**: `/images/team/stitchers/{slug}-{descriptor}.jpg`
- **Fallback handling**: Graceful degradation if images missing

**4.2 Image Processing Workflow**:
```typescript
// Enhanced image loading with error handling
const ImageWithFallback = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setImgSrc('/images/placeholders/placeholder-user.jpg');
    }
  };

  return <Image src={imgSrc} alt={alt} onError={handleError} {...props} />;
};
```

## Task Implementation Order

### Phase 1: Foundation (30 minutes)
1. **Update TeamMember interface** in `src/lib/team.ts` to include `images?: string[]`
2. **Update SCHEMA.md** to document multiple images frontmatter pattern
3. **Create utility functions** for image path resolution with backwards compatibility

### Phase 2: Content Migration (60 minutes)
4. **Process Brunilda Rodriguez** (test case with 3 images)
   - Create `content/team/stitchers/brunilda-rodriguez/index.md`
   - Move and rename images to `public/images/team/stitchers/`
   - Test single stitcher implementation
5. **Batch process remaining 10 stitchers**
   - Joan Flanigan-Clarke (4 images)
   - Mary W. Cohn (5 images)
   - Corinne Burr (4 images)
   - Thomas E. Shaw Gardner (2 images)
   - Cheryl Schwarz (3 images)
   - Others (1-2 images each)

### Phase 3: UI Enhancement (45 minutes)
6. **Update MemberCard full variant** to support image galleries
7. **Add lightbox navigation** for multiple images
8. **Enhance grid variant** with multiple image indicators
9. **Test responsive behavior** across device sizes

### Phase 4: Testing & Validation (30 minutes)
10. **Run component integrity tests** to ensure no regressions
11. **Playwright E2E validation** at `http://localhost:3001/team/stitchers`
12. **Manual testing** of image loading, lightbox, responsive behavior

## Validation Gates (Executable)

### Development Environment Tests
```bash
# Lint and type checking
npm run format
npm run build

# Unit tests for component integrity
npm run test:components

# E2E validation of stitchers page
npm run test:e2e

# Quick smoke test
npm run test:quick
```

### Manual Validation Checklist
- [ ] All 11 new stitchers appear in stitchers grid
- [ ] Single-image stitchers still work (backwards compatibility)
- [ ] Multi-image stitchers show gallery in full view
- [ ] Lightbox works with navigation between images
- [ ] Mobile responsive behavior intact
- [ ] Images load with proper fallbacks
- [ ] No broken links or missing images

## Critical Context for AI Implementation

### Essential URLs & Documentation
- **Next.js Image Component**: https://nextjs.org/docs/app/guides/images
- **Gray-matter frontmatter parsing**: https://github.com/jonschlinkert/gray-matter
- **Markdown frontmatter arrays**: https://stackoverflow.com/questions/67072022/how-can-i-display-a-frontmatter-array-with-next-js-and-mdx

### Key Files to Reference
- **TeamMember interface**: `src/lib/team.ts:6-17`
- **MemberCard component**: `src/components/features/team/member-card.tsx`
- **Existing stitcher example**: `content/team/stitchers/alison-haigis/index.md`
- **Image lightbox component**: `src/components/ui/image-lightbox.tsx`
- **Schema documentation**: `content/team/SCHEMA.md`

### Implementation Gotchas
1. **Image paths**: Must follow exact pattern `/images/team/stitchers/{filename}`
2. **Frontmatter arrays**: Use YAML array syntax `images: ['img1.jpg', 'img2.jpg']`
3. **Backwards compatibility**: Always check for `images` array existence before using
4. **Image optimization**: Use Next.js Image component with proper `sizes` prop
5. **Mobile responsiveness**: Test gallery layout on different screen sizes

### Error Handling Strategy
- **Missing images**: Graceful fallback to placeholder
- **Empty images array**: Fall back to single image pattern `{slug}.jpg`
- **Invalid frontmatter**: Provide sensible defaults for required fields
- **Large images**: Ensure proper loading states and optimization

## Success Metrics
- **Content Migration**: All 11 stitchers successfully migrated with proper frontmatter
- **UI Enhancement**: Multi-image galleries functional with lightbox navigation
- **Backwards Compatibility**: Existing stitchers continue working without changes
- **Performance**: No regression in page load times or image loading
- **Testing**: All existing tests pass + new E2E validation confirms functionality

## Confidence Score: 9/10

This PRP provides comprehensive context for one-pass implementation success through:
- ✅ Complete codebase analysis with specific file references
- ✅ External research on modern Next.js patterns
- ✅ Backwards-compatible implementation strategy
- ✅ Executable validation gates using existing test infrastructure
- ✅ Clear task breakdown with time estimates
- ✅ Detailed error handling and edge case coverage
- ✅ Real file examples and code snippets for reference

The high confidence score reflects thorough research, existing lightbox component availability, established testing patterns, and a clear migration strategy that maintains system stability while adding powerful new functionality.