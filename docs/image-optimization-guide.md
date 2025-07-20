# Image Optimization Guide - America's Tapestry

## Overview

This project uses an automated image optimization system that generates responsive variants of tapestry images to dramatically improve loading performance. Original 15MB+ JPEG files are converted into multiple optimized formats and sizes.

## Performance Results

- **File Size Reduction**: 80-99% smaller files (15MB → 300KB typical)
- **Formats Generated**: AVIF, WebP, JPG variants for maximum browser compatibility
- **Responsive Sizes**: 640w, 1024w, 1920w, 2560w for different viewports
- **Space Saved**: 97MB of disk space by removing original files

## How to Generate Optimized Images

### For New Tapestry Images

1. **Add Original Images** to the appropriate directory:
   ```
   public/images/tapestries/[state-name]/[state-name]-tapestry-main.jpg
   public/images/tapestries/[state-name]/[state-name]-tapestry-thumbnail.jpg
   ```

2. **Run the Optimization Script**:
   ```bash
   node scripts/generate-responsive-images.mjs
   ```

3. **Verify Generation**:
   ```bash
   # Check that variants were created
   ls public/images/tapestries/[state-name]/
   
   # Should see files like:
   # [state-name]-tapestry-main-640w.webp
   # [state-name]-tapestry-main-1024w.avif
   # etc.
   ```

4. **Remove Original Large Files** (optional but recommended):
   ```bash
   # After confirming variants work
   rm public/images/tapestries/[state-name]/[state-name]-tapestry-main.jpg
   ```

### Generated Variants

The script automatically creates these optimized versions:

**For Main Images (`*-main.*`)**:
- `image-640w.avif` / `image-640w.webp` / `image-640w.jpg` (mobile)
- `image-1024w.avif` / `image-1024w.webp` / `image-1024w.jpg` (tablet/desktop)
- `image-1920w.avif` / `image-1920w.webp` / `image-1920w.jpg` (large screens)
- `image-2560w.avif` / `image-2560w.webp` / `image-2560w.jpg` (high-res displays)

**For Thumbnails (`*-thumbnail.*`)**:
- `image-200w.*`, `image-400w.*`, `image-600w.*` variants

## Automatic Image Selection

The system automatically serves the best image format and size:

1. **Format Priority**: AVIF → WebP → JPG (based on browser support)
2. **Size Selection**: 1024w for main content, 640w for thumbnails
3. **Fallback System**: Gracefully degrades if variants are missing

## Usage in Components

### Dynamic Detection (Recommended)
The system automatically detects and uses optimized variants:

```tsx
// This automatically uses optimized variants
<OptimizedImage 
  src="/images/tapestries/georgia/georgia-tapestry-main.webp" 
  alt="Georgia Tapestry"
  role="hero" 
/>
```

### Manual Responsive Images
For maximum control:

```tsx
<ResponsivePicture
  src="/images/tapestries/georgia/georgia-tapestry-main.webp"
  alt="Georgia Tapestry" 
  role="hero"
  priority={true}
/>
```

## Content Updates

### Markdown Content
When referencing tapestry images in markdown, use the optimized variants:

```markdown
<!-- Good: Use optimized variant -->
![Connecticut Panel](/images/tapestries/connecticut/connecticut-tapestry-1024w.webp)

<!-- Avoid: Original large file -->
![Connecticut Panel](/images/tapestries/connecticut/connecticut-tapestry.jpeg)
```

## Maintenance

### Regular Optimization
Run the script periodically to ensure all new images have variants:

```bash
# Generate variants for any new images
node scripts/generate-responsive-images.mjs

# The script is incremental - it skips existing variants
```

### Cleanup Original Files
After confirming variants work correctly:

```bash
# Find and remove large original files
find public/images/tapestries -name "*.jpg" -o -name "*.jpeg" | \
grep -v "\-640w\|1024w\|1920w\|2560w" | \
xargs rm -v
```

### Verification Commands

```bash
# Check total tapestry directory size
du -sh public/images/tapestries

# Count variants generated
find public/images/tapestries -name "*-640w.webp" | wc -l

# Verify no broken references in content
grep -r "tapestries.*\.jpg\|tapestries.*\.jpeg" content/ || echo "All good!"
```

## Build Integration

The optimization is integrated into the development workflow:

1. **Development**: `npm run dev` - Uses existing variants or originals as fallback
2. **Production**: `npm run build` - Validates all image references
3. **Testing**: Clear browser cache to see optimized images load

## Troubleshooting

### Images Not Loading
- Check that optimized variants exist in the directory
- Verify file paths in markdown content
- Clear browser cache to see new images

### Build Failures
- Run `npm run build` to identify broken image references
- Update markdown content to use optimized variants
- Check console for specific missing files

### Performance Issues
- Verify AVIF/WebP variants are being served (check Network tab)
- Ensure original large files have been removed
- Confirm responsive sizes are appropriate for viewport

## File Structure

```
public/images/tapestries/
├── connecticut/
│   ├── connecticut-tapestry-640w.avif    # 289KB
│   ├── connecticut-tapestry-640w.webp    # 194KB  
│   ├── connecticut-tapestry-1024w.webp   # 468KB
│   └── connecticut-tapestry-1920w.webp   # 1.6MB
├── georgia/
│   ├── georgia-tapestry-main-640w.webp   # 118KB
│   └── georgia-tapestry-main-1024w.webp  # 224KB
└── [other-states]/
    └── [optimized-variants]
```

This system ensures fast loading times, excellent user experience, and efficient disk space usage across all devices and network conditions.