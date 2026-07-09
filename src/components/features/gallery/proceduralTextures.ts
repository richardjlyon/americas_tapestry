/**
 * Canvas-generated textures for the virtual gallery: the pale-ash plank
 * floor, wrapped/justified wall-text panels drawn with EB Garamond
 * (FontFace API, Georgia serif fallback), and rasterised SVG quads
 * (spool logo / watermark).
 *
 * All textures are cached in a module-level Map; call
 * disposeProceduralTextures() to release GPU memory.
 */

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

/** Text panels are rasterised at ~256 px per foot (clamped to 2048 px). */
const PX_PER_FT = 256;
/** Approximate cap-height / font-size ratio for EB Garamond. */
const CAP_RATIO = 0.7;
const FONT_FAMILY = '"EB Garamond Gallery", Georgia, serif';

/** One floor-texture tile covers this many feet (used for repeat maths). */
export const FLOOR_TILE_FT = 12;

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const textureCache = new Map<string, CanvasTexture>();
const pendingCache = new Map<string, Promise<CanvasTexture>>();

/** Dispose every cached texture and clear the caches. */
export function disposeProceduralTextures(): void {
  for (const texture of textureCache.values()) {
    texture.dispose();
  }
  textureCache.clear();
  pendingCache.clear();
}

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

let fontLoad: Promise<void> | null = null;

/**
 * Register EB Garamond (400 + 600) under 'EB Garamond Gallery' via the
 * FontFace API. Resolves even on failure — canvas falls back to Georgia.
 */
function loadGalleryFont(): Promise<void> {
  if (!fontLoad) {
    const faces: Array<[string, string]> = [
      ['400', '/fonts/eb-garamond-400.woff'],
      ['600', '/fonts/eb-garamond-600.woff'],
    ];
    fontLoad = Promise.all(
      faces.map(async ([weight, url]) => {
        const face = new FontFace('EB Garamond Gallery', `url(${url})`, {
          weight,
        });
        await face.load();
        document.fonts.add(face);
      }),
    )
      .then(() => undefined)
      .catch(() => undefined);
  }
  return fontLoad;
}

// ---------------------------------------------------------------------------
// Wood floor
// ---------------------------------------------------------------------------

/** Deterministic PRNG so the floor is identical every mount. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const a = Number.parseInt(hexA.slice(1), 16);
  const b = Number.parseInt(hexB.slice(1), 16);
  const channel = (shift: number): number => {
    const ca = (a >> shift) & 0xff;
    const cb = (b >> shift) & 0xff;
    return Math.round(ca + (cb - ca) * t);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/**
 * Procedural pale-ash plank floor: planks run E-W (along canvas x),
 * 0.6 ft wide and 6-8 ft long, with per-plank lightness jitter, subtle
 * grain streaks, and 1 px seams. Tiles seamlessly; one tile covers
 * FLOOR_TILE_FT feet. RepeatWrapping + SRGBColorSpace are pre-set;
 * the caller sets `repeat` for its plane.
 */
