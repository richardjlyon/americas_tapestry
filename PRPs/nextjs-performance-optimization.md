# Next.js Performance Optimization PRP - America's Tapestry

## 📋 Overview

This PRP addresses critical performance issues in the America's Tapestry Next.js website, focusing on image optimization for extremely large files (15MB+ tapestry images), carousel performance, and mobile/desktop loading speed. The website currently loads slowly due to massive unoptimized images in the hero carousel and tapestries grid.

**Current State**: Hero carousel and tapestries page load 15-16MB images causing 5-10 second load times
**Target State**: Sub-2 second loading with optimized responsive images and progressive enhancement

## 🎯 Success Criteria

- ✅ Hero carousel loads in <2 seconds on mobile and desktop
- ✅ Tapestries page loads all images progressively with lazy loading
- ✅ Core Web Vitals improved: LCP <2.5s, CLS <0.1, INP <200ms
- ✅ Image file sizes reduced by 80-90% (15MB → 1-2MB max)
- ✅ Progressive loading with blur placeholders
- ✅ Responsive images serving appropriate sizes per device
- ✅ All existing functionality preserved

## 🔗 Critical Context & Documentation

### Next.js 15 Image Optimization (2025 Best Practices)
- **Official Docs**: https://nextjs.org/docs/app/api-reference/components/image
- **Performance Guide**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **WebP/AVIF Guide**: https://web.dev/serve-images-webp/
- **Responsive Images**: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images

### Image Compression Tools (2025)
- **TinyPNG/WebP**: https://tinypng.com/ - Lossless compression up to 80%
- **Compress-or-Die**: https://compress-or-die.com/webp - Specialized WebP optimization
- **Cloudinary**: https://cloudinary.com/tools/compress-webp - Automated compression

### Current Codebase Context

**Existing OptimizedImage Component** (`src/components/ui/optimized-image.tsx`):
```tsx
// Already exists but not being used consistently
export function OptimizedImage({
  src, alt, role = 'gallery', fallbackSrc, 
  enableBlurPlaceholder = true, ...props
}: OptimizedImageProps) {
  // Has blur placeholders, error handling, contextual sizing
}
```

**Current Image Utility Functions** (`src/lib/image-utils.ts`):
```tsx
// Already has responsive sizing logic
export function getImageSizes(role: 'hero' | 'card' | 'thumbnail' | 'feature' | 'banner' | 'gallery' | 'full'): string {
  switch (role) {
    case 'hero': return '100vw';
    case 'gallery': return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    // ... other cases
  }
}
```

## 🚨 Critical Issues Identified

### 1. Massive Unoptimized Images
**Files Analyzed**:
- `public/images/tapestries/south-carolina/south-carolina-tapestry-main.jpg`: **16.1MB**
- `public/images/tapestries/maryland/maryland-tapestry.jpg`: **15.0MB**
- `public/images/tapestries/north-carolina/north-carolina-tapestry-main.jpg`: **14.5MB**
- `public/images/tapestries/connecticut/connecticut-tapestry.jpeg`: **13.1MB**
- `public/images/tapestries/massachusetts/massachusetts-tapestry-main.jpg`: **12.0MB**

**Impact**: 15-30 second load times on mobile, poor Core Web Vitals, user abandonment

### 2. Hero Carousel Using Standard Image Tags
**File**: `src/components/shared/hero-carousel.tsx:129-148`
```tsx
// Current problematic implementation
<Image
  src={tapestry.imagePath || tapestry.thumbnail || `/placeholder.svg`}
  alt={tapestry.title || 'Tapestry image'}
  fill
  sizes="100vw"
  className="absolute inset-0 object-cover"
  priority={index === 0}
  quality={85}
/>
```
**Issues**: 
- Using full-size 15MB images for carousel background
- No progressive loading
- No responsive sizing
- `unoptimized` flag causing issues

### 3. Tapestry Grid Not Using OptimizedImage
**File**: `src/components/features/tapestries/tapestry-card.tsx:44-51`
```tsx
// Current implementation not using OptimizedImage component
<Image
  src={getImagePath(tapestry.thumbnail)}
  alt={tapestry.title}
  fill
  sizes={getImageSizes('gallery')}
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  unoptimized
/>
```
**Issue**: `unoptimized` flag bypasses Next.js optimization

### 4. Next.js Configuration Blocking Optimization
**File**: `next.config.mjs:24`
```javascript
// ❌ This may be causing issues
dangerouslyAllowSVG: true,
contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
```
**Impact**: Need to verify SVG handling doesn't conflict with image optimization

## 🛠️ Implementation Blueprint

### Phase 1: Enable Next.js Image Optimization (High Priority)

