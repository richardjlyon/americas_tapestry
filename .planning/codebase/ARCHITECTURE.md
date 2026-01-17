# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Next.js App Router with File-Based Content Management

**Key Characteristics:**
- Server-first architecture using React Server Components
- Markdown-based content stored in `/content` directory
- Static site generation with `generateStaticParams` for dynamic routes
- Feature-based component organization
- Server Actions for form handling and mutations

## Layers

**Presentation Layer:**
- Purpose: Renders UI, handles user interactions
- Location: `src/components/`
- Contains: React components (UI primitives, features, layout, shared)
- Depends on: lib utilities, hooks
- Used by: App Router pages

**Page Layer:**
- Purpose: Route handling, data fetching, page composition
- Location: `src/app/`
- Contains: Page components, layouts, server actions, loading/error states
- Depends on: Components, lib data functions
- Used by: Next.js router

**Data Access Layer:**
- Purpose: Content retrieval and transformation
- Location: `src/lib/`
- Contains: Content loaders (tapestries.ts, blog.ts, team.ts), utilities
- Depends on: gray-matter, file system
- Used by: Pages, server components

**Content Layer:**
- Purpose: Source of truth for all content
- Location: `/content/`
- Contains: Markdown files with YAML frontmatter
- Depends on: Nothing
- Used by: Data access layer via content-core.ts

## Data Flow

**Content Rendering Flow:**

1. Page component calls data function (e.g., `getAllTapestries()`)
2. Data function uses `content-core.ts` to read markdown files from `/content`
3. gray-matter parses frontmatter and content
4. Transformed data returned to page
5. Page passes data to presentation components
6. Components render with Tailwind CSS styling

**Form Submission Flow:**

1. User submits form in client component
2. Server Action invoked (e.g., `sendContactEmail`)
3. Zod validates input data
4. External service called (Resend for email)
5. Response returned to client
6. UI updated with success/error state

**State Management:**
- Server-side: Data fetched at request time in Server Components
- Client-side: React useState/useEffect for UI state (carousel, menus)
- No global state management library - component-level state only

## Key Abstractions

**ContentItem:**
- Purpose: Represents any markdown-based content item
- Examples: `src/lib/content-core.ts`
- Pattern: Generic content structure with slug, frontmatter, content, excerpt

**TapestryEntry:**
- Purpose: Domain model for tapestry artwork
- Examples: `src/lib/tapestries.ts`
- Pattern: Typed interface with status enum, timeline events, resources

**BlogPost:**
- Purpose: Domain model for news/blog content
- Examples: `src/lib/blog.ts`
- Pattern: Categorized content with featured flag, video support

**TeamMember/TeamGroup:**
- Purpose: Domain models for team organization
- Examples: `src/lib/team.ts`
- Pattern: Hierarchical grouping (groups contain members)

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Theme provider, fonts, analytics, HTML structure

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Root URL access
- Responsibilities: Hero carousel, section composition, data fetching

**Dynamic Routes:**
- Location: `src/app/[resource]/[slug]/page.tsx`
- Triggers: URL with dynamic segments
- Responsibilities: Fetch specific content, 404 handling, SSG params

**Server Actions:**
- Location: `src/app/actions/*.ts`
- Triggers: Form submissions from client components
- Responsibilities: Validation, external API calls, response handling

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**
- `notFound()` from next/navigation for missing content
- Try-catch with console.error logging in data functions
- Zod validation errors returned to client with field-level messages
- Fallback images for missing content (`/images/placeholders/`)
- Optional chaining and nullish coalescing throughout

## Cross-Cutting Concerns

**Logging:** Console-based logging (console.error, console.warn) for server-side issues

**Validation:** Zod schemas in server actions (`src/app/actions/*.ts`)

**Authentication:** None - public website

**Image Optimization:**
- Custom Cloudflare R2 loader (`src/lib/cloudflare-loader.ts`)
- Responsive image variants with width suffixes (-640w, -1024w, etc.)
- WebP format preference

---

*Architecture analysis: 2026-01-17*
