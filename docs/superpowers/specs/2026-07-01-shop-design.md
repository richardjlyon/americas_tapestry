# America's Tapestry — Storefront Design Spec

**Direction:** Editorial Museum · **Status:** Approved for build · **Date:** 2026-07-01

---

## 1. Overview & Design Principles

America's Tapestry treats thirteen hand-embroidered colony panels as fine art in a modern museum-publication layout. The storefront reads as a **premium gallery bookstore**, not a costume-y heritage site: a gallery-white/parchment canvas with generous whitespace, oversized Montserrat 800 headlines, EB Garamond serif for descriptive and italic caption copy, delicate gold hairlines, and a single running-stitch motif used sparingly as a connective mark. Color is restrained — navy for text and dark art plates, gold reserved for CTAs / the stitch rule / active states, burgundy strictly for eyebrows, hovers, and the type chip. The landing leads with the **flagship hardcover** — *The Making of America's Tapestry* — as a matted museum plate, because the book is the whole work bound together (all thirteen panels in one object). The **state-first spine** then carries the rest ("Find your state, bring its story home"): a refined 13-colony index of framed panel tiles is beat two — the emotional entry into the catalog — before featured products and the curated entry points (Wall Art, the 2026 Calendar, Gifts under $30, and more). The whole surface is three reusable primitives (ProductCard, CatalogGrid, FilterRail) whose facets map directly to Shopify tags, so new product lines populate existing facets and the grid with **no new page types**.

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
| `/shop/catalog` | **Catalog** | Unified filterable + searchable grid: FilterRail (State / Type [Wall-Art grouped] / Price [tier chips + range] / Availability) + search + sort + active filters |
| `/shop/product/[handle]` | **Product detail** | Gallery + variant selector (Size × frame, etc.) + price + Add to cart → Shopify checkout |
| `/shop/institutions` | **Institutions / Bulk** | Inquiry/contact page (no SKU) — wholesale & bulk requests via form/email |

**Curated entry points** — all are pre-filtered catalog URLs or simple content, no new page templates (except the Institutions inquiry page):

| Entry | Resolves to |
|---|---|
| Shop Your State | 13-colony picker → `/shop/state/[slug]` |
| Wall Art | catalog filtered to the `wall-art` type group |
| The 2026 Calendar | the `calendar` product detail |
| The Book | the hardcover product detail (also the landing hero) |
| Gifts under $30 | catalog filtered to price ≤ $30 |
| Collect all 13 | a state's full set, or the all-states collection view |
| For Institutions / Bulk | `/shop/institutions` |

The colony index and every curated entry are **pre-filtered entries into the same catalog** — no unique page types besides Institutions.

---

## 4. Component Inventory

All components map to Shopify product data via two axes — **state** and **type** — read from **flat product tags** (`americas-tapestry` + `<state>` + `<type>`). Price and availability derive from variant data.

### Product taxonomy (canonical — from `PRODUCT_TAXONOMY.md`)

