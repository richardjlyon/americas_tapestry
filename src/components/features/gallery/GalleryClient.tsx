'use client';

import dynamic from 'next/dynamic';
import type { GalleryTapestryData } from './types';

/**
 * GalleryClient — client wrapper for the 3D gallery experience.
 *
 * Uses next/dynamic with ssr: false so Three.js and R3F only load in the
 * browser (they need WebGL / window / document). Shows a parchment loading
 * shell while the experience chunk downloads.
 */
const GalleryExperience = dynamic(() => import('./GalleryExperience'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#F5EFE0]">
      <p className="font-serif text-2xl text-[#12284C]">
        America&rsquo;s Tapestry
      </p>
      <p className="text-sm tracking-widest text-[#8C4A4A] uppercase">
        Preparing the gallery…
      </p>
    </div>
  ),
});

interface GalleryClientProps {
  tapestries: GalleryTapestryData[];
}

export default function GalleryClient({
  tapestries,
}: GalleryClientProps): React.ReactElement {
  return (
    <div className="h-screen w-screen overflow-hidden supports-[height:100dvh]:h-dvh">
      <GalleryExperience tapestries={tapestries} />
    </div>
  );
}
