/**
 * Utilities for handling images in the America's Tapestry website
 * Refactored to use direct public paths
 */

/**
 * Get image path - simplified to only use public directory
 * All images are stored in /public/images/ for direct serving
 * 
 * @param path - Original image path
 * @returns Properly formatted image path for public directory
 */
export function getImagePath(path: string): string {
  // If path is null or empty, return empty string
  if (!path) return '';
  
  // If path is already a public path or external URL, return as is
  if (path.startsWith('/images/') || path.startsWith('http')) {
    return path;
  }
  
  // For backward compatibility, convert old content paths to public paths
  if (path.startsWith('/content/') || path.startsWith('content/')) {
    return convertContentPathToPublic(path.startsWith('/') ? path : '/' + path);
  }
  
  // Otherwise, assume it's a relative path to images directory
  return `/images/${path}`;
}

/**
 * Convert a content path to public images path
 * Maps content directory paths to their public equivalents
 * 
 * @param contentPath - Path starting with /content/
 * @returns Equivalent public path
 */
function convertContentPathToPublic(contentPath: string): string {
  // Map content directories to public directories
  if (contentPath.startsWith('/content/tapestries/')) {
    return contentPath.replace('/content/tapestries/', '/images/tapestries/');
  }
  
  if (contentPath.startsWith('/content/sponsors/')) {
    return contentPath.replace('/content/sponsors/', '/images/sponsors/');
  }
  
  if (contentPath.startsWith('/content/team/')) {
    return contentPath.replace('/content/team/', '/images/team/');
  }
  
  if (contentPath.startsWith('/content/news/images/')) {
    return contentPath.replace('/content/news/images/', '/images/news/');
  }
  
  if (contentPath.startsWith('/content/video/')) {
    return contentPath.replace('/content/video/', '/video/');
  }
  
  // Default case - just strip content and assume images
  return contentPath.replace('/content/', '/images/');
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