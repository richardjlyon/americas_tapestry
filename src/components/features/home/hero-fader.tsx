'use client';

import { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

export interface FaderImage {
  src: string;
  alt: string;
}

/**
 * Cross-fades a set of images inside an absolutely-positioned parent.
 * CSS-transition only; rotation pauses entirely under
 * prefers-reduced-motion (the first image simply stays).
 */
export function HeroFader({
  images,
  intervalMs = 7000,
}: {
  images: FaderImage[];
  intervalMs?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(
      () => setCurrent((v) => (v + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((img, idx) => (
        <OptimizedImage
          key={img.src}
          src={img.src}
          alt={idx === current ? img.alt : ''}
          fill
          role="hero"
          className={`object-cover transition-opacity duration-[2000ms] ease-in-out ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
          priority={idx === 0}
          quality={75}
          enableBlurPlaceholder={idx === 0}
        />
      ))}
    </>
  );
}
