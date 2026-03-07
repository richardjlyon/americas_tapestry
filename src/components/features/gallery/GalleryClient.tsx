'use client';

import dynamic from 'next/dynamic';

/**
 * GalleryClient - Client Component wrapper for the 3D gallery scene
 *
 * Uses next/dynamic with ssr: false to ensure Three.js and R3F are only
 * loaded on the client. This prevents SSR build failures since Three.js
 * requires browser APIs (WebGL, window, document).
 */
const GalleryScene = dynamic(
  () => import('@/components/features/gallery/GalleryScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900">
        <p className="text-lg text-neutral-400">Loading gallery...</p>
      </div>
    ),
  }
);

export default function GalleryClient(): React.ReactElement {
  return (
    <div className="h-screen w-screen">
      <GalleryScene />
    </div>
  );
}