export function makeWoodFloorTexture(): CanvasTexture {
  const key = 'wood-floor';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(0xa11ce5);

  if (ctx) {
    const pxPerFt = size / FLOOR_TILE_FT;
    const plankH = 0.6 * pxPerFt;
    const rows = Math.round(size / plankH);

    ctx.fillStyle = '#DCCFB6';
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < rows; row++) {
      const y0 = row * plankH;

      // Plank-end boundaries within this row. The first and last segments
      // share a colour and get no edge seam, so the tile wraps seamlessly.
      const bounds: number[] = [];
      let bx = (0.5 + rand() * 6.5) * pxPerFt;
      while (bx < size - 4) {
        bounds.push(bx);
        bx += (6 + rand() * 2) * pxPerFt;
      }
      const edges = [0, ...bounds, size];
      const wrapColor = mixHex('#CBBD9F', '#E7DCC6', rand());

      for (let s = 0; s < edges.length - 1; s++) {
        const x0 = edges[s] ?? 0;
        const x1 = edges[s + 1] ?? size;
        const isWrapSegment = s === 0 || s === edges.length - 2;
        ctx.fillStyle = isWrapSegment
          ? wrapColor
          : mixHex('#CBBD9F', '#E7DCC6', rand());
        ctx.fillRect(x0, y0, x1 - x0, plankH);

        // Subtle grain streaks along the plank
        const streaks = 4 + Math.floor(rand() * 5);
        for (let g = 0; g < streaks; g++) {
          const gx = x0 + rand() * (x1 - x0);
          const gw = (0.6 + rand() * 2.0) * pxPerFt;
          const gy = y0 + 2 + rand() * (plankH - 4);
          ctx.strokeStyle =
            rand() < 0.5
              ? 'rgba(122, 98, 62, 0.07)'
              : 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(Math.min(gx + gw, x1), gy);
          ctx.stroke();
        }
      }

      // 1 px seams: row line plus plank-end lines
      ctx.fillStyle = 'rgba(84, 68, 44, 0.22)';
      ctx.fillRect(0, Math.round(y0), size, 1);
      for (const b of bounds) {
        ctx.fillRect(Math.round(b), y0, 1, plankH);
      }
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  textureCache.set(key, texture);
  return texture;
}

// ---------------------------------------------------------------------------
// Text panels
// ---------------------------------------------------------------------------

export interface TextPanelOptions {
  /** Optional letterspaced-caps heading above the body */
  title?: string | undefined;
  /** Body paragraphs to wrap and draw */
  paragraphs: string[];
  /** Panel size in feet — sets the texture resolution (~256 px/ft) */
  widthFt: number;
  heightFt: number;
  /** CSS colour for the type */
  color: string;
  /** Transparent background unless given */
  bg?: string | undefined;
  align?: 'left' | 'center' | 'justify' | undefined;
  /** Heading cap height in feet (default 0.09) */
  titleCapFt?: number | undefined;
  /** Body cap height in feet (default 0.05) */
  bodyCapFt?: number | undefined;
  /** Synthetic-oblique body text */
  italic?: boolean | undefined;
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[][] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    if (
      current.length > 0 &&
      ctx.measureText([...current, word].join(' ')).width > maxWidth
    ) {
      lines.push(current);
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function drawLetterspaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' | 'justify',
  leftX: number,
): void {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + spacing * (chars.length - 1);
  let x = align === 'center' ? centerX - total / 2 : leftX;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i] ?? '', x, y);
    x += (widths[i] ?? 0) + spacing;
  }
}

function drawBodyLine(
  ctx: CanvasRenderingContext2D,
  words: string[],
  leftX: number,
  centerX: number,
  y: number,
  innerWidth: number,
  align: 'left' | 'center' | 'justify',
  isLast: boolean,
): void {
  if (align === 'center') {
    const prev = ctx.textAlign;
    ctx.textAlign = 'center';
    ctx.fillText(words.join(' '), centerX, y);
    ctx.textAlign = prev;
    return;
  }
  if (align === 'left' || isLast || words.length < 2) {
    ctx.fillText(words.join(' '), leftX, y);
    return;
  }
  // Justify: distribute the leftover space between words
  const wordsWidth = words.reduce(
    (sum, word) => sum + ctx.measureText(word).width,
    0,
  );
  const gap = (innerWidth - wordsWidth) / (words.length - 1);
  let x = leftX;
  for (const word of words) {
    ctx.fillText(word, x, y);
    x += ctx.measureText(word).width + gap;
  }
}

