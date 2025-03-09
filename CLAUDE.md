# America's Tapestry Website Commands and Guidelines

## Build and Development Commands
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Lint codebase

## Code Style Guidelines
- **TypeScript**: Use strict typing with Zod for validation schemas
- **React**: Functional components with hooks (useState, useForm)
- **Imports**: Group by external libraries, then internal paths using @/ alias
- **CSS**: Tailwind classes with consistent naming (colonial-navy, colonial-burgundy, etc.)
- **Error Handling**: try/catch blocks with appropriate logging and user feedback
- **Component Structure**: Client components use "use client" directive when needed
- **Form Validation**: Zod schemas with react-hook-form for validation
- **Server Actions**: Use "use server" directive for server-side functions

## Naming Conventions
- PascalCase for components and interfaces
- camelCase for variables, functions, and file names
- Descriptive function/component names that indicate purpose

Don't just run the server and say it works. Inspect the error logs each time.

## Dependency Compatibility
- Keep React at version 18.x.x for compatibility with Next.js 15.x.x
- Use date-fns 2.x.x for compatibility with react-day-picker

## Content Management
- Images for news articles should be placed in `public/images/news/`
- All media files should be in their respective content directories which are copied to public
- The scripts/copy-to-public.mjs script is responsible for copying media files from content to public
