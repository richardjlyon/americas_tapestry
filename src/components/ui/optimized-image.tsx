'use client';

import { useState, useEffect, useRef } from 'react';
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
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(priority);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);

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
  };

  // Handle successful image load
  const handleLoad = () => {
    setHasLoaded(true);
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

  const shouldLoad = priority || isInView;

  // If not in view yet, show skeleton placeholder
  if (!shouldLoad) {
    const skeletonStyle = props.fill 
      ? {} 
      : { aspectRatio: '4/3' };
      
    return (
      <div 
        ref={containerRef}
        className={cn(
          'bg-gray-200 animate-pulse',
          props.fill && 'absolute inset-0',
          className
        )}
        style={skeletonStyle}
        role="img"
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Prepare image props
  const imageProps: ImageProps = {
    src: currentSrc,
    alt,
    sizes: sizes || getImageSizes(role),
    className: props.fill ? undefined : cn(
      'transition-opacity duration-300',
      hasLoaded ? 'opacity-100' : 'opacity-0',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    priority,
    ...props,
  };

  // Add blur placeholder if enabled
  if (enableBlurPlaceholder && !('placeholder' in props)) {
    (imageProps as any).placeholder = 'blur';
    (imageProps as any).blurDataURL = getContextualBlurPlaceholder(currentSrc);
  }

  // For fill images, we need to handle the container differently
  if (props.fill) {
    return (
      <div ref={containerRef} className="relative w-full h-full">
        <Image
          {...imageProps}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            hasLoaded ? 'opacity-100' : 'opacity-0',
            className // Apply the passed className (including transforms) to the Image
          )}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Image
        {...imageProps}
        alt={alt}
      />
    </div>
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