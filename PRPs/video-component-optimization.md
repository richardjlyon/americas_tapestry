# PRP: Video Component Optimization with WebM Support

## Overview
Refactor video components and establish consistent naming conventions to support modern WebM format with MP4 fallback, optimizing bandwidth usage and improving video delivery performance across 13+ video series to be added to the site.

## Problem Statement

### Current Limitations
The existing video infrastructure has several issues that will impact the planned addition of 13 video series:

1. **Format Support**: Video components only support MP4 format
   - **VideoPlayer Component** (`src/components/shared/video-player.tsx:53`):
     ```typescript
     <source src={src} type="video/mp4" />
     ```
   - **Blog Post Content** (`src/components/features/news/blog-post-content.tsx:46`):
     ```typescript
     <source src={post.videoUrl} type="video/mp4" />
     ```

2. **Inconsistent Naming Convention**: Video files lack a standardized naming pattern
   - Existing: `250305-short-promotional-v2.mp4`, `250305-short-promotional-v2-lowres.mp4`
   - New files: `tapestry-talk-georgia.mp4`, `tapestry-talk-georgia.webm`
   - Poster images: Both `-poster.png` and `.jpg` extensions used

3. **Bandwidth Inefficiency**: WebM format typically provides 20-50% smaller file sizes than MP4 at equivalent quality, but is not being utilized despite being available (`public/video/250928-tapestry-talk-georgia/tapestry-talk-georgia.webm`)

4. **Frontmatter Convention**: Current `videoUrl` field only points to single MP4 file, no support for format variants

### Why This Matters
- **13 video series** planned = significant server storage and bandwidth costs
- WebM offers 20-50% better compression than MP4 at same quality
- Modern browsers (Chrome, Firefox, Edge) prefer WebM over MP4
- Safari and iOS still require MP4 fallback

## Success Criteria
- [ ] VideoPlayer component supports both WebM and MP4 formats
- [ ] Blog post video display supports both WebM and MP4 formats
- [ ] Established consistent naming convention for all video assets
- [ ] WebM served first to compatible browsers, MP4 fallback for others
- [ ] Existing videos continue to work without breaking changes
- [ ] Documentation for content creators on video naming convention
- [ ] All video components maintain current functionality (play/pause, poster, high-res link)

## Technical Context

### Browser Support (2025)
Based on research, current browser landscape:
- **WebM Support**: Chrome, Firefox, Edge, Opera (VP8/VP9 codecs)
- **MP4 Support**: All browsers including Safari, iOS
- **Recommendation**: List WebM first, MP4 second for optimal fallback

**Reference**:
- MDN Video Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- WebM vs MP4: https://cloudinary.com/guides/video-formats/webm-format-what-you-should-know

### HTML5 Video Source Ordering
```html
<!-- CORRECT: WebM first for modern browsers -->
<video>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

Browser behavior: Tries first source; if unsupported, tries next. WebM is preferred for bandwidth savings.

### Current Video Architecture

**VideoPlayer Component** (`src/components/shared/video-player.tsx`):
- ✅ Custom play/pause controls with state management
- ✅ Poster image support
- ✅ High-res video link button
- ✅ Mobile-responsive design
- ✅ Low-res/high-res video support via `src` and `highResSrc` props
- ❌ Only supports MP4 format

**Blog Post Content** (`src/components/features/news/blog-post-content.tsx:39-50`):
- ✅ Conditional rendering based on `videoUrl` frontmatter
- ✅ Native HTML5 controls
- ✅ Poster from post image
- ❌ Only supports MP4 format

**Content Type Interface** (`src/lib/blog.ts:7-18`):
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
  image: string;
  excerpt: string;
  content: string;
  author?: string;
  videoUrl?: string;  // Currently single URL
}
```

### Existing Video Files Analysis
```
public/video/
  250305-short-promotional/
    250305-short-promotional-v2.mp4          # High-res MP4
    250305-short-promotional-v2-lowres.mp4   # Low-res MP4
    250305-short-promotional-v2-poster.png   # Poster image
    250305-short-promotional-v2-poster-landscape.png

  250928-tapestry-talk-georgia/
    tapestry-talk-georgia.mp4                # High-res MP4
    tapestry-talk-georgia.webm               # High-res WebM ✅ Already exists!
    tapestry-talk-georgia.jpg                # Poster image
```

