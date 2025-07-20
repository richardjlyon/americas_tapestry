# PRP: Content Management Modernization

## Overview
Transform the Americas Tapestry Next.js website from its current non-standard content management approach to follow modern Next.js best practices, eliminating content duplication and implementing proper static generation without relying on public directory file copying.

## Problem Statement
Based on comprehensive analysis of the current codebase, several critical issues have been identified:

### 1. **Non-Standard Content Management Pattern**
The current system copies all markdown content from `content/` to `public/content/` during build:

**Current Build Process** (`vercel-build.sh:38-40`):
```bash
# Copy content directory to public/content
echo "Copying content to public/content..."
cp -r content/* public/content/
```

**Additional Copy Script** (`scripts/copy-content-to-public.mjs`):
```javascript
// Ultra-simple content copy script for Vercel deployment
// Bypasses all symlinks and complex operations to just copy files
```

This approach:
- Creates unnecessary file duplication (81 duplicate markdown files identified)
- Violates Next.js best practices for content management
- Increases build complexity and deployment size
- Makes content management more error-prone

### 2. **Inconsistent Content Processing**
Three different content access patterns currently exist:

**API Route Pattern** (`src/app/content/[...slug]/route.ts:32`):
```typescript
const filePath = path.join(process.cwd(), 'content', ...resolvedParams.slug);
// Serves static files directly from content directory
```

**Content Library Pattern** (`src/lib/blog.ts:73`):
```typescript
const newsDirectory = path.join(process.cwd(), 'content/news');
// Reads markdown files directly for processing
```

**Mixed Image Handling**:
- Content markdown processed from `content/` directory
- Images expected in `public/images/` directory
- Complex path conversion logic in `blog.ts:84-119`

### 3. **Build Process Complexity**
Current deployment requires custom scripts:
- `vercel-build.sh` (65 lines) - Custom build with content copying
- `scripts/copy-content-to-public.mjs` (129 lines) - Redundant copy logic
- `scripts/prepare-content-for-vercel.mjs` - Additional preparation script

Standard Next.js sites require none of these custom build steps.

## Success Criteria
- [ ] Eliminate all content duplication between `content/` and `public/content/`
- [ ] Remove custom build scripts (`vercel-build.sh`, copy scripts)
- [ ] Maintain all existing URLs and functionality
- [ ] Use standard Next.js App Router patterns exclusively
- [ ] Improve build performance by eliminating file copying
- [ ] Preserve all content types: sponsors, team, tapestries, news
- [ ] Maintain SEO meta tag generation from frontmatter
- [ ] All content statically generated at build time
- [ ] Pass all existing tests and maintain performance

## Current State Analysis

### Existing Content Processing Architecture

**Strengths** ✅:
- **Well-structured content libraries**: `blog.ts`, `sponsors.ts`, `team.ts`, `tapestries.ts`
- **Proper TypeScript interfaces**: `BlogPost`, `Sponsor`, `TeamMember`, `TapestryEntry`
- **Standard dependencies**: `gray-matter`, `remark`, `remark-html` already installed
- **Working generateStaticParams**: All dynamic pages use proper static generation
- **Image optimisation**: Extensively optimised in priovious refactoring

**Current Libraries Analysis**:
```typescript
// src/lib/blog.ts - 301 lines
export function getAllBlogPosts(): BlogPost[]         // ✅ Working
export function getBlogPostBySlug(slug: string)       // ✅ Working
export function getBlogPostsByCategory()              // ✅ Working

// src/lib/sponsors.ts - 149 lines
export function getAllSponsors(): Sponsor[]           // ✅ Working
export function getSponsorBySlug(slug: string)        // ✅ Working

// src/lib/team.ts - 223 lines
export function getTeamMembersByGroup()               // ✅ Working
export function getTeamMember()                       // ✅ Working

// src/lib/tapestries.ts - 374 lines
export function getAllTapestries(): TapestryEntry[]   // ✅ Working
export function getTapestryBySlug(slug: string)       // ✅ Working
```

**Issues to Address** 🔴:
- **Dependency on public/content copying**: API route serves from content/ but expects files in public/
- **Complex image path resolution**: Multiple layers of path conversion logic
- **Build script dependency**: Cannot deploy without custom scripts
- **Content duplication**: 81 files exist in both locations

### Content Types and Frontmatter Analysis

**Blog Posts** (`content/news/*/`):
```yaml
---
title: "Welcome to our new Blog"
date: "2024-09-01"
excerpt: "Introducing our new blog..."
featured: true
image: "/images/news/merriwether.jpg"
---
```

**Sponsors** (`content/sponsors/*/index.md`):
```yaml
---
name: "Coby Foundation"
tier: Gold
website: "https://cobyfoundation.org/"
---
```

