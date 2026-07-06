import Link from 'next/link';
import { Headphones } from 'lucide-react';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import type { TapestryEntry } from '@/lib/tapestries';

interface TapestryCardProps {
  tapestry: TapestryEntry;
}

/**
 * A colony panel hung in the collection gallery: the framed fine-art
 * photograph with title and summary beneath. Dark-room treatment.
 */
export function TapestryCard({ tapestry }: TapestryCardProps) {
  const hasAudio = !!tapestry.audioPath;

  return (
    <Link href={`/tapestries/${tapestry.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-colonial-gold focus-visible:ring-offset-4 focus-visible:ring-offset-colonial-navy">
      <div className="relative">
        <FramedArtwork
          src={tapestry.imagePath || tapestry.thumbnail}
          alt={`The ${tapestry.title} tapestry panel`}
          framed
          className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        />
        {hasAudio && (
          <div className="absolute bottom-3 right-3 rounded-full bg-colonial-navy/80 p-1.5 text-colonial-parchment shadow-md ring-1 ring-white/20">
            <Headphones className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Audio description available</span>
          </div>
        )}
      </div>
      <h3 className="gallery-heading mt-4 text-center text-xl">
        {tapestry.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-center font-serif text-sm text-colonial-parchment/70">
        {tapestry.summary}
      </p>
    </Link>
  );
}
