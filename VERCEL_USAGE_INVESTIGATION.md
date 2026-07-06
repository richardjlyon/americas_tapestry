# Vercel Free-Tier Overage — Investigation Memo

**Date:** 6 July 2026
**Author:** Claude (investigation session, read-only)
**Audience:** web-optimisation agent — fold these findings into your plan
**Status:** Diagnosis complete. No fixes applied.

## What happened

The Vercel team (`richardjlyons-projects`, Hobby plan) exceeded free-tier limits in the
**6 June – 6 July billing cycle** (cycle runs 6th → 6th, which is why it came to a head on 5 July):

| Metric | Used | Free limit |
|---|---|---|
| Fast Data Transfer | **207.72 GB** | 100 GB |
| Edge Requests | **1.7M** | 1M |
| Image Transformations | 245 | 5K |
| Function Invocations | 658 | 1M |

**americas-tapestry accounts for 91.4% of transfer (189.9 GB).** Warning emails (75%, 100%)
landed in Spam on 27–28 June.

Daily transfer profile: ~1 GB/day baseline until 20 June → climb from 20 June →
**~38 GB/day spikes 27–28 June** → elevated 5–8 GB/day → **~42 GB spike on 5 July** (the killer).

## Root cause

**The R2 image migration changed the URLs the site emits, but never removed the originals
from `public/`.** 1.1 GB of unoptimized masters remain deployed to Vercel at stable public
URLs, and crawlers fetch them directly:

- `public/images/` — **1.0 GB**, incl. 27 MB PNGs, 15 MB JPEGs, 9 MB carousel JPEGs, many 6–12 MB portraits
- `public/video/` — **62 MB**: `250305-short-promotional-v2.mp4` (47 MB), `-lowres.mp4` (14 MB), poster PNGs (2.5 MB). The player streams from GitHub releases, but these files are still fetchable — and being fetched
- `public/docs/` — **33 MB** of PDFs (15 MB, 13 MB single files)

The image pipeline itself is healthy: `next/image` + `src/lib/cloudflare-loader.ts` correctly
rewrites manifest images to R2 (Image Optimization usage is trivial). The leak is **raw static
serving of files nothing on the current site links to** — bots re-fetch URLs they indexed
long ago. Evidence: heavy traffic to carousel JPEGs whose pages were deleted this morning,
and 910 hits on `/404` in 12 hours.

Real per-route data (last 12h, ~3 GB total — Observability → Fast Data Transfer → Routes tab):

| Route | Requests | Transfer out |
|---|---|---|
| `/images/tapestries/new-hampshire/…` | 788 | 637 MB |
| `/images/tapestries/maryland/…` | 108 | 302 MB |
| `/video/250305-short-promotional…` | 102 | 203 MB |
| `/images/carousel/carousel_14.jpg` | 74 | 171 MB |
| carousel_11 + carousel_02 | 176 | 44 MB |
| `/data/gz_2010_us_040_00_500…` (geojson) | 120 | 33 MB |

## Contributing timeline

- **20 Jun** — 13 new ~3 MB `*-photo.jpg` mounted-tapestry photos committed to `public/`
  (they *were* uploaded to R2 + manifest same day, but originals stayed in `public/`)
- **24 Jun** — hero photos replaced with "high-res masters"; **sitemap + robots.txt shipped**
  (SEO Tier 1) — crawler traffic ramped from this window
- **27–28 Jun** — first 38 GB/day crawler sweeps; 75%/100% warning emails (→ Spam)
- **5 Jul** — 42 GB day; cap blown
- Human traffic was flat throughout: 31K Web Analytics pageviews for the whole month.
  The spikes are bulk crawlers (AI crawlers fit the profile) pulling full-size originals.

## Known un-migrated assets (served from Vercel by design or oversight)

- ~92 files (~59 MB) missing from the R2 manifest, chiefly:
  - Pre-generated `-2560w.avif` / `-1920w.avif` hero variants (up to 4.7 MB each) —
    manifest holds only jpg/webp variants, **AVIFs were never uploaded to R2**
  - Per-state `*-audio-description.mp3` (~1.2 MB each)
- All of `public/video/` and `public/docs/`

## Recommendations (in impact order — not yet actioned)

1. **Remove heavy originals from `public/`** — de-referencing is not enough; once a URL has
   been public, bots re-fetch it forever. Anything ≥ ~500 KB that has an R2 copy should be
   deleted from the deployment (verify R2 copy first; masters also archived per repo history).
2. **Delete or relocate `public/video/*.mp4`** (61 MB) — playback already streams from GitHub
   releases. Consider moving poster PNGs to R2 (2.5 MB poster loads on every home view).
3. **robots.txt disallow** for `/images/`, `/video/`, `/docs/`, `/data/` — legit rendering
   doesn't need these paths crawled (site images come from R2). Note: only helps with
   well-behaved bots; removal (1) is the real fix.
4. **Audit remaining raw-path references** — audio mp3s, geojson, PDFs: decide keep-on-Vercel
   (small/necessary) vs move to R2.
5. **Watch Edge Requests too** (1.7M/1M) — mostly crawler/scanner fan-out; robots.txt +
   asset removal will cut it, but it's the secondary metric.

## Gotchas for whoever verifies

- Vercel **Observability "Paths" and "Bot Name" tabs show fake sample data on Hobby**
  (Pro-gated) — `/blog/1`, `/api/demo`, "OpenAI 12K" etc. are placeholders. Ignore them.
  The **Routes tab is real.**
- Observability retention on Hobby is ~12 h; the 5 July spike is no longer path-inspectable.
- Usage dashboard: team → Usage → Fast Data Transfer → Projects tab for per-project split.
- Billing cycle resets **6th of each month** — the new cycle starts today (6 July), so the
  clock is already running on the next 100 GB.
