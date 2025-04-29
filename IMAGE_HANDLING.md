# Image Handling in America's Tapestry Website

This document explains the simplified approach to image handling adopted in the project.

## Key Principles

1. **Store images directly in /public directory**
   - All images live in `/public/images/[type]/[item]/` folders
   - Videos are stored in `/public/video/`
   - This ensures files are statically served by Next.js without processing

2. **Use unoptimized Next.js images**
   - We use the Next.js Image component with `unoptimized` flag
   - This preserves layout benefits while avoiding optimization issues

3. **Consistent path handling**
   - All image paths are handled through the `getImagePath()` utility
   - This allows flexibility in path structure while maintaining compatibility

## Directory Structure

- `/public/images/tapestries/` - Tapestry images by state
- `/public/images/team/` - Team member images by group
- `/public/images/sponsors/` - Sponsor logos
- `/public/images/news/` - News article images
- `/public/video/` - Video files

## Migration 

The `migrate-images-to-public.mjs` script handles copying image files from the content directory to their appropriate public locations. This script runs during development and build processes.

## Path Handling

The `getImagePath()` function in `lib/image-utils.ts` handles all image path conversion. It supports multiple input formats:

```typescript
// Convert any path to a public path
getImagePath('/content/tapestries/georgia/georgia.jpg')  // Returns '/images/tapestries/georgia/georgia.jpg'
getImagePath('content/team/project-director/john.jpg')   // Returns '/images/team/project-director/john.jpg'
getImagePath('/images/sponsors/coby/logo.png')          // Returns '/images/sponsors/coby/logo.png' (unchanged)
```

## Benefits of This Approach

1. **Simplicity** - Direct file serving without complex optimization
2. **Reliability** - Works consistently in all environments
3. **Performance** - Static files are efficiently served, especially with CDN
4. **Compatibility** - Works with Next.js while avoiding optimization issues

## Deployment Considerations

- Vercel automatically serves files from the public directory
- No special middleware or configuration is needed
- All images are part of the static build

## Usage in Components

```tsx
import Image from 'next/image';
import { getImagePath } from '@/lib/image-utils';

// Then in your component:
<Image 
  src={getImagePath(path)} 
  alt="Image description"
  width={400}
  height={300}
  unoptimized
/>
```

The `unoptimized` flag ensures direct file serving without Next.js Image Optimization.