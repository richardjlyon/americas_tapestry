# Shop Storefront — Foundation (Data + Catalog Logic) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the headless data foundation for the America's Tapestry storefront — an expanded Shopify Storefront API layer plus a fully unit-tested catalog module (tag→state/type vocabulary, filtering, search, sort, facet counts, URL state) that every storefront UI component and page will consume.

**Architecture:** A thin server-only Storefront API layer (`src/lib/shopify.ts`, expanded) fetches raw products with tags/images/variants and maps them to plain typed objects. A pure, framework-free catalog module (`src/lib/catalog.ts`) turns those into normalized `CatalogProduct`s and provides all browse logic (filter/search/sort/facet/URL-parse). No React, no I/O in `catalog.ts` — so it is 100% unit-testable and the UI layer (later plans) stays declarative.

**Tech Stack:** Next.js 16.2.6 (App Router, RSC), React 19.2.4, TypeScript 5.9.2, `graphql-request` (already a dep), Jest 29.7.0 + @testing-library/react, Shopify Storefront API `2025-07`.

## Global Constraints

- **Design source of truth:** the approved spec at `docs/superpowers/specs/2026-07-01-shop-design.md` and the four HTML mockups in `docs/superpowers/specs/2026-07-01-shop-design-mockups/`. Consult them for visual intent in later (UI) plans.
- **Colors — use the repo's Tailwind tokens, NOT the mockup hexes.** Canonical: `colonial-navy #102542`, `colonial-gold #e8b903`, `colonial-burgundy #711322`, `colonial-parchment #f4e9d5`, `colonial-stone #d8d3c8`. (The standalone mockups used `#1a2b45`/`#6b1f2e`; ignore those — build against `colonial-*` classes.)
- **Fonts:** `font-sans` = Montserrat (headings + UI), `font-serif` = EB Garamond (descriptive/italic copy). Use the Tailwind `font-sans` / `font-serif` classes.
- **Two catalog axes:** `state` (13 values) and `type`, from FLAT tags (`americas-tapestry` + `<state>` + `<type>`). **Finalized taxonomy (see Taxonomy Update below + `PRODUCT_TAXONOMY.md`):** per-state — `framed-print`, `canvas`, `metal-print`, `art-print`, `greeting-cards`, `postcard`; collection-wide (no `<state>` tag) — `calendar`, `book`; Phase-2 recognized-but-unfeatured — `mug`, `tote`, `fridge-magnet`. Maps via known vocabulary lists; no re-tagging.
- **Checkout:** hand off to Shopify via `checkoutUrl()` cart permalinks. No custom cart or checkout is built.
- **Graceful degradation:** when `isShopifyConfigured` is `false`, Shopify functions return `[]` / `null`; nothing may throw. Callers render an empty/"coming soon" state.
- **Server-only:** `src/lib/shopify.ts` keeps its `import 'server-only'` first line; the Storefront token must never reach the client bundle. `src/lib/catalog.ts` is isomorphic (no `server-only`, no env, no I/O).
- **Tests:** live in `src/__tests__/*.test.ts`; import modules via the `@/` alias; run with `npm test`.
- **Per-task verification:** every task ends green on `npm test` and `npx tsc --noEmit` before its commit. NOTE: `npm run lint` (`next lint`) is broken repo-wide in this Next 16 repo (pre-existing); run `npx eslint <changed files>` directly if linting.

---

## Taxonomy Update (2026-07-01) — read before executing remaining tasks

After Tasks 1–4 were implemented, the product taxonomy was finalized (`/Users/rjl/Code/data-tapestry-assets/PRODUCT_TAXONOMY.md`) and the design spec updated. This changes the `type` vocabulary and adds price tiers and a type-group.

- **Tasks 1, 3, 4 (Shopify layer, `filterProducts`, `searchProducts`) are logic-only and unaffected** — they stand as committed.
- **Task 2's `PRODUCT_TYPES` values are superseded.** The old vocab (`poster`, `giclee`, `tote`, `mug`, `artist-edition`, `composite`) is replaced. Because Tasks 2/3/4 tests were committed using the removed slug `poster` (and an `artist-edition`+`signed` case), the correction (Task 7) also updates those committed tests.
- New work is **Tasks 7 (vocab correction) → 8 (price tiers) → 9 (Wall-Art group)** below.

**Recommended execution order for remaining work:** review Task 4 (already implemented) → **Task 7** → Task 5 → Task 6 → **Task 8** → **Task 9**. Task 7 goes first because it repairs the committed tests that Task 5's neighbors depend on.

Finalized types: per-state `framed-print`, `canvas`, `metal-print`, `art-print`, `greeting-cards`, `postcard`; collection-wide (no `<state>` tag) `calendar`, `book`; Phase-2 recognized-but-unfeatured `mug`, `tote`, `fridge-magnet`. Price tiers: Under $25 / $25–50 / $50–150 / $150+. Type group: `wall-art` = framed-print + canvas + metal-print + art-print. Commemorative badge: tag `commemorative` → `250th`.

---

## File Structure

| File | Responsibility | This plan |
|---|---|---|
| `src/lib/shopify.ts` | Server-only Storefront API client + raw→typed mapping. Expanded to fetch `tags`, all `images`, `options`, and full `variants`; adds `getAllProducts()` (paginated) and `getProductByHandle()`. | **Modified** |
| `src/lib/catalog.ts` | Pure catalog domain: `STATES`/`PRODUCT_TYPES` vocab, `CatalogProduct` type, `toCatalogProduct`, `filterProducts`, `searchProducts`, `sortProducts`, `facetCounts`, `parseFilters`/`serializeFilters`. No I/O, no React. | **New** |
| `src/__tests__/shopify-map.test.ts` | Unit tests for the exported pure mapper `mapProductNode`. | **New** |
| `src/__tests__/catalog.test.ts` | Unit tests for every `catalog.ts` function. | **New** |

Later plans (see Roadmap) add `src/components/features/shop/*` and `src/app/(site)/shop/**`.

