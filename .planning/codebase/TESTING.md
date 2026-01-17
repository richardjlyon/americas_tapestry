# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Unit/Component Testing:**
- Framework: Jest v29.7 with `jest-environment-jsdom`
- Test runner: `next/jest` configuration
- Config: `jest.config.js`

**E2E Testing:**
- Framework: Playwright v1.54
- Config: `playwright.config.ts`

**Assertion Library:**
- Jest: `@testing-library/jest-dom` v6.6.3
- Playwright: Built-in `expect`

**Run Commands:**
```bash
npm test                      # Run all Jest tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage report
npm run test:quick            # Run smoke tests only
npm run test:components       # Run component integrity tests
npm run test:e2e              # Run Playwright E2E tests
npm run test:refactor         # Run both component and E2E tests
npm run test:all              # Alias for test:refactor
```

## Test File Organization

**Location:**
- Unit/Component tests: `src/__tests__/*.test.tsx`
- E2E tests: `e2e/*.spec.ts`
- Pattern: Centralized test directory (not co-located)

**Naming:**
- Unit tests: `*.test.tsx`
- E2E tests: `*.spec.ts`

**Structure:**
```
src/
  __tests__/
    component-integrity.test.tsx
    mobile-optimization.test.tsx
    simple-smoke.test.tsx
e2e/
    mobile-optimization.spec.ts
    refactor-safety.spec.ts
```

## Test Structure

**Suite Organization (Jest):**
```typescript
/**
 * Component Integrity Tests
 *
 * These tests ensure core components render without crashing.
 * They use simple mocks and focus on "does it render" rather than complex logic.
 */

import React from 'react';
import { render } from '@testing-library/react';

// Mock Next.js dependencies at top level
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

describe('Component Integrity Tests', () => {

  describe('Basic Rendering', () => {
    it('can render a simple React component without errors', () => {
      const TestComponent = () => <div data-testid="test">Hello World</div>;

      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();
    });
  });
});
```

**Suite Organization (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Refactor Safety - Critical Functionality', () => {

  test('Home page loads and displays core content', async ({ page }) => {
    await page.goto('/');

    expect(page.url()).toContain('localhost:3000');
    await expect(page.locator('main, body').first()).toBeVisible();
  });
});
```

**Patterns:**
- Descriptive test file headers with purpose explanation
- Nested `describe` blocks for logical grouping
- AAA pattern where applicable (Arrange, Act, Assert)
- Console error suppression for error boundary tests

## Mocking

**Framework:** Jest built-in mocking

**Common Mocks:**

Next.js Navigation:
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
```

Next.js Image:
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || 'test'} />,
}));
```

Next.js Link:
```typescript
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
```

Window/Navigator Properties:
```typescript
const mockWindowProperties = (properties: Partial<Window & { connection?: any }>) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: properties.innerWidth || 1024,
  });

  if (properties.connection !== undefined) {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: properties.connection,
    });
  }
};
```

IntersectionObserver:
```typescript
let mockIntersectionObserver: jest.Mock;
let mockObserve: jest.Mock;
let mockDisconnect: jest.Mock;

beforeEach(() => {
  mockObserve = jest.fn();
  mockDisconnect = jest.fn();
  mockIntersectionObserver = jest.fn().mockImplementation((_callback) => ({
    observe: mockObserve,
    unobserve: jest.fn(),
    disconnect: mockDisconnect,
  }));

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
});
```

**What to Mock:**
- Next.js router and navigation hooks
- Next.js Image component (simplified to img tag)
- Browser APIs not available in jsdom (IntersectionObserver, Network Information API)
- External services and APIs

**What NOT to Mock:**
- React Testing Library render
- Component internal state
- Utility functions being tested directly

## Fixtures and Factories

**Test Data:**
- Inline test data within test files
- No separate fixture files detected
- Simple object literals for props testing

**Pattern:**
```typescript
const FlexibleComponent = ({
  title,
  items = [],
  config
}: {
  title?: string;
  items?: any[];
  config?: any;
}) => (
  <div>
    <h1>{title || 'Default Title'}</h1>
    {/* ... */}
  </div>
);

