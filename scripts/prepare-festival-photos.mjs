#!/usr/bin/env node

/**
 * One-off: downscale the Budapest festival masters into public/images/.
 *
 * The originals are ~40MB Leica JPEGs on the shared drive. They must never be
 * committed: public/ is deployed to Vercel, and raw originals at stable origin
 * URLs are exactly what blew the free-tier transfer cap in July 2026 (see
 * VERCEL_USAGE_INVESTIGATION.md). Even with .vercelignore, keeping 700MB in git
 * is pointless — the site never serves anything larger than 1920px.
 *
 * Writes 2000px-wide JPEGs (quality 82, EXIF stripped), which is the input the
 * R2 optimizer expects. Run scripts/optimize-and-upload.mjs afterwards.
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SRC = '/Users/rjl/Resilio/shared-drive/budapest-photos/website images';
const DEST = path.join(process.cwd(), 'public/images/news/2026-09/festival');

fs.mkdirSync(DEST, { recursive: true });

const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

let n = 0;
for (const file of files) {
  n += 1;
  const out = path.join(DEST, `festival-${String(n).padStart(2, '0')}.jpg`);
  const meta = await sharp(path.join(SRC, file)).metadata();
  await sharp(path.join(SRC, file))
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const before = fs.statSync(path.join(SRC, file)).size;
  const after = fs.statSync(out).size;
  console.log(
    `${file} (${meta.width}x${meta.height}, ${(before / 1e6).toFixed(1)}MB)` +
      ` -> ${path.basename(out)} (${(after / 1e6).toFixed(2)}MB)`,
  );
}
console.log(`\n${n} files written to ${path.relative(process.cwd(), DEST)}`);
