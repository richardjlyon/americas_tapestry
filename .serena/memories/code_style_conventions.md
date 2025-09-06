# Code Style and Conventions

## TypeScript Standards
- Always use TypeScript for type safety
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type - use `unknown` when type is truly unknown

## React Components
- Use functional components with TypeScript
- One component per file
- Component files named in PascalCase
- Include prop types using interfaces
- Use React hooks (useState, useReducer) for state management

## Styling
- **Primary**: Tailwind CSS for styling
- Avoid inline styles
- Use CSS modules for component-specific styles when needed
- Typography plugin for content-rich areas (`.content-typography` class)

## File Organization
- Components in `/src/components/` with subdirectories:
  - `ui/` - Base UI components
  - `features/` - Feature-specific components  
  - `layout/` - Layout components
  - `shared/` - Shared reusable components

## Naming Conventions
- Components: PascalCase (e.g., `Button.tsx`)
- Files/directories: kebab-case for non-components
- Variables/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE

## Code Quality Tools
- ESLint for linting
- Biome for formatting
- Jest + React Testing Library for testing
- Playwright for E2E testing