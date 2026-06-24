# America's Tapestry — Fine-Art Print Store

**Date:** 2026-06-24
**Status:** Approved design — ready for implementation planning
**Author:** Richard Lyon (with Claude)

## Summary

Monetise the high-resolution photographs of the 13 colony tapestries by
selling fine-art prints through a print-on-demand (POD) store. Revenue is
**personal/creator income** for Stefan, positioned as fine art tied to the
United States Semiquincentennial (July 4, 2026), not charity merchandise.

The operator cannot handle product, so fulfillment is fully dropship: a POD
provider prints and ships every order direct to the customer.

**Timing is the dominant constraint.** This design is written on 2026-06-24,
ten days before the 250th-anniversary demand peak. The plan deliberately
favours a fast, proven launch over a perfect build, and sequences the nicer
build as a fast-follow.

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Money / goal | Personal creator income | Simplest positioning; commercial art store |
| Storefront platform | Shopify + Printful POD | Proven, zero-ops fulfillment, real analytics |
| Store identity | **New dedicated Shopify store** (~$39/mo) | Brand separation from the doll business |
| Build approach | **Hosted now, headless later** | Hit July 4 with zero code; upgrade if it sells |
| POD provider | **Printful** | Best quality control for fine art; native Shopify |
| Launch scope | **Lean hero (Tier 1 prints only)** | Highest margin, no design work, fastest to live |
| "Signed" editions | **Artist Edition (printed signature)** | True hand-signing breaks the no-ops rule per order |

## Context

- **Project:** America's Tapestry — 13 hand-embroidered panels, one per
  original colony, celebrating the US 250th. Created by Stefan Romero.
- **Existing site:** `americas_tapestry` — Next.js 16 / App Router on Vercel,
  file-based markdown content, images on Cloudflare R2 via a custom loader.
  No commerce today; has a MailerLite newsletter and a sponsor program.
- **Existing asset:** `stefanromerodolls` — a mature, well-tested **headless**
  Next.js/Shopify storefront for Stefan's doll business. Reusable as a v2
  template (see Phase 2). It is single-store hardwired and has **no** POD
  integration today.
- **Rights caveat (confirm offline):** the panels were stitched by 1,000+
  volunteers. Stefan must hold reproduction rights to sell prints for personal
  income. Assumed handled; not a blocker for this design.

## Commercial strategy

Four levers make this unusually monetisable:

1. **The 250th clock** — demand peaks July 4, 2026 and stays warm through H2.
   Favours speed.
2. **13-colony structure** — each tapestry maps to a state. *State pride* gives
   13 built-in regional micro-audiences for the per-colony SKUs.
3. **Warm audience** — 1,000+ volunteers + families ("I helped stitch this"),
   exhibition foot-traffic (QR → store), and the newsletter list.
4. **The composite** — an "All 13 Colonies" poster is the one SKU with
   *national* appeal and is typically the top seller.

## Architecture

```
americastapestry.org (Next.js / Vercel)        shop.americastapestry.org (Shopify, hosted theme)
 ├─ nav: "Shop"  ──────────────────────────────▶  store homepage
 ├─ /shop  (lightweight intro page) ───────────▶  collection: "Fine-Art Prints"
 └─ /tapestries/[slug]                             └─ Printful auto-prints + ships direct
       └─ <BuyPrintCallout>  ───────────────────▶  that colony's product page
```

- **Shopify** owns products, cart, checkout, payments, taxes, order emails,
  analytics, and abandoned-cart recovery. It lives on a subdomain so it shares
  the brand without entangling the tapestry codebase.
- **Printful** is connected to the Shopify store. On each order it prints and
  ships direct to the customer. The operator never touches a box.
- **Repo changes are small, additive, and contain no commerce logic** — no
  cart, no checkout, no payment code, no new server secrets.

### Phase 1 — Launch now (zero code in the store)

Use Shopify's **standard hosted storefront** (a clean theme). Connect the
**Printful app** (trivial on a standard store). Configure products, link from
the tapestry site. Goal: live before July 4.

### Phase 2 — Fast-follow (only if it sells)

Port the `stefanromerodolls` headless template into a branded headless
storefront on `shop.americastapestry.org`, reusing ~80–90% of proven code
(Shopify client, cart, `ProductCard`, `AddToCart`, gallery, sync script). New
work: brand/messaging, and wiring Printful into the headless order flow.
Revenue from Phase 1 justifies the effort. The template's value does not
expire; the July 4 window does — hence the sequencing.

