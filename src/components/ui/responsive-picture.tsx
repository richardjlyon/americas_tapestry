'use client';

import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  getResponsiveImageSources,
  hasResponsiveVariants,
} from '@/lib/image-utils';

interface ResponsivePictureProps {
  src: string;
  alt: string;
  role: 'hero' | 'gallery' | 'thumbnail' | 'card';
  className?: string;
  priority?: boolean;
  enableBlurPlaceholder?: boolean;
  style?: React.CSSProperties;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * ResponsivePicture - Modern responsive image component with AVIF/WebP support
 * Part of Phase 2 Performance Optimization
 *
 * Features:
 * - Modern picture element with multiple source formats
 * - AVIF format for maximum compression (supported browsers)
 * - WebP format for broad modern browser support
 * - JPEG fallback for legacy browsers
 * - Responsive srcSets for optimal loading at different viewport sizes
 * - Progressive enhancement - falls back to OptimizedImage if variants unavailable
 * - Seamless integration with existing OptimizedImage features
 *
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 * @param role - Image role for automatic sizing and responsive behavior
 * @param className - CSS classes to apply
 * @param priority - Whether to prioritize this image (LCP optimization)
 * @param enableBlurPlaceholder - Whether to show blur placeholder during loading
 * @param style - Inline styles
 * @param fill - Whether image should fill its container
 * @param width - Explicit width (if not using fill)
 * @param height - Explicit height (if not using fill)
 * @param quality - Image quality (1-100)
 */
export function ResponsivePicture({
  src,
  alt,
  role,
  className,
  priority = false,
  enableBlurPlaceholder = true,
  style,
  fill,
  width,
  height,
  quality = 80,
}: ResponsivePictureProps) {
  // Check if we have responsive variants available
  const hasVariants = hasResponsiveVariants(src, role);

  // If no responsive variants available, fall back to OptimizedImage
  if (!hasVariants) {
    const imageProps: any = {
      src,
      alt,
      role,
      className,
      priority,
      enableBlurPlaceholder,
      style,
      quality,
    };

    // Only add fill, width, height if they are defined
    if (fill !== undefined) imageProps.fill = fill;
    if (width !== undefined) imageProps.width = width;
    if (height !== undefined) imageProps.height = height;

    return <OptimizedImage {...imageProps} />;
  }

  // Get responsive sources for modern picture element
  const { avif, webp, fallback, sizes } = getResponsiveImageSources(src, role);

  return (
    <picture className={className} style={style}>
      {/* AVIF source - best compression, modern browsers */}
      <source srcSet={avif} type="image/avif" sizes={sizes} />

      {/* WebP source - good compression, wide browser support */}
      <source srcSet={webp} type="image/webp" sizes={sizes} />

      {/* Fallback img element using OptimizedImage for all its features */}
      <OptimizedImage
        src={fallback}
        alt={alt}
        role={role}
        priority={priority}
        enableBlurPlaceholder={enableBlurPlaceholder}
        sizes={sizes}
        {...(fill !== undefined && { fill })}
        {...(width !== undefined && { width })}
        {...(height !== undefined && { height })}
        quality={quality}
        // Remove className and style since they're applied to picture element
      />
    </picture>
  );
}

/**
 * ResponsivePictureWithFallback - Simplified version for basic responsive needs
 * Uses the responsive variants if available, otherwise falls back to standard image
 */
export function ResponsivePictureWithFallback({
  src,
  alt,
  role = 'gallery',
  ...props
}: Omit<ResponsivePictureProps, 'enableBlurPlaceholder' | 'priority'>) {
  return (
    <ResponsivePicture
      src={src}
      alt={alt}
      role={role}
      enableBlurPlaceholder={false}
      priority={false}
      {...props}
    />
  );
}

export default ResponsivePicture;
