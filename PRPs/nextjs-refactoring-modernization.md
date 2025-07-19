# Next.js Website Refactoring and Modernization PRP

CRITICAL. You MUST run `npm run test:refactor` and enture tests work before completing a taks.Z

## 📋 Overview

This PRP addresses comprehensive refactoring of the America's Tapestry Next.js website to eliminate code duplication, implement modern 2025 architectural patterns, and bring the codebase up to professional standards. The current implementation shows junior-level patterns with significant technical debt including layout duplication, component inconsistencies, disabled TypeScript checking, and poor organization.

## 🎯 Success Criteria

- ✅ Eliminate all layout duplication (7+ identical layout files)
- ✅ Consolidate duplicate components and remove redundancy
- ✅ Implement feature-based component organization following 2025 patterns
- ✅ Enable strict TypeScript checking (currently disabled for production)
- ✅ Add comprehensive testing framework with validation patterns
- ✅ Achieve consistent naming conventions throughout codebase
- ✅ Migrate to src/ directory structure per Next.js 15 best practices
- ✅ All tests pass and builds succeed without ignoring errors
- ✅ Visual fidelity maintained across all pages
- ✅ Performance improvements measurable via Core Web Vitals

## 🔗 Critical Context & Documentation

### Next.js 15 Best Practices (2025)
- **Official Project Structure**: https://nextjs.org/docs/app/getting-started/project-structure
- **App Router Guide**: https://nextjs.org/docs/app/guides
- **TypeScript Config**: https://nextjs.org/docs/app/api-reference/config/typescript
- **Critical Pattern**: src/ directory structure is now recommended for clean separation

### Modern React Component Organization (2025)
- **Feature-Based Architecture**: https://medium.com/@muhmdshanoob/feature-driven-modular-architecture-in-react-focusing-on-scalability-reusability-and-atomic-76d9579ac60e
- **Component Patterns**: https://www.telerik.com/blogs/react-design-patterns-best-practices
- **Key Insight**: Atomic Design is declining for complex apps; feature-based organization preferred

### TypeScript Strict Mode 2025
- **Strict Configuration**: https://nextjs.org/docs/app/api-reference/config/typescript
- **Modern Settings**: https://gist.github.com/dilame/32709f16e3f8d4d64b596f5b19d812e1

### Current Codebase Patterns

**Layout Duplication Example** (app/about/layout.tsx):
```tsx
import type React from 'react';
import PageLayout from '../page-layout';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
```

**Component Duplication Examples**:
- `components/team-member-card.tsx` vs `components/team/person-card.tsx`
- `components/ui/colonial-buttons.tsx` vs `components/ui/colonial/colonial-buttons.tsx`

**Target Structure** (from research):
```
src/
├── app/              # App Router
├── components/       # Shared components
│   ├── ui/          # Basic reusable components
│   └── features/    # Feature-specific components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
└── __tests__/       # Test files
```

## 🚨 Critical Issues Identified

### 1. Layout Duplication Crisis
**Files with identical PageLayout wrapper patterns:**
- `app/about/layout.tsx:4-10`
- `app/contact/layout.tsx:4-10`
- `app/news/layout.tsx:1-10`
- `app/privacy-policy/layout.tsx`
- `app/resources/layout.tsx`
- `app/sponsors/layout.tsx`
- `app/support/layout.tsx`
- `app/tapestries/layout.tsx`
- `app/team/layout.tsx`

### 2. Component Architecture Issues
**Duplicate Components:**
- `components/team-member-card.tsx` (148 lines) vs `components/team/person-card.tsx` (similar functionality)
- `components/ui/colonial-buttons.tsx` vs `components/ui/colonial/colonial-buttons.tsx` (exact duplicate)

**Mixed Organization Patterns:**
- Feature components scattered: `components/home/`, `components/news/`, `components/team/`
- Root-level components: `components/header.tsx`, `components/footer.tsx`
- UI components properly organized: `components/ui/`