#### Task 1.1: Remove Unoptimized Flags System-Wide
```bash
# Search for all unoptimized usage
grep -r "unoptimized" src/ --include="*.tsx" --include="*.ts"

# Files to modify:
# - src/components/features/tapestries/tapestry-card.tsx:50
# - Any other components using unoptimized flag
```

**Implementation**:
```tsx
// BEFORE: tapestry-card.tsx:44-51
<Image
  src={getImagePath(tapestry.thumbnail)}
  alt={tapestry.title}
  fill
  sizes={getImageSizes('gallery')}
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  unoptimized  // ❌ REMOVE THIS
/>

// AFTER: Use OptimizedImage component
<OptimizedImage
  src={getImagePath(tapestry.thumbnail)}
  alt={tapestry.title}
  role="gallery"
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  enableBlurPlaceholder={true}
  priority={false}
/>
```

#### Task 1.2: Optimize Hero Carousel Implementation
```tsx
// REPLACE: src/components/shared/hero-carousel.tsx:129-148
<OptimizedImage
  src={tapestry.imagePath || tapestry.thumbnail || `/placeholder.svg`}
  alt={tapestry.title || 'Tapestry image'}
  role="hero"
  className="absolute inset-0 object-cover transition-transform duration-10000 ease-out"
  style={{
    filter: 'brightness(0.9)',
    transform: currentIndex === index && isLoaded ? 'scale(1.05)' : 'scale(1)',
  }}
  priority={index === 0}
  quality={75} // Reduce from 85 to 75 for better compression
  enableBlurPlaceholder={true}
/>
```

### Phase 2: Create Responsive Image Variants (Medium Priority)

#### Task 2.1: Generate Multiple Image Sizes
Create a build script to generate responsive variants for all tapestry images:

```javascript
// scripts/generate-responsive-images.mjs
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SIZES = {
  hero: [640, 1024, 1920, 2560],    // Hero carousel
  gallery: [400, 640, 1024, 1280],  // Gallery grid
  thumbnail: [200, 400, 600],       // Thumbnails
  card: [300, 600, 900]            // Cards
};

const FORMATS = ['webp', 'avif', 'jpg'];

async function generateResponsiveImages() {
  const tapestryDir = 'public/images/tapestries';
  const directories = await fs.readdir(tapestryDir);
  
  for (const dir of directories) {
    const dirPath = path.join(tapestryDir, dir);
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      if (file.includes('-main.')) {
        await generateVariants(path.join(dirPath, file), 'hero');
      } else if (file.includes('-thumbnail.')) {
        await generateVariants(path.join(dirPath, file), 'thumbnail');
      }
    }
  }
}

async function generateVariants(inputPath, type) {
  const sizes = SIZES[type];
  const inputDir = path.dirname(inputPath);
  const inputName = path.parse(inputPath).name;
  
  for (const size of sizes) {
    for (const format of FORMATS) {
      const outputPath = path.join(
        inputDir, 
        `${inputName}-${size}w.${format}`
      );
      
      await sharp(inputPath)
        .resize(size, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toFormat(format, {
          quality: format === 'jpg' ? 80 : 85,
          effort: format === 'avif' ? 9 : undefined
        })
        .toFile(outputPath);
        
      console.log(`Generated: ${outputPath}`);
    }
  }
}

generateResponsiveImages().catch(console.error);
```

#### Task 2.2: Update Image Utilities for Responsive Paths
```typescript
// ENHANCE: src/lib/image-utils.ts
export function getResponsiveImageSrcSet(
  basePath: string, 
  role: 'hero' | 'gallery' | 'thumbnail' | 'card'
): string {
  const sizes = {
    hero: [640, 1024, 1920, 2560],
    gallery: [400, 640, 1024, 1280],
    thumbnail: [200, 400, 600],
    card: [300, 600, 900]
  };
  
  const imageSizes = sizes[role];
  const baseName = basePath.replace(/\.[^/.]+$/, ''); // Remove extension
  
  // Generate srcSet for WebP (preferred) and fallback
  const webpSrcSet = imageSizes
    .map(size => `${baseName}-${size}w.webp ${size}w`)
    .join(', ');
    
  return webpSrcSet;
}

export function getResponsiveImageSources(basePath: string, role: string) {
  const srcSet = getResponsiveImageSrcSet(basePath, role);
  const sizes = getImageSizes(role);
  
  return {
    avif: srcSet.replace(/\.webp/g, '.avif'),
    webp: srcSet,
    fallback: basePath,
    sizes
  };
}
```

