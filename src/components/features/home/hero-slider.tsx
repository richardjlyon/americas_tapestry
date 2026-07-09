'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

export interface SlideImage {
  src: string;
  alt: string;
}

/**
 * The hero's full-bleed image slider: embla-driven slides with a slow
 * Ken Burns zoom on each image, auto-advancing with dot navigation and
 * swipe. Auto-advance and the zoom both stand down under
 * prefers-reduced-motion; dots and swipe keep working.
 */
export function HeroSlider({
  images,
  intervalMs = 7000,
}: {
  images: SlideImage[];
  intervalMs?: number;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => emblaApi.scrollNext(), intervalMs);
    return () => clearInterval(t);
  }, [emblaApi, images.length, intervalMs]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    <>
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div
              key={img.src}
              className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              <OptimizedImage
                src={img.src}
                alt={idx === selected ? img.alt : ''}
                fill
                role="hero"
                className="animate-ken-burns object-cover motion-reduce:animate-none"
                priority={idx === 0}
                quality={75}
                enableBlurPlaceholder={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot navigation only reads well for a handful of slides. Above ~8 the
          row grows too wide, so we drop it and rely on auto-advance + swipe. */}
      {images.length > 1 && images.length <= 8 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
          {images.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Show slide ${idx + 1}: ${img.alt}`}
              aria-current={idx === selected}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-2 focus-visible:ring-offset-colonial-navy ${
                idx === selected
                  ? 'w-6 bg-colonial-gold'
                  : 'w-2 bg-colonial-parchment/50 hover:bg-colonial-parchment/80'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
