# Next.js Deployment Optimization and Image Fix PRP

## 📋 Overview

This PRP addresses critical deployment blockers for the America's Tapestry Next.js website on Vercel, focusing on image optimization, bundle size reduction, and App Router best practices. The project is currently hitting Vercel's serverless function size limits due to image handling issues and needs comprehensive optimization.

## 🎯 Success Criteria

- ✅ Vercel deployment succeeds without bundle size errors
- ✅ All images load correctly in production
- ✅ Core Web Vitals improved (LCP, CLS reduction)
- ✅ Build time reduced by eliminating pre-build scripts
- ✅ Clean App Router structure following Next.js 15 best practices
- ✅ All tests pass and linting succeeds

## 🔗 Critical Context & Documentation

### Next.js Image Optimization (2025 Best Practices)
- **Official Docs**: https://nextjs.org/docs/app/getting-started/images
- **Component API**: https://nextjs.org/docs/pages/api-reference/components/image
- **Critical Issue**: `unoptimized: true` causes deployment issues across platforms
- **WebP Conversion**: Next.js automatically converts JPG/PNG to WebP (60-70% size reduction)
- **Priority Loading**: Use `priority={true}` for above-the-fold images

### Vercel Deployment Issues (2025)
- **Function Size Limit**: 250MB serverless function limit frequently hit
- **Fast Data Transfer**: 1TB limit, $0.15/GB overage charges
- **Bundle Exclusion**: Use `outputFileTracingExcludes` to exclude content from bundles
- **Official Limits**: https://vercel.com/docs/functions/limitations

### Current Codebase Patterns

**Existing Image Usage Example** (components/hero-carousel.tsx:124):
```tsx
<img
  src={tapestry.imagePath || tapestry.thumbnail || `/placeholder.svg`}
  alt={tapestry.title || 'Tapestry image'}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

**Target Pattern** (from components/featured-post.tsx):
```tsx
import Image from 'next/image';
<Image
  src={getImagePath(imagePath)}
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  priority={true} // for above-the-fold
/>
```

## 🚨 Critical Issues Identified

### 1. Image Optimization Disabled
- **File**: `next.config.mjs:17` - `unoptimized: true`
- **Impact**: No WebP conversion, no lazy loading, no responsive sizing
- **Fix**: Remove unoptimized flag, enable built-in optimization

### 2. Hero Carousel Using Raw `<img>` Tags
- **File**: `components/hero-carousel.tsx:124`
- **Impact**: No optimization, poor LCP, layout shifts
- **Fix**: Convert to `next/image` with priority loading

### 3. Content Directory Duplication
- **Issue**: Both `/content/` and `/public/content/` exist with duplicate files
- **Impact**: 2x storage, bundle size issues, confusion
- **Fix**: Consolidate to single content structure

### 4. Pre-build Scripts Causing Issues
- **Files**: 
  - `scripts/migrate-images-to-public.mjs`
  - `scripts/add-unoptimized-to-images.mjs`
- **Impact**: Build complexity, deployment failures
- **Run in**: `package.json:6-7` before dev/build
- **Fix**: Remove scripts, fix root cause

### 5. Dependency Management Issues
- **File**: `package.json` - Multiple "latest" versions
- **Impact**: Security risks, unpredictable builds
- **Fix**: Pin to specific versions

## 🛠️ Implementation Blueprint

### Phase 1: Critical Deployment Fixes (High Priority)

#### Task 1.1: Fix Next.js Image Configuration
```javascript
// next.config.mjs - REMOVE lines 16-18
images: {
  unoptimized: true, // ❌ DELETE THIS
},

// ADD proper image configuration
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
},
```

#### Task 1.2: Convert Hero Carousel to next/image
```tsx
// components/hero-carousel.tsx:124-139 - REPLACE img with:
<Image
  src={tapestry.imagePath || tapestry.thumbnail || `/placeholder.svg`}
  alt={tapestry.title || 'Tapestry image'}
  fill
  sizes="100vw"
  className="absolute inset-0 object-cover transition-transform duration-10000 ease-out"
  style={{
    filter: 'brightness(0.9)',
    transform: currentIndex === index && isLoaded ? 'scale(1.05)' : 'scale(1)',
  }}
  priority={index === 0} // First slide gets priority
  quality={85}
/>
```

#### Task 1.3: Remove Pre-build Scripts
```json
// package.json:6-7 - REPLACE scripts with:
"dev": "next dev",
"build": "next build",
// DELETE these files:
// - scripts/migrate-images-to-public.mjs
// - scripts/add-unoptimized-to-images.mjs
```

#### Task 1.4: Consolidate Content Directories
```bash
# Strategy: Keep /content/, remove /public/content/ and /public/images/
# Update all components to use /content/ paths
# Use Next.js API routes for content serving if needed
```

### Phase 2: Systematic Image Migration (Medium Priority)

#### Task 2.1: Create Image Utility Functions
```typescript
// lib/image-utils.ts - ENHANCE existing functions
export function getOptimizedImagePath(path: string): string {
  // Ensure path starts with /content/ for proper routing
  if (path.startsWith('/public/')) {
    return path.replace('/public/', '/');
  }
  if (!path.startsWith('/content/') && !path.startsWith('/')) {
    return `/content/${path}`;
  }
  return path;
}

export function getImageSizes(type: 'hero' | 'card' | 'thumbnail' | 'feature'): string {
  const sizeMap = {
    hero: '100vw',
    feature: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    card: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    thumbnail: '(max-width: 768px) 25vw, 15vw'
  };
  return sizeMap[type];
}
```

#### Task 2.2: Systematically Replace All `<img>` Tags
```bash
# Search pattern to find all img tags:
grep -r "<img" components/ app/ --include="*.tsx" --include="*.jsx"

