#!/usr/bin/env node

/**
 * Build gate: fail if any image the site can serve would come from the Vercel
 * origin instead of R2.
 *
 * WHY THIS EXISTS
 *
 * src/lib/cloudflare-loader.ts (next/image) and src/lib/markdown.ts (body
 * images) both fall back SILENTLY to the origin path for any /images/... file
 * that is not in src/lib/image-manifest.json. A new image that is committed but
 * not uploaded is then served by Vercel, which is the bandwidth leak this repo
 * has already paid for (see memory.md, VERCEL_USAGE_INVESTIGATION.md).
 *
 * The runtime fallback stays, on purpose: a gap must never break the live page.
 * This script is the guard instead. It runs as `prebuild` (static layers) and
 * `postbuild` (rendered layer), so `npm run build` — locally and on Vercel —
 * fails on a new uncovered image.
 *
 * THREE LAYERS (all raster: jpg jpeg png webp gif avif)
 *
 *   1. disk      Every raster file under public/images/ has an R2 manifest
 *                entry. Catches "committed but not uploaded" however the file
 *                is referenced, including paths built at render time.
 *   2. content   Every raster /images/ path referenced by content/**\/*.md and
 *                by complete literals in src/ is in the manifest. Resolves the
 *                known slug-built conventions (news, exhibitions, sponsors,
 *                team portraits). Catches a reference to a file that is absent.
 *   3. rendered  (--rendered, after `next build`) Every /images/ raster path
 *                that the prerendered HTML in .next/server/app asks the browser
 *                to fetch from the origin is in the manifest. This is measured,
 *                not reasoned: it sees the slug-built paths static analysis
 *                cannot (memory.md, 2026-09-01). Only fetchable attributes are
 *                read (src, srcset, href, poster, content, CSS url()), as in
 *                scripts/crawl-image-refs.mjs.
 *   4. deploy    (--rendered) .vercelignore excludes every R2 original under
 *                public/images, except files a rendered page requests at their
 *                origin path, which must be named with a reason in
 *                scripts/vercel-deploy-keep.json. See deployLayer() below.
 *
 * KNOWN GAPS live in scripts/r2-coverage-allowlist.json, one entry per path,
 * each with a reason. An allowlisted path never fails the build. An entry whose
 * path is now in the manifest is reported as stale. /images/placeholders/ is
 * excluded by design (the loader passes it through).
 *
 * No dependencies, so it runs before `npm ci`.
 *
 * USAGE
 *
 *   npm run check:r2                                   # layers 1 + 2
 *   node scripts/check-r2-coverage.mjs --rendered      # layer 3 (needs .next)
 *   node scripts/check-r2-coverage.mjs --verbose
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isIgnored, loadIgnore } from './vercelignore.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BUILD_HTML_DIR = path.join(ROOT, '.next', 'server', 'app');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'image-manifest.json');
const ALLOWLIST_PATH = path.join(ROOT, 'scripts', 'r2-coverage-allowlist.json');
const KEEP_PATH = path.join(ROOT, 'scripts', 'vercel-deploy-keep.json');
const IGNORE_PATH = path.join(ROOT, '.vercelignore');

const RASTER_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
// Mirrors isLocalImage() in cloudflare-loader.ts and the uploader's excludeDirs.
const EXCLUDED_PREFIXES = ['/images/placeholders/'];

const verbose = process.argv.includes('--verbose');
const rendered = process.argv.includes('--rendered');

// ---------------------------------------------------------------- helpers

function walk(dir, filter, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, filter, acc);
    else if (filter(e.name)) acc.push(full);
  }
  return acc;
}

const isRaster = (p) => RASTER_EXT.includes(path.extname(p).toLowerCase());
const isExcluded = (p) => EXCLUDED_PREFIXES.some((pre) => p.startsWith(pre));

// Mirrors the redundant-segment fixes in markdown.ts, blog.ts and the news page.
function tidy(p) {
  return p
    .replace(/^\/images\/news\/images\//, '/images/news/')
    .replace(/^\/images\/images\//, '/images/');
}

// Mirrors convertImagePath(image, contentType) in src/lib/content-core.ts.
function convertImagePath(p, contentType) {
  if (!p) return null;
  if (p.startsWith('/images/')) return tidy(p);
  if (p.startsWith('/content/')) return tidy(p.replace('/content/', '/images/'));
  if (!p.startsWith('/') && !p.startsWith('http')) {
    return tidy(contentType ? `/images/${contentType}/${p}` : `/images/${p}`);
  }
  return null; // absolute non-/images/ path or external URL: not R2's job
}

function unquote(v) {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : { fm: '', body: text };
}

function fmScalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? unquote(m[1]) : null;
}

// ---------------------------------------------------------------- layer 2

// content/<collection>/.../<slug>/index.md or .../<slug>.md
function slugOf(file) {
  const base = path.basename(file, '.md');
  return base === 'index' ? path.basename(path.dirname(file)) : base;
}

function contentReferences(file) {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep);
  const collection = rel[0];
  const { fm, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  const slug = slugOf(file);
  const refs = [];
  const add = (p, where) => p && refs.push({ path: p, where });

  const image = fmScalar(fm, 'image');

  if (collection === 'news') {
    if (image) add(convertImagePath(image, 'news'), 'image');
  } else if (collection === 'exhibitions') {
    // exhibitions.ts mapExhibition
    if (image) add(image.startsWith('/') ? tidy(image) : `/images/exhibitions/${image}`, 'image');
    for (const m of fm.matchAll(/^\s*-\s*image:\s*(.+)$/gm)) {
      add(`/images/exhibitions/${slug}/${unquote(m[1])}`, 'gallery');
    }
  } else if (collection === 'sponsors') {
    // sponsors.ts mapSponsor: /images/sponsors/{slug}-logo.png unless logo: none
    if (fm && fmScalar(fm, 'logo') !== 'none') {
      add(`/images/sponsors/${slug}-logo.png`, 'logo (slug convention)');
    }
  } else if (collection === 'team') {
    // portrait: filename under /images/team/<group>/
    const portrait = fmScalar(fm, 'portrait');
    if (portrait && rel.length >= 3) {
      add(portrait.startsWith('/') ? tidy(portrait) : `/images/team/${rel[1]}/${portrait}`, 'portrait');
    }
    if (image) add(convertImagePath(image, `team/${rel[1]}`), 'image');
  } else if (image) {
    add(convertImagePath(image, collection), 'image');
  }

  // Any explicit /images/ value in frontmatter (src:, gallery, galleries, ...).
  for (const m of fm.matchAll(/:\s*["']?(\/images\/[^\s"']+)["']?\s*$/gm)) {
    add(tidy(m[1]), 'frontmatter');
  }
  for (const m of body.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    add(tidy(m[1]), 'body ![]()');
  }
  for (const m of body.matchAll(/<img\s[^>]*src="(\/images\/[^"]+)"/g)) {
    add(tidy(m[1]), 'body <img>');
  }
  return refs;
}

function srcReferences(file) {
  const text = fs.readFileSync(file, 'utf8');
  const refs = [];
  // Complete literals only; template strings with ${...} are slug-built and
  // are covered by layers 1 and 3.
  for (const m of text.matchAll(/["'`](\/images\/[^"'`$\s]+)["'`]/g)) {
    refs.push({ path: m[1], where: 'src literal' });
  }
  return refs;
}

// ---------------------------------------------------------------- layer 3

function renderedReferences() {
  if (!fs.existsSync(BUILD_HTML_DIR)) {
    console.error(`❌ --rendered: ${path.relative(ROOT, BUILD_HTML_DIR)} not found. Run next build first.`);
    process.exit(2);
  }
  const files = walk(BUILD_HTML_DIR, (n) => n.endsWith('.html'));
  if (files.length === 0) {
    console.error('❌ --rendered: no prerendered HTML found. Refusing to pass on no evidence.');
    process.exit(2);
  }
  const attrs = /(?:src|srcSet|srcset|href|poster|content)="([^"]+)"|url\((['"]?)([^)'"]+)\2\)/g;
  const refs = [];
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const page = path.relative(BUILD_HTML_DIR, file);
    for (const m of html.matchAll(attrs)) {
      const value = (m[1] ?? m[3] ?? '').replace(/&amp;/g, '&');
      for (const raw of value.split(/[\s,]+/)) {
        // Origin paths, relative or absolute to our own domain.
        const p = raw.replace(/^https?:\/\/(www\.)?americastapestry\.com(?=\/images\/)/, '');
        if (!p.startsWith('/images/')) continue;
        let clean = p.split(/[?#]/)[0];
        try { clean = decodeURIComponent(clean); } catch { /* keep raw */ }
        refs.push({ path: clean, where: page });
      }
    }
  }
  return { refs, pages: files.length };
}

