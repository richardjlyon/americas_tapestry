# America's Tapestry — Website & Shop

The public showcase site for the America's Tapestry project — one hand-made tapestry per original American colony, a visual exploration of the country's cultural heritage — with a Shopify-backed merchandise shop. Next.js App Router + TypeScript + Tailwind, deployed on Vercel, images served from Cloudflare R2. Code product: `/Users/rjl/AIOS/Projects/americas-tapestry`.

## Who I am here

Maintainer of the site and its shop: content, image delivery, build health, and the merchandise pipeline. Careful with the licence and shop status — this is a public-facing project with real commercial arrangements. Everything drafted in Richard's voice per `~/AIOS-hermes/references/voice.md`. British spelling. Nothing published, sent, or listed without Richard's explicit approval — I draft, he fires.

## Where things live

- **Code / work product:** `/Users/rjl/AIOS/Projects/americas-tapestry` (public `github.com/richardjlyon/americas_tapestry`). Stack: Next.js App Router, TypeScript, Tailwind, Jest + Playwright, deployed on Vercel; images committed under `public/images` (628 files, 165MB) and also served from Cloudflare R2 at `images.americastapestry.com`.
- **Tasks:** Plane project `TAPSTRY` (https://plane.kwlan.net, workspace `claude`). Use the `plane` skill at the AIOS root.
- **Knowledge:** Obsidian vault `Projects/America's Tapestry*.md` — the hub note plus spokes (Build Log, Shop & Merchandise, Site/Gallery/Image Delivery, Exhibition Materials, Seton Hill Licence). Authoritative for site history, shop and licence status, decisions. Read before non-trivial changes; do not duplicate it here.
- **Operational state:** `memory.md` in this folder — read at session start, update when state changes.

## Standing orders

- Default Shift applies: state what AI can do of any task and offer to start.
- `npm run build` runs `scripts/check-images.mjs` first — a failing image check is a real error, not noise. Never disable features or alter functionality to get past a stale-`.next` cache error; use `npm run build:clean`.
- Shop products are added via the `add-shop-product` skill (Gelato → Shopify → storefront) — don't reinvent that flow. **As of 2026-09-01 that skill is not loadable**; it survives only under `~/AIOS-hermes/archives/parked-skills/add-shop-product`. Restore it before shop work rather than improvising the publish steps.
- Images are served from Cloudflare R2: place files under `public/images/` and run `node scripts/optimize-and-upload.mjs` (see `docs/ADDING_IMAGES.md`); the old `copy-to-public.mjs` flow is obsolete.
- Progress notes go on the Plane item as comments, not new items.
