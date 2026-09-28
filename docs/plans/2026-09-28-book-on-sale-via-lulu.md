# Put the book on sale, printed by Lulu — plan (2026-09-28, not approved)

## What exists now (checked live 2026-09-28)

- **Site:** `/shop/book` is a full sales page with the buy button switched off
  (`buyable = false`, commit `c27ad8a`, 6 Jul). `/shop` and every `/shop/<state>`
  page show the book as "Coming soon". Live site confirms: 4 × "Coming soon".
- **Site copy is stale:** says 58 pages, 8.3 × 11 in (the old Gelato build).
  The Lulu build is 62 pages, 8.5 × 11 in.
- **Shopify:** product "America's Tapestry — A Nation's Story Stitched by Hand
  (Hardcover)", $45, tags `americas-tapestry` + `book`, in the collection.
  Created 30 Jun — before the Lulu switch — with a Gelato-style SKU and a
  weight of 160 g. So it is still the **Gelato** product. `published_at` was
  reset at 13:29 UTC today, and its product page at the myshopify.com address
  shows "Add to cart": it can be bought there now, and would route to Gelato
  if the Gelato link is still active.
- **Lulu files (Mac, `~/Resilio/Projects/americas-tapestry-shop-items/book/`):**
  62-page print-ready interior (800 MB) done. **Cover spread not built.**
  No proof ordered. Nothing records a Lulu account or project.
- **Tooling gaps:** `add-shop-product` skill no longer exists anywhere; the Shopify admin
  token is only in 1Password **Personal** (not Automation); the VM's `.env`
  has no Shopify
  values, so local builds show no shop.

## Admin API check (2026-09-28, token from 1Password Personal › "Shopify")

- Book product `9763676061926`: ACTIVE, published to Online Store,
  Atelier Headless Storefront, America's Tapestry (3 channels, not 5).
- Stock sits at the **gelato** fulfilment location. The store's only
  fulfilment services are Manual and Gelato. **No Lulu connection in Shopify.**
- 68 products in the store, one book. Lulu Direct creates its own product, so
  it has not been linked here.
- One book order ever: #1015, 8 Jul, $51.99, refunded and cancelled 11 Jul.
- The token lacks `read_shipping` and cannot read installed apps. It is in the
  Personal vault, which the VM's service account cannot see.

## Plan

### 1. Lulu (Richard, in Lulu's web app)
1. Create the project: 8.5 × 11 hardcover casewrap, premium colour, upload
   the interior.
2. Download Lulu's cover template; I build the cover spread from
   `cover/AT_FrontCover_Print.pdf` to it (spine ~0.25 in).
3. Order a proof copy. Check it.
4. Publish the project for direct sales only; note the print cost.

### 2. Shopify (Richard installs; I can do the rest with an admin token)
1. Install the **Lulu Direct** app; connect the store in Lulu's "My Stores".
2. Attach the Lulu project to the existing product if the app allows,
   otherwise create a new one and archive the Gelato one. Either way,
   **remove the Gelato link** so no order goes to two printers.
3. Keep tags `americas-tapestry` + `book`, the collection, and all five sales
   channels (the site only sees tagged, collected, all-channel products).
4. Shipping: a Shopify shipping profile for the book — Lulu live rates if the
   plan supports calculated rates, otherwise flat rates from Lulu's calculator.
5. Correct the weight; set the price.
6. Test order: manual order marked paid → appears in Lulu Direct → pay it as
   a second proof.

### 3. Site code (me, on a branch; Vercel preview before master)
1. `/shop/book`: restore `buyable = Boolean(href && book?.availableForSale)`;
   specs to 62 pages, 8.5 × 11 in; copy that says 58 pages.
2. `/shop`: replace the "Coming soon" book card with a buy card; decide
   whether the hero promotes the book.
3. `/shop/<state>`: change "Coming soon · Preview" to price + buy.
4. Build, check preview, merge to master (which deploys live), verify live.

## Decisions for Richard
- Price: $45 was set against Gelato costs; re-check once Lulu quotes.
- Hardcover only, or a paperback variant too.
- Launch date / whether to close the direct myshopify.com purchase path now.
