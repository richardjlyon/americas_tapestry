import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface FramedArtworkProps {
  /** Image path (public path or R2 manifest key). */
  src: string;
  /** Alt text describing the artwork. */
  alt: string;
  /** When true, wrap the artwork in a simulated near-black frame. */
  framed?: boolean;
  className?: string;
}

/**
 * A colony's print artwork, hung on the gallery wall. Unframed editions get a
 * hairline edge and a soft cast shadow; framed editions add a near-black frame
 * with a fine inner bevel. The outer box is always 4:5 — framed or not — so a
 * mixed row of editions lines up.
 */
export function FramedArtwork({
  src,
  alt,
  framed = false,
  className,
}: FramedArtworkProps) {
  const img = (
    <OptimizedImage
      src={getImagePath(src)}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
      role="feature"
      className="object-cover"
      enableBlurPlaceholder
    />
  );

  return (
    <div className={cn('relative aspect-[4/5]', className)}>
      {framed ? (
        // The frame — near-black moulding — fills the 4:5 box; the art sits
        // inside it, so framing never changes the card's footprint.
        <div className="absolute inset-0 bg-colonial-frame p-[5%] shadow-plate-lg ring-1 ring-black/50">
          {/* Inner bevel — a fine lit edge where moulding meets the art. */}
          <div className="relative h-full w-full overflow-hidden bg-black ring-1 ring-white/10">
            {img}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-black shadow-plate ring-1 ring-white/10">
          {img}
        </div>
      )}
    </div>
  );
}
