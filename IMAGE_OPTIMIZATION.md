# Image Optimization for America's Tapestry Website

## 📋 Overview

This document explains the optimized approach for handling images in the America's Tapestry website to resolve the Vercel deployment issues.

## 🔧 Key Changes

1. Modified build configuration to exclude large media files from serverless bundles
2. Enabled Next.js built-in image optimization
3. Added Vercel-specific configurations
4. Added utility functions for standardizing image paths
5. Updated components to use Next.js's `<Image>` component

## 🚨 Vercel Size Limit Issue

The previous approach was hitting Vercel's serverless function size limit (250MB) because:
- Content files were being included in the function bundle
- Image assets were duplicated in the public directory
- The default file tracing was including all content files

## 📂 Image Storage Structure

### Before:
- Images stored in `/content/[type]` directories
- Build-time script copied images to `/public/images/[type]`
- Regular HTML `<img>` tags referenced paths in `/public`

### After:
- Images remain in `/content/[type]` directories
- Next.js directly optimizes images on-demand
- No build-time copying (except for videos)
- Components use Next.js `<Image>` component
- Vercel configuration handles the content directory properly

## 🛠️ Technical Implementation

1. **Next.js Configuration**:
   - Added `output: 'standalone'` for optimized Vercel deployment
   - Configured `outputFileTracingExcludes` to exclude content directories from bundles
   - Enabled built-in image optimization with appropriate settings

2. **Vercel Configuration**:
   - Added `vercel.json` with appropriate caching rules
   - Configured proper handling of content files
   - Added cache headers for optimized images

3. **Image Utilities**:
   - Created helper functions for standardizing paths
   - Added responsive sizes presets
   - Implemented a custom image loader for better control

## 🚀 Benefits

1. **Smaller serverless functions**: By excluding media files from function bundles
2. **Better performance**: Next.js image optimization provides:
   - Automatic WebP/AVIF conversion
   - Responsive sizing
   - Lazy loading
   - Reduced layout shifts
3. **Simplified build process**: No duplicate file handling
4. **Faster deployments**: No copying large files during build

## 🖼️ Image Component Usage

```tsx
import Image from 'next/image';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

// For content images (recommended approach)
<div className="relative aspect-[16/9]">
  <Image
    src={getImagePath(imagePath)}
    alt="Description"
    fill
    sizes={getImageSizes('feature')}
    className="object-cover"
  />
</div>

// For fixed size images
<Image 
  src={getImagePath(imagePath)}
  alt="Description"
  width={800}
  height={600}
/>
```

## 🎬 Video Files

For video content:
- Video files are still copied to public directory
- Use the `getVideoPath()` helper function for correct paths
- Consider using adaptive streaming solutions for large videos

## 🔍 Troubleshooting

If you encounter deployment issues:
1. Check Vercel build logs for specific errors
2. Ensure all components use next/image instead of HTML img tags
3. Verify paths are correctly formatted using the util functions
4. For unusually large media files, consider hosting them externally