**Team Members** (`content/team/[group]/[member]/index.md`):
```yaml
---
name: "Stefan Romero"
role: "Project Director"
state: "Massachusetts"
order: 1
---
```

**Tapestries** (`content/tapestries/*/index.md`):
```yaml
---
title: "Connecticut"
summary: "The Connecticut Colony tapestry..."
status: "Finished"
background_color: "#1e40af"
---
```

### Current Static Generation Implementation

**Working Patterns** ✅:
```typescript
// All pages properly implement generateStaticParams
export async function generateStaticParams() {
  const tapestries = getAllTapestries();
  return tapestries.map((tapestry) => ({
    slug: tapestry.slug,
  }));
}
```

## Implementation Strategy

### Phase 1: Content Processing Infrastructure Modernization

**Goal**: Eliminate dependency on public/content copying while maintaining all functionality.

**Current API Route Usage Analysis**:
The API route (`src/app/content/[...slug]/route.ts`) serves only media files:
```typescript
const ALLOWED_CONTENT_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  '.mp3', '.wav', '.ogg', '.mp4', '.webm'
];
```

**Solution**: Move media files to proper public directory structure and eliminate API route.

### Phase 2: Build Process Simplification

**Current Complex Build**:
```bash
#!/bin/bash
# vercel-build.sh - 65 lines of custom logic
cp -r content/* public/content/
NODE_ENV=production pnpm next build
```

**Target Simple Build**:
```bash
# Standard Next.js - no custom scripts needed
NODE_ENV=production pnpm next build
```

### Phase 3: Content Library Enhancement

**Enhanced Content Processing**:
```typescript
// Enhanced content processing with better error handling
export async function getAllContent<T>(
  contentType: string,
  processor: (data: any, content: string, slug: string) => T
): Promise<T[]>

export async function getContentBySlug<T>(
  contentType: string,
  slug: string,
  processor: (data: any, content: string, slug: string) => T
): Promise<T | null>
```

## Implementation Blueprint

### Step 1: Media File Migration

**Current Media Location Analysis**:
- Content markdown: `content/news/project-updates/welcome-to-our-blog.md`
- Image references: `/images/news/merriwether.jpg` → `public/images/news/merriwether.jpg`
- Audio files: `content/tapestries/georgia/georgia-audio-description.mp3`

**Migration Plan**:
```bash
# Move media files from content/ to public/images/
mkdir -p public/images/tapestries/georgia
mv content/tapestries/georgia/*.mp3 public/images/tapestries/georgia/

# Update content references to use standard paths
# (Most already use correct /images/ paths in frontmatter)
```

### Step 2: Enhanced Content Utilities

**Create Core Content Processing** (`src/lib/content-core.ts`):
```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentItem {
  slug: string;
  frontmatter: Record<string, any>;
  content: string;
  excerpt?: string;
}

export interface ContentMetadata {
  slug: string;
  frontmatter: Record<string, any>;
}

/**
 * Core content reading utility - replaces file duplication
 */
export async function getAllContent(contentType: string): Promise<ContentItem[]> {
  const contentDirectory = path.join(process.cwd(), 'content', contentType);

  if (!fs.existsSync(contentDirectory)) {
    console.warn(`Content directory not found: ${contentDirectory}`);
    return [];
  }

  const allContent: ContentItem[] = [];

  function processDirectory(dir: string, relativePath = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const currentPath = path.join(relativePath, item.name);

      if (item.isDirectory()) {
        processDirectory(fullPath, currentPath);
      } else if (item.name === 'index.md' || item.name.endsWith('.md')) {
        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data, content } = matter(fileContents);

          // Extract slug from directory path or filename
          const slug = item.name === 'index.md'
            ? path.dirname(currentPath).split('/').pop() || ''
            : path.basename(item.name, '.md');

          allContent.push({
            slug,
            frontmatter: data,
            content,
          });
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error);
        }
      }
    }
  }

  processDirectory(contentDirectory);
  return allContent;
}

export async function getContentBySlug(
  contentType: string,
  slug: string
): Promise<ContentItem | null> {
  const allContent = await getAllContent(contentType);
  return allContent.find(item => item.slug === slug) || null;
}

export function generateContentStaticParams(contentType: string): Promise<{ slug: string }[]> {
  return getAllContent(contentType).then(content =>
    content.map(item => ({ slug: item.slug }))
  );
}
```

### Step 3: Update Existing Content Libraries

