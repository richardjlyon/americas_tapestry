# Image Optimization for America's Tapestry Website

## 📋 Overview

This document explains the optimized approach for handling images in the America's Tapestry website.

## 🔧 Changes Made

1. Removed the build-time file copying script (`copy-to-public.mjs`)
2. Enabled Next.js built-in image optimization
3. Updated components to use Next.js's `Image` component
4. Simplified build process by removing unnecessary steps

## 📂 Image Storage Structure

### Before:
- Images stored in `/content/[type]` directories
- Build-time script copied images to `/public/images/[type]`
- Regular HTML `<img>` tags referenced paths in `/public`

### After:
- Images remain in `/content/[type]` directories
- Next.js directly serves and optimizes images from their original location
- No build-time copying needed
- Components use Next.js `<Image>` component

## 🚀 Benefits

1. **Reduced build size**: Images no longer copied to the build output
2. **Faster builds**: No additional copy step required
3. **Automatic optimization**: Next.js automatically:
   - Generates WebP/AVIF versions of images
   - Serves responsive sizes based on device
   - Lazy loads images for better performance
4. **Improved loading performance**: 
   - Prevents layout shifts with proper sizing
   - Loads images progressively with blur placeholders

## 🖼️ Image Usage Guide

### Basic Image Component

```tsx
import Image from 'next/image';

// For fixed size images
<Image 
  src="/content/tapestries/georgia/georgia-tapestry-main.webp" 
  alt="Georgia Tapestry"
  width={800}
  height={600}
  className="rounded-lg" 
/>

// For responsive/fill container images
<div className="relative aspect-[16/9]">
  <Image
    src="/content/tapestries/georgia/georgia-tapestry-main.webp"
    alt="Georgia Tapestry"
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover"
  />
</div>
```

### Key Props to Use

- **`src`**: Path to the image (can now point directly to content directory)
- **`alt`**: Descriptive alt text
- **`fill`**: For images that should fill their container
- **`sizes`**: Define image sizes at different breakpoints
- **`priority`**: Set to `true` for above-the-fold images
- **`quality`**: Control image quality (1-100, default 75)

## 🔄 Migrating Components

When updating components, follow this pattern:

1. Import the Image component: `import Image from 'next/image'`
2. Replace `<img>` tags with `<Image>` components
3. Add proper sizing (either `width/height` or `fill` with a relative parent)
4. Include the `sizes` attribute for responsive images
5. Set appropriate loading priority

## 🎬 Video Files

For video content:
- Keep using the copy script ONLY for video files or disable optimization for these files
- Video files remain in the public directory for direct serving

## 🛠️ Troubleshooting

If you encounter image-related issues:

1. Check that image paths are correct
2. Ensure parent containers have `position: relative` when using `fill`
3. Verify image dimensions for fixed-size images
4. Check Next.js logs for specific image optimization errors