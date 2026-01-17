# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- JavaScript - Configuration files (`jest.config.js`, `tailwind.config.js`)
- CSS - Global styles (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js 24.11 (specified in `package.json` engines)
- `.nvmrc` specifies version `20` (for nvm compatibility)

**Package Manager:**
- npm 10.8.2 (specified in `package.json` packageManager)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.0.7 - React framework with App Router
- React 18 - UI library
- React DOM 18 - DOM rendering

**Testing:**
- Jest 29.7.0 - Unit testing framework
- React Testing Library 16.3.0 - Component testing
- Playwright 1.54.1 - End-to-end testing

**Build/Dev:**
- SWC - Build tooling (via Next.js)
- PostCSS 8 - CSS processing
- Tailwind CSS 3.4.17 - Utility-first CSS framework

## Key Dependencies

**Critical:**
- `next` 16.0.7 - Application framework
- `react` 18 - UI library
- `tailwindcss` 3.4.17 - Styling
- `typescript` 5.9.2 - Type safety

**UI Components:**
- `@radix-ui/*` - Headless UI primitives (accordion, dialog, dropdown, tabs, tooltip, etc.)
- `lucide-react` 0.454.0 - Icon library
- `class-variance-authority` 0.7.1 - Component variant styling
- `tailwind-merge` 2.5.5 - Tailwind class merging
- `clsx` 2.1.1 - Conditional class names

**Maps:**
- `mapbox-gl` 3.10.0 - Map rendering
- `react-map-gl` 8.0.1 - React Mapbox bindings
- `leaflet` 1.9.4 - Alternative map library
- `react-leaflet` 4.2.1 - React Leaflet bindings

**Forms & Validation:**
- `react-hook-form` 7.54.1 - Form management
- `@hookform/resolvers` 3.9.1 - Form validation resolvers
- `zod` 3.24.1 - Schema validation

**Content:**
- `gray-matter` 4.0.3 - Markdown frontmatter parsing
- `remark` 15.0.1 - Markdown processing
- `remark-html` 16.0.1 - Markdown to HTML conversion

**Email:**
- `resend` 4.0.1 - Transactional email API

**Charts:**
- `recharts` 2.15.0 - Data visualization

**Date Handling:**
- `date-fns` 2.30.0 - Date utilities
- `react-day-picker` 8.10.1 - Date picker component

**UI Utilities:**
- `embla-carousel-react` 8.5.2 - Carousel component
- `sonner` 1.7.1 - Toast notifications
- `vaul` 0.9.6 - Drawer component
- `cmdk` 1.0.4 - Command palette
- `next-themes` 0.4.4 - Theme management
- `react-resizable-panels` 2.1.7 - Resizable panels

**Performance:**
- `web-vitals` 4.2.4 - Core Web Vitals monitoring
- `@vercel/analytics` 1.5.0 - Analytics

**Infrastructure:**
- `@aws-sdk/client-s3` 3.948.0 (devDependency) - S3/R2 storage operations
- `sharp` 0.34.5 (devDependency) - Image optimization

## Configuration

**Environment:**
- Configuration via `.env.local` (secrets)
- Example file: `.env.example` documents required variables
- Public variables prefixed with `NEXT_PUBLIC_`

**Required Environment Variables:**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox API key
- `NEXT_PUBLIC_SITE_URL` - Site URL
- `NEXT_PUBLIC_DEFAULT_MAPBOX_STYLE` - Mapbox style
- `RESEND_API_KEY` - Email service key
- `MAILERLITE_API_KEY` - Newsletter service key
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` - Cloudflare R2 storage
- `R2_IMAGES_BUCKET`, `R2_IMAGES_PUBLIC_URL`, `NEXT_PUBLIC_R2_IMAGES_URL` - R2 image hosting

**Build:**
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `jest.config.js` - Jest test configuration
- `playwright.config.ts` - E2E test configuration

**TypeScript Configuration:**
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES6
- Module: ESNext with bundler resolution
- Additional strict checks: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`

**Linting/Formatting:**
- ESLint with `next/core-web-vitals` preset (`.eslintrc.json`)
- Biome 1.9.4 for formatting (`biome.json`)
  - Indent: 2 spaces
  - Line width: 80
  - Single quotes for JavaScript

## Platform Requirements

**Development:**
- Node.js 24.11+ (or 20.x per .nvmrc)
- npm 10.8.2+
- Git

**Production:**
- Vercel deployment (`.vercel/` directory present)
- Cloudflare R2 for image hosting
- Custom image loader eliminates Vercel image optimization costs

**Scripts:**
```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm run typecheck     # TypeScript checking
npm run format        # Biome formatting
npm run test          # Jest tests
npm run test:e2e      # Playwright E2E tests
npm run analyze       # Bundle analysis
```

---

*Stack analysis: 2026-01-17*
