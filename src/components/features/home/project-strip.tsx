import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VideoPlayer } from '@/components/shared/video-player';

/**
 * The project introduction below the hero: the full what-is-this
 * explanation (a first-time visitor should leave this section knowing
 * exactly what America's Tapestry is), the documentary excerpt, a link.
 */
export function ProjectStrip() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div>
        <span className="eyebrow eyebrow-gold">The Project</span>
        <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
          What is America&rsquo;s Tapestry?
        </h2>
        <div className="gold-threshold mt-4" />
        <p className="gallery-lead mt-5 font-medium text-colonial-parchment">
          Created to commemorate our country&rsquo;s 250th anniversary,{' '}
          <em>America&rsquo;s Tapestry</em>{' '}
          weaves together stories from our nation&rsquo;s founding through the
          medium of embroidery.
        </p>
        <p className="gallery-lead mt-4">
          Thirteen embroidered panels were designed by our creative team in
          collaboration with historical organizations from each of the
          original colonies, and stitched over 18 months by volunteer
          embroiderers in each state, led by our state directors. The
          completed Tapestry is now touring prominent gallery spaces on a
          three-year exhibition through to 2030.
        </p>
        <p className="gallery-lead mt-4">
          <em>America&rsquo;s Tapestry</em>{' '}
          enriches our understanding of our shared heritage, while promoting
          the art of American needlework — visitors can learn about the
          revolution and engage in the historic practice of needlework.
        </p>
        <Link
          href="/about"
          className="mt-5 inline-flex items-center font-medium text-colonial-gold transition-colors hover:text-colonial-gold/80"
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
