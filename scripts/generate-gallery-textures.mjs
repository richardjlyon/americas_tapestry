#!/usr/bin/env node

/**
 * Generate 3D-gallery texture variants from the fine-art tapestry photographs.
 *
 * Reads  public/images/shop/prints/<slug>/<slug>-fineart.jpg  (2400x3000)
 * Writes public/images/tapestries/<slug>/<slug>-fineart-gallery-<size>w.webp
 * with the LONG edge resized to 1920 / 1024 / 640 px, quality 80.
 *
 * LOCAL ONLY — no R2 upload (textures are fetched same-origin by the
 * virtual gallery's WebGL loader). Companion to optimize-and-upload.mjs.
 *
 * Usage:
 *   node scripts/generate-gallery-textures.mjs [--force]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const SLUGS = [
  'connecticut',
  'delaware',
  'georgia',
  'maryland',
  'massachusetts',
  'new-hampshire',
  'new-jersey',
  'new-york',
  'north-carolina',
  'pennsylvania',
  'rhode-island',
  'south-carolina',
  'virginia',
];

// Long-edge sizes to generate (px)
const SIZES = [1920, 1024, 640];
const QUALITY = 80;

const force = process.argv.includes('--force');

async function main() {
  let generated = 0;
  let skipped = 0;

  for (const slug of SLUGS) {
    const source = path.join(
      PROJECT_ROOT,
      'public/images/shop/prints',
      slug,
      `${slug}-fineart.jpg`,
    );
    const outDir = path.join(PROJECT_ROOT, 'public/images/tapestries', slug);

    try {
      await fs.access(source);
    } catch {
      console.error(`✗ ${slug}: missing source ${source}`);
      process.exitCode = 1;
      continue;
    }
    await fs.mkdir(outDir, { recursive: true });

    for (const size of SIZES) {
      const outFile = path.join(
        outDir,
        `${slug}-fineart-gallery-${size}w.webp`,
      );
      if (!force) {
        try {
          await fs.access(outFile);
          skipped++;
          continue;
        } catch {
          // doesn't exist yet — generate
        }
      }
      await sharp(source)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outFile);
      const { size: bytes } = await fs.stat(outFile);
      console.log(
        `✓ ${path.relative(PROJECT_ROOT, outFile)} (${(bytes / 1024).toFixed(0)} KB)`,
      );
      generated++;
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
