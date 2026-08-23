# America's Tapestry

Showcase site for the America's Tapestry project (one hand-made tapestry per
original colony) with a Shopify-backed shop. Next.js App Router, TypeScript,
Tailwind, Vercel.

## Commands

- `npm run build` runs `scripts/check-images.mjs` before `next build`; a failing
  image check is a real error, not noise.
- `npm run typecheck`, `npm run lint`, `npm test` (Jest), `npm run test:e2e`
  (Playwright).
- Webpack build errors are often a stale `.next` cache: `npm run build:clean`.
  Never disable features or alter functionality to get past a cache error.

## Always

- Project knowledge (site history, shop and licence status, decisions) lives in
  the vault, "America's Tapestry" project notes. Read before non-trivial changes.
- Shop products are added via the `add-shop-product` skill (Gelato → Shopify →
  storefront); don't reinvent that flow.

## Read when relevant

- Writing components or styles: [docs/conventions.md](docs/conventions.md),
  [docs/design-system.md](docs/design-system.md)
- Adding or replacing images: [docs/ADDING_IMAGES.md](docs/ADDING_IMAGES.md),
  [docs/image-optimization-guide.md](docs/image-optimization-guide.md)
