# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
americas_tapestry/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── actions/            # Server Actions
│   │   ├── about/              # Static pages
│   │   ├── contact/
│   │   ├── news/               # Dynamic blog routes
│   │   ├── sponsors/           # Dynamic sponsor routes
│   │   ├── tapestries/         # Dynamic tapestry routes
│   │   ├── team/               # Dynamic team routes
│   │   └── [other routes]/
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   │   ├── features/           # Feature-specific components
│   │   ├── layout/             # Header, Footer, PageLayout
│   │   └── shared/             # Cross-feature shared components
│   ├── lib/                    # Utility functions and data access
│   ├── hooks/                  # Custom React hooks
│   └── __tests__/              # Test files
├── content/                    # Markdown content source
│   ├── exhibitions/
│   ├── news/
│   ├── sponsors/
│   ├── tapestries/
│   ├── team/
│   └── video/
├── public/
│   ├── images/                 # Static images
│   ├── docs/                   # PDF resources
│   ├── data/                   # JSON data files
│   └── video/                  # Video files
├── .planning/                  # Planning documents
└── [config files]
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router - pages, layouts, server actions
- Contains: Route handlers, page.tsx, layout.tsx, loading.tsx, error.tsx
- Key files: `layout.tsx` (root), `page.tsx` (home), `globals.css`

**`src/app/actions/`:**
- Purpose: Server Actions for form handling
- Contains: `contact-actions.ts`, `newsletter-actions.ts`, `sponsor-actions.ts`, `team-actions.ts`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives (shadcn/ui based)
- Contains: Button, Card, Dialog, Form, Input, etc.
- Key files: `button.tsx`, `card.tsx`, `page-section.tsx`, `optimized-image.tsx`

**`src/components/features/`:**
- Purpose: Feature-specific component groups
- Contains: Subdirectories per feature domain
- Structure: `features/{domain}/{component}.tsx`

**`src/components/features/` Subdirectories:**
- `blog/` - Blog card, featured post
- `contact/` - Contact form
- `home/` - Home page sections (about, vision, tapestries, support, etc.)
- `news/` - News grid, post components, filters
- `newsletter/` - Newsletter signup forms
- `resources/` - Resource cards
- `sponsors/` - Sponsor card
- `support/` - Support page sections
- `tapestries/` - Tapestry grid, cards, map, timeline
- `team/` - Team components, member cards

**`src/components/layout/`:**
- Purpose: Page structure components
- Contains: `header.tsx`, `footer.tsx`, `page-layout.tsx`

**`src/components/shared/`:**
- Purpose: Cross-feature reusable components
- Contains: `hero-carousel.tsx`, `accessible-audio-player.tsx`, `colonial-map.tsx`, `full-image-viewer.tsx`, `theme-provider.tsx`

**`src/lib/`:**
- Purpose: Utilities and data access functions
- Contains: Content loaders, helpers, configs
- Key files:
  - `content-core.ts` - Core markdown reading
  - `tapestries.ts` - Tapestry data access
  - `blog.ts` - Blog/news data access
  - `team.ts` - Team data access
  - `sponsors.ts` - Sponsor data access
  - `exhibitions.ts` - Exhibition data access
  - `utils.ts` - General utilities (cn, formatDate)
  - `image-utils.ts` - Image path helpers
  - `cloudflare-loader.ts` - R2 image loader
  - `markdown.ts` - Markdown processing

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: `use-toast.ts`, `use-connection-aware.ts`

**`content/`:**
- Purpose: Markdown content source files
- Contains: Subdirectories per content type
- Structure: `content/{type}/{slug}/index.md` or `content/{type}/{category}/{slug}.md`

**`public/images/`:**
- Purpose: Static image assets
- Contains: Subdirectories mirroring content types
- Structure: `images/{type}/{slug}/{image-files}`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with providers
- `src/app/page.tsx`: Home page

**Configuration:**
- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts

**Core Logic:**
- `src/lib/content-core.ts`: Generic content reading
- `src/lib/tapestries.ts`: Tapestry domain logic
- `src/lib/blog.ts`: Blog domain logic
- `src/lib/team.ts`: Team domain logic

**Testing:**
- `src/__tests__/`: Test files
- `jest.config.js`: Jest configuration

## Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `hero-carousel.tsx`, `blog-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `content-core.ts`, `image-utils.ts`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Server Actions: `*-actions.ts` (e.g., `contact-actions.ts`)

**Directories:**
- Route segments: `kebab-case` (e.g., `privacy-policy`)
- Dynamic segments: `[param]` or `[...param]` (e.g., `[slug]`)
- Component groups: `kebab-case` (e.g., `features/home`)

**Exports:**
- Components: PascalCase (e.g., `export function HeroCarousel`)
- Utilities: camelCase (e.g., `export function getAllTapestries`)
- Types: PascalCase (e.g., `export interface TapestryEntry`)

## Where to Add New Code

**New Page:**
- Create directory: `src/app/{route-name}/`
- Add files: `page.tsx`, optionally `layout.tsx`, `loading.tsx`
- For dynamic routes: `src/app/{route}/[slug]/page.tsx`

**New Feature Component:**
- Location: `src/components/features/{feature-name}/`
- Naming: `{component-name}.tsx`
- Example: `src/components/features/events/event-card.tsx`

**New UI Primitive:**
- Location: `src/components/ui/`
- Naming: `{component-name}.tsx`
- Follow shadcn/ui patterns

**New Shared Component:**
- Location: `src/components/shared/`
- Use for cross-feature components

**New Content Type:**
- Content: `content/{type-name}/`
- Images: `public/images/{type-name}/`
- Data access: `src/lib/{type-name}.ts`
- Follow `content-core.ts` patterns

**New Server Action:**
- Location: `src/app/actions/{domain}-actions.ts`
- Include Zod schema for validation

**New Utility:**
- Location: `src/lib/{utility-name}.ts`
- Export functions with clear names

**New Hook:**
- Location: `src/hooks/use-{hook-name}.ts`
- Follow React hook conventions

## Special Directories

**`.planning/`:**
- Purpose: Planning and documentation
- Generated: No
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No

**`.vercel/`:**
- Purpose: Vercel deployment config
- Generated: Yes
- Committed: No

**`.serena/`:**
- Purpose: Serena MCP tool cache
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-01-17*
