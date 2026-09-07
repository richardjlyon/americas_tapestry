'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { getImagePath, getImageSizes } from '@/lib/image-utils';

export interface PostGalleryImage {
  src: string;
  alt: string;
}

/**
 * A tiled grid of photographs at the foot of a news article, for posts that
 * carry a set of pictures rather than a handful placed in the prose. Same
 * plate treatment and lightbox as the exhibition wall, on the parchment
 * background the article body uses.
 */
export function PostGallery({ images }: { images: PostGalleryImage[] }) {
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
      {/* `not-prose` is required: this grid renders inside the article's
          `.content-typography` scope, which sets a 1.78em margin on every img
          and bullets plus padding on every li. That margin shifts the
          absolutely-positioned fill image down inside its frame, leaving a
          blank band at the head of each tile. */}
      <ul className="not-prose grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:gap-4">
        {images.map((photo, index) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View larger: ${photo.alt}`}
              className="group relative block aspect-[3/2] w-full overflow-hidden bg-colonial-navy/5 ring-1 ring-colonial-navy/10 transition-shadow hover:shadow-plate focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-2"
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
                  className="h-6 w-6 text-colonial-parchment opacity-0 transition-opacity duration-300 group-hover:opacity-90"
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
