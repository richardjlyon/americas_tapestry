# Adding New Images

Images are hosted on Cloudflare R2 and pre-optimized to WebP format at multiple sizes. This eliminates Vercel's image optimization costs.

## Quick Start

```bash
# 1. Add image to public/images/
cp my-photo.jpg public/images/news/2025-12/my-photo.jpg

# 2. Optimize and upload to R2
node scripts/optimize-and-upload.mjs --path=news/2025-12/my-photo.jpg

# 3. Commit the updated manifest
git add src/lib/image-manifest.json public/images/news/2025-12/
git commit -m "feat: add new images"
git push
```

## Step-by-Step Guide

### 1. Add the Image

Place your image in the appropriate subdirectory under `public/images/`:

```
public/images/
├── branding/        # Logos, brand assets
├── carousel/        # Homepage carousel
├── news/            # News article images
│   └── 2025-12/     # Organized by month
├── sponsors/        # Sponsor logos
├── tapestries/      # Tapestry photos
├── team/            # Team member photos
│   ├── illustrators/
│   ├── state-directors/
│   ├── stitchers/
│   └── stitching-groups/
└── exhibitions/     # Exhibition venue images
```

### 2. Run the Optimization Script

The script converts images to WebP at 3 sizes (640px, 1024px, 1920px) and uploads to R2:

```bash
# Single image
node scripts/optimize-and-upload.mjs --path=news/2025-12/my-photo.jpg

# Entire directory
node scripts/optimize-and-upload.mjs --path=news/2025-12

# Preview only — makes no changes (no upload, no manifest write)
node scripts/optimize-and-upload.mjs --path=news/2025-12 --dry-run
```

### 3. Use the Image

**In Markdown (news articles, content):**
```markdown
![Photo description](/images/news/2025-12/my-photo.jpg)
```

**In React/Next.js components:**
```tsx
import Image from 'next/image';

<Image
  src="/images/news/2025-12/my-photo.jpg"
  alt="Photo description"
  width={800}
  height={600}
/>
```

Both methods automatically serve the optimized R2 version.

### 4. Commit Changes

```bash
git add src/lib/image-manifest.json public/images/
git commit -m "feat: add new images for [description]"
git push
```

## Command Reference

| Command | Description |
|---------|-------------|
| `node scripts/optimize-and-upload.mjs` | Process all images |
| `--path=<path>` | Process specific file or directory |
| `--dry-run` | Preview only — no upload and no manifest write (safe no-op) |
| `--force` | Re-process even if already uploaded |
| `--skip-upload` | Optimize locally only |

## How It Works

1. **Optimization**: Images are converted to WebP format at 3 breakpoints (640, 1024, 1920px width) using `sharp`
2. **Upload**: Optimized variants are uploaded to Cloudflare R2 with 1-year cache headers
3. **Manifest**: `src/lib/image-manifest.json` maps original paths to R2 URLs
4. **Serving**:
   - Next.js `Image` component uses a custom loader (`src/lib/cloudflare-loader.ts`)
   - Markdown images are replaced during HTML conversion (`src/lib/markdown.ts`)

## Troubleshooting

### "Image not in manifest" warning
The image hasn't been processed. Run the optimization script:
```bash
node scripts/optimize-and-upload.mjs --path=path/to/image.jpg
```

### Verifying references before deploy
`npm run check:images` scans all content and reports any image reference that
would 404 (not in the manifest **and** missing from `public/`). It runs
automatically as part of `npm run build`, so a broken reference fails the build
rather than shipping silently. Images that exist in `public/` but aren't in the
manifest are reported as warnings (they serve unoptimized — run the upload script).

### Images not updating after re-upload
Use the `--force` flag to regenerate:
```bash
node scripts/optimize-and-upload.mjs --path=path/to/image.jpg --force
```

### R2 credentials error
Ensure `.env.local` contains:
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_IMAGES_BUCKET=americas-tapestry-images
R2_IMAGES_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## File Locations

| File | Purpose |
|------|---------|
| `scripts/optimize-and-upload.mjs` | Optimization and upload script |
| `src/lib/image-manifest.json` | Path-to-URL mappings (auto-generated) |
| `src/lib/cloudflare-loader.ts` | Next.js Image custom loader |
| `src/lib/markdown.ts` | Markdown image replacement |
