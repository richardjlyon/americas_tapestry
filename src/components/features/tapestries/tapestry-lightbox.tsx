'use client';

import { useEffect, useRef, useState } from 'react';
import { Expand, X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

/**
 * "View full size" affordance for a tapestry panel: opens the image in a
 * viewport-filling overlay. Closes via the X button, the backdrop, or
 * Escape; body scroll locks while open.
 */
export function TapestryLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 font-medium text-colonial-parchment/70 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
      >
        <Expand className="h-4 w-4" aria-hidden="true" />
        View full size
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — full size`}
          className="fixed inset-0 z-[70] bg-colonial-navy/95 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-4 md:inset-8">
            <OptimizedImage
              src={src}
              alt={alt}
              fill
              role="hero"
              className="object-contain"
              quality={90}
            />
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close full-size view"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-colonial-navy/80 text-colonial-parchment ring-1 ring-white/25 transition-colors hover:text-colonial-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