### 3. TypeScript Configuration Issues
**Current next.config.mjs (lines 3-8):**
```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ❌ Ignoring linting errors
  },
  typescript: {
    ignoreBuildErrors: true,   // ❌ Ignoring TypeScript errors
  },
```

**Missing Strict TypeScript Options** (tsconfig.json needs):
```json
{
  "compilerOptions": {
    "strict": true,  // ✅ Already enabled
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true
  }
}
```

### 4. Project Metadata Issues
**package.json line 2:**
```json
"name": "my-v0-project",  // ❌ Generic v0.dev project name
```

### 5. Testing Infrastructure Missing
- No testing framework setup
- No component test patterns
- No validation gates for refactoring

## 🛠️ Implementation Blueprint

### Phase 1: Project Structure Migration (Priority: Critical)

**Task 1.1: Migrate to src/ Directory Structure**
```bash
# Create new src structure
mkdir -p src/{app,components,lib,hooks,types,__tests__}

# Move existing directories
mv app src/
mv components src/
mv lib src/
mv hooks src/ # if exists

# Update all import paths from @/* to @/src/*
```

**Task 1.2: Consolidate Layout Duplication**
CRITICAL: Make sure you do NOT break the layout of the homepage when altering header files
Create `src/components/layouts/page-layout.tsx`:
```tsx
import type React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SiteBreadcrumb } from '@/components/ui/site-breadcrumb';

interface PageLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function PageLayout({
  children,
  fullWidth = false,
}: PageLayoutProps) {
  return (
    <>
      <Header />
      <SiteBreadcrumb />
      <main className="flex-1 woven-linen content-spacing-sm">{children}</main>
      <Footer />
    </>
  );
}
```

**Delete all duplicate layout files and update imports**

**Task 1.3: Update Package Metadata**
```json
{
  "name": "americas-tapestry",
  "description": "A visual exploration of cultural diversity across the American landscape",
  "version": "1.0.0"
}
```

### Phase 2: Component Organization (Priority: High)

**Task 2.1: Implement Feature-Based Architecture**
New structure:
```
src/components/
├── ui/                    # Basic reusable components
│   ├── button.tsx
│   ├── card.tsx
│   └── form/
├── layout/               # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   └── page-layout.tsx
└── features/            # Feature-specific components
    ├── home/
    ├── news/
    ├── team/
    ├── tapestries/
    ├── resources/
    └── support/
```

**Task 2.2: Eliminate Component Duplicates**

**Priority 1: Colonial Buttons Duplication**
- Remove `components/ui/colonial/colonial-buttons.tsx`
- Keep `components/ui/colonial-buttons.tsx`
- Update all imports

**Priority 2: Team Member Components**
Analysis needed to merge:
- `components/team-member-card.tsx` (148 lines, complex state)
- `components/team/person-card.tsx` (simpler implementation)

Target unified component:
```tsx
// src/components/features/team/member-card.tsx
interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'full' | 'simple' | 'grid';
  className?: string;
}
```

**Task 2.3: Standardize Naming Conventions**
Convert to kebab-case:
- `EducationalResourcesCard.tsx` → `educational-resources-card.tsx`
- `RelatedArtefactsGalleryCard.tsx` → `related-artefacts-gallery-card.tsx`
- `TapestryGlossariesCard.tsx` → `tapestry-glossaries-card.tsx`

### Phase 3: TypeScript Modernization (Priority: High)

**Task 3.1: Enable Strict Checking**
Update `next.config.mjs`:
```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,  // ✅ Enable linting
  },
  typescript: {
    ignoreBuildErrors: false,   // ✅ Enable TypeScript checking
  },
```

**Task 3.2: Add 2025 TypeScript Strict Options**
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "paths": {
      "@/*": ["./src/*"]  // ✅ Update for src/ structure
    }
  }
}
```

**Task 3.3: Fix Type Errors**
Systematically address all TypeScript errors revealed by strict checking.

### Phase 4: Testing Framework (Priority: Medium)

**Task 4.1: Add Testing Dependencies**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Task 4.2: Configure Jest**
Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

**Task 4.3: Create Test Patterns**
Example component test:
```tsx
// src/__tests__/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Phase 5: Documentation & Validation (Priority: Medium)