**Per-state products** (13 products each, one per colony; imagery is the portrait "navy-plate" composition — art floated on the navy ground with the AMERICA'S TAPESTRY lockup):

| Type | Tag | Variant axes | Price | Priority |
|---|---|---|---|---|
| Framed Print | `framed-print` | Size S/M/L × frame color | $90–180 | ★ Hero |
| Canvas Print | `canvas` | Size S/M/L | $90–160 | ★ Hero |
| Metal & Acrylic Print | `metal-print` | Size S/M/L | $150–300+ | Premium |
| Art Print (unframed poster) | `art-print` | Size S/M/L | $25–70 | Volume |
| Greeting-Card Set (boxed) | `greeting-cards` | — | $25–30 | Gift |
| Postcards — Pack of 10 (live) | `postcard` | — | $20 | Impulse |

**Collection-wide products** (single product, all states — the `<state>` tag is absent; landscape/cover imagery, the two exceptions to portrait):

| Type | Tag | Notes | Price |
|---|---|---|---|
| 2026 Wall Calendar | `calendar` | all 13 panels; 250th-anniversary hero, giftable | $30–40 |
| Book — hardcover (live) | `book` | product `9763676061926` | $45 |

**Type groups:** **Wall Art** = `framed-print` + `canvas` + `metal-print` + `art-print` — surfaced as a grouped heading in the Type facet and as a curated entry.

**Phase-2 long tail** (recognized in the vocabulary so any tagged products render, but NOT featured): `mug`, `tote`, `fridge-magnet`.

**Price tiers** (the "gifts by price" pattern — one-tap chips + optional badges): **Under $25 · $25–50 · $50–150 · $150+**, derived from a product's minimum price. The range slider stays alongside the chips for fine control.

> **Tag scheme — RESOLVED.** The taxonomy confirms **flat tags**: `americas-tapestry` (collection) + `<state>` (one of 13; absent on collection-wide products) + `<type>` (from the tables above). Facets build from known vocabulary lists matched against these flat tags — no namespacing, no re-tag. **Data hygiene:** every product must carry its `<type>` tag (live postcards already carry `postcard`; backfill `<type>` on new products as created).

### Header / Nav
Sticky, translucent white with blur, `1px` hairline base. Brand lockup (name + burgundy sub-label), primary links (Shop by State / Catalog / By Product / The Project), Search, and Bag with burgundy count pill. Announcement bar above (navy, gold highlight). Identical across all four screens.

### StatePicker (13-colony index)
Framed square panel tiles (navy→burgundy gradient, `nth-child` alternating tones for hand-made warmth, dashed inner stitch matte, EB Garamond italic state abbreviation), each with `Panel <roman> · N pieces` metadata and a hover arrow. A visually distinct **14th "All States" tile** (gold uppercase glyph, extra dashed inner frame) links to the collection-wide products (calendar, book) and the all-states catalog view. Per-state tiles link to `/shop/state/[slug]`. Props: `name, abbr, panelNo, pieceCount, slug, variant("panel"|"all-states")`.

### ProductCard (one card, everywhere)
The single most important primitive. Renders identically from a $20 postcard pack to a $300 metal print with no layout change. Portrait image by default (per-state navy-plate); the calendar/book cards use their landscape/cover art without force-cropping. Regions:
- **flag** (top-left) = product type (the `<type>` tag → its label)
- **eyebrow** = state name (the `<state>` tag) or "All States" for collection-wide products
- **badge** (top-right) = status vocabulary: `In stock`, `Bestseller`, `New`, `250th` (commemorative), `Coming soon`/`Sold out`
- **tier badge** (optional) = the product's price tier where the "gifts by price" pattern is surfaced
- **quick-add** (hover reveal) = `Quick add — $price` for single-variant buyable items, `Choose options` for multi-variant (Size/frame), or `Notify me` (ghost/gold outline) for pre-order/sold-out
- **title** (Montserrat 700) + **EB Garamond descriptive line** ("The Tidewater panel, framed and ready to hang.")
- **price** with `from` prefix for variant-priced lines ("from $90") and strikethrough compare-at
- `dk` modifier switches the placeholder tile to the dark navy→burgundy plate.

Props: `state, type, title, description, price{from?, compareAt?}, badge, tier?, availability, image, dark?`.

### CatalogGrid
Responsive CSS grid (3 → 2 → 1 col) holding the unified, searchable, sortable result set of ProductCards. The same grid backs the catalog, the state page product list, the featured section, the related band, and the extensibility band.

### FilterRail
Quiet, left-aligned, hairline-divided facets — never boxed or shaded. Four facets:
- **State** (the 13 `<state>` values, "Show all 13 +" expander)
- **Product Type** (the `<type>` values, with a **"Wall Art" grouped heading** over `framed-print`/`canvas`/`metal-print`/`art-print`, then Greeting Cards, Postcards, Calendar, Book; grows as new types are tagged)
- **Price** — one-tap **tier chips** (Under $25 / $25–50 / $50–150 / $150+) **and** a range slider below them for fine control
- **Availability** (radio: In stock / Include pre-order / All)

Facet enhancements: per-facet **"N selected"** gold count badge in the header; per-option result counts; **gold running-stitch underline on checked options**. New `<type>` values appear as new checkboxes automatically (unknown types fall under an "Other" heading until added to the group map). Collapses to a "Filters" drawer below 900px.

### SearchBar
Promoted to a prominent, front-and-center field (keyword search is a fixed IA requirement): full-width within the canvas, `1.5px` navy border, magnifier glyph, and a visible gold **Search** button. Placeholder demonstrates intent ("Virginia print", "tote", "wall calendar").

### StatePage layout
Asymmetric hero (1fr framed panel plate / 1fr story column with panel number, oversized headline, EB Garamond hook, stat trio, dual CTA), a type quick-nav (anchored views into the one grid), the full CatalogGrid of that state's products (`tag: state:<slug>`), a navy story block with pull-quote, and a "Continue along the coast" neighboring-states strip (reuses mini panel tiles + composite door).

### ProductDetail
Two-column: gallery (vertical thumbnails + framed stage plate with flag + badge + italic caption) and buy column (eyebrow state, H1, EB Garamond subtitle, price with from/compare-at, availability + rating, stitch rule, variant swatches with gold-stitch "on" underline and a disabled/sold-out swatch, quantity stepper, `Add to cart — $price` primary + Shopify `Buy it now`, assurances, and an accordion for Details / The panel / Shipping). Availability handled as a **button variant**: when the selected variant is sold out the primary CTA becomes a disabled `Notify me` (documented inline). Closes with a "More from the Virginia panel" related CatalogGrid.

### Footer
Cream field, `2fr 1fr 1fr 1fr` grid: brand + stitch rule + mission line, Shop / Products / Project link columns, and a bottom row (© + "Secure checkout via Shopify"). Identical across screens.

---

## 5. Extensibility Model — adding a product line (e.g. Calendars)

1. In Shopify, create the products and tag them with the `<type>` (e.g. `tote`) plus their `<state>` value (omit `<state>` for a collection-wide product). Set variant prices/inventory.
2. **FilterRail** automatically surfaces a new checkbox under Product Type with a live count — the facet renders from the distinct `<type>` values present (add the type to the Wall-Art group map only if it belongs there; otherwise it lists individually / under "Other").
3. **ProductCard** renders each with flag=type label, eyebrow=state (or "All States"), the EB Garamond descriptive line, `from`-price if variant-priced, any status badge, and its price-tier — no layout change.
4. **CatalogGrid** includes them in the unified result set; they appear on the catalog, the relevant state pages, related bands, and any curated view with zero template work.
5. Curated entries (Wall Art, Gifts under $30, Collect all 13) are just saved pre-filtered catalog URLs — no new products or tags needed.

No new routes, no new components. The catalog's **extensibility band** demonstrates this visually: the identical Card + Grid already carries framed prints, canvas, metal, art prints, greeting cards, postcards, the calendar, and the book side by side.

---

## 6. Per-Screen Layout Notes

**01 Landing** — **Book hero leads** (flagship): asymmetric layout with the real hardcover cover as a standing, matted museum plate (parchment offset mat + soft floor/spine shadow) opposite the title *The Making of America's Tapestry*, the "A nation's story, stitched by hand" tagline, provenance copy (≈2,000 volunteers, 30,000 hours, 50,000 yards), price + In-stock, **Add to cart** / **Look inside**, and a 60 Pages · 13 Panels · 250 Years stat trio on dashed-gold borders. The announcement bar promotes the hardcover; nav gains a "The Book" link. Beat two is the parchment-tinted 13-colony index (4-col framed tiles + 14th All-States tile). Then the white featured section (3-col cards, stitch section rule) showing the full badge/price range (Bestseller, In stock, New, Coming soon→Notify, from-pricing), parchment secondary doors (navy + burgundy), navy story strip with pull-quote, shared footer. The book is a normal Shopify product (`type:book`, all-states) — it simply gets the hero slot; its detail page reuses ProductDetail.

**02 State (Georgia)** — Breadcrumb, asymmetric state hero (framed 5/4 plate / story column, panel number, facts, dual CTA), type quick-nav pills, `state = georgia` eyebrow over the full CatalogGrid spanning every type for that colony (framed print, canvas, metal, art print, greeting cards, postcards — with any Coming soon→Notify items), navy panel-story block, "Continue along the coast" neighbors strip, footer.

**03 Catalog** — Head + prominent centered SearchBar (gold Search button) + toolbar (result count, sort). Active-filter row (Type/state chips + Clear all). Two-col layout: quiet FilterRail — State; Product Type with the **Wall Art grouped heading** (Framed / Canvas / Metal & Acrylic / Art Prints) then Greeting Cards, Postcards, Calendar, Book; **Price = tier chips (Under $25 / $25–50 / $50–150 / $150+) + range slider**; Availability — with N-selected badges, per-option counts, gold-stitch checked underlines. 3-col CatalogGrid of portrait navy-plate cards spanning the real line (Framed from $90, Canvas from $90, Metal from $150, Art Print from $25, Greeting Cards $28, Postcards $20), with the badge vocabulary incl. a gold **250th** commemorative badge. Pagination + extensibility band. Footer.

**04 Product (Georgia Framed Print)** — Breadcrumb. Two-col: gallery (portrait navy-plate stage + thumbnails, flag + **250th** badge + italic caption) / buy column (from-price, availability + rating, stitch rule, **Size (S/M/L)** and **Frame color** variant swatches with gold-stitch "on" underline incl. a sold-out swatch, qty stepper, `Add to cart` + Shopify Buy-it-now, assurances, accordion). "More Georgia wall art" related grid (`state = georgia`). Footer.

---

## 7. Accessibility & Responsive Notes

- **Contrast:** all text combinations meet WCAG AA; gold is never used for body text (CTAs, rules, and active affordances only). In-stock green is decorative-adjacent but paired with the word "In stock".
- **Semantics (build):** filter options are real `<label>` + `<input>` pairs; nav is `<nav>`; the search is a `<form>`; badges/availability should carry text (not color alone). Accordion rows and quantity steppers need `aria-expanded` / `aria-label` in build.
- **Focus:** gold focus ring on the search field (`box-shadow` 3px gold-alpha); build should extend visible focus states to all interactive elements.
- **Motion:** restrained — 2–5px translate lifts and short arrow reveals; honor `prefers-reduced-motion` in build.
- **Responsive:** desktop-first, canvas ~1200px. ≤900px — heros collapse to one column, colony index 4→2, product/related grids 3→2, filter rail collapses behind a "Filters" drawer button, primary nav hides behind a menu (to add in build). ≤600px — all grids single column, search button hides (icon-submit), gutters tighten to 22px.

---

## 8. Open Questions / Decisions Deferred to Build

**Resolved by the taxonomy (2026-07-01):** tag scheme is **flat** `americas-tapestry` + `<state>` + `<type>` (no namespacing). Collection-wide products (calendar, book) simply omit the `<state>` tag — "All States" is derived, there is no `composite` tag or 14th tile; "Collect all 13" is a curated pre-filtered view. Price uses **tier chips + range slider**. "For Institutions / Bulk" is an **inquiry page, no SKU**.

Still open:
1. **Cart model** — slide-out drawer vs. dedicated cart page before Shopify checkout handoff (mockups assume drawer + Buy-it-now).
2. **Mobile filter drawer** — exact interaction (bottom sheet vs. full-screen) and the hamburger nav menu are stubbed, not designed.
3. **Piece counts** — colony `N pieces` metadata should read live from Shopify tag counts; confirm caching strategy.
4. **Variant axes** — confirm the exact Size options (S/M/L labels + dimensions) and frame-color options per print type when those products are created in Shopify; the ProductDetail selector must render 1- or 2-axis `options` generically.
5. **Variant → availability wiring** — the sold-out swatch and `Add to cart → Notify me` swap must bind to real variant inventory; define the Notify-me capture (email/Shopify back-in-stock).
6. **Search backend** — Shopify native search vs. a search app; the SearchBar assumes keyword + faceted results (the `catalog.ts` search is client-side over the fetched set for launch).
7. **Price-tier thresholds** — the tier chips are Under $25 / $25–50 / $50–150 / $150+ (min-price based); the "Gifts under $30" curated entry uses a $30 threshold independent of the tiers — confirm both are wanted, or align them.
8. **Institutions page** — content + form fields for `/shop/institutions` (bulk/wholesale inquiry) and where submissions route (email vs. CRM).
9. **Panel imagery** — real portrait navy-plate photography replaces the gradient placeholder tiles; confirm crop ratios and the calendar/book landscape/cover exceptions against final assets.