function drawTextPanel(options: TextPanelOptions): CanvasTexture {
  // Uniform px/ft, clamped so neither canvas axis exceeds 2048 px
  const ppf = Math.min(
    PX_PER_FT,
    2048 / options.widthFt,
    2048 / options.heightFt,
  );
  const width = Math.max(8, Math.round(options.widthFt * ppf));
  const height = Math.max(8, Math.round(options.heightFt * ppf));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    if (options.bg) {
      ctx.fillStyle = options.bg;
      ctx.fillRect(0, 0, width, height);
    }

    const align = options.align ?? 'justify';
    const padX = Math.max(4, width * 0.03);
    const innerWidth = width - padX * 2;
    const baseTitlePx = ((options.titleCapFt ?? 0.09) / CAP_RATIO) * ppf;
    const baseBodyPx = ((options.bodyCapFt ?? 0.05) / CAP_RATIO) * ppf;
    const bodyFont = (px: number): string =>
      `${options.italic ? 'italic ' : ''}400 ${px}px ${FONT_FAMILY}`;
    const titleFont = (px: number): string => `600 ${px}px ${FONT_FAMILY}`;

    // Measure at a given scale; returns total block height in px
    const measure = (scale: number): number => {
      const bodyPx = baseBodyPx * scale;
      const titlePx = baseTitlePx * scale;
      const lineH = bodyPx * 1.45;
      const paraGap = bodyPx * 0.6;
      ctx.font = bodyFont(bodyPx);
      const paraLines = options.paragraphs.map((p) =>
        wrapWords(ctx, p, innerWidth),
      );
      let total = paraLines.reduce(
        (sum, lines) => sum + lines.length * lineH,
        0,
      );
      total += paraGap * Math.max(0, paraLines.length - 1);
      if (options.title) total += titlePx + titlePx * 0.9;
      return total;
    };

    // Auto-shrink so the block always fits its panel
    let scale = 1;
    const available = height * 0.94;
    const naturalHeight = measure(1);
    if (naturalHeight > available) {
      scale = Math.max(0.35, available / naturalHeight);
    }

    const bodyPx = baseBodyPx * scale;
    const titlePx = baseTitlePx * scale;
    const lineH = bodyPx * 1.45;
    const paraGap = bodyPx * 0.6;
    const total = measure(scale);

    ctx.fillStyle = options.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let y = (height - total) / 2;

    if (options.title) {
      ctx.font = titleFont(titlePx);
      drawLetterspaced(
        ctx,
        options.title.toUpperCase(),
        width / 2,
        y + titlePx / 2,
        titlePx * 0.22,
        align,
        padX,
      );
      y += titlePx + titlePx * 0.9;
    }

    ctx.font = bodyFont(bodyPx);
    for (const paragraph of options.paragraphs) {
      const lines = wrapWords(ctx, paragraph, innerWidth);
      for (let i = 0; i < lines.length; i++) {
        drawBodyLine(
          ctx,
          lines[i] ?? [],
          padX,
          width / 2,
          y + lineH / 2,
          innerWidth,
          align,
          i === lines.length - 1,
        );
        y += lineH;
      }
      y += paraGap;
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Draw a wall-text panel (optional letterspaced-caps title + wrapped body
 * paragraphs) to a CanvasTexture at ~256 px/ft. Resolves after the
 * EB Garamond FontFace loads (Georgia fallback on failure). Cached by
 * options; do not dispose the returned texture directly — use
 * disposeProceduralTextures().
 */
export async function makeTextPanelTexture(
  options: TextPanelOptions,
): Promise<CanvasTexture> {
  const key = `text:${JSON.stringify(options)}`;
  const cached = textureCache.get(key);
  if (cached) return cached;
  const pending = pendingCache.get(key);
  if (pending) return pending;

  const promise = (async () => {
    await loadGalleryFont();
    const texture = drawTextPanel(options);
    textureCache.set(key, texture);
    pendingCache.delete(key);
    return texture;
  })();
  pendingCache.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// SVG quads (spool logo / watermark)
// ---------------------------------------------------------------------------

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    image.src = url;
  });
}

/**
 * Rasterise an SVG to a CanvasTexture at the given pixel size (vector-crisp:
 * browsers render SVG images at the drawn resolution). The image is drawn
 * "contain" (aspect preserved, centred). If `tint` is given, every opaque
 * pixel is recoloured to that flat colour (watermark treatment).
 */
export async function makeSvgTexture(
  url: string,
  widthPx: number,
  heightPx: number,
  tint?: string,
): Promise<CanvasTexture> {
  const key = `svg:${url}:${widthPx}x${heightPx}:${tint ?? ''}`;
  const cached = textureCache.get(key);
  if (cached) return cached;
  const pending = pendingCache.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const scale = Math.min(
        widthPx / image.naturalWidth,
        heightPx / image.naturalHeight,
      );
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      ctx.drawImage(image, (widthPx - dw) / 2, (heightPx - dh) / 2, dw, dh);
      if (tint) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, widthPx, heightPx);
      }
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    textureCache.set(key, texture);
    pendingCache.delete(key);
    return texture;
  })();
  // Drop failed loads from the cache so a transient error isn't sticky.
  promise.catch(() => {
    pendingCache.delete(key);
  });
  pendingCache.set(key, promise);
  return promise;
}
