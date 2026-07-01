# America's Tapestry — Storefront Design Spec

**Direction:** Editorial Museum · **Status:** Approved for build · **Date:** 2026-07-01

---

## 1. Overview & Design Principles

America's Tapestry treats thirteen hand-embroidered colony panels as fine art in a modern museum-publication layout. The storefront reads as a **premium gallery bookstore**, not a costume-y heritage site: a gallery-white/parchment canvas with generous whitespace, oversized Montserrat 800 headlines, EB Garamond serif for descriptive and italic caption copy, delicate gold hairlines, and a single running-stitch motif used sparingly as a connective mark. Color is restrained — navy for text and dark art plates, gold reserved for CTAs / the stitch rule / active states, burgundy strictly for eyebrows, hovers, and the type chip. The landing leads with the **flagship hardcover** — *The Making of America's Tapestry* — as a matted museum plate, because the book is the whole work bound together (all thirteen panels in one object). The **state-first spine** then carries the rest ("Find your state, bring its story home"): a refined 13-colony index of framed panel tiles is beat two — the emotional entry into the catalog — before featured products and two secondary doors. The whole surface is three reusable primitives (ProductCard, CatalogGrid, FilterRail) whose facets map directly to Shopify tags, so new product lines populate existing facets and the grid with **no new page types**.

**Principles:** (1) State-first emotional spine. (2) Museum restraint — whitespace and hairlines over chrome. (3) One card, one grid, one rail — extensibility is visible. (4) Type hierarchy carries the design; the stitch is the only ornament. (5) AA-accessible contrast throughout.

---

## 2. Design Tokens

### Color (exact hex)
| Token | Hex | Role |
|---|---|---|
| Colonial Navy | `#1a2b45` | Primary text, dark art plates, nav, chips |
| Colonial Gold | `#e8b903` | CTAs, running-stitch rule, active check/underline states |
| Gold (hover) | `#d4a802` | Primary button hover |
| Colonial Burgundy | `#6b1f2e` | Eyebrow labels, hovers, type-filter chip |
| Colonial Parchment | `#f4e9d5` | Warm light section background, on-navy text |
| Cream | `#fbf7ef` | Card fields, footer, placeholder-light tiles |
| White | `#ffffff` | Dominant canvas |
| Ink/Muted | `#1a2b45` / `#6a6a72` | Body / secondary text |
| Line | `#e6ddca` | Hairline dividers, borders |
| In-stock green | `#2f6b3a` | Availability affordance only |

Contrast: navy-on-white, navy-on-parchment, parchment-on-navy, and navy-on-gold all pass WCAG AA for text sizes used.

### Typography
Loaded from Google Fonts: `Montserrat` (600/700/800 + italic 600) and `EB Garamond` (400/500 + italic 400).

| Element | Family / weight | Size | Notes |
|---|---|---|---|
| Hero H1 | Montserrat 800 | 60px (desktop) / 44px (≤900) | letter-spacing −.02em; `em` swaps to EB Garamond italic 500 burgundy |
| Catalog / page H1 | Montserrat 800 | 44px / 34px | |
| State H1 | Montserrat 800 | 54px / 42px | |
| Section H2 | Montserrat 800 | 38px / 28–34px | |
| Card title | Montserrat 700 | 15–17px | |
| Eyebrow label | Montserrat 700 | 11px | uppercase, letter-spacing .22em, **burgundy** |
| UI / nav / buttons | Montserrat 600–700 | 12–14px | uppercase for buttons/labels |
| Body / description | EB Garamond 400–500 | 14–20px | line-height 1.6–1.7 |
| Pull-quote / caption | EB Garamond italic | 24–30px | italic captions on art plates |

### Spacing scale
Base 4px. Common steps: 4 · 8 · 12 · 16 · 22 · 26 · 34 · 40 · 52 · 64 · 78–88 (section vertical rhythm). Canvas `max-width: 1200px`, gutter `40px` desktop / `22px` mobile.

