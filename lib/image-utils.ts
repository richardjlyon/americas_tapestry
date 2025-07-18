/**
 * Utilities for handling images in the America's Tapestry website
 * Refactored to use direct public paths
 */

/**
 * Get image path from any format to the correct public path
 * This simplifies the image path handling to use only public directories
 * 
 * @param path - Original image path
 * @returns Properly formatted image path for public directory
 */
export function getImagePath(path: string): string {
  // If path is null or empty, return empty string
  if (!path) return '';
  
  // If path is already absolute or starts with / (for public directory), return as is
  if (path.startsWith('/') || path.startsWith('http')) {
    // If path is using old content format, convert it
    if (path.startsWith('/content/')) {
      return convertContentPathToPublic(path);
    }
    return path;
  }
  
  // If path starts with 'content/', convert to public format
  if (path.startsWith('content/')) {
    return convertContentPathToPublic('/' + path);
  }
  
  // Otherwise, assume it's a relative path to images directory
  return `/images/${path}`;
}

/**
 * Convert a content path to direct content access
 * Now serves content files directly without copying to public
 * 
 * @param contentPath - Path starting with /content/
 * @returns Direct content path for Next.js to serve
 */
function convertContentPathToPublic(contentPath: string): string {
  // Return content paths as-is - Next.js will serve them directly
  // The rewrites in next.config.mjs handle the routing
  return contentPath;
}

/**
 * Get path for video files
 * 
 * @param path - Original video path
 * @returns Properly formatted video path
 */
export function getVideoPath(path: string): string {
  // If path is null or empty, return empty string
  if (!path) return '';
  
  // If path is already absolute or starts with / (for public directory), return as is
  if (path.startsWith('/') || path.startsWith('http')) {
    // If path is using old content format, convert it
    if (path.startsWith('/content/video/')) {
      return path.replace('/content/video/', '/video/');
    }
    return path;
  }
  
  // If path starts with 'content/video', convert to public format
  if (path.startsWith('content/video/')) {
    return path.replace('content/video/', '/video/');
  }
  
  // Otherwise, assume it's a relative path to video directory
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