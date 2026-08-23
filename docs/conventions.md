# Conventions

## TypeScript
- Interfaces over type aliases for object shapes; explicit return types on
  exported functions; `unknown` rather than `any`.

## Components
- Functional components, one per file, `PascalCase.tsx`, props typed with an
  interface. `src/components/ui/` for reusable pieces, `features/` for
  page-specific compositions.
- Server Components by default; `'use client'` only where state or browser APIs
  are needed. Images through `next/image`.

## Styling
- Tailwind utilities; no inline `style={}`. Tokens and spacing in
  [design-system.md](design-system.md).

## Forms and data
- Forms: react-hook-form with a zod schema; show field errors and a submitting
  state.
- API routes: `app/api/**/route.ts`, typed request/response, JSON error body
  with a proper status code.

## Testing
- Jest for utilities, hooks and component integrity; Playwright (`e2e/`) for the
  critical user paths. Meaningful coverage, not 100%.

## Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