### Running-stitch motif (signature)
Promoted to a single reusable CSS custom property (embroidery token):
```css
--stitch: repeating-linear-gradient(90deg, var(--gold) 0 7px, transparent 7px 13px);
```
Derived uses: section rules (`.stitch`, height 2px), the checked filter-option underline, product-detail variant "on" underline, and hero-stat left borders. Placeholder tiles carry a faint `1px dashed` inner matte (parchment-alpha on dark plates, navy-alpha on light) expressing the same motif so image tiles read as intentional matted art, never broken.

### Radius & shadow
- Radius: `2px` (buttons, inputs, chips, cards) — crisp, near-square.
- Lift shadow (hover): `0 24px 44px -28px rgba(26,43,69,.55)`.
- Plate shadow (framed art): `0 30px 60px -30px rgba(26,43,69,.4)`.

---

## 3. Information Architecture & Routes

| Route | Screen | Purpose |
|---|---|---|
| `/shop` | **Landing** | **Book hero** (flagship — the hardcover leads) → 13-colony picker (state-first entry, beat two) → featured products → two secondary doors → project story |
| `/shop/product/americas-tapestry-…-hardcover` | **Book product** | Detail page for the hardcover (reuses ProductDetail). Live Shopify product `9763676061926`: **$45**, **62 pages**, printed to order, tags `americas-tapestry, book` |
| `/shop/state/[slug]` | **State page** | One colony: panel imagery + story hook + EVERY product for that state (`tag: state:<slug>`) |
| `/shop` (catalog view) | **Catalog** | Unified filterable + searchable grid: FilterRail (State/Type/Price/Availability) + search + sort + active filters |
| `/shop/product/[handle]` | **Product detail** | Gallery + variant selector + price + Add to cart → Shopify checkout |
| `/shop/collections/all-states` | Composite (reuses Catalog) | The 14th "All 13" door — a pre-filtered catalog view, not a new template |

Secondary doors ("Shop by product", "All-states collections") and the colony index are **pre-filtered entries into the same catalog** — no unique page types.

---

## 4. Component Inventory

All components map to Shopify product data via two axes — **state** (13 values) and **type** (postcard, poster, tote, mug, giclee, framed, artist-edition, book, composite). Price and availability derive from variant data.

> **Live-store reconciliation (build decision):** the products already in Shopify use **flat, un-namespaced tags** — e.g. the Georgia postcards carry `["americas-tapestry", "georgia", "postcard"]`; the book carries `["americas-tapestry", "book"]`. The facet system therefore builds from **known vocabulary lists** (13 state slugs, N type slugs) matched against flat tags, OR we normalize to namespaced `state:*` / `type:*` tags (cleaner, self-describing, but requires a one-time re-tag of the ~14 existing products). Recommended: normalize now while the catalog is small. Either way the component contracts below are unchanged. Tracked in Open Questions.

### Header / Nav
Sticky, translucent white with blur, `1px` hairline base. Brand lockup (name + burgundy sub-label), primary links (Shop by State / Catalog / By Product / The Project), Search, and Bag with burgundy count pill. Announcement bar above (navy, gold highlight). Identical across all four screens.

### StatePicker (13-colony index)
Framed square panel tiles (navy→burgundy gradient, `nth-child` alternating tones for hand-made warmth, dashed inner stitch matte, EB Garamond italic state abbreviation), each with `Panel <roman> · N pieces` metadata and a hover arrow. A visually distinct **14th composite tile** (gold uppercase glyph, extra dashed inner frame) is the all-states destination. Each tile links to `/shop/state/[slug]`. Props: `name, abbr, panelNo, pieceCount, slug, variant("panel"|"composite")`.

### ProductCard (one card, everywhere)
The single most important primitive. Renders identically from a $4 single postcard to a $650 signed Artist Edition with no layout change. Regions:
- **flag** (top-left) = product type (`type:*`)
- **eyebrow** = state or collection (`state:*`)
- **badge** (top-right) = status vocabulary: `In stock`, `Bestseller`, `New`, `Signed`, `Coming soon`/`Sold out`
- **quick-add** (hover reveal) = `Quick add — $20` for buyable, or `Notify me` (ghost/gold outline variant) for pre-order/sold-out
- **title** (Montserrat 700) + **EB Garamond descriptive line** ("Ten cards from the Tidewater panel.")
- **price** with optional `from` prefix for variant-priced lines ("from $85") and strikethrough compare-at
- `dk` modifier switches the placeholder tile to the dark navy→burgundy plate.

