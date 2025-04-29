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