#!/usr/bin/env node

/**
 * Verify that every image referenced by content resolves to something servable.
 *
 * Why this exists: images are served from Cloudflare R2 via src/lib/image-manifest.json.
 * The most common maintenance mistake is adding an image and referencing it without
 * running `node scripts/optimize-and-upload.mjs`, leaving it absent from the manifest.
 * The loader falls back to serving the original file from public/ when a path is not
 * in the manifest, so the real failure modes are:
 *
 *   BROKEN      — referenced, not in the manifest, AND no file in public/  -> 404 in prod
 *   UNOPTIMIZED — referenced, not in the manifest, but the file exists      -> works, bypasses R2
 *
 * BROKEN is a hard error (non-zero exit). UNOPTIMIZED is a warning.
 *
 * Scope: content/**\/*.md (markdown body + frontmatter). This is where occasional
 * hand edits happen; component image paths are covered by the build/typecheck.
 *
 * NOTE: the two body-image path rewrites below mirror src/lib/markdown.ts
 * (replaceImagePathsWithR2 pre-processing). Keep them in sync if that logic changes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'src', 'lib', 'image-manifest.json');

// Extensions the optimizer processes (so these MUST be in the manifest). SVGs and
// other types are served directly from public/ and are intentionally excluded.
const RASTER_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
// Directories excluded from optimization (mirrors CONFIG.excludeDirs in the uploader).
const EXCLUDED_PREFIXES = ['/images/placeholders/'];

// Mirrors the markdown.ts body-image rewrites (only applied to ![alt](...) syntax).
function rewriteBodyPath(p) {
  return p
    .replace(/^\/images\/news\/images\//, '/images/news/')
    .replace(/^\/images\/images\//, '/images/');
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestKeys = new Set(Object.keys(manifest));
  const files = walk(CONTENT_DIR);

  const bodyImgRe = /!\[[^\]]*\]\((\/images\/[^)\s]+?)\)/g;
  const anyRefRe = /\/images\/[A-Za-z0-9_\-./@%]+\.[A-Za-z0-9]+/g;

  // resolvedPath -> { referencedBy: Set<file> }
  const refs = new Map();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(PROJECT_ROOT, file);

    // Body images get the markdown.ts rewrites; everything else is checked as-is.
    const bodyOriginals = new Set();
    let m;
    while ((m = bodyImgRe.exec(text))) bodyOriginals.add(m[1]);

    while ((m = anyRefRe.exec(text))) {
      const raw = m[0];
      const resolved = bodyOriginals.has(raw) ? rewriteBodyPath(raw) : raw;
      if (!refs.has(resolved)) refs.set(resolved, new Set());
      refs.get(resolved).add(rel);
    }
  }

  const broken = [];
  const unoptimized = [];

  for (const [p, where] of refs) {
    const ext = path.extname(p).toLowerCase();
    if (!RASTER_EXT.includes(ext)) continue;
    if (EXCLUDED_PREFIXES.some(prefix => p.startsWith(prefix))) continue;
    if (manifestKeys.has(p)) continue; // served from R2 — good

    const onDisk = fs.existsSync(path.join(PUBLIC_DIR, p));
    (onDisk ? unoptimized : broken).push([p, [...where]]);
  }

  console.log(`🔍 Checked ${files.length} content files, ${refs.size} unique image references.\n`);

  if (unoptimized.length) {
    console.log(`⚠️  ${unoptimized.length} referenced image(s) not in the manifest (served unoptimized from public/ — run optimize-and-upload.mjs):`);
    for (const [p, where] of unoptimized) console.log(`   • ${p}\n       referenced by: ${where.join(', ')}`);
    console.log('');
  }

  if (broken.length) {
    console.error(`❌ ${broken.length} referenced image(s) are BROKEN — not in the manifest and no file in public/ (will 404 in production):`);
    for (const [p, where] of broken) console.error(`   • ${p}\n       referenced by: ${where.join(', ')}`);
    console.error('\n   Fix: add the file under public/images/ and run `node scripts/optimize-and-upload.mjs --path=<dir>`,');
    console.error('   or correct the reference in the content file(s) above.');
    process.exit(1);
  }

  console.log(`✅ No broken image references.${unoptimized.length ? ` (${unoptimized.length} unoptimized — see above)` : ''}`);
}

main();
