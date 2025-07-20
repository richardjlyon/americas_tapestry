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
    // Handle sponsor logos - they are now in flat structure
    // Convert /content/sponsors/sponsor-name/logo.png to /images/sponsors/sponsor-name-logo.png
    const sponsorPath = contentPath.replace('/content/sponsors/', '');
    const pathParts = sponsorPath.split('/');
    if (pathParts.length >= 2) {
      const sponsorSlug = pathParts[0];
      const filename = pathParts[pathParts.length - 1];
      // If it's a logo file, use the flat structure
      if (filename && filename.includes('logo')) {
        return `/images/sponsors/${sponsorSlug}-logo.png`;
      }
    }
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
      return '(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw';
    case 'card':
      return '(max-width: 480px) 95vw, (max-width: 768px) 45vw, (max-width: 1200px) 30vw, 25vw';
    case 'thumbnail':
      return '(max-width: 480px) 40vw, (max-width: 768px) 25vw, 15vw';
    case 'gallery':
      return '(max-width: 480px) 100vw, (max-width: 768px) 95vw, (max-width: 1024px) 50vw, 33vw';
    case 'banner':
      return '100vw';
    case 'full':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1024px';
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

/**
 * Generate responsive image srcSet for different sizes and formats
 * Part of Phase 2 Performance Optimization
 * 
 * @param basePath - Base image path without extension
 * @param role - Image role determining which sizes to generate
 * @param format - Image format (webp, avif, jpg)
 * @returns srcSet string for the specified format
 */
export function getResponsiveImageSrcSet(
  basePath: string, 
  role: 'hero' | 'gallery' | 'thumbnail' | 'card',
  format: 'webp' | 'avif' | 'jpg' = 'webp'
): string {
  const sizes = {
    hero: [640, 1024, 1920, 2560],
    gallery: [400, 640, 1024, 1280],
    thumbnail: [200, 400, 600],
    card: [300, 600, 900]
  };
  
  const imageSizes = sizes[role];
  const baseName = basePath.replace(/\.[^/.]+$/, ''); // Remove extension
  
  // Generate srcSet for the specified format
  const srcSet = imageSizes
    .map(size => `${baseName}-${size}w.${format} ${size}w`)
    .join(', ');
    
  return srcSet;
}

/**
 * Get complete responsive image sources for modern picture element
 * Provides AVIF, WebP, and fallback sources with appropriate srcSets
 * 
 * @param basePath - Base image path
 * @param role - Image role for sizing
 * @returns Object with AVIF, WebP, fallback sources and sizes
 */
export function getResponsiveImageSources(basePath: string, role: 'hero' | 'gallery' | 'thumbnail' | 'card') {
  const sizes = getImageSizes(role);
  
  return {
    avif: getResponsiveImageSrcSet(basePath, role, 'avif'),
    webp: getResponsiveImageSrcSet(basePath, role, 'webp'),
    fallback: basePath,
    sizes
  };
}

/**
 * Detect if user is on a mobile device
 * Uses multiple heuristics for better detection
 * 
 * @returns boolean indicating if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check viewport width
  const isMobileViewport = window.innerWidth <= 768;
  
  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUserAgent = /mobi|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileViewport || (isMobileUserAgent && isTouchDevice);
}

/**
 * Get mobile-optimized image path
 * Returns smaller, more compressed variants for mobile devices
 * Part of Phase 4 Mobile Optimization
 * 
 * @param imagePath - Original image path
 * @param role - Image role for appropriate sizing
 * @param forceOptimization - Force mobile optimization regardless of device detection
 * @returns Optimized path for mobile devices
 */
export function getMobileOptimizedPath(
  imagePath: string, 
  role: 'hero' | 'gallery' | 'thumbnail' | 'card' = 'gallery',
  forceOptimization: boolean = false
): string {
  // For mobile devices or when forced, prefer smaller, more compressed variants
  if (forceOptimization || isMobileDevice()) {
    const baseName = imagePath.replace(/\.[^/.]+$/, '');
    
    // Choose appropriate mobile size based on role with more aggressive optimization
    const mobileSize = role === 'hero' ? '1024w' : 
                     role === 'gallery' ? '640w' :
                     role === 'card' ? '400w' : '200w'; // Smaller for thumbnails
    
    return `${baseName}-${mobileSize}.webp`;
  }
  return imagePath;
}

/**
 * Get connection and device-aware image path
 * Combines mobile detection with connection awareness for optimal image serving
 * 
 * @param imagePath - Original image path
 * @param role - Image role for appropriate sizing
 * @param connectionType - Connection speed type
 * @returns Optimized path based on device and connection
 */
export function getAdaptiveImagePath(
  imagePath: string,
  role: 'hero' | 'gallery' | 'thumbnail' | 'card' = 'gallery',
  connectionType: 'slow' | 'fast' | 'unknown' = 'unknown'
): string {
  const baseName = imagePath.replace(/\.[^/.]+$/, '');
  
  // Determine optimal size based on device and connection
  let size: string;
  
  // Check if it's mobile device (if window is available)
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false;
  
  if (connectionType === 'slow' || isMobile) {
    // Use smaller sizes for slow connections or mobile
    size = role === 'hero' ? '640w' : 
           role === 'gallery' ? '400w' :
           role === 'card' ? '300w' : '200w';
  } else {
    // Use larger sizes for fast connections on desktop
    size = role === 'hero' ? '1920w' : 
           role === 'gallery' ? '1024w' :
           role === 'card' ? '600w' : '400w';
  }
  
  // Choose format based on connection speed
  const format = connectionType === 'slow' ? 'webp' : 'avif';
  
  return `${baseName}-${size}.${format}`;
}

/**
 * Check if responsive variants exist for an image
 * Helps determine if we should use responsive loading or fallback
 * 
 * @param imagePath - Path to check for variants
 * @param role - Image role to check appropriate sizes
 * @returns boolean indicating if responsive variants are available
 */
export function hasResponsiveVariants(imagePath: string, _role?: 'hero' | 'gallery' | 'thumbnail' | 'card'): boolean {
  // This is a simplified check - in production you might want to actually verify file existence
  // For now, we assume variants exist for tapestry images since we generated them
  const baseName = imagePath.replace(/\.[^/.]+$/, '');
  const isOriginalTapestryImage = baseName.includes('/tapestries/') && 
    !baseName.includes('-640w') && 
    !baseName.includes('-1024w') &&
    !baseName.includes('-1920w') &&
    !baseName.includes('-2560w') &&
    !baseName.includes('-400w') &&
    !baseName.includes('-1280w') &&
    !baseName.includes('-200w') &&
    !baseName.includes('-600w') &&
    !baseName.includes('-300w') &&
    !baseName.includes('-900w');
  
  // Role parameter is available for future use when we might want different logic per role
  return isOriginalTapestryImage;
}

/**
 * Get the optimal image format based on browser support
 * Returns the best supported format for the current browser
 * 
 * @returns Preferred image format
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'webp'; // Default for SSR
  
  // Check for AVIF support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const avifSupported = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (avifSupported) return 'avif';
  
  // Check for WebP support
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (webpSupported) return 'webp';
  
  return 'jpg';
}