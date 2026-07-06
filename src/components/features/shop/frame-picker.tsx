'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FrameOption {
  /** e.g. "Black frame". */
  frame: string;
  /** Direct-to-checkout URL for this variant. */
  href: string;
  available: boolean;
}

interface FramePickerProps {
  options: FrameOption[];
  /** Formatted price (all frame colours share one price). */
  price: string;
}

const WOOD = 'linear-gradient(135deg,#bd8f5c,#7a4f28)';
const SWATCH: Record<string, string> = {
  'White frame': '#ece6d8',
  'Black frame': '#15181f',
};

function swatchStyle(frame: string): CSSProperties {
  if (frame === 'Wood frame') return { backgroundImage: WOOD };
  return { backgroundColor: SWATCH[frame] ?? '#8a8a8a' };
}

/**
 * Frame-colour chooser for the framed editions. Swatches select a variant; the
 * Buy link points at that variant's checkout. Defaults to the black frame,
 * matching the frame drawn around the artwork above it.
 */
export function FramePicker({ options, price }: FramePickerProps) {
  const preferred = options.findIndex((o) => o.frame === 'Black frame');
  const [idx, setIdx] = useState(preferred >= 0 ? preferred : 0);
  const selected = options[idx];
  if (!selected) return null;

  return (
    <div>
      <div className="mt-3 flex items-center justify-center gap-3">
        {options.map((o, i) => (
          <button
            key={o.frame}
            type="button"
            onClick={() => setIdx(i)}
            title={o.frame}
            aria-label={o.frame}
            aria-pressed={i === idx}
            style={swatchStyle(o.frame)}
            className={cn(
              // A visible border keeps every swatch — even the near-black one —
              // reading as a distinct circle against the navy wall. The selected
              // ring uses `ring` (a box-shadow), not `outline`: `focus:outline-none`
              // would otherwise blank the outline on the just-clicked (focused)
              // swatch, leaving the highlight stuck on the previous colour.
              'h-6 w-6 rounded-full border border-white/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-2 focus-visible:ring-offset-colonial-navy',
              i === idx &&
                'ring-2 ring-colonial-gold ring-offset-2 ring-offset-colonial-navy',
            )}
          />
        ))}
      </div>

      <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.16em] text-colonial-parchment/55">
        {selected.frame}
      </p>

      <p className="mt-2 font-sans text-xs uppercase tracking-[0.15em] text-colonial-parchment/60">
        {price}
        <span className="mx-2 text-colonial-parchment/30">·</span>
        {selected.available ? (
          <a
            href={selected.href}
            className="inline-flex items-center gap-1 text-colonial-gold underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
          >
            Buy
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : (
          <span className="italic text-colonial-parchment/40">Sold out</span>
        )}
      </p>
    </div>
  );
}