// ---------------------------------------------------------------- layer 4

/**
 * deploy  (--rendered only) .vercelignore must exclude every original under
 *         public/images that R2 serves, so Vercel never holds a second copy
 *         that bots can fetch (190 GB in July 2026). The one exception is a
 *         file a rendered page requests at its ORIGIN path: excluding it would
 *         404 the page, so it must stay deployed and be named, with a reason,
 *         in scripts/vercel-deploy-keep.json.
 *
 *         "Requested at origin" is the rendered layer's measurement above,
 *         from every prerendered page, so slug-built paths are seen. Three
 *         rules, each a build failure:
 *           a. a manifested file that would deploy is not on the keep list
 *              (a missing or broken .vercelignore line, or a new original);
 *           b. a keep-list entry no rendered page requests at origin, or that
 *              is not a manifested file on disk (stale: exclude it instead);
 *           c. a file a rendered page requests at origin is excluded by
 *              .vercelignore (it would 404 in production).
 *
 *         Deployed = on disk and not matched by .vercelignore. On Vercel the
 *         excluded files are already absent, so the answer is the same there.
 */
function deployLayer(manifest, renderedByPath, failures) {
  const rules = loadIgnore(IGNORE_PATH);
  if (rules.length === 0) {
    failures.push(['deploy', '.vercelignore', 'missing or empty: every R2 original would deploy']);
    return;
  }
  const keep = loadKeepList();
  const has = (p) => Boolean(manifest[p]);
  const relOf = (web) => `public${web}`;

  let manifestedOnDisk = 0;
  let deployedFiles = 0;
  let deployedBytes = 0;
  for (const f of walk(path.join(PUBLIC_DIR, 'images'), () => true)) {
    const web = '/' + path.relative(PUBLIC_DIR, f).split(path.sep).join('/');
    const ignored = isIgnored(rules, relOf(web));
    if (!ignored) { deployedFiles += 1; deployedBytes += fs.statSync(f).size; }
    if (!has(web)) continue;
    manifestedOnDisk += 1;
    if (!ignored && !keep.has(web)) {
      failures.push([
        'deploy', web,
        renderedByPath.has(web)
          ? 'R2 original would deploy. A rendered page requests it at origin, so add it with a reason to scripts/vercel-deploy-keep.json'
          : 'R2 original would deploy and no rendered page requests it at origin: add it to .vercelignore (scripts/generate-vercelignore.mjs)',
      ]);
    }
  }

  for (const [p] of keep) {
    if (!has(p) || !fs.existsSync(path.join(PUBLIC_DIR, p))) {
      failures.push(['deploy', p, 'keep-list entry is not a manifested file on disk: remove it from scripts/vercel-deploy-keep.json']);
    } else if (!renderedByPath.has(p)) {
      failures.push(['deploy', p, 'keep-list entry is not requested at origin by any rendered page: remove it from scripts/vercel-deploy-keep.json and exclude it']);
    }
  }

  for (const [p, where] of renderedByPath) {
    if (fs.existsSync(path.join(PUBLIC_DIR, p)) && isIgnored(rules, relOf(p))) {
      failures.push(['deploy', p, `excluded by .vercelignore but requested at origin (would 404): ${[...new Set(where)].slice(0, 3).join(', ')}`]);
    }
  }

  console.log(
    `Deploy: ${manifestedOnDisk} R2 originals on disk, ${keep.size} kept deployed on purpose ` +
      `(${path.relative(ROOT, KEEP_PATH)}). public/images would deploy ${deployedFiles} files, ` +
      `${(deployedBytes / 1e6).toFixed(1)} MB.`,
  );
}

