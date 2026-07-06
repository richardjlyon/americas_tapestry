import { OptimizedImage } from '@/components/ui/optimized-image';
import { getImagePath } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  /** Public path to the trimmed, opaque cover (via the R2 manifest). */
  src: string;
  alt: string;
  className?: string;
}

/**
 * The hardcover book presented as a physical object: a bound cover with a
 * lit spine, a page fore-edge, depth, and a grounded shadow. A gentle tilt on
 * hover invites the eye. This is the shop hero's centerpiece.
 */
export function BookCover({ src, alt, className }: BookCoverProps) {
  return (
    <div className={cn('[perspective:1800px]', className)}>
      <div className="group relative mx-auto w-[240px] transition-transform duration-500 ease-out [transform:rotateY(-22deg)] [transform-style:preserve-3d] hover:[transform:rotateY(-12deg)] motion-reduce:transition-none sm:w-[280px]">
        {/* Page fore-edge — a stack of leaves along the right side. */}
        <div className="absolute inset-y-[1.5%] right-0 w-[26px] translate-x-[22px] rounded-r-[2px] bg-[repeating-linear-gradient(90deg,#f4efe1,#f4efe1_1px,#cabf9f_2px,#f4efe1_3px)] shadow-[inset_-1px_0_2px_rgba(0,0,0,0.25)] [transform:rotateY(38deg)] [transform-origin:left_center]" />

        {/* The bound cover. */}
        <div className="relative aspect-[1477/1958] overflow-hidden rounded-l-[2px] rounded-r-[5px] shadow-[0_34px_60px_-18px_rgba(11,15,32,0.65)] ring-1 ring-black/20">
          <OptimizedImage
            src={getImagePath(src)}
            alt={alt}
            fill
            sizes="(min-width: 640px) 280px, 240px"
            role="feature"
            className="object-cover"
            enableBlurPlaceholder
            priority
          />
          {/* Spine shadow where the boards meet the binding. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-black/45 via-black/12 to-transparent"
          />
          {/* A faint gutter highlight just inside the spine. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-[10%] w-px bg-white/10"
          />
          {/* Cover gloss. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-white/[0.12]"
          />
        </div>

        {/* Contact shadow on the ground. */}
        <div
          aria-hidden="true"
          className="absolute -bottom-6 left-1/2 h-8 w-[85%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-xl"
        />
      </div>
    </div>
  );
}
