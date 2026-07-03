import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface FramedPrintProps {
  /** Image path (public path or R2 manifest key). */
  src: string;
  /** Alt text describing the print. */
  alt: string;
  /** Print proportions — portrait reads most like wall art. */
  orientation?: 'portrait' | 'landscape';
  /** Eager-load above-the-fold instances (e.g. the hero). */
  priority?: boolean;
  className?: string;
}

/**
 * Presents a tapestry image as a matted, framed fine-art print — a parchment
 * mat, a thin frame line, and a lifted shadow. This is the shop's signature
 * device: it reframes the documentary panel photos as wall art you can own.
 */
export function FramedPrint({
  src,
  alt,
  orientation = 'landscape',
  priority = false,
  className,
}: FramedPrintProps) {
  return (
    <div
      className={cn(
        'bg-colonial-parchment p-3 sm:p-4 md:p-5 shadow-[0_10px_34px_rgba(16,37,66,0.20)] ring-1 ring-colonial-navy/15',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-white ring-1 ring-colonial-navy/25',
          orientation === 'portrait' ? 'aspect-[4/5]' : 'aspect-[4/3]',
        )}
      >
        <OptimizedImage
          src={getImagePath(src)}
          alt={alt}
          fill
          role="feature"
          className="object-cover"
          enableBlurPlaceholder
          priority={priority}
        />
      </div>
    </div>
  );
}
