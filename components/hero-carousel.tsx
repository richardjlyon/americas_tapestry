'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import type { TapestryEntry } from '@/lib/tapestries';

interface HeroCarouselProps {
  tapestries: TapestryEntry[];
}

export function HeroCarousel({ tapestries = [] }: HeroCarouselProps) {
  // Ensure tapestries is a valid array
  const validTapestries = useMemo(() => 
    Array.isArray(tapestries) ? tapestries : [], 
    [tapestries]
  );
  const hasTapestries = validTapestries.length > 0;

  // Only init carousel if we have tapestries
  const [emblaRef, emblaApi] = useEmblaCarousel(
    hasTapestries ? { loop: true } : { loop: false },
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Debug carousel issues
  useEffect(() => {
    console.log('HeroCarousel received tapestries:', {
      count: validTapestries.length,
      tapestries: validTapestries.map((t) => ({
        slug: t.slug,
        imagePath: t.imagePath,
        thumbnail: t.thumbnail,
      })),
    });
  }, [validTapestries]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Start auto-scrolling
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 6000); // Change slide every 6 seconds

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Debug tapestry data
  useEffect(() => {
    console.log('Hero carousel tapestries:', tapestries);
    tapestries.forEach((tapestry) => {
      console.log(`Tapestry ${tapestry.slug}:`, {
        status: tapestry.status,
        imagePath: tapestry.imagePath,
        thumbnail: tapestry.thumbnail,
      });
    });
  }, [tapestries]);

  if (!hasTapestries) {
    console.log('No eligible tapestries found for carousel!');
    return (
      <div className="relative h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
            filter: 'brightness(0.7)',
          }}
        />
        <div className="relative z-10 container mx-auto text-center px-6">
          <div className="hero-content-box max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-colonial-parchment mb-4 md:mb-6 tracking-tight">
              America's Tapestry
            </h1>
            <p className="font-serif text-xl sm:text-2xl text-colonial-parchment/90 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              Be a part of America's 250th Anniversary.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safely get the current tapestry or fallback to the first one
  const safeIndex = currentIndex < validTapestries.length ? currentIndex : 0;
  const currentTapestry = validTapestries[safeIndex];

  return (
    <div className="relative h-[80vh] md:h-[90vh] overflow-hidden">
      {/* Background overlay */}
      {/* <div className="absolute inset-0 bg-colonial-navy/30 z-10" /> */}

      {/* Carousel for background images only */}
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {validTapestries.map((tapestry, index) => (
            <div
              key={tapestry.slug || index}
              className="embla__slide h-full relative flex-[0_0_100%]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={
                    tapestry.imagePath ||
                    tapestry.thumbnail ||
                    `/placeholder.svg?height=1080&width=1920`
                  }
                  alt={tapestry.title || 'Tapestry image'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 ease-out"
                  style={{
                    filter: 'brightness(0.9)',
                    transform:
                      currentIndex === index && isLoaded
                        ? 'scale(1.05)'
                        : 'scale(1)',
                  }}
                />
              </div>
              <div
                className={cn(
                  'absolute inset-0 opacity-40',
                  tapestry.background_color || 'bg-colonial-navy',
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed content overlay - stays in place while images slide underneath */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <div className="container mx-auto text-center px-6">
          <div className="hero-content-box max-w-4xl mx-auto">
            <p className="font-serif italic text-xl sm:text-2xl text-colonial-parchment/90 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              13 Colonies. 13 Stories. 1 Nation.
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-colonial-parchment mb-4 md:mb-6 tracking-tight">
              America's Tapestry
            </h1>
            <p className="font-serif text-xl sm:text-2xl text-colonial-parchment/90 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              Be a part of America's 250th Anniversary.
            </p>
            <Button
              asChild
              variant="gold"
              size="lg"
              className="text-base sm:text-lg px-6 py-3 h-auto pointer-events-auto"
            >
              <Link href={`/tapestries/${currentTapestry.slug}`}>
                Explore the {currentTapestry.title} tapestry
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {validTapestries.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              currentIndex === index
                ? 'bg-colonial-gold w-6'
                : 'bg-colonial-parchment/60 hover:bg-colonial-parchment',
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-colonial-navy/30 hover:bg-colonial-navy/50 text-colonial-parchment rounded-full p-2 backdrop-blur-sm transition-all"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-colonial-navy/30 hover:bg-colonial-navy/50 text-colonial-parchment rounded-full p-2 backdrop-blur-sm transition-all"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ArrowRight className="h-6 w-6" />
      </button>
    </div>
  );
}
