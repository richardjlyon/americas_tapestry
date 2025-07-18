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
 * Enhanced with PRP specifications for better performance
 * 
 * @param role - The role of the image in the layout
 * @returns Appropriate sizes attribute for next/image
 */
export function getImageSizes(role: 'hero' | 'card' | 'thumbnail' | 'feature' | 'banner' | 'gallery' | 'full' = 'gallery'): string {
  switch (role) {
    case 'hero':
      return '100vw';
    case 'feature':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'card':
      return '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
    case 'thumbnail':
      return '(max-width: 768px) 25vw, 15vw';
    case 'banner':
      return '100vw';
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'full':
    default:
      return '(max-width: 1024px) 100vw, 1024px';
  }
}

/**
 * Get optimized image path with enhanced validation
 * Ensures proper path handling for Next.js Image component
 * 
 * @param path - Original image path
 * @returns Properly formatted image path
 */
export function getOptimizedImagePath(path: string): string {
  if (!path) return '';
  
  // Handle public directory paths
  if (path.startsWith('/public/')) {
    return path.replace('/public/', '/');
  }
  
  // Handle content directory paths
  if (!path.startsWith('/content/') && !path.startsWith('/')) {
    return `/content/${path}`;
  }
  
  return path;
}

/**
 * Generate a low-quality blur placeholder for better perceived performance
 * Creates a minimal base64 encoded image for blur effect during loading
 * 
 * @param width - Width of the placeholder (default: 10)
 * @param height - Height of the placeholder (default: 10)
 * @returns Base64 encoded blur placeholder
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  // Create a minimal SVG that will be blurred
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get blur placeholder based on image type or content
 * Returns appropriate placeholder colors for different content types
 * 
 * @param imagePath - Path to the image to determine appropriate placeholder
 * @returns Base64 encoded blur placeholder
 */
export function getContextualBlurPlaceholder(imagePath: string): string {
  // Determine placeholder color based on content type
  let fillColor = '#f3f4f6'; // Default gray
  
  if (imagePath.includes('/team/')) {
    fillColor = '#e0e7ff'; // Light blue for team photos
  } else if (imagePath.includes('/tapestries/')) {
    fillColor = '#fef3c7'; // Light amber for tapestry images
  } else if (imagePath.includes('/sponsors/')) {
    fillColor = '#f0fdf4'; // Light green for sponsors
  } else if (imagePath.includes('/news/')) {
    fillColor = '#fdf2f8'; // Light pink for news
  }
  
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${fillColor}"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}