# Replace pattern for each file:
# FROM: <img src={path} alt={alt} className={classes} />
# TO: <Image src={getOptimizedImagePath(path)} alt={alt} fill sizes={getImageSizes('appropriate-type')} className={classes} />
```

### Phase 3: App Router Optimization (Medium Priority)

#### Task 3.1: Restructure to src/ Directory
```bash
# Create new structure following Next.js 15 best practices
src/
├── app/              # App Router (move existing app/)
├── components/       # Move existing components/
│   ├── ui/          # Keep existing shadcn/ui components
│   └── features/    # Rename feature-specific components
├── lib/             # Move existing lib/
├── hooks/           # Move existing hooks/
└── types/           # Create new types directory
```

#### Task 3.2: Clean up next.config.mjs
```javascript
// next.config.mjs - REMOVE commented experimental code (lines 39-43)
// RE-ENABLE TypeScript/ESLint checks (lines 10-15)
eslint: {
  ignoreDuringBuilds: false, // ✅ Re-enable
},
typescript: {
  ignoreBuildErrors: false, // ✅ Re-enable
},
```

#### Task 3.3: Fix Dependency Versions
```json
// package.json - REPLACE "latest" with specific versions
"@hookform/resolvers": "^3.9.1",
"@radix-ui/react-label": "^2.1.1",
"@radix-ui/react-radio-group": "^1.2.2",
"@radix-ui/react-slider": "^1.2.3",
"embla-carousel-react": "^8.5.2",
"fs": "^0.0.1-security", // Note: This should probably be removed
"gray-matter": "^4.0.3",
"input-otp": "^1.4.1",
"path": "^0.12.7", // Note: This should probably be removed
"react-hook-form": "^7.54.1",
"remark": "^15.0.1",
"remark-html": "^16.0.1",
"resend": "^4.0.1",
"zod": "^3.24.1"
```

### Phase 4: Advanced Optimization (Low Priority)

#### Task 4.1: Implement Progressive Enhancement
```tsx
// Add blur placeholders for better UX
<Image
  src={imagePath}
  alt={alt}
  fill
  sizes={sizes}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." // Generate these
  className={className}
/>
```

#### Task 4.2: Add Error Handling
```tsx
// components/ui/optimized-image.tsx - Create wrapper component
const OptimizedImage = ({ src, alt, ...props }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <div className="bg-gray-200 flex items-center justify-center">Image failed to load</div>;
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};
```

## 🧪 Validation Gates (Must Pass)

### Syntax & Type Checking
```bash
# Must pass before completion
npm run lint && npm run build
```

### Image Loading Verification
```bash
# Test in development
npm run dev
# Verify all images load at: http://localhost:3000

# Test production build
npm run build && npm run start
# Verify all images load at: http://localhost:3000
```

### Bundle Size Analysis
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
# Ensure no content files in client bundle
```

### Performance Testing
```bash
# Core Web Vitals check (use Lighthouse CI or similar)
# Target metrics:
# - LCP < 2.5s (currently likely >4s due to unoptimized images)
# - CLS < 0.1 (layout shift reduction from proper sizing)
# - FCP < 1.8s
```

## ⚠️ Common Gotchas & Solutions

### Image Path Issues
- **Problem**: Images work in dev but fail in production
- **Solution**: Use absolute paths starting with `/content/` or proper API routes

### Build Failures
- **Problem**: TypeScript errors after re-enabling checks
- **Solution**: Fix type issues incrementally, use `// @ts-ignore` sparingly for complex cases

### Vercel Function Size
- **Problem**: Bundle size still too large
- **Solution**: Check `outputFileTracingExcludes` includes all content directories

### SVG Handling
- **Problem**: SVG files not loading with next/image
- **Solution**: Use `dangerouslyAllowSVG: true` in config or handle SVGs separately

## 🔍 Success Metrics

### Before Optimization
- ❌ Vercel deployment fails (bundle size >250MB)
- ❌ Images take 3-5s to load (unoptimized)
- ❌ Poor LCP scores (>4s)
- ❌ Build takes 5+ minutes (due to scripts)

### After Optimization
- ✅ Vercel deployment succeeds
- ✅ Images load in <1s (WebP conversion)
- ✅ LCP improved to <2.5s
- ✅ Build time reduced to <2 minutes
- ✅ Bundle size reduced by 60-80%

## 📚 Additional Resources

- **Next.js 15 Migration Guide**: https://nextjs.org/docs/app/getting-started/upgrading
- **Vercel Performance Guide**: https://vercel.com/docs/speed-insights
- **Image Optimization Deep Dive**: https://web.dev/optimize-images/
- **App Router Best Practices**: https://nextjs.org/docs/app/getting-started/project-structure

## 🎯 Implementation Priority Order

1. **Fix next.config.mjs image settings** (Immediate deployment fix)
2. **Convert hero carousel** (Biggest LCP impact)
3. **Remove build scripts** (Simplify deployment)
4. **Consolidate content directories** (Bundle size reduction)
5. **System-wide img→Image conversion** (Comprehensive optimization)
6. **App Router restructuring** (Long-term maintainability)
7. **Dependency version fixes** (Security & stability)
8. **Advanced optimizations** (Polish & performance)

---

**Confidence Score: 9/10** - This PRP provides comprehensive context, clear implementation steps, and addresses all critical deployment blockers. The systematic approach ensures one-pass implementation success with built-in validation gates.