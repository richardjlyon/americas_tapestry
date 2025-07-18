# Claude Code Configuration for Next.js Projects

This document provides guidelines and preferences for Claude Code when generating Next.js applications.

## Core Principles

1. **Simplicity First**: Write code that is easy to understand and maintain
2. **Clean Architecture**: Follow established patterns and best practices
3. **Comprehensive Documentation**: Include clear comments and documentation
4. **Maintainability**: Structure code for long-term sustainability

## Project Structure

Use the Next.js App Router (app directory) structure:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (routes)/
├── components/
│   ├── ui/           # Reusable UI components
│   └── features/     # Feature-specific components
├── lib/
│   ├── utils.ts      # Utility functions
│   └── constants.ts  # App constants
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── public/           # Static assets
```

## Code Style Guidelines

### TypeScript

- Always use TypeScript for type safety
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type - use `unknown` when type is truly unknown

```typescript
// Good
interface UserProps {
  name: string;
  email: string;
  age?: number;
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// Avoid
type UserProps = {
  name: any;
}
```

### React Components

- Use functional components with TypeScript
- One component per file
- Component files should be named in PascalCase
- Include prop types using interfaces

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### State Management

- Use React's built-in hooks for local state
- For global state, prefer Zustand or Context API over Redux
- Keep state as close to where it's used as possible

```typescript
// Simple state with useState
const [isOpen, setIsOpen] = useState(false);

// Complex state with useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

## Styling Preferences

- Use Tailwind CSS for styling
- Avoid inline styles
- Create reusable utility classes for common patterns
- Use CSS modules for component-specific styles when needed

```typescript
// Good - using Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// Avoid - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

## API Routes

- Use Next.js Route Handlers (app/api structure)
- Implement proper error handling
- Use TypeScript for request/response types
- Follow RESTful conventions

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

## Data Fetching

- Use Server Components for data fetching when possible
- Implement loading and error states
- Use React Suspense for better UX

```typescript
// app/users/page.tsx
async function UsersPage() {
  const users = await fetchUsers();

  return (
    <div>
      <h1>Users</h1>
      <UsersList users={users} />
    </div>
  );
}

// With error handling
export default async function Page() {
  try {
    const data = await fetchData();
    return <Component data={data} />;
  } catch (error) {
    return <ErrorComponent message="Failed to load data" />;
  }
}
```

## Forms

- Use React Hook Form for form management
- Implement client-side validation with Zod
- Show clear error messages
- Provide loading states during submission

```typescript
// Example with React Hook Form and Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Environment Variables

- Use `.env.local` for local development
- Prefix client-side variables with `NEXT_PUBLIC_`
- Never commit sensitive data
- Provide `.env.example` file

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com

# .env.example
DATABASE_URL=
NEXT_PUBLIC_API_URL=
```

## Testing

- Write unit tests for utilities and hooks
- Use React Testing Library for component tests
- Include basic integration tests for critical paths
- Aim for meaningful coverage, not 100%

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Optimization

- Use dynamic imports for code splitting
- Implement image optimization with next/image
- Minimize client-side JavaScript
- Use Server Components by default

```typescript
// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Image optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
/>
```

## Documentation

Every component and function should include:

```typescript
/**
 * Button component for user interactions
 *
 * @param children - Content to display inside the button
 * @param onClick - Click handler function
 * @param variant - Visual style variant
 * @param disabled - Whether the button is disabled
 *
 * @example
 * <Button variant="primary" onClick={handleSubmit}>
 *   Submit Form
 * </Button>
 */
```

## Git Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Dependencies

Prefer these well-maintained libraries:
- **Forms**: react-hook-form
- **Validation**: zod
- **State Management**: zustand (for complex state)
- **Date Handling**: date-fns
- **HTTP Client**: fetch API or axios
- **Animation**: framer-motion (when needed)
- **Icons**: lucide-react

## Security Best Practices

- Sanitize user inputs
- Use CSRF protection
- Implement rate limiting on API routes
- Keep dependencies updated
- Use Content Security Policy headers

## Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain proper color contrast

## Error Handling

- Implement error boundaries
- Log errors appropriately
- Show user-friendly error messages
- Provide fallback UI

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

## Additional Notes

- Always consider mobile-first design
- Implement proper meta tags for SEO
- Use proper loading states
- Cache data appropriately
- Monitor Core Web Vitals

When generating code, prioritize readability and maintainability over cleverness. The goal is to create code that any developer can understand and modify with confidence.

---

## AI Assistant Behavior Rules

### Context Awareness
- **Always read project files** in this order: PLANNING.md → TASK.md → existing code
- **Never assume context** - ask for clarification when needed
- **Verify before suggesting** - check that files/modules exist before referencing

### Code Generation Rules
- **Never use unwrap() in libraries** - always propagate errors
- **Always write tests first** - TDD is non-negotiable
- **Include error context** - use `.context()` for error messages
- **Prefer explicit over clever** - clarity beats brevity

### When Making Changes
- **Never delete without permission** - ask before removing code
- **Maintain consistency** - follow existing patterns in the codebase
- **Update documentation** - keep README.md and inline docs current
- **Add discovered tasks** - update TASK.md with found issues

### Communication Style
- **Be direct and clear** - no unnecessary pleasantries
- **Explain the why** - provide reasoning for design decisions
- **Show, don't tell** - provide code examples
- **Flag uncertainties** - clearly mark assumptions that need verification