**Key Observation**: The Georgia video already has WebM format but components don't use it!

## Implementation Blueprint

### Step 1: Define Video Naming Convention

**Standardized Naming Pattern**:
```
public/video/{date-description}/
  {base-name}.webm              # Primary high-res (WebM, modern browsers)
  {base-name}.mp4               # Fallback high-res (MP4, all browsers)
  {base-name}-lowres.webm       # Optional low-res WebM
  {base-name}-lowres.mp4        # Optional low-res MP4
  {base-name}-poster.{jpg|png}  # Poster frame (prefer .jpg for photos)
```

**Examples**:
```
tapestry-talk-georgia.webm
tapestry-talk-georgia.mp4
tapestry-talk-georgia-poster.jpg

short-promotional.webm
short-promotional.mp4
short-promotional-lowres.webm
short-promotional-lowres.mp4
short-promotional-poster.png
```

**Migration Strategy**: Existing videos work as-is (MP4 only); new videos follow convention

### Step 2: Update VideoPlayer Component Interface

**Current Interface** (`src/components/shared/video-player.tsx:8-13`):
```typescript
interface VideoPlayerProps {
  src: string;           // Low-res MP4
  highResSrc: string;    // High-res MP4
  poster?: string;
  className?: string;
}
```

**New Interface** (backward compatible):
```typescript
interface VideoSource {
  webm?: string;
  mp4: string;  // Required for fallback
}

interface VideoPlayerProps {
  // New unified approach
  sources: {
    standard: VideoSource;   // Standard quality (replaces 'src')
    highRes?: VideoSource;   // Optional high-res (replaces 'highResSrc')
  };
  poster?: string;
  className?: string;

  // DEPRECATED: Keep for backward compatibility
  src?: string;
  highResSrc?: string;
}
```

### Step 3: Update VideoPlayer Component Implementation

**Pseudocode**:
```typescript
export function VideoPlayer({ sources, src, highResSrc, poster, className }: VideoPlayerProps) {
  // 1. Handle backward compatibility
  const videoSources = sources ?? {
    standard: { mp4: src! },
    highRes: highResSrc ? { mp4: highResSrc } : undefined
  };

  // 2. Use standard quality for main player
  const mainSource = videoSources.standard;

  // 3. Render video with multiple source tags
  return (
    <div>
      <video ref={videoRef} poster={poster} onClick={togglePlay} playsInline>
        {/* WebM first for modern browsers */}
        {mainSource.webm && <source src={mainSource.webm} type="video/webm" />}
        {/* MP4 fallback for all browsers */}
        <source src={mainSource.mp4} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* High-res link button (if highRes provided) */}
      {videoSources.highRes && (
        <Button asChild>
          <a href={videoSources.highRes.webm || videoSources.highRes.mp4}>
            High Resolution
          </a>
        </Button>
      )}
    </div>
  );
}
```

**Reference Component**: `src/components/shared/video-player.tsx` (104 lines)

### Step 4: Update Blog Post Content Component

**Current Implementation** (`src/components/features/news/blog-post-content.tsx:39-50`):
```typescript
{post.videoUrl && (
  <video className="w-full aspect-video" controls>
    <source src={post.videoUrl} type="video/mp4" />
  </video>
)}
```

**New Implementation**:
```typescript
{post.videoUrl && (
  <video className="w-full aspect-video" controls preload="metadata" poster={post.image}>
    {/* Try WebM first (assume .webm exists if following convention) */}
    <source
      src={post.videoUrl.replace(/\.(mp4|webm)$/, '.webm')}
      type="video/webm"
    />
    {/* Fallback to MP4 */}
    <source
      src={post.videoUrl.replace(/\.webm$/, '.mp4')}
      type="video/mp4"
    />
    Your browser does not support the video tag.
  </video>
)}
```

**Alternative Approach** (cleaner, if updating frontmatter):
```typescript
// If we add videoWebm field to BlogPost interface
{(post.videoWebm || post.videoUrl) && (
  <video className="w-full aspect-video" controls>
    {post.videoWebm && <source src={post.videoWebm} type="video/webm" />}
    {post.videoUrl && <source src={post.videoUrl} type="video/mp4" />}
  </video>
)}
```