// Test with various data combinations
render(<FlexibleComponent />);
render(<FlexibleComponent config={null} />);
render(<FlexibleComponent title="Test" items={[]} config={{}} />);
```

**Location:**
- No dedicated fixtures directory
- Test data defined inline in test files

## Coverage

**Requirements:** Not enforced (no coverage thresholds configured)

**Coverage Collection:**
```javascript
// jest.config.js
collectCoverageFrom: [
  'src/app/**/*.{js,jsx,ts,tsx}',
  'src/components/**/*.{js,jsx,ts,tsx}',
  'src/lib/**/*.{js,jsx,ts,tsx}',
  '!**/*.d.ts',
],
```

**View Coverage:**
```bash
npm run test:coverage
# Generates HTML report
```

## Test Types

**Unit Tests:**
- Focus: Utility functions, hooks
- Location: `src/__tests__/`
- Example: `mobile-optimization.test.tsx` tests `useConnectionAware` hook

**Component Tests:**
- Focus: "Does it render without crashing"
- Pattern: `expect(() => render(<Component />)).not.toThrow()`
- Example: `component-integrity.test.tsx`

**Integration Tests:**
- Focus: Component combinations
- Within Jest test files alongside unit tests

**E2E Tests:**
- Framework: Playwright
- Location: `e2e/`
- Focus: Full user journeys, page navigation, mobile responsiveness
- Browser: Chromium (single project configuration)

## Common Patterns

**Async Testing:**
```typescript
test('handles error state gracefully', async () => {
  render(<OptimizedImage src="/non-existent.jpg" ... />);

  const image = screen.getByTestId('optimized-image');
  fireEvent.error(image);

  await waitFor(() => {
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });
});
```

**Error Testing:**
```typescript
it('handles component render errors gracefully', () => {
  const originalError = console.error;
  console.error = jest.fn();

  // Test code that might log errors

  console.error = originalError;
});
```

**Viewport Testing (Playwright):**
```typescript
test('Mobile responsive - basic functionality', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/');

  await expect(page.locator('main, body').first()).toBeVisible();
});
```

**Multiple Page Testing (Playwright):**
```typescript
test('All main pages load successfully', async ({ page }) => {
  const pages = [
    { url: '/about', expectedText: 'Welcome' },
    { url: '/tapestries', expectedText: 'Tapestry' },
    // ...
  ];

  for (const pageInfo of pages) {
    await page.goto(pageInfo.url);
    await expect(page.locator('main, body').first()).toBeVisible({ timeout: 10000 });
    const content = await page.locator('main, body').first().textContent();
    expect(content).toContain(pageInfo.expectedText);
  }
});
```

## Playwright Configuration

**Base URL:** `http://localhost:3000`

**Dev Server:**
```typescript
webServer: {
  command: 'NODE_OPTIONS="--disable-warning=DEP0040" npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env['CI'],
  timeout: 120 * 1000,
},
```

**Screenshot Testing:**
```typescript
expect: {
  toHaveScreenshot: {
    threshold: 0.2,
  },
},
```

**CI Configuration:**
- Workers: 1 (sequential in CI)
- Retries: 2 in CI, 0 locally
- `forbidOnly`: true in CI

## Test Philosophy

**Refactor Safety:**
- Tests focus on "does it work" not implementation details
- Page loads without errors
- Critical content is present
- Navigation works
- No JavaScript console errors

**Mobile-First:**
- Dedicated mobile optimization tests
- Viewport simulation at multiple sizes
- Connection-aware behavior testing
- Touch interaction verification

**Graceful Degradation:**
- Tests verify fallback behavior
- Image error handling tested
- Connection-aware loading strategies tested

---

*Testing analysis: 2026-01-17*
