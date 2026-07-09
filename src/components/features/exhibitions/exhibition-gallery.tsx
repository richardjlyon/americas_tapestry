'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { getImagePath, getImageSizes } from '@/lib/image-utils';
import type { ExhibitionGalleryImage } from '@/lib/exhibitions';

/**
 * A wall of framed photographs from a venue's showing, presented in the Night
 * Gallery language. Each plate opens a full-size lightbox with keyboard and
 * arrow navigation across the set.
 */
export function ExhibitionGallery({
  images,
}: {
  images: ExhibitionGalleryImage[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const active = activeIndex !== null ? images[activeIndex] : null;
  const showNavigation = images.length > 1;

  const step = (delta: number) =>
    setActiveIndex((current) =>
      current === null
        ? current
        : (current + delta + images.length) % images.length,
    );

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {images.map((photo, index) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View larger: ${photo.alt}`}
              className="group relative block aspect-[3/2] w-full overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-plate transition-shadow hover:shadow-plate-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy"
            >
              <Image
                src={getImagePath(photo.src)}
                alt={photo.alt}
                fill
                sizes={getImageSizes('gallery')}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-colonial-navy/0 transition-colors duration-300 group-hover:bg-colonial-navy/30">
                <Expand
                  className="h-7 w-7 text-colonial-parchment opacity-0 transition-opacity duration-300 group-hover:opacity-90"
                  aria-hidden="true"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <ImageLightbox
          isOpen={activeIndex !== null}
          onClose={() => setActiveIndex(null)}
          src={getImagePath(active.src)}
          alt={active.alt}
          title={active.alt}
          showNavigation={showNavigation}
          onPrevious={showNavigation ? () => step(-1) : undefined}
          onNext={showNavigation ? () => step(1) : undefined}
        />
      )}
    </>
  );
}