**Task 5.1: Update Documentation**
- Update README.md with new structure
- Document component organization patterns
- Add testing guidelines

**Task 5.2: Create Migration Guide**
Document breaking changes and update instructions for developers.

## 🧪 Validation Gates

**Must Pass Before Completion:**
```bash
# TypeScript and Linting
npm run build                    # Must succeed without errors
npm run lint                     # Must pass all linting rules

# Testing (after Phase 4)
npm run test                     # All tests must pass
npm run test:coverage            # Minimum 60% coverage

# Visual Validation
npm run dev
npm run test:refactor              # Runs both Jest and Playwright tests
# Manual testing of key pages:
# - / (homepage)
# - /about
# - /team
# - /tapestries
# - /news
# - /contact
```

**Performance Validation:**
- Core Web Vitals maintained or improved
- Bundle size not increased
- Build time improvements measured

## ⚠️ Common Gotchas & Solutions

### Import Path Updates
**Problem**: Moving to src/ breaks all imports
**Solution**: Use find/replace for `@/` imports, update tsconfig.json paths

### Layout Migration Issues
**Problem**: Nested layouts may have different requirements
**Solution**: Audit each page's layout needs before consolidating

### Component Merge Conflicts
**Problem**: team-member-card.tsx has complex state, person-card.tsx is simpler
**Solution**: Keep complex version, add variant props for simple use cases

### TypeScript Strict Mode Reveals Issues
**Problem**: Enabling strict mode will reveal many existing type issues
**Solution**: Fix incrementally, use TODO comments for non-critical issues

### Testing Integration
**Problem**: No existing test patterns to follow
**Solution**: Start with simple component tests, build up patterns gradually

## 🔍 Success Metrics

### Before Refactoring
- 9 duplicate layout files
- 2+ duplicate component pairs
- TypeScript errors ignored in production
- No testing framework
- Mixed naming conventions
- Generic project name

### After Refactoring
- 1 reusable PageLayout component
- 0 duplicate components
- Full TypeScript strict checking enabled
- Jest + RTL testing framework
- Consistent kebab-case naming
- Professional project metadata
- Feature-based component organization
- Comprehensive test coverage

## 📚 Additional Resources

### Next.js 15 Documentation
- **App Router Migration**: https://nextjs.org/docs/app/guides/upgrading
- **TypeScript Best Practices**: https://nextjs.org/docs/app/api-reference/config/typescript
- **Testing Next.js**: https://nextjs.org/docs/app/building-your-application/testing

### React Testing Patterns
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro
- **Jest Configuration**: https://jestjs.io/docs/configuration

### Component Organization
- **Feature-Based Architecture**: https://dev.to/m_midas/atomic-design-and-its-relevance-in-frontend-in-2025-32e9
- **Modern React Patterns**: https://www.telerik.com/blogs/react-design-patterns-best-practices

## 🎯 Implementation Priority Order

1. **Phase 1.1**: Migrate to src/ directory structure
2. **Phase 1.2**: Consolidate layout duplication (immediate impact)
3. **Phase 2.2**: Eliminate component duplicates (critical cleanup)
4. **Phase 3.1**: Enable TypeScript strict checking
5. **Phase 2.1**: Implement feature-based organization
6. **Phase 3.2**: Add TypeScript strict options
7. **Phase 1.3**: Update package metadata
8. **Phase 4**: Add testing framework
9. **Phase 2.3**: Standardize naming conventions
10. **Phase 5**: Documentation and final validation

## Confidence Score: 9/10

**Reasoning**: Comprehensive codebase analysis completed, modern patterns researched, clear implementation path defined with specific file references, validation gates established, and common gotchas anticipated. The only uncertainty is the exact scope of TypeScript errors that will be revealed when strict checking is enabled, but these can be addressed incrementally.
