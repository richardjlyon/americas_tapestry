#!/usr/bin/env node

/**
 * Fail if any image a news post references is not served from R2.
 *
 * WHY THIS EXISTS
 *
 * src/lib/cloudflare-loader.ts (next/image) and src/lib/markdown.ts (body
 * images) both fall back SILENTLY to the origin path for any /images/... file
 * that is not in src/lib/image-manifest.json. A new image that is committed but
 * not uploaded is then served by Vercel, which is the bandwidth leak this repo
 * has already paid for (see memory.md, VERCEL_USAGE_INVESTIGATION.md).
 *
 * scripts/check-images.mjs only WARNS about that case ("UNOPTIMIZED"), because
 * it runs inside `npm run build`. This check is the strict one: every raster
 * image referenced by a news post must have a manifest entry with at least one
 * variant, or it exits 1. Run it before handing a news change over for deploy.
 *
 * WHAT IT READS (content/news/**\/*.md)
 *
 *   - frontmatter `image:` (resolved as convertImagePath() in content-core.ts)
 *   - frontmatter `src:` lines: `gallery:` and every named set in `galleries:`
 *   - body markdown images ![alt](/images/...) with the markdown.ts rewrites
 *   - body raw <img src="/images/..."> tags
 *
 * No dependencies, so it runs before `npm ci`.
 *
 * USAGE
 *
 *   npm run check:r2
 *   node scripts/check-r2-coverage.mjs --verbose   # list every reference
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_DIR = path.join(ROOT, 'content', 'news');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'image-manifest.json');

// Types the optimiser processes. SVGs etc. are served from public/ by design.
const RASTER_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
// Mirrors isLocalImage() in cloudflare-loader.ts and the uploader's excludeDirs.
const EXCLUDED_PREFIXES = ['/images/placeholders/'];

const verbose = process.argv.includes('--verbose');

// Mirrors the redundant-segment fixes in markdown.ts, blog.ts and the news page.
function tidy(p) {
  return p
    .replace(/^\/images\/news\/images\//, '/images/news/')
    .replace(/^\/images\/images\//, '/images/');
}

// Mirrors convertImagePath(image, 'news') in src/lib/content-core.ts.
function resolveFrontmatterImage(p) {
  if (!p) return null;
  if (p.startsWith('/images/')) return tidy(p);
  if (p.startsWith('/content/')) return tidy(p.replace('/content/', '/images/'));
  if (!p.startsWith('/') && !p.startsWith('http')) return tidy(`/images/news/${p}`);
  return null; // absolute non-/images/ path or external URL: not R2's job
}

function unquote(v) {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : { fm: '', body: text };
}

function referencesIn(text) {
  const { fm, body } = splitFrontmatter(text);
  const refs = [];

  const image = fm.match(/^image:\s*(.+)$/m);
  if (image) {
    const p = resolveFrontmatterImage(unquote(image[1]));
    if (p) refs.push({ path: p, where: 'image' });
  }

  // `src:` under gallery / galleries (any nesting depth).
  for (const m of fm.matchAll(/^\s*-?\s*src:\s*(.+)$/gm)) {
    const p = unquote(m[1]);
    if (p.startsWith('/images/')) refs.push({ path: tidy(p), where: 'gallery' });
  }

  for (const m of body.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    refs.push({ path: tidy(m[1]), where: 'body ![]()' });
  }
  for (const m of body.matchAll(/<img\s[^>]*src="(\/images\/[^"]+)"/g)) {
    refs.push({ path: tidy(m[1]), where: 'body <img>' });
  }
  return refs;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const files = walk(NEWS_DIR);

  const byPath = new Map(); // path -> [{ file, where }]
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    for (const r of referencesIn(fs.readFileSync(file, 'utf8'))) {
      const ext = path.extname(r.path).toLowerCase();
      if (!RASTER_EXT.includes(ext)) continue;
      if (EXCLUDED_PREFIXES.some((pre) => r.path.startsWith(pre))) continue;
      if (!byPath.has(r.path)) byPath.set(r.path, []);
      byPath.get(r.path).push({ file: rel, where: r.where });
    }
  }

  const missing = [];
  for (const [p, where] of byPath) {
    const entry = manifest[p];
    const ok = entry && entry.variants && Object.keys(entry.variants).length > 0;
    if (verbose) console.log(`${ok ? 'ok  ' : 'MISS'} ${p}`);
    if (!ok) missing.push([p, where]);
  }

  console.log(
    `Checked ${files.length} news posts, ${byPath.size} unique raster image references.`,
  );

  if (missing.length === 0) {
    console.log('✅ Every referenced news image has an R2 variant in image-manifest.json.');
    return;
  }

  console.error(
    `\n❌ ${missing.length} news image(s) are NOT in image-manifest.json. ` +
      'They would be served from the Vercel origin (bandwidth leak):',
  );
  for (const [p, where] of missing) {
    const onDisk = fs.existsSync(path.join(PUBLIC_DIR, p)) ? 'on disk' : 'NOT on disk (would 404)';
    const from = [...new Set(where.map((w) => `${w.file} [${w.where}]`))].join(', ');
    console.error(`   • ${p}  (${onDisk})\n       referenced by: ${from}`);
  }
  console.error(
    '\n   Fix: node scripts/optimize-and-upload.mjs --path=<dir under public/images>,\n' +
      '   commit the manifest change, then re-run `npm run check:r2`.',
  );
  process.exit(1);
}

main();
