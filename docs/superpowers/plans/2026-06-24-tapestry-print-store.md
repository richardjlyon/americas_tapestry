# Tapestry Fine-Art Print Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a dropship fine-art print store for the 13 tapestry photos before July 4, 2026, with minimal additive code in the tapestry site.

**Architecture:** Fulfillment and storefront live entirely in a new, dedicated Shopify store (hosted theme) with Printful POD — no commerce code enters this repo. The tapestry site gets three small additive surfaces that drive warm traffic to the store: a `Shop` nav link, a per-colony "Buy a print" callout on tapestry detail pages, and a `/shop` intro page. A single typed config (`src/lib/shop-links.ts`) maps colony slugs to product URLs and falls back to the collection page so links never break during the staged rollout.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind, Jest + React Testing Library. External: Shopify (hosted), Printful app.

## Global Constraints

- New **dedicated** Shopify store (~$39/mo); do not reuse the `stefanromerodolls` store. (Verbatim from spec: "New dedicated Shopify store".)
- POD provider is **Printful**. No other provider in Phase 1.
- **No commerce logic in the repo:** no cart, checkout, payment code, or new environment secrets.
- Launch scope is **Tier 1 prints only**: per-colony poster + premium giclée + framed, the "All 13 Colonies" composite poster, and an **Artist Edition (printed signature)**. No textiles, gifts, calendar, or hand-signed drops.
- **Proof gate:** configure ONE colony end-to-end and order a physical proof before scaling to all 13.
- Store subdomain assumed `shop.americastapestry.org`. If the real apex domain differs, update `SHOP_BASE_URL` in `src/lib/shop-links.ts` only.
- The 13 canonical colony slugs are: `connecticut`, `delaware`, `georgia`, `maryland`, `massachusetts`, `new-hampshire`, `new-jersey`, `new-york`, `north-carolina`, `pennsylvania`, `rhode-island`, `south-carolina`, `virginia`.
- Follow existing repo conventions: `next/link` for internal routes, plain `<a target="_blank" rel="noopener noreferrer">` for the external store, the `Button` component (`@/components/ui/button`) with `asChild` for link-buttons, and colonial style variants.

---

## Track A — Operational (manual, external dashboards; NOT code)

These tasks are done in Shopify/Printful, not the repo. They have no unit tests; each lists an acceptance criterion. Track A and Track B are independent and can proceed in parallel — the only coupling is that **Task A4 produces the Shopify product handles that feed Task B6** (a one-line config edit per colony as products go live).

### Task A1: Create the dedicated Shopify store
- [ ] Create a new Shopify store (not the doll store); set brand name, logo, colours to match America's Tapestry.
- [ ] Add the custom domain `shop.americastapestry.org` (or confirm the correct subdomain; if different, note it for Task B1).
- [ ] Create one collection titled **Fine-Art Prints** with handle `fine-art-prints`.

**Acceptance:** Store reachable at the subdomain; empty `fine-art-prints` collection exists.

### Task A2: Connect Printful
- [ ] Install the Printful app into the new Shopify store and authorise it.
- [ ] Confirm Printful's print labs/papers for fine-art giclée + framed are available for the target shipping regions.

**Acceptance:** Printful shows "connected" to the store; product push works.

### Task A3: Configure ONE colony + order proof (PROOF GATE)
- [ ] Pick one colony (recommend Connecticut — status "Finished"). Upload its high-res master from R2 to Printful.
- [ ] Create 3 Printful→Shopify products: poster 18×24 ($39), premium giclée 16×20/24×36 ($69/$99), framed 18×24 ($129). Set the Shopify product handle to the convention `<slug>-fine-art-print` (e.g. `connecticut-fine-art-print`) for the primary print, and group the formats as variants or sibling products as Printful dictates.
- [ ] Order a **physical proof** of each format to the operator's address.

**Acceptance:** Proof ordered. **Do not proceed to A4 until the proof is received and Stefan approves print/colour quality.**

### Task A4: Scale to the full Tier-1 line
- [ ] After proof approval, repeat A3's product setup for the remaining 12 colonies, using handle convention `<slug>-fine-art-print`.
- [ ] Create the **"All 13 Colonies" composite poster** product (uses the image from Task A5), handle `all-thirteen-colonies-fine-art-print`, ~$59.
- [ ] Create the **Artist Edition** product: premium paper, printed signature, ~$149, with **limited Shopify inventory** and edition numbering in the listing copy.
- [ ] Record each live product's handle for Task B6.