## Launch product line (Tier 1 only)

| Product | Variants | Suggested retail | Rough POD cost | Notes |
|---|---|---|---|---|
| Per-colony poster | 18×24 | $39 | ~$13 | The volume entry point |
| Per-colony premium giclée | 16×20 / 24×36 | $69 / $99 | ~$18 / ~$30 | Premium matte/giclée paper |
| Per-colony framed | 18×24 framed | $129 | ~$45 | Highest AOV per colony |
| **"All 13 Colonies" composite poster** | large | $59 | ~$16 | National appeal; likely top seller |
| Artist Edition (numbered) | premium paper | $149 | ~$30 | Printed signature + limited inventory |

Catalog size: **13 colonies × 3 print formats + 1 composite + 1 Artist
Edition** ≈ a clean, focused line. Prices are starting recommendations; tune
against live Printful costs.

### Artist Edition (the "signed" compromise)

True hand-signing requires Stefan to physically handle a batch — which breaks
the no-ops rule *per order*. For launch, the Artist Edition is: premium paper,
a **printed signature**, scarcity enforced by **limited Shopify inventory** +
edition numbering in the listing copy. A genuine **hand-signed drop** is a
later one-time batch Stefan signs himself (light, one-off ops — not per-order).

### "All 13 Colonies" composite

The composite needs a single image of all 13 panels laid out as a poster grid.
Produce a draft composite from the existing R2 high-res masters during build;
Stefan approves before it goes live.

## Repo changes (americas_tapestry) — deliberately minimal

1. **`Shop` nav link** in the header (and footer), pointing to the Shopify
   subdomain.
2. **`<BuyPrintCallout>` component** rendered on each `/tapestries/[slug]`
   page — "Own this panel as a fine-art print" → deep-links to that colony's
   Shopify product. Maps colony slug → product URL via a small config file
   (e.g. `src/lib/shop-links.ts`).
3. **`/shop` intro page** — one screen: the story, the hero composite, and a
   "Browse the collection" button to Shopify. Serves SEO and gives a clean
   internal link target.

No cart, checkout, payment code, or new environment secrets enter the repo.

## Marketing hooks (low effort, high leverage)

- **Per-tapestry deep links** — warm intent → product; the best funnel available.
- **Newsletter announce** to the existing MailerLite list at launch.
- **Exhibition QR code** → `/shop` for foot-traffic (generate during build).
- **Launch timing** — live before July 4; the composite + state prints are the
  July 4 push.

## Success criteria

1. New dedicated Shopify store live on the subdomain; Printful connected.
2. **One colony fully configured end-to-end** with a passing Printful test
   order *before* scaling to all 13 (de-risks quality + fulfillment).
3. Repo: `Shop` nav link + `<BuyPrintCallout>` + `/shop` page shipped; every
   colony link resolves to the correct product; no build/cache regressions.
4. First real customer order printed and shipped by Printful with the operator
   never handling product.

## Out of scope (deferred to fast-follow)

- Textiles (tea towels, woven throws, cushions), gift/impulse tier (cards,
  magnets, mugs, totes), 2026 calendar.
- Hand-signed limited drops.
- "Portion supports the exhibition" charity messaging.
- International-optimised provider mix (e.g. Gelato for overseas posters).
- The Phase 2 headless storefront port (tracked separately once Phase 1 sells).

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Reproduction rights unclear | Confirm Stefan holds rights before going live |
| Print quality of tapestry photos disappoints | Order physical proofs of 1 colony before scaling |
| Missing the July 4 window | Phase 1 is zero-code hosted Shopify; no custom build on the critical path |
| Second Shopify subscription cost | ~$39/mo accepted as cost of brand separation |
| Composite image quality | Draft from R2 masters; Stefan approves before publish |

## Launch checklist (Phase 1, deadline-driven)

1. Create new Shopify store; set brand, domain `shop.americastapestry.org`.
2. Install + connect Printful app.
3. Configure **one** colony (3 formats) end-to-end; order a physical proof.
4. On proof approval, configure remaining 12 colonies + composite + Artist Edition.
5. Build composite image from R2 masters; get Stefan's approval.
6. Ship repo changes: `Shop` nav link, `<BuyPrintCallout>`, `/shop` page.
7. Generate exhibition QR code → `/shop`.
8. Announce to the MailerLite newsletter list.
```