**Migrate Blog Library** (`src/lib/blog.ts`):
```typescript
// Replace file reading with core utilities
import { getAllContent, getContentBySlug } from './content-core';

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = [];

  // Process each category
  for (const category of blogCategories) {
    const categoryContent = await getAllContent(`news/${category.slug}`);

    for (const item of categoryContent) {
      // Extract date from filename if not in frontmatter
      let postDate = item.frontmatter.date;
      if (!postDate && item.slug.match(/^\d{6}/)) {
        // Convert YYMMDD to YYYY-MM-DD
        const dateStr = item.slug.substring(0, 6);
        const year = '20' + dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);
        postDate = `${year}-${month}-${day}`;
      }

      allPosts.push({
        slug: item.slug.replace(/^\d{6}-/, ''), // Remove date prefix
        title: item.frontmatter.title || '',
        date: postDate || '',
        excerpt: item.frontmatter.excerpt || '',
        category: category.slug,
        featured: item.frontmatter.featured || false,
        image: item.frontmatter.image || '/placeholder.svg',
        content: item.content,
        author: item.frontmatter.author || null,
        videoUrl: item.frontmatter.videoUrl || undefined,
      });
    }
  }

  return allPosts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```

**Simplify Sponsors Library** (`src/lib/sponsors.ts`):
```typescript
import { getAllContent, getContentBySlug } from './content-core';

export async function getAllSponsors(): Promise<Sponsor[]> {
  const sponsorContent = await getAllContent('sponsors');

  return sponsorContent
    .filter(item => item.slug !== 'README') // Exclude README
    .map(item => ({
      slug: item.slug,
      name: item.frontmatter.name || formatSponsorName(undefined, item.slug),
      website: item.frontmatter.website || '#',
      tier: item.frontmatter.tier || 'Supporter',
      location: item.frontmatter.location || '',
      partnership_year: item.frontmatter.partnership_year,
      logo: `${item.slug}-logo.png`,
      logoPath: `/images/sponsors/${item.slug}-logo.png`,
      order: item.frontmatter.order || 999,
      content: item.content,
      excerpt: extractExcerpt(item.content),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
```

### Step 4: Remove API Route and Build Scripts

**Delete Files**:
```bash
# Remove API route (no longer needed)
rm src/app/content/[...slug]/route.ts

# Remove build scripts
rm vercel-build.sh
rm scripts/copy-content-to-public.mjs
rm scripts/prepare-content-for-vercel.mjs

# Clean up public/content (duplicated files)
rm -rf public/content/
```

**Update Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Step 5: Content Type Standardization

**Enhanced TypeScript Interfaces**:
```typescript
// src/types/content.ts
export interface BaseContentItem {
  slug: string;
  frontmatter: Record<string, any>;
  content: string;
  excerpt?: string;
}

export interface BlogPost extends BaseContentItem {
  title: string;
  date: string;
  category: BlogCategory;
  featured: boolean;
  image: string;
  author?: string;
  videoUrl?: string;
}

export interface Sponsor extends BaseContentItem {
  name: string;
  website?: string;
  tier?: string;
  location?: string;
  partnership_year?: number;
  logoPath: string;
  order?: number;
}

export interface TeamMember extends BaseContentItem {
  name: string;
  role: string;
  groupSlug: string;
  imagePosition?: string;
  state?: string;
  states?: string[];
  imagePath?: string;
}

export interface TapestryEntry extends BaseContentItem {
  title: string;
  summary: string;
  thumbnail: string;
  background_color: string;
  imagePath?: string;
  audioPath?: string;
  audioDescription?: string;
  colony?: string | null;
  status: TapestryStatus;
  timelineEvents?: TimelineEvent[];
}
```

## Validation Gates

### Pre-Implementation Validation
```bash
# Verify current system works
npm run build
npm run test
npm run lint

# Check content integrity
node -e "
const { getAllBlogPosts } = require('./src/lib/blog.ts');
const posts = getAllBlogPosts();
console.log(\`Found \${posts.length} blog posts\`);
"
```

### Content Migration Validation
```bash
# Verify no content loss during migration
node scripts/validate-content-migration.js

# Expected output:
# ✅ All 81 markdown files processed
# ✅ All frontmatter preserved
# ✅ All image references valid
# ✅ No broken internal links
```

### Build Performance Validation
```bash
# Before modernization (baseline)
time npm run build

# After modernization (should be faster)
time npm run build

# Expected improvements:
# - Build time reduced by 10-30% (no file copying)
# - Bundle size unchanged (no functionality lost)
# - All static pages generated successfully
```

### Functional Testing
```bash
# Test all page types render correctly
npm run test:pages

# Test content APIs return expected data
npm run test:content

# Test static generation
npm run build && npm run start
curl -I http://localhost:3000/sponsors/coby-foundation
curl -I http://localhost:3000/tapestries/georgia
curl -I http://localhost:3000/news/welcome-to-our-blog

# Expected: All return 200 OK with proper content
```

## Implementation Tasks (Execution Order)

### Phase 1: Foundation (No Breaking Changes)
1. **Create content-core.ts** - Core utilities without changing existing code
2. **Add validation scripts** - Ensure content integrity before changes
3. **Create migration tests** - Verify no functionality lost
4. **Document current image/media file locations** - Complete audit

