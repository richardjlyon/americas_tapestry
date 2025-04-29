/**
 * Utilities for handling images in the America's Tapestry website
 */

/**
 * Convert a content path to a properly formatted image source path
 * This allows components to reference images in the content directory
 * while Next.js Image optimization handles them correctly
 * 
 * @param path - Original image path (can be full path or relative to content)
 * @returns Properly formatted image path for Next.js Image component
 */
export function getImagePath(path: string): string {
  // If path is null or empty, return empty string
  if (!path) return '';
  
  // If path is already absolute or starts with / (for public directory), return as is
  if (path.startsWith('/') || path.startsWith('http')) {
    return path;
  }
  
  // If path starts with 'content/', strip that part as it's redundant
  if (path.startsWith('content/')) {
    return `/${path}`;
  }
  
  // Otherwise, assume it's a path relative to the content directory
  return `/content/${path}`;
}

/**
 * Convert a path to a proper video source path
 * Videos are still copied to the public directory
 * 
 * @param path - Original video path
 * @returns Properly formatted video path
 */
export function getVideoPath(path: string): string {
  // If path is null or empty, return empty string
  if (!path) return '';
  
  // If path is already absolute or starts with / (for public directory), return as is
  if (path.startsWith('/') || path.startsWith('http')) {
    return path;
  }
  
  // If path starts with 'content/video', convert to public/video
  if (path.startsWith('content/video/')) {
    return `/video/${path.substring('content/video/'.length)}`;
  }
  
  // Otherwise, assume it's a path relative to the content/video directory
  return `/video/${path}`;
}

/**
 * Generate responsive image sizes string based on the image's role
 * 
 * @param role - The role of the image in the layout
 * @returns Appropriate sizes attribute for next/image
 */
export function getImageSizes(role: 'thumbnail' | 'banner' | 'gallery' | 'feature' | 'full' = 'gallery'): string {
  switch (role) {
    case 'thumbnail':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 250px';
    case 'banner':
      return '100vw';
    case 'feature':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'full':
    default:
      return '(max-width: 1024px) 100vw, 1024px';
  }
}

/**
 * Loader function that can be used with Next.js Image component
 * This provides a custom loading strategy for images
 * 
 * @param params - Image loader parameters
 * @returns URL for the image with proper params
 */
export function customImageLoader({ src, width, quality }: { 
  src: string; 
  width: number; 
  quality?: number;
}): string {
  // For external URLs, just return the URL
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, return the path with width and quality params
  // This will be handled by Next.js image optimization pipeline
  return `${src}?w=${width}&q=${quality || 75}`;
}