---

### Task 1: Expand the Shopify Storefront layer

Adds `tags` to the product shape, extracts the raw→typed mapping into a pure, testable `mapProductNode`, and adds `getAllProducts()` (paginated over the `americas-tapestry` collection) and `getProductByHandle()` (rich detail: all images, options, variants). Existing exports (`getCollectionProducts`, `checkoutUrl`, `isShopifyConfigured`) keep working; changes are additive.

**Files:**
- Modify: `src/lib/shopify.ts`
- Test: `src/__tests__/shopify-map.test.ts`

**Interfaces:**
- Consumes: nothing new (uses existing `graphql-request` client + env vars `NEXT_PUBLIC_SHOPIFY_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`).
- Produces:
  - `interface ShopifyProduct { id: string; title: string; handle: string; description: string; tags: string[]; featuredImage: {url:string; altText:string|null}|null; price: {amount:string; currencyCode:string}; maxPrice: {amount:string; currencyCode:string}; variantId: string|null; availableForSale: boolean }` (adds `tags` and `maxPrice`; existing fields unchanged)
  - `interface ShopifyVariant { id: string; title: string; availableForSale: boolean; price: {amount:string; currencyCode:string}; selectedOptions: {name:string; value:string}[] }`
  - `interface ShopifyProductDetail extends ShopifyProduct { images: {url:string; altText:string|null}[]; options: {name:string; values:string[]}[]; variants: ShopifyVariant[] }`
  - `export function mapProductNode(node: RawProductNode): ShopifyProduct` (pure)
  - `export async function getAllProducts(): Promise<ShopifyProduct[]>` (paginates the `americas-tapestry` collection; `[]` if unconfigured/error)
  - `export async function getProductByHandle(handle: string): Promise<ShopifyProductDetail | null>` (`null` if unconfigured/not found/error)

- [ ] **Step 1: Write the failing test for `mapProductNode`**

Create `src/__tests__/shopify-map.test.ts`:

```typescript
import { mapProductNode } from '@/lib/shopify';

const rawNode = {
  id: 'gid://shopify/Product/1',
  title: 'The Georgia Panel Postcard (Pack of 10)',
  handle: 'georgia-postcard-pack-of-10',
  description: 'Ten cards.',
  tags: ['americas-tapestry', 'georgia', 'postcard'],
  featuredImage: { url: 'https://cdn.shopify.com/x.webp', altText: null },
  priceRange: {
    minVariantPrice: { amount: '20.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '20.0', currencyCode: 'USD' },
  },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/9', availableForSale: true } }] },
};

describe('mapProductNode', () => {
  it('maps a raw Storefront product node to a flat ShopifyProduct with tags', () => {
    const p = mapProductNode(rawNode);
    expect(p.id).toBe('gid://shopify/Product/1');
    expect(p.tags).toEqual(['americas-tapestry', 'georgia', 'postcard']);
    expect(p.price).toEqual({ amount: '20.0', currencyCode: 'USD' });
    expect(p.maxPrice).toEqual({ amount: '20.0', currencyCode: 'USD' });
    expect(p.variantId).toBe('gid://shopify/ProductVariant/9');
    expect(p.availableForSale).toBe(true);
  });

  it('defaults gracefully when optional fields are missing', () => {
    const p = mapProductNode({ ...rawNode, description: null, tags: [], featuredImage: null, variants: { edges: [] } });
    expect(p.description).toBe('');
    expect(p.tags).toEqual([]);
    expect(p.featuredImage).toBeNull();
    expect(p.variantId).toBeNull();
    expect(p.availableForSale).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- shopify-map`
Expected: FAIL — `mapProductNode` is not exported from `@/lib/shopify`.

- [ ] **Step 3: Refactor `shopify.ts` to export `mapProductNode` and add `tags`/`maxPrice`**

In `src/lib/shopify.ts`: extend the interfaces and the GraphQL query, and extract the inline mapping. Replace the `ShopifyProduct` interface and `RawProductNode` interface, extend `COLLECTION_PRODUCTS_QUERY` to request `tags` and `maxVariantPrice`, and add the exported mapper:

```typescript
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  price: { amount: string; currencyCode: string };
  maxPrice: { amount: string; currencyCode: string };
  variantId: string | null;
  availableForSale: boolean;
}

export interface RawProductNode {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: { edges: Array<{ node: { id: string; availableForSale: boolean } }> };
}

/** Pure raw→typed mapping. Exported for unit testing; no I/O. */
export function mapProductNode(node: RawProductNode): ShopifyProduct {
  const variant = node.variants.edges[0]?.node ?? null;
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description ?? '',
    tags: node.tags ?? [],
    featuredImage: node.featuredImage,
    price: node.priceRange.minVariantPrice,
    maxPrice: node.priceRange.maxVariantPrice,
    variantId: variant?.id ?? null,
    availableForSale: variant?.availableForSale ?? false,
  };
}
```

Update `COLLECTION_PRODUCTS_QUERY`'s `node { ... }` selection to add `tags` (right after `description`) and add `maxVariantPrice { amount currencyCode }` inside `priceRange`. Then change `getCollectionProducts` to return `edges.map(({ node }) => mapProductNode(node))` instead of the inline object.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- shopify-map`
Expected: PASS (both cases).

- [ ] **Step 5: Add `getAllProducts` and `getProductByHandle`**

Append to `src/lib/shopify.ts`. `getAllProducts` paginates the `americas-tapestry` collection; `getProductByHandle` fetches rich detail:

```typescript
const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  query AllProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node {
          id title handle description tags
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          variants(first: 1) { edges { node { id availableForSale } } }
        } }
      }
    }
  }
`;

