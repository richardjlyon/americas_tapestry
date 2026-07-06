import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VideoPlayer } from '@/components/shared/video-player';

/** Compact project introduction: one paragraph, the documentary excerpt, a link. */
export function ProjectStrip() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div>
        <span className="eyebrow eyebrow-gold">The Project</span>
        <h2 className="gallery-heading mt-2 text-3xl md:text-4xl">
          A nation&rsquo;s story, stitched by hand
        </h2>
        <div className="gold-threshold mt-4" />
        <p className="gallery-lead mt-6">
          Created to commemorate America&rsquo;s 250th anniversary,{' '}
          <em>America&rsquo;s Tapestry</em> weaves together stories from our
          nation&rsquo;s founding. Panels were designed with historical
          organizations in each of the original colonies and stitched over 18
          months by volunteer embroiderers aged 5 to 96.
        </p>
        <Link
          href="/about"
          className="mt-6 inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
        >
          About the project
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mx-auto w-full max-w-[350px] lg:max-w-[400px]">
        <VideoPlayer
          src="https://github.com/richardjlyon/americas_tapestry/releases/download/video-assets-v1.0/250305-short-promotional-v2-lowres.mp4"
          highResSrc="https://github.com/richardjlyon/americas_tapestry/releases/download/video-assets-v1.0/250305-short-promotional-v2.mp4"
          poster="/video/250305-short-promotional/250305-short-promotional-v2-poster.png"
          className="aspect-[9/16] w-full"
        />
        <p className="mt-2 text-center font-serif text-sm italic text-colonial-parchment/60 sm:text-base">
          Documentary excerpt: &ldquo;The Making of America&rsquo;s
          Tapestry&rdquo;
        </p>
      </div>
    </div>
  );
}
