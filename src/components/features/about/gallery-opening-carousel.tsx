import {
  HeroSlider,
  type SlideImage,
} from "@/components/features/home/hero-slider";

/**
 * Rotating display of photographs from the Tapestry's gallery opening at
 * the Muscarelle Museum of Art — replaces the static about-us hero image.
 *
 * PLACEHOLDER SLIDES: Richard will supply a dedicated set of images from
 * the June 2026 opening; swap these dummies for that set when it arrives.
 */
const OPENING_SLIDES: SlideImage[] = [
  {
    src: "/images/content/about-us.webp",
    alt: "Stitchers at work on America's Tapestry",
  },
  {
    src: "/images/exhibitions/muscarelle-museum-of-art.png",
    alt: "The Muscarelle Museum of Art at William & Mary",
  },
  {
    src: "/images/tapestries/virginia/virginia-photo.jpg",
    alt: "The Virginia panel on display",
  },
  {
    src: "/images/tapestries/pennsylvania/pennsylvania-photo.jpg",
    alt: "The Pennsylvania panel on display",
  },
];

export function GalleryOpeningCarousel() {
  return (
    <div className="relative mx-auto mb-6 aspect-[2/1] max-w-5xl overflow-hidden rounded-lg shadow-xl md:mb-12">
      <HeroSlider images={OPENING_SLIDES} />
    </div>
  );
}
