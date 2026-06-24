# Brand source masters

Version-controlled **source** assets — high-resolution / vector originals of the
America's Tapestry logo and sponsor logos.

These files are **not served** by the site (this directory lives outside
`public/`) and are **not** processed by `scripts/optimize-and-upload.mjs`. They
are kept as editable masters for design work and as the source of truth for the
web-ready versions.

## Contents

- `Americas_Tapestry_Vector.{ai,pdf}` — vector master of the horizontal
  "America's Tapestry" wordmark + thread-spool lockup. Web derivatives generated
  from the PDF with `pdftocairo` (poppler):
  - `public/images/branding/americas-tapestry-logo.svg` — scalable, transparent.
  - `public/images/branding/americas-tapestry-logo.png` — 2315×473, transparent.

  Regenerate with:
  ```
  pdftocairo -svg assets/brand/Americas_Tapestry_Vector.pdf public/images/branding/americas-tapestry-logo.svg
  pdftocairo -png -singlefile -transp -r 300 assets/brand/Americas_Tapestry_Vector.pdf public/images/branding/americas-tapestry-logo
  ```

  The existing square patriotic badge used in the site header is a separate
  asset: `public/images/branding/americas-tapestry-logo-patriotic.png`.
- `sponsors/<slug>/` — print/vector sponsor logo masters, keyed by the sponsor
  slug used in `content/sponsors/`. The live web logos are the transparent PNGs
  in `public/images/sponsors/<slug>-logo.png`.

## Turning a master into a web logo

The print masters are mostly TIFF/EPS/PDF/JPG (often with white backgrounds).
To use one on the site, export a transparent PNG to
`public/images/sponsors/<slug>-logo.png`, then run
`node scripts/optimize-and-upload.mjs` (add `--force` if replacing an existing
file). See the sponsor logo convention in `src/lib/sponsors.ts`.
