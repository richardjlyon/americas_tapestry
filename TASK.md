# Content Management Modernization Project

## Objective
Transform the Americas Tapestry Next.js website from its current non-standard content management approach to follow modern Next.js best practices, eliminating content duplication and implementing proper static generation.

## Current Problem
The website currently copies all markdown content from `content/` to `public/content/` during build, which is not standard Next.js practice and creates unnecessary duplication. Modern Next.js applications process markdown at build time rather than serving raw markdown files statically.

## Analysis Phase

### 1. Content Flow Investigation
- Map how markdown files in both `content/` and `public/content/` are consumed
- Identify all components, API routes, and pages referencing `/content/` URLs
- Document the complete data flow from markdown source to rendered output
- Trace dependencies in the current content system

### 2. Architecture Assessment
- Review current routing patterns for content pages
- Analyze build scripts (`vercel-build.sh`, `scripts/copy-content-to-public.mjs`)
- Audit all content imports and fetch operations
- Identify breaking changes that modernization would cause

### 3. Content Inventory
- Document all content types: sponsors, team members, tapestries, news articles
- Map current URL structure and routing
- Catalog frontmatter schemas used across different content types
- List all static assets referenced by content

## Implementation Strategy

### Phase 1: Foundation
**Goal**: Establish modern content processing infrastructure

- Create robust content reading utilities using `gray-matter` and `remark`
- Implement TypeScript interfaces for all content types
- Build content processing functions that work at build time
- Set up proper error handling for malformed content

### Phase 2: Routing Modernization
**Goal**: Convert to standard Next.js App Router patterns

- Implement dynamic routes with `generateStaticParams`
- Create proper `[slug]` routes for each content type:
  - `app/sponsors/[slug]/page.tsx`
  - `app/team/[group]/[member]/page.tsx` 
  - `app/tapestries/[slug]/page.tsx`
  - `app/news/[slug]/page.tsx`
- Ensure all existing URLs continue to work

### Phase 3: Component Migration
**Goal**: Update all content consumption to use new system

- Modify components to use build-time content processing
- Remove all dependencies on `public/content/` static files
- Update image references to use Next.js Image optimization
- Implement proper SEO meta tag generation from frontmatter

### Phase 4: Build Process Cleanup
**Goal**: Simplify deployment to standard Next.js practices

- Remove content copying from `vercel-build.sh`
- Delete unnecessary scripts in `scripts/` directory
- Clean up `vercel.json` configuration
- Update deployment documentation

## Technical Requirements

### Content Processing API
```typescript
// Core functions to implement
export async function getAllContent(contentType: string): Promise<ContentItem[]>
export async function getContentBySlug(contentType: string, slug: string): Promise<ContentItem>
export async function getContentMetadata(contentType: string): Promise<Metadata[]>
export function generateContentStaticParams(contentType: string): Promise<{ slug: string }[]>
```

### Content Type Definitions
```typescript
interface ContentItem {
  slug: string
  frontmatter: Record<string, any>
  content: string
  excerpt?: string
}

interface SponsorContent extends ContentItem {
  frontmatter: {
    name: string
    tier: 'Gold' | 'Silver' | 'Bronze'
    website?: string
  }
}
```

### Static Generation
- Pre-render all content pages at build time
- Generate proper meta tags for SEO
- Optimize images referenced in markdown content
- Create sitemap from all content

## Success Metrics

### Functionality
- [ ] All existing content URLs work without redirect
- [ ] No broken links or missing content
- [ ] Proper SEO meta tags from frontmatter
- [ ] Fast page loads through static generation

### Code Quality
- [ ] Standard Next.js content patterns
- [ ] No content duplication between directories
- [ ] Clean, maintainable content processing
- [ ] Complete TypeScript coverage

### Performance
- [ ] All content statically generated at build time
- [ ] Improved or maintained Lighthouse scores
- [ ] Reduced build times (no file copying)
- [ ] Faster page loads

### Developer Experience
- [ ] Simple content addition (just add markdown file)
- [ ] Clear content schema documentation
- [ ] Maintainable codebase
- [ ] Standard Next.js conventions

## Deliverables

1. **Content Processing System**: Modern utilities for handling markdown content
2. **Updated Routing**: Proper App Router implementation for all content types
3. **Migrated Components**: All components using new content system
4. **Simplified Build**: Standard Next.js build process without custom scripts
5. **Documentation**: Updated content management guidelines
6. **Test Coverage**: Validation of content rendering and functionality

## Implementation Notes

- Maintain backward compatibility during migration
- Test each phase thoroughly before proceeding
- Document all changes for future reference
- Consider using `@next/mdx` or `next-mdx-remote` if dynamic content is needed
- Preserve all existing content and metadata
- Ensure zero downtime during deployment

## Current Status
- [ ] Analysis phase
- [ ] Foundation implementation
- [ ] Routing modernization
- [ ] Component migration
- [ ] Build process cleanup
- [ ] Testing and validation
- [ ] Documentation update

This modernization will align the website with Next.js best practices, improve performance, and create a more maintainable content management system.