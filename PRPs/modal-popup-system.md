# PRP: Modal Popup System with Cookie Management

## Context

Implement a modal popup system that displays over the main index page to direct user attention to new information. The popup content will be managed via `content/popup/index.md` and uses a simple hybrid cookie strategy to prevent repeated annoyance while allowing for content updates.

## Current State

### Existing Infrastructure
- **UI Components**: Radix UI Dialog components already available at `src/components/ui/dialog.tsx`
- **Content Directory**: `content/popup/` directory exists with empty `index.md` file
- **Main Page**: Entry point at `src/app/page.tsx` for popup integration
- **Testing**: Jest + Testing Library setup available

### Technology Stack
- **Next.js 15**: App Router with async cookie handling
- **Radix UI**: `@radix-ui/react-dialog` already installed
- **TypeScript**: Full type safety
- **Tailwind CSS**: For styling consistency

## Implementation Blueprint

### Phase 1: Content Management System

Create content structure in `content/popup/index.md`:
```yaml
---
title: "Welcome to America's Tapestry"
version: "2025-01-15"
enabled: true
showDuration: 30
---

Your popup content goes here. You can use **markdown** formatting.

[Learn More](/about)
```

### Phase 2: Core Popup Logic

Create `src/lib/popup.ts` for content and state management:
```typescript
import { cookies } from 'next/headers';
import { getAllContent } from './content-core';

export interface PopupContent {
  title: string;
  version: string;
  enabled: boolean;
  showDuration: number;
  content: string;
  slug: string;
}

export interface PopupState {
  dismissed: boolean;
  version: string;
  timestamp: number;
}

export async function getPopupContent(): Promise<PopupContent | null> {
  try {
    const content = await getAllContent('popup');
    const popup = content[0];

    if (!popup?.enabled) return null;

    return {
      title: popup.title,
      version: popup.version,
      enabled: popup.enabled,
      showDuration: popup.showDuration || 30,
      content: popup.content,
      slug: popup.slug
    };
  } catch {
    return null;
  }
}

export async function shouldShowPopup(popupContent: PopupContent): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get('popup-state')?.value;

  if (!cookieValue) return true;

  try {
    const state: PopupState = JSON.parse(cookieValue);

    // Show if version changed
    if (state.version !== popupContent.version) return true;

    // Show if duration expired
    const daysSinceDismissed = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed > popupContent.showDuration) return true;

    return false;
  } catch {
    return true;
  }
}
```

### Phase 3: Server Action for Cookie Management

Create `src/app/actions/popup-actions.ts`:
```typescript
'use server';

import { cookies } from 'next/headers';
import type { PopupState } from '@/lib/popup';

export async function dismissPopup(version: string): Promise<void> {
  const cookieStore = await cookies();

  const state: PopupState = {
    dismissed: true,
    version,
    timestamp: Date.now()
  };

  cookieStore.set('popup-state', JSON.stringify(state), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}
```

### Phase 4: React Component

Create `src/components/features/popup/popup-modal.tsx`:
```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { dismissPopup } from '@/app/actions/popup-actions';
import type { PopupContent } from '@/lib/popup';

interface PopupModalProps {
  content: PopupContent;
  initialOpen: boolean;
}

export function PopupModal({ content, initialOpen }: PopupModalProps) {
  const [open, setOpen] = useState(initialOpen);

  const handleDismiss = async (permanent: boolean = false) => {
    setOpen(false);

    if (permanent) {
      await dismissPopup(content.version);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </DialogDescription>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => handleDismiss(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => handleDismiss(true)}
          >
            Don't show again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Phase 5: Integration with Main Page

Update `src/app/page.tsx`:
```typescript
import { PopupModal } from '@/components/features/popup/popup-modal';
import { getPopupContent, shouldShowPopup } from '@/lib/popup';
// ... existing imports

export default async function Home() {
  // ... existing code ...

  // Popup logic
  const popupContent = await getPopupContent();
  const showPopup = popupContent ? await shouldShowPopup(popupContent) : false;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Popup Modal */}
      {popupContent && showPopup && (
        <PopupModal content={popupContent} initialOpen={true} />
      )}

      <main className="flex-1 woven-linen content-spacing-sm">
        {/* ... existing content ... */}
      </main>

      <Footer />
    </div>
  );
}
```

## Critical Context & References

### Existing Patterns to Follow
- **Content Management**: Follow pattern from `src/lib/sponsors.ts` and `src/lib/team.ts`
- **Component Structure**: Match existing feature components in `src/components/features/`
- **Server Actions**: Follow pattern from `src/app/actions/contact-actions.ts`

### Technical Constraints
- **Next.js 15**: Cookies API is async - always `await cookies()`
- **Server Actions**: Required for setting cookies (cannot be done in Server Components)
- **Client Components**: Dialog components require `'use client'` directive

### Documentation References
- **Next.js Cookies**: https://nextjs.org/docs/app/api-reference/functions/cookies
- **Radix UI Dialog**: https://www.radix-ui.com/docs/primitives/components/dialog
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

## Implementation Tasks

Execute in this exact order:

1. **Setup Content Structure**
   - Update `content/popup/index.md` with frontmatter schema
   - Add sample popup content

2. **Create Core Library**
   - Implement `src/lib/popup.ts` with content fetching and state logic
   - Add TypeScript interfaces

3. **Create Server Action**
   - Implement `src/app/actions/popup-actions.ts` for cookie management
   - Handle Next.js 15 async cookie constraints

4. **Build React Component**
   - Create `src/components/features/popup/popup-modal.tsx`
   - Implement Radix UI Dialog with proper state management

5. **Integrate with Main Page**
   - Update `src/app/page.tsx` to include popup logic
   - Add server-side popup state checking

6. **Add Basic Tests**
   - Test popup content loading
   - Test cookie state management
   - Test component rendering

## Validation Gates

### Linting & Type Checking
```bash
npm run lint && npm run typecheck
```

### Unit Tests
```bash
npm test -- --testPathPattern=popup
```

### Manual Testing Checklist
- [ ] Popup shows on first visit
- [ ] "Close" hides popup temporarily
- [ ] "Don't show again" sets cookie and prevents future shows
- [ ] Changing content version in markdown resets cookie
- [ ] Popup respects `enabled: false` setting
- [ ] Content updates properly from markdown

## Error Handling Strategy

- **Content Loading**: Graceful fallback if `content/popup/index.md` is missing
- **Cookie Parsing**: Safe JSON parsing with try/catch blocks
- **Server Action**: Proper error boundaries for cookie operations
- **Component Rendering**: Conditional rendering prevents crashes

## Gotchas & Best Practices

### Next.js 15 Specific
- Always `await` the `cookies()` function
- Server Actions cannot be called directly from Server Components
- Cookie operations require proper HTTP context

### Radix UI Dialog
- Components require `'use client'` directive
- Portal rendering handled automatically
- Accessibility features included by default

### Content Management
- Version string format: `YYYY-MM-DD` for easy sorting
- Keep `showDuration` reasonable (7-90 days)
- Test content changes in development first

## PRP Quality Score: 9/10

**Confidence Level**: Very High - This PRP provides comprehensive context, follows established patterns, includes proper error handling, and addresses Next.js 15 specific constraints. The hybrid cookie approach is simple yet flexible for content management needs.

**Success Indicators**:
- Modal appears on first visit
- Cookie management works correctly
- Content updates reset user preferences appropriately
- No hydration or server/client mismatches
- Accessible and responsive design