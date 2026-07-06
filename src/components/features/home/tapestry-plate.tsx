import Link from 'next/link';
import { FramedArtwork } from '@/components/ui/framed-artwork';
import type { TapestryEntry } from '@/lib/tapestries';

/** A colony panel hung in the homepage gallery: framed photo + caption. */
export function TapestryPlate({ tapestry }: { tapestry: TapestryEntry }) {
  return (
    <Link href={`/tapestries/${tapestry.slug}`} className="group block">
      <FramedArtwork
        src={tapestry.imagePath || tapestry.thumbnail}
        alt={`The ${tapestry.title} tapestry panel`}
        framed
        className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
      />
      <p className="gallery-heading mt-4 text-center text-lg">
        {tapestry.title}
      </p>
    </Link>
  );
}
