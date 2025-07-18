# TASK.md

  🔥 HIGH PRIORITY (Deployment Blockers)

  1. Fix Next.js image optimization
  - Remove unoptimized: true from next.config.mjs
  - This is likely causing bundle size issues on Vercel

  2. Convert hero carousel to next/image
  - Replace <img> tags with next/image
  - Add priority={true} for above-the-fold loading
  - Critical for Core Web Vitals

  3. Consolidate duplicate content directories
  - Choose between /content/ or /public/content/
  - Eliminate duplication causing deployment size issues

  4. Remove pre-build image migration scripts
  - Delete scripts that run before build
  - Simplify deployment process

  ⚡ MEDIUM PRIORITY (Performance & Maintainability)

  5. Convert all remaining <img> tags to next/image
  - Systematic replacement across all components
  - Ensure consistent image optimization

  6. Restructure to App Router best practices
  - Create src/ directory structure
  - Move app/, components/, lib/, hooks/ inside src/

  7. Clean up next.config.mjs
  - Remove commented experimental code
  - Re-enable TypeScript/ESLint checks
  - Simplify configuration

  8. Optimize component organization
  - Separate UI from feature components
  - Consolidate unnecessary layout files

  9. Fix dependency management
  - Replace "latest" with specific versions
  - Security audit and cleanup

  🎯 LOW PRIORITY (Polish & Optimization)

  10. Implement advanced image optimization
  - Add responsive breakpoints
  - Modern formats (WebP/AVIF)
  - Blur placeholders

  11. Error handling & accessibility
  - Proper fallbacks
  - ARIA labels
  - Focus management

  12. Bundle optimization
  - Code splitting
  - Unused dependency removal
  - Bundle analysis
