# PRP: Extend Stitching Groups with Multiple Images Support

## Context

The stitching-groups content model needs to be extended to support multiple images, following the same pattern used by the stitchers team members. Currently, stitching-groups have images stored in their content directories but they are not referenced in the frontmatter or displayed on the website.

## Current State

### Existing Stitching Group Structure
- Location: `content/team/stitching-groups/*/index.md`
- Current frontmatter fields:
  ```yaml
  ---
  name: "Group Name"
  role: "Stitching Group"
  state: "State Name"
  moreInformation: "URL"
  ---
  ```

### Existing Images
- Images are already present in each stitching group directory
- Examples:
  - `capital-district-chapter/5d352c24-d525-4b4d-9a88-c9206fd5f504.jpg`
  - `constellation-chapter/constellation-chapter-logo.jpg`
  - `dogwood-chapter/dogwood-chapter-logo.jpg`

### Target Pattern (from stitchers)
- Stitchers use an `images` array in frontmatter:
  ```yaml
  ---
  name: "Name"
  role: "Stitcher"
  state: "State"
  images: ["name-work1.jpg", "name-work2.jpg"]
  ---
  ```
- Images are stored in: `public/images/team/stitchers/`

## Implementation Blueprint

### Phase 1: Move Images to Public Directory
1. Create directory structure: `public/images/team/stitching-groups/`
2. Move all images from `content/team/stitching-groups/*/` to `public/images/team/stitching-groups/`
3. Rename images to follow consistent naming pattern

### Phase 2: Update Frontmatter
1. Add `images` array to each stitching group's `index.md`
2. Reference the renamed image files

### Phase 3: Verify Rendering
1. The existing `MemberCard` component already supports `images` array (line 16 in `/src/lib/team.ts`)
2. The component handles multiple images with indicators (lines 111-116 in `/src/components/features/team/member-card.tsx`)
3. Test the display at `http://localhost:3000/team/stitching-groups`

## File References

### Core Files to Review
- `/src/lib/team.ts` - Team member interface with `images?: string[]` support
- `/src/components/features/team/member-card.tsx` - Rendering component with multi-image support
- `/content/team/stitchers/thomas-e-shaw-gardner/index.md` - Example of images array usage

### Image Handling Pattern
From `member-card.tsx`:
```typescript
const getImageSrc = (imageIndex: number = 0) => {
  const images = member.images || [`${member.slug}.${imageExtension}`];
  return `/images/team/${member.groupSlug}/${images[imageIndex]}`;
};
```

## Tasks

1. **Create target directory**
   ```bash
   mkdir -p public/images/team/stitching-groups
   ```

2. **Move and rename images for each group**
   - capital-district-chapter: Move `5d352c24-d525-4b4d-9a88-c9206fd5f504.jpg`
   - colonial-west-jersey: Move `PHOTO-2025-08-14-12-46-21.jpg`
   - constellation-chapter: Move both jpg files
   - dogwood-chapter: Move `dogwood-chapter-logo.jpg`
   - hagerstown-chapter: Move `FullSizeRender-preview 2 copy.png`
   - hartford-stitch: Move `hartford-stitch-logo.png`
   - mayflower-historic-samplet-guild: Move `MA_Day_1_4 copy.jpg`
   - pioneer-valley-chapter: Move `IMG_7002.jpg`
   - princeton: Move `PHOTO-2025-07-04-12-44-10.jpg`
   - rose-and-thistle: Move `IMG_3624-preview 2.png`
   - the-stitchery: Move `the-stitchery-logo.jpg`
   - three-rivers-chapter: Move `IMG_072E6E405238-1.jpeg`

3. **Update each group's index.md with images array**

4. **Verify rendering at localhost:3000/team/stitching-groups**

## Validation Gates

```bash
# 1. Check TypeScript compilation
npm run build

# 2. Verify images are accessible
ls -la public/images/team/stitching-groups/

# 3. Test the site locally
npm run dev
# Navigate to http://localhost:3000/team/stitching-groups

# 4. Verify each group displays images correctly
# Check that images load without 404 errors in browser console
```

## Implementation Notes

- The existing codebase already supports the `images` array in the TeamMember interface
- The MemberCard component already handles multiple images with indicators
- Image extension handling is already in place (`.jpg` for most groups)
- The component shows "+N more" indicator for multiple images (line 113-115)
- No code changes needed - only content and file organization

## Gotchas

1. **File naming**: Some images have spaces in names (e.g., "FullSizeRender-preview 2 copy.png") - these need to be renamed with hyphens or underscores
2. **Image formats**: Mix of .jpg, .jpeg, and .png files - the component handles this
3. **Empty directory**: `public/images/team/stitching-groups/` currently exists but is empty

## Success Criteria

- [ ] All images moved to `public/images/team/stitching-groups/`
- [ ] All stitching group index.md files have `images` array in frontmatter
- [ ] Images display correctly on the stitching-groups page
- [ ] No 404 errors in browser console
- [ ] Build succeeds without errors

## Confidence Score: 9/10

This is a straightforward content migration task. The code infrastructure already fully supports multiple images. The only work needed is moving files and updating frontmatter, which follows an existing, proven pattern from the stitchers implementation.