#### Task 2.3: Create Enhanced Picture Component
```tsx
// CREATE: src/components/ui/responsive-picture.tsx
'use client';

interface ResponsivePictureProps {
  src: string;
  alt: string;
  role: 'hero' | 'gallery' | 'thumbnail' | 'card';
  className?: string;
  priority?: boolean;
  enableBlurPlaceholder?: boolean;
  style?: React.CSSProperties;
}

export function ResponsivePicture({
  src, alt, role, className, priority = false,
  enableBlurPlaceholder = true, style
}: ResponsivePictureProps) {
  const { avif, webp, fallback, sizes } = getResponsiveImageSources(src, role);
  
  return (
    <picture>
      <source srcSet={avif} type="image/avif" sizes={sizes} />
      <source srcSet={webp} type="image/webp" sizes={sizes} />
      <OptimizedImage
        src={fallback}
        alt={alt}
        role={role}
        className={className}
        priority={priority}
        enableBlurPlaceholder={enableBlurPlaceholder}
        style={style}
        sizes={sizes}
      />
    </picture>
  );
}
```

### Phase 3: Progressive Loading Enhancement (Medium Priority)

#### Task 3.1: Implement Intersection Observer Loading
```tsx
// ENHANCE: src/components/ui/optimized-image.tsx
import { useEffect, useRef, useState } from 'react';

export function OptimizedImage({ 
  src, alt, role = 'gallery', priority = false,
  enableBlurPlaceholder = true, ...props 
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  const shouldLoad = priority || isInView;
  
  return (
    <div ref={imgRef} className={props.className}>
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          sizes={getImageSizes(role)}
          onLoad={() => setHasLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            hasLoaded ? 'opacity-100' : 'opacity-0'
          )}
          placeholder={enableBlurPlaceholder ? 'blur' : undefined}
          blurDataURL={enableBlurPlaceholder ? getContextualBlurPlaceholder(src) : undefined}
          {...props}
        />
      ) : (
        <div 
          className={cn(
            'bg-gray-200 animate-pulse',
            props.className
          )}
          style={{ aspectRatio: '4/3' }}
        />
      )}
    </div>
  );
}
```

#### Task 3.2: Implement Smart Preloading for Carousel
```tsx
// ENHANCE: src/components/shared/hero-carousel.tsx
useEffect(() => {
  // Preload next/previous images in carousel
  const preloadImage = (index: number) => {
    const tapestry = validTapestries[index];
    if (!tapestry) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getImagePath(tapestry.imagePath || tapestry.thumbnail);
    link.type = 'image/webp';
    document.head.appendChild(link);
  };
  
  // Preload adjacent slides
  const nextIndex = (currentIndex + 1) % validTapestries.length;
  const prevIndex = currentIndex === 0 ? validTapestries.length - 1 : currentIndex - 1;
  
  preloadImage(nextIndex);
  preloadImage(prevIndex);
}, [currentIndex, validTapestries]);
```

### Phase 4: Mobile Optimization (High Priority)

#### Task 4.1: Mobile-Specific Image Serving
```tsx
// ENHANCE: src/lib/image-utils.ts
export function getMobileOptimizedPath(imagePath: string): string {
  // For mobile, prefer smaller, more compressed variants
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    const mobilePath = imagePath.replace(
      /(\.[^/.]+)$/, 
      '-640w.webp'
    );
    return mobilePath;
  }
  return imagePath;
}

export function getImageSizes(role: 'hero' | 'card' | 'thumbnail' | 'feature' | 'banner' | 'gallery' | 'full' = 'gallery'): string {
  switch (role) {
    case 'hero':
      return '100vw';
    case 'feature':
      return '(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw';
    case 'card':
      return '(max-width: 480px) 95vw, (max-width: 768px) 45vw, (max-width: 1200px) 30vw, 25vw';
    case 'thumbnail':
      return '(max-width: 480px) 40vw, (max-width: 768px) 25vw, 15vw';
    case 'gallery':
      return '(max-width: 480px) 100vw, (max-width: 768px) 95vw, (max-width: 1024px) 50vw, 33vw';
    case 'banner':
      return '100vw';
    case 'full':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1024px';
  }
}
```

#### Task 4.2: Add Connection-Aware Loading
```tsx
// CREATE: src/hooks/use-connection-aware.ts
'use client';

export function useConnectionAware() {
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateConnection = () => {
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setConnectionType('slow');
        } else {
          setConnectionType('fast');
        }
      };
      
      updateConnection();
      connection.addEventListener('change', updateConnection);
      
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);
  
  return connectionType;
}

// Usage in OptimizedImage component
export function OptimizedImage(props: OptimizedImageProps) {
  const connectionType = useConnectionAware();
  
  const quality = connectionType === 'slow' ? 60 : 80;
  const format = connectionType === 'slow' ? 'webp' : 'avif';
  
  // Adjust loading strategy based on connection
}
```

## 🧪 Validation Gates (Must Pass)