**Acceptance:** 13 colonies × 3 formats + composite + Artist Edition are published in the `fine-art-prints` collection; handles recorded.

### Task A5: Build the composite image
- [ ] Produce a single poster-grid image of all 13 panels from the R2 high-res masters.
- [ ] Get Stefan's approval before it is used in the composite product (A4).

**Acceptance:** Approved composite image file ready for Printful upload.

### Task A6: Exhibition QR + newsletter announce
- [ ] Generate a QR code pointing to `https://americastapestry.org/shop`; hand off for exhibition signage.
- [ ] Draft and send the launch announcement to the existing MailerLite list.

**Acceptance:** QR delivered; newsletter sent at launch.

---

## Track B — Code (this repo)

All Track B tasks link to the store via the collection-page fallback, so they ship and pass independently of whether any Shopify product exists yet.

### Task B1: Shop links config

**Files:**
- Create: `src/lib/shop-links.ts`
- Test: `src/__tests__/shop-links.test.ts`

**Interfaces:**
- Produces: `SHOP_BASE_URL: string`, `PRINTS_COLLECTION_PATH: string`, `PRINT_PRODUCT_HANDLES: Record<string, string | null>`, `getPrintUrl(colonySlug: string): string`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/shop-links.test.ts
import {
  getPrintUrl,
  PRINT_PRODUCT_HANDLES,
  SHOP_BASE_URL,
} from '@/lib/shop-links';