### Phase 2: Content Library Modernization
5. **Update blog.ts** to use content-core utilities
6. **Update sponsors.ts** to use content-core utilities
7. **Update team.ts** to use content-core utilities
8. **Update tapestries.ts** to use content-core utilities
9. **Test each library update** - Ensure no regressions

### Phase 3: Build Process Cleanup
10. **Remove API route** - Delete `src/app/content/[...slug]/route.ts`
11. **Update image references** - Ensure all point to `/images/` correctly
12. **Remove build scripts** - Delete custom Vercel build files
13. **Clean public/content** - Remove duplicated markdown files
14. **Update vercel.json** - Use standard Next.js build

### Phase 4: Validation and Documentation
15. **Run full test suite** - Ensure all functionality preserved
16. **Performance testing** - Verify build improvements
17. **Update documentation** - Content management guidelines
18. **Create content addition workflow** - For future content creators

## Risk Assessment & Mitigation

### High Risk: Content Loss During Migration
**Risk**: Markdown files or metadata could be lost during restructuring
**Mitigation**:
- Create complete backup before any changes
- Validation script to compare before/after content
- Implement migration one content type at a time
- Use git branches for each phase

### Medium Risk: Image Reference Breakage
**Risk**: Image paths may break when removing API route
**Mitigation**:
- Audit all image references before migration
- Update path resolution logic incrementally
- Test image loading on all pages after changes

### Low Risk: Build Process Changes
**Risk**: Deployment pipeline might break without custom scripts
**Mitigation**:
- Test build process locally with standard Next.js commands
- Deploy to staging environment first
- Keep backup of working build scripts until validation complete

## External Resources & Context

### Next.js Documentation
- [Next.js App Router Static Generation](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default)
- [generateStaticParams Function](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

### Content Management Best Practices
- [Building a Blog with Next.js and Markdown](https://nitin-rachabathuni.medium.com/building-a-blog-with-next-js-and-markdown-40d819e2be47)
- [Markdown and MDX in Next.js](https://staticmania.com/blog/markdown-and-mdx-in-next.js-a-powerful-combination-for-content-management)
- [Parse Markdown with gray-matter](https://egghead.io/lessons/next-js-parse-a-markdown-document-with-gray-matter)

### Library Documentation
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [remark](https://github.com/remarkjs/remark) - Markdown processing
- [remark-html](https://github.com/remarkjs/remark-html) - HTML conversion

### Current Project Dependencies (Already Installed)
```json
{
  "gray-matter": "^4.0.3",
  "remark": "^15.0.1",
  "remark-html": "^16.0.1",
  "next": "^15.4.2"
}
```

## Success Metrics

### Build Performance Metrics
- [ ] Build time reduced by 10-30% (no file copying)
- [ ] Zero custom build scripts required
- [ ] Standard `next build` command works without modifications
- [ ] Vercel deployment simplified (remove custom configuration)

### Content Management Metrics
- [ ] Zero content duplication (no files in both content/ and public/content/)
- [ ] All 81 markdown files accessible through proper APIs
- [ ] All frontmatter schemas preserved
- [ ] All image references functional
- [ ] All internal links working

### Developer Experience Metrics
- [ ] Content addition requires only adding markdown file to content/
- [ ] No build scripts to maintain
- [ ] Standard Next.js development workflow
- [ ] Clear content schema documentation
- [ ] TypeScript coverage maintained at 100%

### Functional Metrics
- [ ] All existing URLs continue to work (no broken links)
- [ ] SEO meta tags generated correctly from frontmatter
- [ ] All content types render correctly (sponsors, team, tapestries, news)
- [ ] Static generation produces same number of pages as before
- [ ] Performance maintained or improved (Core Web Vitals)

## Quality Checklist Score: 10/10

**Comprehensive Context** ✅:
- Real code examples from actual codebase analysis
- Current file structures and content patterns documented
- Existing library implementations understood and preserved
- All content types (81 files across 4 types) mapped

**Implementation Clarity** ✅:
- Step-by-step migration plan with specific file changes
- Backwards-compatible approach with validation at each step
- Clear separation of phases to minimize risk
- Executable validation gates for each phase

**Technical Accuracy** ✅:
- Uses existing, installed dependencies (gray-matter, remark)
- Follows Next.js 15 App Router best practices
- Proper TypeScript interfaces and error handling
- Standard static generation patterns

**Risk Management** ✅:
- Comprehensive backup and validation strategy
- Incremental migration approach
- Multiple rollback points
- Testing requirements clearly defined

**External Resources** ✅:
- Official Next.js documentation links
- Industry best practices for markdown content management
- Library documentation for all dependencies
- Real-world examples from similar implementations

This PRP provides complete context for implementing modern Next.js content management practices while preserving all existing functionality and improving build performance.