// ---------------------------------------------------------------- main

function loadKeepList() {
  if (!fs.existsSync(KEEP_PATH)) return new Map();
  const list = JSON.parse(fs.readFileSync(KEEP_PATH, 'utf8'));
  const map = new Map();
  for (const e of list.entries ?? []) {
    if (!e.path || !e.reason || !String(e.reason).trim()) {
      console.error(`❌ Keep-list entry without a path and a reason: ${JSON.stringify(e)}`);
      process.exit(2);
    }
    map.set(e.path, e.reason);
  }
  return map;
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return new Map();
  const list = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  const map = new Map();
  for (const e of list.entries ?? []) {
    if (!e.path || !e.reason || !String(e.reason).trim()) {
      console.error(`❌ Allowlist entry without a path and a reason: ${JSON.stringify(e)}`);
      process.exit(2);
    }
    map.set(e.path, e.reason);
  }
  return map;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const inManifest = (p) => {
    const e = manifest[p];
    return Boolean(e && e.variants && Object.keys(e.variants).length > 0);
  };
  const allow = loadAllowlist();
  const used = new Set();

  const failures = []; // [layer, path, detail]
  const check = (layer, byPath) => {
    let n = 0;
    for (const [p, where] of byPath) {
      if (!isRaster(p) || isExcluded(p)) continue;
      n += 1;
      const ok = inManifest(p);
      if (verbose) console.log(`${ok ? 'ok   ' : allow.has(p) ? 'ALLOW' : 'MISS '} [${layer}] ${p}`);
      if (ok) continue;
      if (allow.has(p)) { used.add(p); continue; }
      failures.push([layer, p, [...new Set(where)].slice(0, 4).join(', ')]);
    }
    return n;
  };
  const group = (refs) => {
    const m = new Map();
    for (const r of refs) {
      if (!m.has(r.path)) m.set(r.path, []);
      m.get(r.path).push(r.where);
    }
    return m;
  };

  if (rendered) {
    const { refs, pages } = renderedReferences();
    const byPath = group(refs);
    const n = check('rendered', byPath);
    console.log(`Rendered: ${pages} prerendered pages, ${n} distinct origin /images/ raster requests.`);
    deployLayer(manifest, byPath, failures);
  } else {
    // Layer 1: disk
    const disk = walk(path.join(PUBLIC_DIR, 'images'), isRaster).map(
      (f) => ['/' + path.relative(PUBLIC_DIR, f).split(path.sep).join('/'), ['public/']],
    );
    const nDisk = check('disk', new Map(disk));

    // Layer 2: content + src
    const refs = [];
    for (const f of walk(CONTENT_DIR, (n) => n.endsWith('.md'))) {
      const rel = path.relative(ROOT, f);
      for (const r of contentReferences(f)) refs.push({ path: r.path, where: `${rel} [${r.where}]` });
    }
    // Test fixtures name made-up paths on purpose; they are never served.
    const srcFiles = walk(SRC_DIR, (n) => /\.(t|j)sx?$/.test(n) && !/\.(test|spec)\./.test(n))
      .filter((f) => !f.split(path.sep).includes('__tests__'));
    for (const f of srcFiles) {
      const rel = path.relative(ROOT, f);
      for (const r of srcReferences(f)) refs.push({ path: r.path, where: `${rel} [${r.where}]` });
    }
    const nRefs = check('content', group(refs));
    console.log(`Disk: ${nDisk} raster files under public/images. Content + src: ${nRefs} distinct raster references.`);

    // Stale entries are judged by the static run only.
    for (const p of allow.keys()) {
      if (inManifest(p)) console.warn(`⚠️  Allowlisted but now in the manifest (remove the entry): ${p}`);
    }
  }
  console.log(`Allowlist: ${allow.size} entries (${path.relative(ROOT, ALLOWLIST_PATH)}), ${used.size} matched in this run.`);

  if (failures.length === 0) {
    console.log(`✅ R2 coverage (${rendered ? 'rendered + deploy' : 'disk + content'}): nothing would be served from the Vercel origin.`);
    return;
  }

  const coverage = failures.filter(([layer]) => layer !== 'deploy');
  const deploy = failures.filter(([layer]) => layer === 'deploy');

  if (coverage.length > 0) {
    console.error(
      `\n❌ ${coverage.length} image path(s) are NOT in image-manifest.json and not allowlisted.\n` +
        '   They would be served from the Vercel origin (bandwidth leak) or 404:',
    );
    for (const [layer, p, where] of coverage) {
      const onDisk = fs.existsSync(path.join(PUBLIC_DIR, p)) ? 'on disk' : 'NOT on disk (404)';
      console.error(`   • [${layer}] ${p}  (${onDisk})\n       ${where}`);
    }
    console.error(
      '\n   Fix: node scripts/optimize-and-upload.mjs --path=<dir under public/images>,\n' +
        '   commit the manifest change, then re-run. Only if the gap is deliberate, add\n' +
        `   the path with a reason to ${path.relative(ROOT, ALLOWLIST_PATH)}.`,
    );
  }

  if (deploy.length > 0) {
    console.error(
      `\n❌ ${deploy.length} problem(s) with what Vercel would deploy from public/images (.vercelignore):`,
    );
    for (const [, p, why] of deploy) console.error(`   • [deploy] ${p}\n       ${why}`);
    console.error(
      '\n   Fix: build, serve, crawl (scripts/crawl-image-refs.mjs) and regenerate the block with\n' +
        '   scripts/generate-vercelignore.mjs. A file that must stay deployed goes, with a reason,\n' +
        `   in ${path.relative(ROOT, KEEP_PATH)}.`,
    );
  }
  process.exit(1);
}

main();