describe('getPrintUrl', () => {
  it('returns the collection URL when the colony has no live handle', () => {
    expect(getPrintUrl('delaware')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
  });

  it('returns the product URL when a handle is set', () => {
    PRINT_PRODUCT_HANDLES['connecticut'] = 'connecticut-fine-art-print';
    expect(getPrintUrl('connecticut')).toBe(
      `${SHOP_BASE_URL}/products/connecticut-fine-art-print`,
    );
    PRINT_PRODUCT_HANDLES['connecticut'] = null; // reset shared state
  });

  it('falls back to the collection URL for an unknown slug', () => {
    expect(getPrintUrl('atlantis')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- shop-links`
Expected: FAIL — cannot find module `@/lib/shop-links`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/shop-links.ts
/**
 * Maps tapestry colony slugs to America's Tapestry print-shop URLs.
 *
 * The shop is a separate Shopify storefront on a subdomain, so links are
 * external. Set a colony's handle to its live Shopify product handle as that
 * product goes live; leave it null to fall back to the collection page. This
 * keeps every link valid during the staged rollout / proof gate.
 */
export const SHOP_BASE_URL = 'https://shop.americastapestry.org';
export const PRINTS_COLLECTION_PATH = '/collections/fine-art-prints';

/** Colony slug -> Shopify product handle (or null until that product is live). */
export const PRINT_PRODUCT_HANDLES: Record<string, string | null> = {
  connecticut: null,
  delaware: null,
  georgia: null,
  maryland: null,
  massachusetts: null,
  'new-hampshire': null,
  'new-jersey': null,
  'new-york': null,
  'north-carolina': null,
  pennsylvania: null,
  'rhode-island': null,
  'south-carolina': null,
  virginia: null,
};

/**
 * Returns the best shop URL for a colony: its specific product page when the
 * handle is live, otherwise the Fine-Art Prints collection page.
 */
export function getPrintUrl(colonySlug: string): string {
  const handle = PRINT_PRODUCT_HANDLES[colonySlug];
  if (handle) {
    return `${SHOP_BASE_URL}/products/${handle}`;
  }
  return `${SHOP_BASE_URL}${PRINTS_COLLECTION_PATH}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- shop-links`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop-links.ts src/__tests__/shop-links.test.ts
git commit -m "feat(shop): add colony slug to print-shop URL config"
```

---

### Task B2: BuyPrintCallout component

**Files:**
- Create: `src/components/features/shop/buy-print-callout.tsx`
- Test: `src/__tests__/buy-print-callout.test.tsx`

**Interfaces:**
- Consumes: `getPrintUrl`, `SHOP_BASE_URL` from `@/lib/shop-links`; `Button` from `@/components/ui/button`.
- Produces: `BuyPrintCallout({ colonySlug, colonyName }: { colonySlug: string; colonyName: string })`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/buy-print-callout.test.tsx
import { render, screen } from '@testing-library/react';
import { BuyPrintCallout } from '@/components/features/shop/buy-print-callout';
import { SHOP_BASE_URL } from '@/lib/shop-links';

describe('BuyPrintCallout', () => {
  it('renders the headline and an external shop link for the colony', () => {
    render(<BuyPrintCallout colonySlug="delaware" colonyName="Delaware" />);

    expect(
      screen.getByText(/own this panel as a fine-art print/i),
    ).toBeTruthy();

    const link = screen.getByRole('link', { name: /shop delaware prints/i });
    expect(link.getAttribute('href')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- buy-print-callout`
Expected: FAIL — cannot find module `buy-print-callout`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/features/shop/buy-print-callout.tsx
import { Button } from '@/components/ui/button';
import { getPrintUrl } from '@/lib/shop-links';

interface BuyPrintCalloutProps {
  /** Tapestry colony slug, e.g. "delaware". */
  colonySlug: string;
  /** Display name, e.g. "Delaware". */
  colonyName: string;
}

/**
 * Drives warm tapestry-page traffic to the print shop. Renders an aside with a
 * single external call-to-action linking to the colony's product (or the
 * collection page until that product is live).
 */
export function BuyPrintCallout({
  colonySlug,
  colonyName,
}: BuyPrintCalloutProps) {
  const href = getPrintUrl(colonySlug);

  return (
    <aside className="my-content-lg rounded-lg border border-colonial-gold/40 bg-colonial-parchment p-6 text-center shadow-sm">
      <h3 className="font-serif text-2xl text-colonial-navy">
        Own this panel as a fine-art print
      </h3>
      <p className="mx-auto mt-2 max-w-prose text-colonial-navy/80">
        Bring the {colonyName} tapestry home — museum-quality giclée prints,
        printed and shipped to your door.
      </p>
      <Button asChild variant="colonial-gold" size="lg" className="mt-4">
        <a href={href} target="_blank" rel="noopener noreferrer">
          Shop {colonyName} prints
        </a>
      </Button>
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- buy-print-callout`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/shop/buy-print-callout.tsx src/__tests__/buy-print-callout.test.tsx
git commit -m "feat(shop): add BuyPrintCallout component"
```

---

### Task B3: Insert the callout into the tapestry detail page

**Files:**
- Modify: `src/app/(site)/tapestries/[slug]/page.tsx` (after the `ReadingContainer` markdown block, ~line 197, before the Tapestry Talk separator)

**Interfaces:**
- Consumes: `BuyPrintCallout` from Task B2. The page already has `slug` (route param) and `tapestry.title`.

- [ ] **Step 1: Add the import**

At the top of the file, with the other component imports:

```tsx
import { BuyPrintCallout } from '@/components/features/shop/buy-print-callout';
```

- [ ] **Step 2: Render the callout after the main content**

Immediately after the closing `</ReadingContainer>` (the markdown content block, ~line 197) and before the Tapestry Talk separator section, insert:

```tsx
<BuyPrintCallout colonySlug={slug} colonyName={tapestry.title} />
```

(If the slug variable in scope is named differently, e.g. `params.slug`, use that name; pass the colony display title for `colonyName`.)

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds with no type errors. If a webpack/.cache error appears, clear `.next` and rebuild (per repo CLAUDE.md) — do not disable features.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/tapestries/delaware`, confirm the callout renders after the description and the button links to the collection page in a new tab.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/tapestries/[slug]/page.tsx"
git commit -m "feat(shop): add print callout to tapestry detail pages"
```

---

### Task B4: `/shop` intro page

**Files:**
- Create: `src/app/(site)/shop/page.tsx`

**Interfaces:**
- Consumes: `pageMetadata` from `@/lib/seo`; `PageSection`, `ReadingContainer` from `@/components/ui/*`; `Button` from `@/components/ui/button`; `SHOP_BASE_URL`, `PRINTS_COLLECTION_PATH` from `@/lib/shop-links`. Mirrors the About page structure.

- [ ] **Step 1: Create the page**

```tsx
// src/app/(site)/shop/page.tsx
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo';
import { SHOP_BASE_URL, PRINTS_COLLECTION_PATH } from '@/lib/shop-links';

export const metadata = pageMetadata({
  title: 'Shop',
  description:
    'Museum-quality fine-art prints of the thirteen America’s Tapestry colony panels, printed and shipped to your door.',
  path: '/shop',
});

export default function ShopPage() {
  const collectionUrl = `${SHOP_BASE_URL}${PRINTS_COLLECTION_PATH}`;

  return (
    <>
      <h1 className="page-heading">Fine-Art Prints</h1>
      <p className="lead-text text-center mb-content-lg">
        Bring the stories of the thirteen colonies home. Each panel is available
        as a museum-quality giclée print — printed on demand and shipped
        directly to you.
      </p>
      <PageSection spacing="tight">
        <ReadingContainer width="article" background="paper">
          <p>
            Marking America&rsquo;s 250th anniversary, every tapestry panel is
            offered as posters, premium giclée prints, and framed editions, plus
            a limited Artist Edition and the complete &ldquo;All Thirteen
            Colonies&rdquo; composite poster.
          </p>
          <div className="mt-content-md text-center">
            <Button asChild variant="colonial-gold" size="lg">
              <a href={collectionUrl} target="_blank" rel="noopener noreferrer">
                Browse the collection
              </a>
            </Button>
          </div>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; `/shop` route is generated.

- [ ] **Step 3: Manual verification**

Open `/shop` in `npm run dev`; confirm the page renders with the colonial styling and the button opens the Shopify collection in a new tab.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/shop/page.tsx"
git commit -m "feat(shop): add /shop intro page"
```

---

### Task B5: Shop nav link (header + footer)

**Files:**
- Modify: `src/components/layout/header.tsx` (the `navigationItems` array)
- Modify: `src/components/layout/footer.tsx` (Quick Links list, lines ~26-57)

- [ ] **Step 1: Add Shop to the header nav array**

In `src/components/layout/header.tsx`, add to `navigationItems` (place after `Sponsors`, before `Contact`):

```tsx
{ name: 'Shop', href: '/shop' },
```

- [ ] **Step 2: Add Shop to the footer Quick Links**

In `src/components/layout/footer.tsx`, add a matching link in the Quick Links list following the existing pattern there:

```tsx
<li>
  <Link href="/shop" className="hover:text-colonial-gold transition-colors">
    Shop
  </Link>
</li>
```

(Match the exact `Link` import and class names already used in that file.)

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual verification**

In `npm run dev`, confirm `Shop` appears in the header and footer on desktop and mobile, and navigates to `/shop`.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/footer.tsx
git commit -m "feat(shop): add Shop link to header and footer nav"
```

---

### Task B6: Go-live handle wiring (after products are published)

**Files:**
- Modify: `src/lib/shop-links.ts` (`PRINT_PRODUCT_HANDLES`)

**Depends on:** Track A4 (live product handles recorded).

- [ ] **Step 1: Set live handles**

For each colony whose product is live, replace `null` with its Shopify handle, e.g.:

```tsx
connecticut: 'connecticut-fine-art-print',
```

Leave colonies not yet live as `null` (they keep linking to the collection page).

- [ ] **Step 2: Run the config test**

Run: `npm test -- shop-links`
Expected: PASS (the fallback test still holds for null entries).

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/shop-links.ts
git commit -m "feat(shop): wire live product handles for shipped colonies"
```

---

## Self-Review

**Spec coverage:**
- New dedicated Shopify store → A1. Printful → A2. Proof gate → A3. Full Tier-1 line + Artist Edition + composite → A4/A5. QR + newsletter → A6.
- Shop nav link → B5. Per-tapestry callout → B2/B3. `/shop` page → B4. Slug→URL config → B1, wired live in B6.
- Out-of-scope items (textiles, gifts, calendar, hand-signed, charity messaging, headless port) are intentionally absent.

**Placeholder scan:** No TBD/TODO; all code steps show full code; the one conditional ("if the slug variable is named differently") gives an explicit instruction, not a placeholder.

**Type consistency:** `getPrintUrl`, `PRINT_PRODUCT_HANDLES`, `SHOP_BASE_URL`, `PRINTS_COLLECTION_PATH` are named identically across B1, B2, B4, B6. `BuyPrintCallout({ colonySlug, colonyName })` matches between B2 and B3.

**Note for executor:** `PRINT_PRODUCT_HANDLES` is mutated in the B1 test then reset; if the suite runs in parallel within one file this is safe (sequential within the file). Keep the reset line.