Props: `state, type, title, description, price{from?, compareAt?}, badge, availability, image, dark?`.

### CatalogGrid
Responsive CSS grid (3 → 2 → 1 col) holding the unified, searchable, sortable result set of ProductCards. The same grid backs the catalog, the state page product list, the featured section, the related band, and the extensibility band.

### FilterRail
Quiet, left-aligned, hairline-divided facets — never boxed or shaded. Four facets:
- **State** (`tag: state:*`, 13 values, "Show all 13 +" expander)
- **Product Type** (`tag: type:*`, grows over time)
- **Price** (range with gold fill)
- **Availability** (radio: In stock / Include pre-order / All)

Facet enhancements: per-facet **"N selected"** gold count badge in the header; per-option result counts; **gold running-stitch underline on checked options**; a subtle EB Garamond italic **`tag: state:*` preview affordance** under each header (styled as a low-contrast admin/preview hint with a `title` tooltip — makes the tag-driven model legible to the team without leaking dev detail as shopper body copy). New tag values appear as new checkboxes automatically. Collapses to a "Filters" drawer below 900px.

### SearchBar
Promoted to a prominent, front-and-center field (keyword search is a fixed IA requirement): full-width within the canvas, `1.5px` navy border, magnifier glyph, and a visible gold **Search** button. Placeholder demonstrates intent ("Virginia print", "tote", "signed edition").

### StatePage layout
Asymmetric hero (1fr framed panel plate / 1fr story column with panel number, oversized headline, EB Garamond hook, stat trio, dual CTA), a type quick-nav (anchored views into the one grid), the full CatalogGrid of that state's products (`tag: state:<slug>`), a navy story block with pull-quote, and a "Continue along the coast" neighboring-states strip (reuses mini panel tiles + composite door).

### ProductDetail
Two-column: gallery (vertical thumbnails + framed stage plate with flag + badge + italic caption) and buy column (eyebrow state, H1, EB Garamond subtitle, price with from/compare-at, availability + rating, stitch rule, variant swatches with gold-stitch "on" underline and a disabled/sold-out swatch, quantity stepper, `Add to cart — $price` primary + Shopify `Buy it now`, assurances, and an accordion for Details / The panel / Shipping). Availability handled as a **button variant**: when the selected variant is sold out the primary CTA becomes a disabled `Notify me` (documented inline). Closes with a "More from the Virginia panel" related CatalogGrid.

### Footer
Cream field, `2fr 1fr 1fr 1fr` grid: brand + stitch rule + mission line, Shop / Products / Project link columns, and a bottom row (© + "Secure checkout via Shopify"). Identical across screens.

---

## 5. Extensibility Model — adding a product line (e.g. Calendars)

1. In Shopify, create the products and tag them `type:calendar` plus their `state:*` value (and `composite` for all-13 pieces). Set variant prices/inventory.
2. **FilterRail** automatically surfaces a new **Calendars** checkbox under Product Type with a live count — the facet renders from the distinct `type:*` values present.
3. **ProductCard** renders each calendar with flag=`Calendar`, eyebrow=state, the EB Garamond descriptive line, `from`-price if variant-priced, and any status badge — no layout change.
4. **CatalogGrid** includes them in the unified result set; they appear on the catalog, the relevant state pages, related bands, and the extensibility band with zero template work.
5. Secondary doors and the composite tile are just saved pre-filtered catalog URLs, so an "All-states Calendar" set needs only the `composite` tag.

No new routes, no new components. The catalog's **extensibility band** ("Other products from these three colonies") demonstrates this visually: the identical Card + Grid already carries posters, prints, framed and signed editions beside postcards.

---

## 6. Per-Screen Layout Notes

