# America's Tapestry — Product Taxonomy (for site design)

Product taxonomy to optimize the website around. Built on the two filter axes the
site uses — **By State** and **By Product Type** — and flags which products are
per-state vs collection-wide, since that drives layout and filtering.

## Two organizing axes

- **State** — 13: Georgia, Connecticut, Delaware, Maryland, Massachusetts,
  New Hampshire, New Jersey, New York, North Carolina, Pennsylvania,
  Rhode Island, South Carolina, Virginia
- **Product type** — the list below

Per-state wall art comes in **two portrait design families** (decided 2026-07-02):
**art-only** (full-bleed photo cropped to the muslin border — collector line,
products 1–4) and the **Exhibition Poster** (art floated on the signature navy
ground with an "AMERICA'S TAPESTRY" / state / directors text block — souvenir
line, product 5).
→ **Design every product card / thumbnail around a portrait image.**

## A. Per-state products (13 variants each)

| # | Product type | Type tag | Variants (axes) | Price tier | Priority |
|---|---|---|---|---|---|
| 1 | **Framed Print** | `framed-print` | Size (S/M/L) × frame color | $$$$ ($90–180) | ★ Hero |
| 2 | **Canvas Print** | `canvas` | Size (S/M/L) | $$$ ($90–160) | ★ Hero |
| 3 | **Metal / Acrylic HD Print** | `metal-print` | Size (S/M/L) | $$$$$ ($150–300+) | Premium |
| 4 | **Unframed Fine-Art Print** | `art-print` | Size (S/M/L) | $$ ($25–70) | Volume |
| 5 | **Exhibition Poster** (navy + text block) | `poster` | Size (S/M, smaller sizes only) | $ ($15–35, TBC) | Volume |
| 6 | **Boxed Greeting-Card Set** | `greeting-cards` | — | $$ ($25–30) | Gift |
| 7 | **Postcards — Pack of 10** ✅ _live_ | `postcard` | — | $ ($20) | Impulse |

## B. Collection-wide products (single product, all states)

| # | Product type | Type tag | Notes | Price tier |
|---|---|---|---|---|
| 8 | **2026 Wall Calendar** (all 13 panels) | `calendar` | One SKU, 250th-anniversary hero, giftable | $$ ($30–40) |
| 9 | **Book — "A Nation's Story" (Hardcover)** ✅ _live_ | `book` | Already live | $$$ |

_Phase-2 long tail — leave room but don't feature: mug, tote, fridge-magnet set._

## Notes for the designer

- **Two primary filters:** _Shop by State_ (13) and _Shop by Product Type_ (9).
  Every per-state product must be reachable both ways.
- **Curated entry points** worth designing as first-class: _Shop Your State_,
  _Wall Art_, _The 2026 Calendar_, _The Book_, _Gifts under $30_,
  _For Institutions / Bulk_.
- **Price-tier nav / badges** (for a "gifts by price" pattern):
  Under $25 · $25–50 · $50–150 · $150+.
- **Merchandising hooks** to build UI around: "Buy your state," "Collect all 13,"
  gift-ability, and a **250th-anniversary commemorative** badge/theme.
- **Existing Shopify data** to filter on: collection **America's Tapestry**;
  tags `americas-tapestry` + `<state>` + `<type>` (recommend adding the `<type>`
  tag from the table so type-filtering is clean — postcards currently only carry
  `postcard`).
- **Imagery is portrait & consistent** across all states → grids stay tidy; the
  calendar and book are the two landscape/cover exceptions.