### Step 5: Update BlogPost Type (Optional but Recommended)

**Current Type** (`src/lib/blog.ts:17`):
```typescript
videoUrl?: string;
```

**Enhanced Type**:
```typescript
videoUrl?: string;      // MP4 video URL (backward compatible)
videoWebm?: string;     // WebM video URL (optional, new)
videoPoster?: string;   // Optional custom poster (overrides 'image')
```

**Update Processing** (`src/lib/blog.ts:124`):
```typescript
allPosts.push({
  // ... existing fields
  videoUrl: data['videoUrl'] || undefined,
  videoWebm: data['videoWebm'] || undefined,     // NEW
  videoPoster: data['videoPoster'] || undefined,  // NEW
});
```

### Step 6: Update Content Creators Documentation

**Create/Update**: `docs/video-content-guide.md` or add to existing content documentation

**Content**:
```markdown
## Video Content Guidelines

### File Naming Convention
Store videos in: `public/video/{folder-name}/`

Required files:
- `{name}.webm` - WebM format (primary, better compression)
- `{name}.mp4` - MP4 format (fallback for Safari/iOS)
- `{name}-poster.jpg` - Poster frame image

Optional files:
- `{name}-lowres.webm` - Low-resolution WebM for previews
- `{name}-lowres.mp4` - Low-resolution MP4 for previews

### Frontmatter Configuration

**For blog posts with video** (`content/news/videos/*.md`):
```yaml
---
title: "Video: Welcome to America's Tapestry"
date: "2025-03-11"
excerpt: "Watch our introductory video."
category: videos
image: "/video/250305-short-promotional/poster.jpg"
videoUrl: "/video/250305-short-promotional/short-promotional.mp4"
videoWebm: "/video/250305-short-promotional/short-promotional.webm"  # Optional
---
```

**For components using VideoPlayer**:
```tsx
<VideoPlayer
  sources={{
    standard: {
      webm: "/video/my-video/my-video.webm",
      mp4: "/video/my-video/my-video.mp4"
    }
  }}
  poster="/video/my-video/my-video-poster.jpg"
/>
```

### Video Encoding Recommendations
- WebM: VP9 codec, 1080p, ~2-4 Mbps
- MP4: H.264 codec, 1080p, ~4-6 Mbps
- Poster: JPG, 1920x1080, 80-85% quality

### Tools
- FFmpeg for video encoding
- Handbrake for batch conversions
```

## Implementation Tasks

1. **Update VideoPlayer Component** (`src/components/shared/video-player.tsx`)
   - [ ] Add new `VideoSource` and updated `VideoPlayerProps` interface
   - [ ] Update component logic to handle multiple source formats
   - [ ] Add backward compatibility for existing `src`/`highResSrc` props
   - [ ] Render multiple `<source>` tags in correct order (WebM first)
   - [ ] Update high-res link to prefer WebM if available

2. **Update Blog Post Content Component** (`src/components/features/news/blog-post-content.tsx`)
   - [ ] Add WebM source tag before MP4 source tag
   - [ ] Handle videoWebm field if present in frontmatter
   - [ ] Maintain backward compatibility with existing videoUrl-only posts

3. **Update BlogPost Type and Processing** (`src/lib/blog.ts`)
   - [ ] Add optional `videoWebm` field to `BlogPost` interface
   - [ ] Add optional `videoPoster` field to `BlogPost` interface
   - [ ] Update blog post processing to extract new fields from frontmatter

4. **Update Existing Video Usage** (`src/components/features/home/about-section.tsx`)
   - [ ] Migrate from old props to new `sources` prop structure
   - [ ] Or keep using old props (backward compatible)

5. **Test All Video Scenarios**
   - [ ] VideoPlayer with only MP4 (backward compat)
   - [ ] VideoPlayer with both WebM and MP4
   - [ ] VideoPlayer with low-res and high-res variants
   - [ ] Blog post video with only MP4
   - [ ] Blog post video with both WebM and MP4
   - [ ] Test in Chrome (WebM), Safari (MP4 fallback), Firefox (WebM)

6. **Documentation**
   - [ ] Create video content guidelines document
   - [ ] Add naming convention to project documentation
   - [ ] Update README if needed with video optimization info

## Validation Gates

### Build Validation
```bash
# Type checking
npm run type-check
# or
pnpm tsc --noEmit

# Build check
npm run build
# or
pnpm build
```

### Component Testing
```bash
# Visual inspection in dev mode
npm run dev
# Visit:
# - / (home page with VideoPlayer in about section)
# - /news (blog listing)
# - /news/231120-documentary-preview (video blog post)
```

### Browser Testing
Test in multiple browsers to verify format fallback:
- ✅ Chrome/Edge: Should load WebM
- ✅ Firefox: Should load WebM
- ✅ Safari/iOS: Should load MP4
- ✅ Check network tab to confirm correct format loading

### Validation Checklist
- [ ] TypeScript compilation succeeds
- [ ] Next.js build succeeds without errors
- [ ] Existing videos continue to play
- [ ] New multi-format videos play in all browsers
- [ ] WebM loads in Chrome/Firefox (check Network tab)
- [ ] MP4 loads in Safari (check Network tab)
- [ ] High-res link button works
- [ ] Poster images display correctly
- [ ] Play/pause controls work
- [ ] Mobile playback works (iOS Safari + Android Chrome)

## Migration Path

### For Existing Videos (Non-Breaking)
Existing videos using only MP4 continue to work:
```tsx
// This still works
<VideoPlayer
  src="/video/old-video.mp4"
  highResSrc="/video/old-video-hd.mp4"
  poster="/video/old-video-poster.png"
/>
```

### For New Videos (Recommended)
Use new multi-format approach:
```tsx
<VideoPlayer
  sources={{
    standard: {
      webm: "/video/new-video/new-video.webm",
      mp4: "/video/new-video/new-video.mp4"
    },
    highRes: {
      webm: "/video/new-video/new-video-hd.webm",
      mp4: "/video/new-video/new-video-hd.mp4"
    }
  }}
  poster="/video/new-video/new-video-poster.jpg"
/>
```

## Risks and Mitigations

### Risk 1: Breaking Existing Videos
**Mitigation**: Maintain backward compatibility in VideoPlayer props

### Risk 2: Missing WebM Files
**Mitigation**: Make WebM optional; always require MP4 as fallback

### Risk 3: Browser Support Issues
**Mitigation**: Test in all major browsers; MP4 ensures universal support

### Risk 4: Increased Complexity
**Mitigation**: Clear documentation and examples for content creators

## Expected Outcomes

### Performance Improvements
- 20-50% reduction in video bandwidth for WebM-supporting browsers
- Faster video loading for majority of users (80%+ use Chrome/Firefox/Edge)
- Reduced server bandwidth costs across 13+ video series

### Developer Experience
- Clear naming convention reduces confusion
- Backward compatible changes prevent breakage
- Well-documented pattern for future videos

### User Experience
- Faster video loading in modern browsers
- Seamless fallback for older browsers
- Consistent video experience across site

## References

### External Resources
- **HTML5 Video MDN**: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- **WebM Format Guide**: https://cloudinary.com/guides/video-formats/webm-format-what-you-should-know
- **Browser Compatibility**: https://caniuse.com/webm
- **Next.js Video Guide**: https://nextjs.org/docs/app/guides/videos

### Internal References
- VideoPlayer Component: `src/components/shared/video-player.tsx`
- Blog Post Content: `src/components/features/news/blog-post-content.tsx`
- About Section Usage: `src/components/features/home/about-section.tsx`
- Blog Post Type: `src/lib/blog.ts:7-18`
- Existing Videos: `public/video/`

## PRP Quality Score

**Confidence Level: 8.5/10**

**Strengths**:
- ✅ Clear implementation path with pseudocode
- ✅ Backward compatibility maintained
- ✅ Real examples from codebase referenced
- ✅ Browser support research included
- ✅ Validation gates are executable
- ✅ Multiple fallback strategies defined
- ✅ Existing pattern already partially implemented (Georgia video has WebM!)

**Moderate Risks**:
- ⚠️ Some testing required across browsers
- ⚠️ Documentation creation needed
- ⚠️ Content creator education needed

**Success Probability**: High - straightforward component updates with clear web standards support. The fact that WebM files already exist for one video demonstrates the pattern is viable.
