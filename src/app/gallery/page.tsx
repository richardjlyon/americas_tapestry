import type { Metadata } from 'next';
import GalleryClient from '@/components/features/gallery/GalleryClient';

export const metadata: Metadata = {
  title: "Virtual Gallery | America's Tapestry",
  description:
    'Walk through Gallery 7 and explore the tapestries in an immersive 3D experience.',
};

/**
 * Gallery page - Server Component entry point
 *
 * This is a Server Component that delegates all 3D rendering to GalleryClient.
 * No Three.js or R3F imports are allowed in this file to maintain SSR safety.
 */
export default function GalleryPage(): React.ReactElement {
  return <GalleryClient />;
}
