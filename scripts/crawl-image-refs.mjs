#!/usr/bin/env node

/**
 * Crawl a locally-served production build and record every /images/... origin
 * path the RENDERED pages actually request. Feeds --refs of
 * scripts/generate-vercelignore.mjs, which refuses to run on any set that was
 * derived by static analysis instead of measurement (see its header).
 *
 *   npm run build && npm run start   # in another shell
 *   node scripts/crawl-image-refs.mjs > /tmp/rendered-image-refs.txt
 */

const BASE = process.env.CRAWL_BASE || 'http://localhost:3000';

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace(/^https?:\/\/[^/]+/, BASE),
);

// Unlisted pages are absent from the sitemap by design but still render images.
const extra = ['/festival-info'].map((p) => BASE + p);
const all = [...new Set([...urls, ...extra])];

const refs = new Set();
let done = 0;

async function crawl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    // Only paths the BROWSER will actually fetch: src, srcSet, href, poster,
    // content, and CSS url(). A bare /images/... string elsewhere in the
    // markup is the RSC flight payload echoing a component prop — next/image
    // rewrites those to R2 before the browser sees them, so counting them
    // would wrongly keep the original deployed on Vercel.
    const attrs =
      /(?:src|srcSet|srcset|href|poster|content)="([^"]+)"|url\((['"]?)([^)'"]+)\2\)/g;
    for (const m of html.matchAll(attrs)) {
      const value = m[1] ?? m[3] ?? '';
      for (const p of value.split(/[\s,]+/)) {
        if (p.startsWith('/images/')) refs.add(decodeURIComponent(p));
      }
    }
  } catch (err) {
    process.stderr.write(`FAILED ${url}: ${err.message}\n`);
  }
  done += 1;
  if (done % 25 === 0) process.stderr.write(`  ${done}/${all.length}\n`);
}

const CONCURRENCY = 8;
const queue = [...all];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await crawl(queue.shift());
  }),
);

process.stderr.write(
  `Crawled ${all.length} pages, found ${refs.size} distinct /images/ paths\n`,
);
for (const r of [...refs].sort()) console.log(r);