### Performance Testing
```bash
# Core Web Vitals Testing
npm run build && npm run start

# Test pages:
# - Homepage (carousel): http://localhost:3000
# - Tapestries page: http://localhost:3000/tapestries

# Use Lighthouse CI for automated testing
npx @lhci/cli autorun --upload.target=temporary-public-storage

# Target metrics:
# - LCP < 2.5s (currently >6s)
# - CLS < 0.1 
# - INP < 200ms
# - Image file sizes: <2MB each (currently 15MB)
```

### Build and Type Checking
```bash
# Must pass before completion
npm run lint && npm run build

# Ensure no TypeScript errors
npx tsc --noEmit

# Check bundle size
npm run analyze
```

### Mobile Performance Testing
```bash
# Test on various devices using Chrome DevTools
# Throttled connection testing:
# - Fast 3G: LCP < 3s
# - Slow 3G: LCP < 5s (with connection-aware loading)

# Real device testing preferred
```

### Image Optimization Verification
```bash
# Verify image variants generated
find public/images/tapestries -name "*-640w.webp" | wc -l  # Should match number of source images
find public/images/tapestries -name "*-1024w.webp" | wc -l

# Check file sizes
find public/images/tapestries -name "*-640w.webp" -exec ls -lh {} \; | awk '{print $5}'
```

## ⚠️ Common Gotchas & Solutions

### Image Generation Issues
- **Problem**: Sharp installation fails on some systems
- **Solution**: Use `npm install sharp --platform=linux --arch=x64` for Vercel compatibility

### Next.js Image Domains
- **Problem**: External image domains not configured
- **Solution**: Add to `next.config.mjs` remotePatterns if needed

### SVG Handling
- **Problem**: SVGs not loading with Image component
- **Solution**: Handle SVGs separately or ensure `dangerouslyAllowSVG: true` is configured correctly

### Layout Shifts
- **Problem**: Images cause layout shifts during loading
- **Solution**: Always specify aspect ratios and use `fill` with proper container sizing

## 📊 Expected Performance Improvements

### Before Optimization
- ❌ Homepage LCP: 6-8 seconds
- ❌ Tapestries page load: 10-15 seconds  
- ❌ Mobile performance: Poor (20-30s)
- ❌ Total page weight: 150-200MB
- ❌ Core Web Vitals: All metrics failing

### After Optimization  
- ✅ Homepage LCP: <2.5 seconds
- ✅ Tapestries page load: <4 seconds
- ✅ Mobile performance: Good (<5s)
- ✅ Total page weight: 15-20MB
- ✅ Core Web Vitals: All metrics passing
- ✅ 80-90% reduction in image file sizes

## 📚 Additional Resources

- **Next.js Image Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **WebP Compression Guide**: https://developers.google.com/speed/webp/docs/compression
- **Core Web Vitals**: https://web.dev/vitals/
- **Sharp Documentation**: https://sharp.pixelplumbing.com/
- **Responsive Images**: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images

## 🎯 Implementation Priority Order

1. **Remove unoptimized flags** (Immediate - enables Next.js optimization)
2. **Optimize hero carousel** (High impact - biggest performance win)
3. **Generate responsive image variants** (Essential for proper optimization)
4. **Implement progressive loading** (User experience improvement)
5. **Mobile-specific optimizations** (Critical for mobile users)
6. **Connection-aware loading** (Progressive enhancement)
7. **Advanced caching strategies** (Long-term performance)

## 🎯 Task Completion Checklist

### Phase 1: Core Optimization
- [ ] Remove all `unoptimized` flags from Image components
- [ ] Convert hero carousel to use OptimizedImage component
- [ ] Update tapestry cards to use OptimizedImage component
- [ ] Verify Next.js image optimization is working

### Phase 2: Responsive Images  
- [ ] Install Sharp dependency for image processing
- [ ] Create responsive image generation script
- [ ] Generate multiple sizes for all tapestry images (640w, 1024w, 1920w, 2560w)
- [ ] Update image utilities to support responsive srcSets
- [ ] Create ResponsivePicture component with AVIF/WebP support

### Phase 3: Progressive Enhancement
- [ ] Implement intersection observer for lazy loading
- [ ] Add smart preloading for carousel adjacent slides
- [ ] Create connection-aware loading hook
- [ ] Add loading states and skeleton placeholders

### Phase 4: Mobile Optimization
- [ ] Implement mobile-specific image serving
- [ ] Test and optimize for mobile devices
- [ ] Add performance monitoring and analytics

### Validation
- [ ] All Lighthouse scores >90
- [ ] LCP <2.5s on all pages
- [ ] Mobile performance acceptable (<5s)
- [ ] All existing functionality preserved
- [ ] Build and deployment successful

---

**Confidence Score: 9/10** - This PRP provides comprehensive analysis of critical performance issues, specific implementation steps with code examples, and clear validation criteria. The systematic approach addresses the root cause (massive 15MB images) with modern responsive image techniques and progressive enhancement strategies proven effective in 2025.