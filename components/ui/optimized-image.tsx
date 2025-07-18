'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getContextualBlurPlaceholder, getImageSizes } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  src: string;
  alt: string;
  role?: 'hero' | 'card' | 'thumbnail' | 'feature' | 'banner' | 'gallery' | 'full';
  fallbackSrc?: string;
  showErrorMessage?: boolean;
  errorClassName?: string;
  enableBlurPlaceholder?: boolean;
}

/**
 * OptimizedImage - A wrapper around Next.js Image component with advanced features
 * 
 * Features:
 * - Automatic blur placeholders based on image content type
 * - Error handling with fallback images
 * - Contextual sizing based on image role
 * - Loading states and error states
 * - Accessibility improvements
 * 
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 * @param role - Image role for automatic sizing (default: 'gallery')
 * @param fallbackSrc - Fallback image if main image fails
 * @param showErrorMessage - Whether to show error message on failure
 * @param errorClassName - Custom CSS class for error state
 * @param enableBlurPlaceholder - Whether to show blur placeholder (default: true)
 * @param props - Additional Next.js Image props
 */
export function OptimizedImage({
  src,
  alt,
  role = 'gallery',
  fallbackSrc = '/images/placeholder.svg',
  showErrorMessage = false,
  errorClassName,
  enableBlurPlaceholder = true,
  sizes,
  className,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle image load error
  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      // Try fallback image first
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      // If fallback also fails, show error state
      setHasError(true);
    }
    setIsLoading(false);
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // If error state and no fallback worked
  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-500 text-sm',
          errorClassName,
          className
        )}
        role="img"
        aria-label={alt}
      >
        {showErrorMessage ? (
          <div className="text-center p-4">
            <div className="mb-2">⚠️</div>
            <div>Failed to load image</div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 rounded" />
        )}
      </div>
    );
  }

  // Prepare image props
  const imageProps: ImageProps = {
    src: currentSrc,
    alt,
    sizes: sizes || getImageSizes(role),
    className: cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    ...props,
  };

  // Add blur placeholder if enabled
  if (enableBlurPlaceholder && !props.placeholder) {
    imageProps.placeholder = 'blur';
    imageProps.blurDataURL = getContextualBlurPlaceholder(currentSrc);
  }

  return (
    <Image
      {...imageProps}
      alt={alt}
    />
  );
}

/**
 * OptimizedImageWithFallback - Simplified version with just fallback handling
 * For cases where you want minimal overhead but still need error handling
 */
export function OptimizedImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  ...props
}: Omit<OptimizedImageProps, 'role' | 'showErrorMessage' | 'errorClassName' | 'enableBlurPlaceholder'>) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && !hasError) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

export default OptimizedImage;