**01 Landing** — **Book hero leads** (flagship): asymmetric layout with the real hardcover cover as a standing, matted museum plate (parchment offset mat + soft floor/spine shadow) opposite the title *The Making of America's Tapestry*, the "A nation's story, stitched by hand" tagline, provenance copy (≈2,000 volunteers, 30,000 hours, 50,000 yards), price + In-stock, **Add to cart** / **Look inside**, and a 60 Pages · 13 Panels · 250 Years stat trio on dashed-gold borders. The announcement bar promotes the hardcover; nav gains a "The Book" link. Beat two is the parchment-tinted 13-colony index (4-col framed tiles + 14th composite). Then the white featured section (3-col cards, stitch section rule) showing the full badge/price range (Bestseller, In stock, New, Coming soon→Notify, Signed, from-pricing), parchment secondary doors (navy + burgundy), navy story strip with pull-quote, shared footer. The book is a normal Shopify product (`type:book`, all-states) — it simply gets the hero slot; its detail page reuses ProductDetail.

**02 State (Georgia)** — Breadcrumb, asymmetric state hero (framed 5/4 plate / story column, panel number, facts, dual CTA), type quick-nav pills, `tag: state:georgia` eyebrow over the full 8-piece CatalogGrid spanning every type (postcard → signed edition, including a Coming soon→Notify mug), navy panel-story block, "Continue along the coast" neighbors strip, footer.

**03 Catalog** — Head + prominent centered SearchBar (gold Search button) + toolbar (result count, sort). Active-filter row (burgundy Type chip + three state chips + Clear all). Two-col layout: quiet FilterRail (N-selected badges, per-option counts, gold-stitch checked underlines, `tag:` preview hints, price range, availability radios) + 3-col CatalogGrid of dark-plate postcard cards with the full badge vocabulary. Pagination. **Extensibility band** on linen-textured parchment proving the same grid absorbs posters/prints/framed/signed. Footer.

**04 Product (Virginia Postcards)** — Breadcrumb. Two-col: gallery (4 thumbnails + framed stage with flag + Bestseller badge + italic caption) / buy column (price, in-stock + rating, stitch rule, pack-size variants incl. sold-out swatch, finish variants, qty stepper, `Add to cart — $20` + Shopify Buy-it-now, assurances, accordion). "More from the Virginia panel" related grid (`tag: state:virginia`). Footer.

---

## 7. Accessibility & Responsive Notes

- **Contrast:** all text combinations meet WCAG AA; gold is never used for body text (CTAs, rules, and active affordances only). In-stock green is decorative-adjacent but paired with the word "In stock".
- **Semantics (build):** filter options are real `<label>` + `<input>` pairs; nav is `<nav>`; the search is a `<form>`; badges/availability should carry text (not color alone). Accordion rows and quantity steppers need `aria-expanded` / `aria-label` in build.
- **Focus:** gold focus ring on the search field (`box-shadow` 3px gold-alpha); build should extend visible focus states to all interactive elements.
- **Motion:** restrained — 2–5px translate lifts and short arrow reveals; honor `prefers-reduced-motion` in build.
- **Responsive:** desktop-first, canvas ~1200px. ≤900px — heros collapse to one column, colony index 4→2, product/related grids 3→2, filter rail collapses behind a "Filters" drawer button, primary nav hides behind a menu (to add in build). ≤600px — all grids single column, search button hides (icon-submit), gutters tighten to 22px.

---

## 8. Open Questions / Decisions Deferred to Build

1. **Cart model** — slide-out drawer vs. dedicated cart page before Shopify checkout handoff (mockups assume drawer + Buy-it-now).
2. **Mobile filter drawer** — exact interaction (bottom sheet vs. full-screen) and the hamburger nav menu are stubbed, not designed.
3. **Piece counts** — colony `N pieces` metadata should read live from Shopify tag counts; confirm caching strategy.
4. **`tag:` preview affordance** — decide whether the FilterRail tag hint ships to production (recommended: admin/preview-only, gated behind a staff flag).
5. **Variant → availability wiring** — the sold-out swatch and `Add to cart → Notify me` swap must bind to real variant inventory; define the Notify-me capture (email/Shopify back-in-stock).
6. **Search backend** — Shopify native search vs. a search app; the prominent SearchBar assumes keyword + faceted results.
7. **Composite / all-states data** — whether `composite` is a tag on all-13 products or a distinct collection; affects the 14th tile and the all-states door.
8. **Panel imagery** — real panel photography replaces the gradient placeholder tiles; confirm 4/5 and 5/4 crop ratios and matte treatment against final photos.