/** Every product in the America's Tapestry collection, paginated. [] when unconfigured/on error. */
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  if (!client) return [];
  const out: ShopifyProduct[] = [];
  let after: string | null = null;
  try {
    for (let page = 0; page < 20; page++) {
      const data: {
        collection: { products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          edges: Array<{ node: RawProductNode }>;
        } } | null;
      } = await client.request(ALL_PRODUCTS_QUERY, { handle: 'americas-tapestry', first: 50, after });
      const conn = data.collection?.products;
      if (!conn) break;
      for (const { node } of conn.edges) out.push(mapProductNode(node));
      if (!conn.pageInfo.hasNextPage) break;
      after = conn.pageInfo.endCursor;
    }
    return out;
  } catch (error) {
    console.error('[shopify] getAllProducts failed:', error);
    return [];
  }
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: { name: string; value: string }[];
}
export interface ShopifyProductDetail extends ShopifyProduct {
  images: { url: string; altText: string | null }[];
  options: { name: string; values: string[] }[];
  variants: ShopifyVariant[];
}

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title handle description tags
      featuredImage { url altText }
      images(first: 12) { edges { node { url altText } } }
      options { name values }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 100) { edges { node {
        id title availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
      } } }
    }
  }
`;

/** Rich product detail by handle. null when unconfigured/not found/on error. */
export async function getProductByHandle(handle: string): Promise<ShopifyProductDetail | null> {
  if (!client) return null;
  try {
    const data: { product: (RawProductNode & {
      images: { edges: Array<{ node: { url: string; altText: string | null } }> };
      options: { name: string; values: string[] }[];
      variants: { edges: Array<{ node: ShopifyVariant }> };
    }) | null } = await client.request(PRODUCT_BY_HANDLE_QUERY, { handle });
    const node = data.product;
    if (!node) return null;
    const base = mapProductNode({ ...node, variants: { edges: node.variants.edges.map((e) => ({ node: { id: e.node.id, availableForSale: e.node.availableForSale } })) } });
    return {
      ...base,
      availableForSale: node.variants.edges.some((e) => e.node.availableForSale),
      images: node.images.edges.map((e) => e.node),
      options: node.options,
      variants: node.variants.edges.map((e) => e.node),
    };
  } catch (error) {
    console.error('[shopify] getProductByHandle failed:', error);
    return null;
  }
}
```

- [ ] **Step 6: Verify typecheck, lint, and the full test suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck clean, lint clean, all tests PASS (existing `shop-links`/`buy-print-callout`/smoke tests plus new `shopify-map`). If `next lint` flags the `console.error` calls, keep them (they match the existing pattern already in this file).

- [ ] **Step 7: Commit**

```bash
git add src/lib/shopify.ts src/__tests__/shopify-map.test.ts
git commit -m "feat(shop): expand Storefront layer with tags, variants, getAllProducts/getProductByHandle"
```

---

### Task 2: Catalog vocabulary + `toCatalogProduct`

Creates the pure catalog module: the `STATES`/`PRODUCT_TYPES` vocabularies and the `toCatalogProduct` mapper that normalizes a `ShopifyProduct` into a `CatalogProduct` (resolving flat tags → `state`/`type`, deriving `fromPrice`, availability, and status badges).

**Files:**
- Create: `src/lib/catalog.ts`
- Test: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `ShopifyProduct` from `@/lib/shopify` (type-only import).
- Produces:
  - `interface StateVocab { slug: string; name: string; abbr: string }` and `export const STATES: StateVocab[]` (13 entries)
  - `interface TypeVocab { slug: string; label: string }` and `export const PRODUCT_TYPES: TypeVocab[]`
  - `type Availability = 'available' | 'sold-out'`
  - `interface CatalogProduct { id:string; handle:string; title:string; description:string; image:{url:string;altText:string|null}|null; price:number; maxPrice:number; currency:string; hasPriceRange:boolean; state:string|null; type:string|null; availability:Availability; badges:string[] }`
  - `export function toCatalogProduct(p: ShopifyProduct): CatalogProduct`
  - `export function stateName(slug: string): string | undefined`, `export function typeLabel(slug: string): string | undefined`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/catalog.test.ts`:

```typescript
import { toCatalogProduct, STATES, PRODUCT_TYPES, stateName } from '@/lib/catalog';
import type { ShopifyProduct } from '@/lib/shopify';

function make(overrides: Partial<ShopifyProduct> = {}): ShopifyProduct {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Georgia Panel Postcard (Pack of 10)',
    handle: 'georgia-postcard',
    description: 'Ten cards.',
    tags: ['americas-tapestry', 'georgia', 'postcard'],
    featuredImage: { url: 'https://cdn.shopify.com/x.webp', altText: 'Georgia' },
    price: { amount: '20.0', currencyCode: 'USD' },
    maxPrice: { amount: '20.0', currencyCode: 'USD' },
    variantId: 'gid://shopify/ProductVariant/9',
    availableForSale: true,
    ...overrides,
  };
}

describe('catalog vocab', () => {
  it('has 13 states and known product types', () => {
    expect(STATES).toHaveLength(13);
    expect(STATES.map((s) => s.slug)).toContain('new-hampshire');
    expect(PRODUCT_TYPES.map((t) => t.slug)).toEqual(
      expect.arrayContaining(['postcard', 'poster', 'tote', 'mug', 'giclee', 'framed', 'artist-edition', 'book', 'composite']),
    );
    expect(stateName('georgia')).toBe('Georgia');
  });
});

