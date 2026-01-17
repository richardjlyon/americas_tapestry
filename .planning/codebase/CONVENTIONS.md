# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- React components: `kebab-case.tsx` (e.g., `tapestry-card.tsx`, `contact-form.tsx`)
- Utility modules: `kebab-case.ts` (e.g., `image-utils.ts`, `use-connection-aware.ts`)
- Server actions: `kebab-case.ts` with `-actions` suffix (e.g., `contact-actions.ts`)
- Test files: `*.test.tsx` in `src/__tests__/` or `*.spec.ts` in `e2e/`

**Functions:**
- React components: PascalCase (e.g., `TapestryCard`, `OptimizedImage`)
- Utility functions: camelCase (e.g., `getImagePath`, `isMobileDevice`)
- Hooks: camelCase with `use` prefix (e.g., `useConnectionAware`, `useToast`)
- Server actions: camelCase (e.g., `sendContactEmail`, `subscribeToNewsletter`)

**Variables:**
- Local variables: camelCase (e.g., `hasError`, `currentSrc`)
- Constants: UPPER_SNAKE_CASE for true constants, camelCase for config objects
- Boolean variables: `is/has/should` prefixes (e.g., `isInView`, `hasLoaded`, `shouldLoad`)

**Types/Interfaces:**
- Interfaces: PascalCase (e.g., `TapestryEntry`, `ConnectionInfo`)
- Type aliases: PascalCase (e.g., `TapestryStatus`, `ConnectionType`)
- Props interfaces: `{ComponentName}Props` pattern (e.g., `ButtonProps`, `OptimizedImageProps`)

## Code Style

**Formatting:**
- Tool: Biome (`@biomejs/biome` v1.9.4)
- Indent: 2 spaces
- Line width: 80 characters
- Quote style: Single quotes for JavaScript/TypeScript
- Config file: `biome.json`

**Linting:**
- Tool: ESLint with `next/core-web-vitals` preset
- Disabled rules:
  - `react/no-unescaped-entities`
  - `@next/next/no-img-element`
- Config file: `.eslintrc.json`

**TypeScript:**
- Strict mode enabled with additional strict flags
- `noUncheckedIndexedAccess`: true (use bracket notation with nullish checks)
- `noImplicitReturns`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React imports (`'use client'` directive first if needed)
2. React/Next.js core (`import { useState } from 'react'`)
3. Third-party packages (Radix UI, lucide-react, zod, etc.)
4. Local absolute imports using `@/` alias
5. Types (often inline with their source)

**Path Aliases:**
- `@/*` for all src imports (e.g., `@/components/ui/button`, `@/lib/utils`)

**Example:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TapestryEntry } from '@/lib/tapestries';
```

## Error Handling

**Patterns:**
- Server actions return `{ success: boolean; message: string }` objects
- Try-catch with specific error type checks (e.g., `instanceof z.ZodError`)
- Console logging for debugging with context (e.g., `console.error('Error in sendContactEmail:', error)`)
- Graceful degradation in components (fallback images, error states)

**Example - Server Action:**
```typescript
export async function sendContactEmail(formData: ContactFormData) {
  try {
    const validatedData = contactFormSchema.parse(formData);
    // ... operation
    return { success: true, message: 'Success message' };
  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation error', errors: error.errors };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
```

**Example - Component Error State:**
```typescript
const handleError = () => {
  if (currentSrc !== fallbackSrc) {
    setCurrentSrc(fallbackSrc);
    setHasError(false);
  } else {
    setHasError(true);
  }
};
```

## Logging

**Framework:** Console (native browser/Node.js)

**Patterns:**
- `console.error()` for errors with context
- `console.warn()` for recoverable issues (e.g., image load failures)
- No production logging setup detected

## Comments

**When to Comment:**
- JSDoc for exported utility functions with parameters and return values
- Inline comments for non-obvious logic or connection-aware optimizations
- Section comments in larger files (e.g., `// Status color mapping`)

**JSDoc Usage:**
```typescript
/**
 * Get mobile-optimized image path
 * Returns smaller, more compressed variants for mobile devices
 * Part of Phase 4 Mobile Optimization
 *
 * @param imagePath - Original image path
 * @param role - Image role for appropriate sizing
 * @param forceOptimization - Force mobile optimization regardless of device detection
 * @returns Optimized path for mobile devices
 */
export function getMobileOptimizedPath(...): string { ... }
```

## Function Design

**Size:** Functions are kept focused; complex logic split into helpers

**Parameters:**
- Required parameters first, optional parameters with defaults last
- Object destructuring for multiple optional parameters
- Default parameter values in function signature

**Return Values:**
- Explicit return types always specified
- Union types for nullable returns (e.g., `TapestryEntry | null`)
- Objects with consistent shape for action responses

## Module Design

**Exports:**
- Named exports preferred over default exports for utilities
- Default export for React components (following Next.js convention)
- Re-export related items from index files where appropriate

**Component Structure:**
```typescript
// Props interface first
interface ComponentProps {
  prop: string;
}

// Component function
export function Component({ prop }: ComponentProps) {
  // State hooks
  const [state, setState] = useState();

  // Effects
  useEffect(() => { ... }, []);

  // Event handlers
  const handleClick = () => { ... };

  // Render
  return <div />;
}

// Display name for debugging
Component.displayName = 'Component';
```

## React Patterns

**Component Types:**
- Server Components: Default in `app/` directory pages
- Client Components: Marked with `'use client'` at top of file
- UI Components: Composable primitives using `forwardRef` pattern (shadcn/ui style)

**State Management:**
- `useState` for local component state
- `useEffect` for side effects and subscriptions
- Custom hooks for reusable stateful logic (e.g., `useConnectionAware`)

**Props Pattern (shadcn/ui style):**
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
```

## Styling Conventions

**Framework:** Tailwind CSS v3.4

**Utility Function:**
- Use `cn()` from `@/lib/utils` for conditional class merging
- Combines `clsx` and `tailwind-merge`

**Color Palette:**
- Colonial theme colors: `colonial-navy`, `colonial-burgundy`, `colonial-gold`, `colonial-stone`, `colonial-parchment`
- CSS variables for shadcn/ui semantic colors: `--primary`, `--secondary`, `--muted`, etc.

**Typography:**
- Sans-serif: Montserrat (`font-sans`)
- Serif: EB Garamond (`font-serif`)

**Class Ordering:**
- Layout (display, position, dimensions)
- Spacing (padding, margin)
- Typography (font, text)
- Colors (bg, text color, border)
- Effects (shadows, transitions)

## Form Handling

**Libraries:**
- `react-hook-form` for form state management
- `zod` for schema validation
- `@hookform/resolvers` for zod integration

**Pattern:**
```typescript
const schema = z.object({
  email: z.string().email({ message: 'Error message' }),
  // ...
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Server Actions

**Location:** `src/app/actions/*.ts`

**Pattern:**
- `'use server'` directive at file top
- Zod schema for validation
- Return typed response objects
- Handle all error cases

---

*Convention analysis: 2026-01-17*
