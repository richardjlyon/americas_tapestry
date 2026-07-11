# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**Mapping:**
- Mapbox - Interactive map rendering for colonial America visualization
  - SDK/Client: `mapbox-gl` 3.10.0, `react-map-gl` 8.0.1
  - Auth: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
  - Style: `NEXT_PUBLIC_DEFAULT_MAPBOX_STYLE` (default: `mapbox://styles/mapbox/light-v11`)
  - Config: `src/lib/mapbox-config.ts`
  - Usage: `src/components/features/tapestries/interactive-colonies-map.tsx`

**Email (Transactional):**
- Resend - Contact form email delivery
  - SDK/Client: `resend` 4.0.1
  - Auth: `RESEND_API_KEY`
  - Usage: `src/app/actions/contact-actions.ts`
  - From address: `hello@americastapestry.com`

**Email (Newsletter):**
- MailerLite - Newsletter subscription management
  - SDK/Client: Native fetch API (no SDK)
  - Auth: `MAILERLITE_API_KEY` (supports both v2 API key and v3 JWT)
  - Endpoints:
    - v3: `https://connect.mailerlite.com/api/subscribers`
    - v2: `https://api.mailerlite.com/api/v2/subscribers`
  - Usage: `src/app/actions/newsletter-actions.ts`

**Analytics:**
- Vercel Analytics - Page view and performance tracking
  - SDK/Client: `@vercel/analytics` 1.5.0
  - Auth: Automatic (Vercel deployment)
  - Usage: `src/app/layout.tsx` - `<Analytics />` component

## Data Storage

**Databases:**
- None - Static content site
- Content stored as Markdown files in `content/` directory

**File Storage:**
- Cloudflare R2 - Pre-optimized image hosting
  - Client: `@aws-sdk/client-s3` (S3-compatible API)
  - Connection:
    - `R2_ACCOUNT_ID`
    - `R2_ACCESS_KEY_ID`
    - `R2_SECRET_ACCESS_KEY`
  - Bucket: `R2_IMAGES_BUCKET` (default: `americas-tapestry-images`)
  - Public URL: `R2_IMAGES_PUBLIC_URL`, `NEXT_PUBLIC_R2_IMAGES_URL`
  - Remote pattern: `images.americastapestry.com`
  - Implementation: `src/lib/cloudflare-loader.ts`
  - Manifest: `src/lib/image-manifest.json`

**Image Optimization Strategy:**
- Images pre-optimized to 3 sizes: 640px, 1024px, 1920px
- Custom Next.js image loader selects appropriate variant
- Eliminates Vercel image optimization costs
- Fallback to local `/images/` for non-migrated images

**Vercel Blob Storage:**
- Secondary storage (legacy or backup)
  - Remote pattern: `hebbkx1anhila5yf.public.blob.vercel-storage.com`

**Caching:**
- Middleware-based caching headers (`middleware.ts`)
- Content directory: `Cache-Control: public, max-age=86400`
- Video files: `Cache-Control: public, max-age=86400`

## Authentication & Identity

**Auth Provider:**
- None - Public website with no user authentication
- Contact/newsletter forms use server actions (no auth required)

**Keystatic CMS (Optional/Future):**
- GitHub OAuth for CMS access (documented in `.env.example`)
- Requires: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
- Status: Not currently implemented

## Monitoring & Observability

**Error Tracking:**
- None explicitly configured
- Console logging in server actions

**Logs:**
- `console.error()` for error logging in server actions
- `console.warn()` for non-critical warnings (missing manifest entries)

**Performance:**
- Web Vitals tracking via `web-vitals` 4.2.4
- Vercel Analytics for production metrics

## CI/CD & Deployment

**Hosting:**
- Vercel (`.vercel/` directory present)
- Configured via `vercel.json` (implicit)

**CI Pipeline:**
- No explicit CI configuration found
- Scripts available: `npm run lint`, `npm run typecheck`, `npm run test`

**Build Configuration:**
- `next.config.mjs` optimizations:
  - Custom image loader for R2
  - Output file tracing excludes for smaller bundles
  - Content rewrites for `/content/*` paths
  - Cache headers for content delivery

## Environment Configuration

**Required env vars:**
```
NEXT_PUBLIC_SITE_URL=https://americastapestry.com
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=<mapbox_token>
NEXT_PUBLIC_DEFAULT_MAPBOX_STYLE=mapbox://styles/mapbox/light-v11
RESEND_API_KEY=<resend_key>
MAILERLITE_API_KEY=<mailerlite_key>
R2_ACCOUNT_ID=<cloudflare_account_id>
R2_ACCESS_KEY_ID=<r2_access_key>
R2_SECRET_ACCESS_KEY=<r2_secret_key>
R2_IMAGES_BUCKET=americas-tapestry-images
R2_IMAGES_PUBLIC_URL=https://pub-xxxxx.r2.dev
NEXT_PUBLIC_R2_IMAGES_URL=https://pub-xxxxx.r2.dev
```

**Secrets location:**
- `.env.local` (local development, gitignored)
- Vercel environment variables (production)

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Content Sources

**Local Markdown Content:**
- Location: `content/` directory
- Types: `exhibitions`, `news`, `sponsors`, `tapestries`, `team`, `video`
- Parser: `gray-matter` for frontmatter, `remark` for markdown
- Core logic: `src/lib/content-core.ts`
- Type-specific readers:
  - `src/lib/tapestries.ts`
  - `src/lib/blog.ts`
  - `src/lib/exhibitions.ts`
  - `src/lib/team.ts`
  - `src/lib/sponsors.ts`

**Google Fonts:**
- Montserrat (sans-serif)
- EB Garamond (serif)
- Loaded via `next/font/google`

## Third-Party Assets

**Map Styles:**
- Mapbox Light v11 (default style)
- Custom styles configurable via env var

**CDN Resources:**
- fonts.googleapis.com
- fonts.gstatic.com

---

*Integration audit: 2026-01-17*