describe('toCatalogProduct', () => {
  it('resolves flat tags to state and type', () => {
    const c = toCatalogProduct(make());
    expect(c.state).toBe('georgia');
    expect(c.type).toBe('postcard');
    expect(c.price).toBe(20);
    expect(c.hasPriceRange).toBe(false);
    expect(c.availability).toBe('available');
    expect(c.badges).toContain('In stock');
  });

  it('marks all-states products (book/composite) with a null state', () => {
    const c = toCatalogProduct(make({ tags: ['americas-tapestry', 'book'], title: 'The Hardcover' }));
    expect(c.state).toBeNull();
    expect(c.type).toBe('book');
  });

  it('flags a price range with hasPriceRange and keeps min as price', () => {
    const c = toCatalogProduct(make({ price: { amount: '85.0', currencyCode: 'USD' }, maxPrice: { amount: '240.0', currencyCode: 'USD' } }));
    expect(c.price).toBe(85);
    expect(c.maxPrice).toBe(240);
    expect(c.hasPriceRange).toBe(true);
  });

  it('derives Sold out and honors marketing tags (bestseller/new/signed)', () => {
    const c = toCatalogProduct(make({ availableForSale: false, tags: ['americas-tapestry', 'virginia', 'artist-edition', 'signed'] }));
    expect(c.availability).toBe('sold-out');
    expect(c.badges).toContain('Sold out');
    expect(c.badges).toContain('Signed');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `@/lib/catalog` does not exist.

- [ ] **Step 3: Implement `src/lib/catalog.ts` (vocab + mapper)**

```typescript
import type { ShopifyProduct } from '@/lib/shopify';

export interface StateVocab { slug: string; name: string; abbr: string }
export interface TypeVocab { slug: string; label: string }

export const STATES: StateVocab[] = [
  { slug: 'connecticut', name: 'Connecticut', abbr: 'Ct' },
  { slug: 'delaware', name: 'Delaware', abbr: 'De' },
  { slug: 'georgia', name: 'Georgia', abbr: 'Ga' },
  { slug: 'maryland', name: 'Maryland', abbr: 'Md' },
  { slug: 'massachusetts', name: 'Massachusetts', abbr: 'Ma' },
  { slug: 'new-hampshire', name: 'New Hampshire', abbr: 'Nh' },
  { slug: 'new-jersey', name: 'New Jersey', abbr: 'Nj' },
  { slug: 'new-york', name: 'New York', abbr: 'Ny' },
  { slug: 'north-carolina', name: 'North Carolina', abbr: 'Nc' },
  { slug: 'pennsylvania', name: 'Pennsylvania', abbr: 'Pa' },
  { slug: 'rhode-island', name: 'Rhode Island', abbr: 'Ri' },
  { slug: 'south-carolina', name: 'South Carolina', abbr: 'Sc' },
  { slug: 'virginia', name: 'Virginia', abbr: 'Va' },
];

export const PRODUCT_TYPES: TypeVocab[] = [
  { slug: 'postcard', label: 'Postcards' },
  { slug: 'poster', label: 'Posters' },
  { slug: 'tote', label: 'Tote Bags' },
  { slug: 'mug', label: 'Mugs' },
  { slug: 'giclee', label: 'Fine-Art Prints' },
  { slug: 'framed', label: 'Framed Editions' },
  { slug: 'artist-edition', label: 'Artist Edition' },
  { slug: 'book', label: 'Book' },
  { slug: 'composite', label: 'All-States' },
];

const STATE_SLUGS = new Set(STATES.map((s) => s.slug));
const TYPE_SLUGS = new Set(PRODUCT_TYPES.map((t) => t.slug));
/** Optional marketing tags → display badge label. */
const MARKETING_BADGES: Record<string, string> = { bestseller: 'Bestseller', new: 'New', signed: 'Signed' };

export function stateName(slug: string): string | undefined {
  return STATES.find((s) => s.slug === slug)?.name;
}
export function typeLabel(slug: string): string | undefined {
  return PRODUCT_TYPES.find((t) => t.slug === slug)?.label;
}

export type Availability = 'available' | 'sold-out';

export interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  price: number;
  maxPrice: number;
  currency: string;
  hasPriceRange: boolean;
  state: string | null;
  type: string | null;
  availability: Availability;
  badges: string[];
}

export function toCatalogProduct(p: ShopifyProduct): CatalogProduct {
  const state = p.tags.find((t) => STATE_SLUGS.has(t)) ?? null;
  const type = p.tags.find((t) => TYPE_SLUGS.has(t)) ?? null;
  const price = Number.parseFloat(p.price.amount);
  const maxPrice = Number.parseFloat(p.maxPrice.amount);
  const availability: Availability = p.availableForSale ? 'available' : 'sold-out';

  const badges: string[] = [];
  for (const tag of p.tags) if (MARKETING_BADGES[tag]) badges.push(MARKETING_BADGES[tag]!);
  badges.push(availability === 'available' ? 'In stock' : 'Sold out');

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    image: p.featuredImage,
    price,
    maxPrice,
    currency: p.price.currencyCode,
    hasPriceRange: maxPrice > price,
    state,
    type,
    availability,
    badges,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS (all cases in this file so far).

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): catalog vocabulary + toCatalogProduct tag mapping"
```

---

### Task 3: `filterProducts`

Adds multi-facet filtering over `CatalogProduct[]`.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `CatalogProduct` (Task 2).
- Produces: `interface CatalogFilters { states: string[]; types: string[]; availability: 'all'|'available'; priceMin: number|null; priceMax: number|null }` and `export function filterProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[]`.

- [ ] **Step 1: Write the failing test (append to `catalog.test.ts`)**

```typescript
import { filterProducts, type CatalogFilters } from '@/lib/catalog';

const EMPTY: CatalogFilters = { states: [], types: [], availability: 'all', priceMin: null, priceMax: null };

describe('filterProducts', () => {
  const list = [
    toCatalogProduct(make({ id: '1', tags: ['americas-tapestry', 'georgia', 'postcard'], price: { amount: '20.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '2', tags: ['americas-tapestry', 'virginia', 'poster'], price: { amount: '40.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: '3', tags: ['americas-tapestry', 'book'], price: { amount: '45.0', currencyCode: 'USD' }, availableForSale: false })),
  ];

  it('returns everything when no filters are set', () => {
    expect(filterProducts(list, EMPTY)).toHaveLength(3);
  });
  it('filters by state (OR within facet)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'] }).map((p) => p.id)).toEqual(['1']);
  });
  it('filters by type', () => {
    expect(filterProducts(list, { ...EMPTY, types: ['poster'] }).map((p) => p.id)).toEqual(['2']);
  });
  it('ANDs across facets (state AND type)', () => {
    expect(filterProducts(list, { ...EMPTY, states: ['georgia'], types: ['poster'] })).toHaveLength(0);
  });
  it('filters by availability and price range', () => {
    expect(filterProducts(list, { ...EMPTY, availability: 'available' }).map((p) => p.id)).toEqual(['1', '2']);
    expect(filterProducts(list, { ...EMPTY, priceMin: 30, priceMax: 42 }).map((p) => p.id)).toEqual(['2']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `filterProducts` / `CatalogFilters` not exported.

- [ ] **Step 3: Implement `filterProducts` (append to `catalog.ts`)**

```typescript
export interface CatalogFilters {
  states: string[];
  types: string[];
  availability: 'all' | 'available';
  priceMin: number | null;
  priceMax: number | null;
}

export function filterProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  return products.filter((p) => {
    if (filters.states.length && (p.state === null || !filters.states.includes(p.state))) return false;
    if (filters.types.length && (p.type === null || !filters.types.includes(p.type))) return false;
    if (filters.availability === 'available' && p.availability !== 'available') return false;
    if (filters.priceMin !== null && p.price < filters.priceMin) return false;
    if (filters.priceMax !== null && p.price > filters.priceMax) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): filterProducts multi-facet filtering"
```

---

### Task 4: `searchProducts`

Keyword search across title, description, state name, and type label.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `CatalogProduct` (Task 2), `stateName`/`typeLabel` (Task 2).
- Produces: `export function searchProducts(products: CatalogProduct[], query: string): CatalogProduct[]`.

- [ ] **Step 1: Write the failing test (append)**

```typescript
import { searchProducts } from '@/lib/catalog';

describe('searchProducts', () => {
  const list = [
    toCatalogProduct(make({ id: '1', title: 'Georgia Panel Postcard', tags: ['americas-tapestry', 'georgia', 'postcard'] })),
    toCatalogProduct(make({ id: '2', title: 'Virginia Poster', description: 'Tidewater panel', tags: ['americas-tapestry', 'virginia', 'poster'] })),
  ];
  it('returns all for an empty/whitespace query', () => {
    expect(searchProducts(list, '   ')).toHaveLength(2);
  });
  it('matches on title', () => {
    expect(searchProducts(list, 'poster').map((p) => p.id)).toEqual(['2']);
  });
  it('matches on state name and is case-insensitive', () => {
    expect(searchProducts(list, 'GEORGIA').map((p) => p.id)).toEqual(['1']);
  });
  it('matches on type label (e.g. "postcards")', () => {
    expect(searchProducts(list, 'postcards').map((p) => p.id)).toEqual(['1']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `searchProducts` not exported.

- [ ] **Step 3: Implement `searchProducts` (append to `catalog.ts`)**

```typescript
export function searchProducts(products: CatalogProduct[], query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const haystack = [
      p.title,
      p.description,
      p.state ? stateName(p.state) ?? '' : '',
      p.type ? typeLabel(p.type) ?? '' : '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): searchProducts keyword search"
```

---

### Task 5: `sortProducts` + `facetCounts`

Sorting options for the toolbar and per-facet result counts for the filter rail.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `CatalogProduct` (Task 2).
- Produces:
  - `type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title'` and `export function sortProducts(products: CatalogProduct[], key: SortKey): CatalogProduct[]` (returns a new array; does not mutate).
  - `export function facetCounts(products: CatalogProduct[]): { states: Record<string, number>; types: Record<string, number> }` (counts over the given list; a null state/type is not counted).

- [ ] **Step 1: Write the failing test (append)**

```typescript
import { sortProducts, facetCounts, type SortKey } from '@/lib/catalog';

describe('sortProducts', () => {
  const list = [
    toCatalogProduct(make({ id: 'b', title: 'Bravo', price: { amount: '40.0', currencyCode: 'USD' } })),
    toCatalogProduct(make({ id: 'a', title: 'Alpha', price: { amount: '20.0', currencyCode: 'USD' } })),
  ];
  it('does not mutate the input array', () => {
    const copy = [...list];
    sortProducts(list, 'price-asc');
    expect(list).toEqual(copy);
  });
  it('sorts by price ascending and descending', () => {
    expect(sortProducts(list, 'price-asc').map((p) => p.id)).toEqual(['a', 'b']);
    expect(sortProducts(list, 'price-desc').map((p) => p.id)).toEqual(['b', 'a']);
  });
  it('sorts by title', () => {
    expect(sortProducts(list, 'title').map((p) => p.id)).toEqual(['a', 'b']);
  });
  it('featured preserves input order', () => {
    expect(sortProducts(list, 'featured').map((p) => p.id)).toEqual(['b', 'a']);
  });
});

describe('facetCounts', () => {
  it('counts products per state and type, ignoring nulls', () => {
    const list = [
      toCatalogProduct(make({ tags: ['americas-tapestry', 'georgia', 'postcard'] })),
      toCatalogProduct(make({ tags: ['americas-tapestry', 'georgia', 'canvas'] })),
      toCatalogProduct(make({ tags: ['americas-tapestry', 'book'] })),
    ];
    const { states, types } = facetCounts(list);
    expect(states['georgia']).toBe(2);
    expect(states['book']).toBeUndefined();
    expect(types['postcard']).toBe(1);
    expect(types['book']).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `sortProducts` / `facetCounts` not exported.

- [ ] **Step 3: Implement (append to `catalog.ts`)**

```typescript
export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title';

export function sortProducts(products: CatalogProduct[], key: SortKey): CatalogProduct[] {
  const copy = [...products];
  switch (key) {
    case 'price-asc': return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'title': return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'featured': default: return copy;
  }
}

export function facetCounts(products: CatalogProduct[]): { states: Record<string, number>; types: Record<string, number> } {
  const states: Record<string, number> = {};
  const types: Record<string, number> = {};
  for (const p of products) {
    if (p.state) states[p.state] = (states[p.state] ?? 0) + 1;
    if (p.type) types[p.type] = (types[p.type] ?? 0) + 1;
  }
  return { states, types };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): sortProducts + facetCounts"
```

---

### Task 6: URL filter state — `parseFilters` / `serializeFilters`

Round-trips `CatalogFilters` + `SortKey` + search query to/from URL query params so the catalog page is shareable and back-button friendly (server-readable via `searchParams`).

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `CatalogFilters` (Task 3), `SortKey` (Task 5).
- Produces:
  - `interface CatalogQuery { filters: CatalogFilters; sort: SortKey; q: string }`
  - `export function parseFilters(params: Record<string, string | string[] | undefined>): CatalogQuery` (tolerant of missing/garbage values; comma-joined lists)
  - `export function serializeFilters(query: CatalogQuery): URLSearchParams` (omits empty/default values so clean URLs like `/shop?state=georgia&type=postcard` result)

- [ ] **Step 1: Write the failing test (append)**

```typescript
import { parseFilters, serializeFilters, type CatalogQuery } from '@/lib/catalog';

describe('parseFilters', () => {
  it('reads comma-separated states/types, sort, price, availability, q', () => {
    const q = parseFilters({ state: 'georgia,virginia', type: 'postcard', sort: 'price-asc', min: '20', max: '80', avail: 'available', q: 'tote' });
    expect(q.filters.states).toEqual(['georgia', 'virginia']);
    expect(q.filters.types).toEqual(['postcard']);
    expect(q.filters.priceMin).toBe(20);
    expect(q.filters.priceMax).toBe(80);
    expect(q.filters.availability).toBe('available');
    expect(q.sort).toBe('price-asc');
    expect(q.q).toBe('tote');
  });
  it('defaults cleanly for empty/garbage input', () => {
    const q = parseFilters({ sort: 'nonsense', min: 'abc' });
    expect(q.filters.states).toEqual([]);
    expect(q.filters.priceMin).toBeNull();
    expect(q.sort).toBe('featured');
    expect(q.q).toBe('');
    expect(q.filters.availability).toBe('all');
  });
  it('ignores unknown state/type slugs', () => {
    const q = parseFilters({ state: 'georgia,atlantis', type: 'postcard,spaceship' });
    expect(q.filters.states).toEqual(['georgia']);
    expect(q.filters.types).toEqual(['postcard']);
  });
});

describe('serializeFilters', () => {
  it('omits empty and default values', () => {
    const base: CatalogQuery = { filters: { states: [], types: [], availability: 'all', priceMin: null, priceMax: null }, sort: 'featured', q: '' };
    expect(serializeFilters(base).toString()).toBe('');
  });
  it('round-trips a populated query', () => {
    const q: CatalogQuery = { filters: { states: ['georgia'], types: ['postcard'], availability: 'available', priceMin: 20, priceMax: 80 }, sort: 'price-asc', q: 'tote' };
    const round = parseFilters(Object.fromEntries(serializeFilters(q)));
    expect(round).toEqual(q);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `parseFilters` / `serializeFilters` not exported.

- [ ] **Step 3: Implement (append to `catalog.ts`)**

```typescript
export interface CatalogQuery { filters: CatalogFilters; sort: SortKey; q: string }

const SORT_KEYS: SortKey[] = ['featured', 'price-asc', 'price-desc', 'title'];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? '';
}
function list(v: string | string[] | undefined, allowed: Set<string>): string[] {
  return first(v).split(',').map((s) => s.trim()).filter((s) => allowed.has(s));
}
function num(v: string | string[] | undefined): number | null {
  const n = Number.parseFloat(first(v));
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const sortRaw = first(params['sort']) as SortKey;
  return {
    filters: {
      states: list(params['state'], STATE_SLUGS),
      types: list(params['type'], TYPE_SLUGS),
      availability: first(params['avail']) === 'available' ? 'available' : 'all',
      priceMin: num(params['min']),
      priceMax: num(params['max']),
    },
    sort: SORT_KEYS.includes(sortRaw) ? sortRaw : 'featured',
    q: first(params['q']).trim(),
  };
}

export function serializeFilters(query: CatalogQuery): URLSearchParams {
  const p = new URLSearchParams();
  const { filters: f, sort, q } = query;
  if (f.states.length) p.set('state', f.states.join(','));
  if (f.types.length) p.set('type', f.types.join(','));
  if (f.availability === 'available') p.set('avail', 'available');
  if (f.priceMin !== null) p.set('min', String(f.priceMin));
  if (f.priceMax !== null) p.set('max', String(f.priceMax));
  if (sort !== 'featured') p.set('sort', sort);
  if (q) p.set('q', q);
  return p;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS.

- [ ] **Step 5: Full verification and commit**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean/green.

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): URL filter parse/serialize round-trip"
```

---

### Task 7: Correct PRODUCT_TYPES to the finalized taxonomy

Replaces the superseded type vocabulary with the finalized set, adds Phase-2 recognized types and the `commemorative`→`250th` badge, and repairs the already-committed Task 2/3/4 tests that referenced removed slugs.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: existing `TypeVocab`, `MARKETING_BADGES`.
- Produces: updated `PRODUCT_TYPES` (8 featured + 3 Phase-2 = 11 entries); new `export const PHASE2_TYPE_SLUGS: Set<string>`; badge vocab gains `commemorative → '250th'` and drops `signed`. `TYPE_SLUGS` (derived from `PRODUCT_TYPES`) now recognizes all 11.

- [ ] **Step 1: Update the vocab assertion test (RED driver)**

In `src/__tests__/catalog.test.ts`, in the `catalog vocab` test, replace the `PRODUCT_TYPES` assertion with the finalized set and a length check:

```typescript
    expect(PRODUCT_TYPES.map((t) => t.slug)).toEqual(
      expect.arrayContaining(['framed-print', 'canvas', 'metal-print', 'art-print', 'greeting-cards', 'postcard', 'calendar', 'book']),
    );
    expect(PRODUCT_TYPES).toHaveLength(11);
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — old `PRODUCT_TYPES` still holds `poster`/`giclee`/etc. and has a different length.

- [ ] **Step 3: Replace `PRODUCT_TYPES` and badges in `catalog.ts`**

```typescript
export const PRODUCT_TYPES: TypeVocab[] = [
  { slug: 'framed-print', label: 'Framed Prints' },
  { slug: 'canvas', label: 'Canvas Prints' },
  { slug: 'metal-print', label: 'Metal & Acrylic Prints' },
  { slug: 'art-print', label: 'Art Prints' },
  { slug: 'greeting-cards', label: 'Greeting Card Sets' },
  { slug: 'postcard', label: 'Postcards' },
  { slug: 'calendar', label: '2026 Wall Calendar' },
  { slug: 'book', label: 'Book' },
  // Phase-2 long tail — recognized so tagged products render, but not featured.
  { slug: 'mug', label: 'Mugs' },
  { slug: 'tote', label: 'Tote Bags' },
  { slug: 'fridge-magnet', label: 'Fridge Magnets' },
];

/** Phase-2 types: recognized/valid, but not surfaced as featured curated entries. */
export const PHASE2_TYPE_SLUGS = new Set(['mug', 'tote', 'fridge-magnet']);
```

Update `MARKETING_BADGES` to:

```typescript
const MARKETING_BADGES: Record<string, string> = { bestseller: 'Bestseller', new: 'New', commemorative: '250th' };
```

(`TYPE_SLUGS = new Set(PRODUCT_TYPES.map((t) => t.slug))` is unchanged and now includes all 11.)

- [ ] **Step 4: Repair the committed tests that used removed slugs**

In `src/__tests__/catalog.test.ts`, apply these substitutions (they match this plan's Task 2/3/4 example code verbatim — read the file and replace in place):

| Where | Old | New |
|---|---|---|
| Task 2 all-states test | `it('marks all-states products (book/composite) ...` | `it('marks all-states products (book/calendar) ...` (description only) |
| Task 2 badges case | `tags: ['americas-tapestry', 'virginia', 'artist-edition', 'signed']` asserting `'Signed'` | `tags: ['americas-tapestry', 'virginia', 'framed-print', 'commemorative']`; assert `c.type === 'framed-print'` and `badges` contains `'250th'` (keep the `'Sold out'` assertion); update the `it(...)` text `bestseller/new/signed` → `bestseller/new/commemorative` |
| Task 3 fixture + filter | `'poster'` (product `id: '2'` tag, and `types: ['poster']` in two assertions) | `'art-print'` (tag and both `types: ['art-print']`) |
| Task 4 fixture + query | `title: 'Virginia Poster'`, tag `'poster'`, and `searchProducts(list, 'poster')` | `title: 'Virginia Art Print'`, tag `'art-print'`, and `searchProducts(list, 'art print')` (still expects `['2']`) |

- [ ] **Step 5: Verify the full suite and commit**

Run: `npm test && npx tsc --noEmit`
Expected: all suites green (the vocab, filter, search, sort, facet tests all pass with the finalized types).

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "fix(shop): finalized product-type taxonomy + 250th badge; repair dependent tests"
```

---

### Task 8: Price tiers

Adds the "gifts by price" tier model: a `PRICE_TIERS` vocab, `tierOf(price)`, a `tiers` facet on `CatalogFilters` honored by `filterProducts`, and URL round-tripping of the `tier` param.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `CatalogProduct` (Task 2), `CatalogFilters` (Task 3), `filterProducts` (Task 3), `parseFilters`/`serializeFilters` (Task 6).
- Produces:
  - `interface PriceTier { slug: string; label: string; min: number; max: number | null }` and `export const PRICE_TIERS: PriceTier[]`
  - `export function tierOf(price: number): string` (returns a tier slug; half-open `[min, max)` buckets)
  - `CatalogFilters` gains `tiers: string[]`; `filterProducts` filters by tier (OR within the facet, AND across facets)
  - `parseFilters`/`serializeFilters` read/write the `tier` query param

- [ ] **Step 1: Write the failing tests (append)**

```typescript
import { PRICE_TIERS, tierOf } from '@/lib/catalog';

describe('price tiers', () => {
  it('buckets prices into the four tiers (half-open)', () => {
    expect(PRICE_TIERS.map((t) => t.slug)).toEqual(['under-25', '25-50', '50-150', '150-plus']);
    expect(tierOf(20)).toBe('under-25');
    expect(tierOf(25)).toBe('25-50');
    expect(tierOf(49.99)).toBe('25-50');
    expect(tierOf(90)).toBe('50-150');
    expect(tierOf(150)).toBe('150-plus');
    expect(tierOf(300)).toBe('150-plus');
  });
  it('filterProducts filters by tier', () => {
    const list = [
      toCatalogProduct(make({ id: 'p', tags: ['americas-tapestry', 'georgia', 'postcard'], price: { amount: '20.0', currencyCode: 'USD' } })),
      toCatalogProduct(make({ id: 'f', tags: ['americas-tapestry', 'georgia', 'framed-print'], price: { amount: '90.0', currencyCode: 'USD' } })),
    ];
    expect(filterProducts(list, { states: [], types: [], tiers: ['under-25'], availability: 'all', priceMin: null, priceMax: null }).map((x) => x.id)).toEqual(['p']);
  });
  it('parseFilters/serializeFilters round-trip the tier param', () => {
    const q = { filters: { states: [], types: [], tiers: ['50-150'], availability: 'all' as const, priceMin: null, priceMax: null }, sort: 'featured' as const, q: '' };
    expect(parseFilters(Object.fromEntries(serializeFilters(q))).filters.tiers).toEqual(['50-150']);
  });
});
```

Also add `tiers: []` to the existing `EMPTY` filter object in the `filterProducts` describe block and to the base `CatalogFilters` objects in the `parseFilters`/`serializeFilters` tests (required field).

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `PRICE_TIERS`/`tierOf` not exported and `tiers` not on `CatalogFilters`.

- [ ] **Step 3: Implement (append to `catalog.ts`, and extend the existing pieces)**

Append the tier vocab:

```typescript
export interface PriceTier { slug: string; label: string; min: number; max: number | null }
export const PRICE_TIERS: PriceTier[] = [
  { slug: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { slug: '25-50', label: '$25–50', min: 25, max: 50 },
  { slug: '50-150', label: '$50–150', min: 50, max: 150 },
  { slug: '150-plus', label: '$150+', min: 150, max: null },
];
const TIER_SLUGS = new Set(PRICE_TIERS.map((t) => t.slug));

export function tierOf(price: number): string {
  const t = PRICE_TIERS.find((t) => price >= t.min && (t.max === null || price < t.max));
  return (t ?? PRICE_TIERS[PRICE_TIERS.length - 1]!).slug;
}
```

Edit `CatalogFilters` to add `tiers: string[];`. In `filterProducts`, add this guard (before the `return true`):

```typescript
    if (filters.tiers.length && !filters.tiers.includes(tierOf(p.price))) return false;
```

In `parseFilters`, add to the returned `filters` object: `tiers: list(params['tier'], TIER_SLUGS),`. In `serializeFilters`, add: `if (f.tiers.length) p.set('tier', f.tiers.join(','));`.

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- catalog`
Expected: PASS (including the updated round-trip and filter tests).

- [ ] **Step 5: Verify and commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): price tiers (PRICE_TIERS, tierOf, tier facet + URL param)"
```

---

### Task 9: Wall-Art type group

Adds the type-group map so the FilterRail can render a "Wall Art" heading and the curated "Wall Art" entry can pre-filter the catalog.

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `export const TYPE_GROUPS: Record<string, { label: string; types: string[] }>` with a `wall-art` entry
  - `export function typesInGroup(group: string): string[]` (the type slugs in a group; `[]` if unknown)

- [ ] **Step 1: Write the failing test (append)**

```typescript
import { TYPE_GROUPS, typesInGroup } from '@/lib/catalog';

describe('type groups', () => {
  it('defines Wall Art as the four print types', () => {
    expect(TYPE_GROUPS['wall-art']?.label).toBe('Wall Art');
    expect(typesInGroup('wall-art')).toEqual(['framed-print', 'canvas', 'metal-print', 'art-print']);
  });
  it('returns [] for an unknown group', () => {
    expect(typesInGroup('nonsense')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — `TYPE_GROUPS`/`typesInGroup` not exported.

- [ ] **Step 3: Implement (append to `catalog.ts`)**

```typescript
export const TYPE_GROUPS: Record<string, { label: string; types: string[] }> = {
  'wall-art': { label: 'Wall Art', types: ['framed-print', 'canvas', 'metal-print', 'art-print'] },
};

export function typesInGroup(group: string): string[] {
  return TYPE_GROUPS[group]?.types ?? [];
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- catalog`
Expected: PASS.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add src/lib/catalog.ts src/__tests__/catalog.test.ts
git commit -m "feat(shop): Wall-Art type group"
```

---

## Self-Review

- **Spec coverage (this plan's scope):** filter facets State/Type/Price/Availability → Task 3; keyword search → Task 4; sort → Task 5; facet counts (the "N selected" / per-option counts in the FilterRail) → Task 5; URL-driven shareable filters → Task 6; tag→axis mapping → Task 2; **finalized product-type taxonomy + 250th badge → Task 7; price tiers (chips) → Task 8; Wall-Art type group → Task 9**; variants/images/options for ProductDetail + book hero data → Task 1. UI rendering of these is explicitly out of scope (Plans 2–3).
- **Placeholder scan:** none — every code/test step contains complete code.
- **Type consistency:** `CatalogProduct`, `CatalogFilters`, `SortKey`, `CatalogQuery` are defined once (Tasks 2/3/5/6) and referenced by exact name thereafter; `mapProductNode`/`ShopifyProduct` names match Task 1 and the `@/lib/shopify` module.

---

## Roadmap — subsequent plans (to be written after this one lands)

These are **outlines**, not tasks. Each becomes its own fully-specified plan (`writing-plans`) once this foundation is green.

**Plan 2 — Storefront components** (`src/components/features/shop/`, component-tested with @testing-library):
- `product-card.tsx` — one card for every line ($20 postcard → signed edition); flag=type, eyebrow=state, status badge, from-price, hover quick-add / Notify-me. Consumes `CatalogProduct`. Shopify images via plain `<img>` (CDN not in `remotePatterns`).
- `catalog-grid.tsx` — responsive 3→2→1 grid of `ProductCard`.
- `filter-rail.tsx` — State/Type/Price/Availability facets with `facetCounts`, "N selected" badges, gold running-stitch checked underline; client component that pushes `serializeFilters` to the URL.
- `search-bar.tsx` — prominent keyword field (gold Search button).
- `state-picker.tsx` — the 13-colony framed index + 14th composite tile (joins `STATES` with `tapestries.ts` panel data for imagery/piece counts).
- `book-hero.tsx` — flagship landing hero (real cover, $45/62-page facts from the live product, Add-to-cart via `checkoutUrl`).

**Plan 3 — Storefront pages** (`src/app/(site)/shop/`), reusing the existing `/shop` route:
- `shop/page.tsx` — rebuild as the book-hero landing → state picker → featured → doors; **or** the unified catalog view driven by `searchParams` (parseFilters → getAllProducts → toCatalogProduct → filter/search/sort). Decide catalog-at-`/shop` vs `/shop/all` during Plan 3 brainstorming.
- `shop/state/[slug]/page.tsx` — colony hero + that state's products (`generateStaticParams` over `STATES`; `params` is a `Promise`).
- `shop/product/[handle]/page.tsx` — `getProductByHandle`, gallery + variant selector (client) + price + Add-to-cart → `checkoutUrl`, related grid.
- Empty/degraded states when `isShopifyConfigured` is false; SEO via `pageMetadata`; final responsive + a11y pass against the mockups.
