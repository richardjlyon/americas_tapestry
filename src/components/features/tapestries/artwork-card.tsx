import Link from 'next/link';
import { Fragment } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';

export interface ArtworkArtist {
  name: string;
  href: string;
}

interface ArtworkCardProps {
  src: string;
  alt: string;
  artists: ArtworkArtist[];
}

/**
 * Card preserving a tapestry's original design illustration, with an artist
 * credit linking to the illustrator's page.
 *
 * @param src - Public path to the original-artwork image
 * @param alt - Alt text for the artwork image
 * @param artists - Illustrators to credit; empty array uses a generic caption
 */
export function ArtworkCard({ src, alt, artists }: ArtworkCardProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg bg-colonial-parchment p-4 shadow-md">
        <OptimizedImage
          src={getImagePath(src)}
          alt={alt}
          width={1024}
          height={1317}
          className="h-auto w-full rounded"
          role="feature"
          quality={85}
          enableBlurPlaceholder
        />
        <p className="mt-4 text-center text-sm italic text-colonial-navy/80">
          {artists.length > 0 ? (
            <>
              The original illustration by{' '}
              {artists.map((artist, index) => (
                <Fragment key={artist.href}>
                  {index > 0 &&
                    (index === artists.length - 1 ? ' and ' : ', ')}
                  <Link
                    href={artist.href}
                    className="font-medium text-colonial-burgundy underline hover:text-colonial-navy"
                  >
                    {artist.name}
                  </Link>
                </Fragment>
              ))}
              , the artwork our stitchers worked from.
            </>
          ) : (
            'The original illustration our stitchers worked from.'
          )}
        </p>
      </div>
    </div>
  );
}
