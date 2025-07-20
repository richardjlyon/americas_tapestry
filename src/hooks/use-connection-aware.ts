'use client';

import { useState, useEffect } from 'react';

/**
 * Connection type definitions
 */
export type ConnectionType = 'slow' | 'fast' | 'unknown';

/**
 * Extended connection information
 */
export interface ConnectionInfo {
  type: ConnectionType;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Hook to detect user's connection speed and adapt loading behavior
 * 
 * This hook uses the Network Information API to detect connection speed
 * and provides adaptive loading strategies for better performance on
 * slower connections.
 * 
 * @returns ConnectionInfo object with connection type and details
 */
export function useConnectionAware(): ConnectionInfo {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    type: 'unknown'
  });
  
  useEffect(() => {
    // Check if Network Information API is available
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      const updateConnection = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const rtt = connection.rtt;
        const saveData = connection.saveData;
        
        let type: ConnectionType = 'unknown';
        
        // Classify connection speed
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          type = 'slow';
        } else if (effectiveType === '3g' && downlink < 1.5) {
          type = 'slow';
        } else if (saveData) {
          // User has data saver mode enabled
          type = 'slow';
        } else {
          type = 'fast';
        }
        
        setConnectionInfo({
          type,
          effectiveType,
          downlink,
          rtt,
          saveData
        });
      };
      
      // Initial connection check
      updateConnection();
      
      // Listen for connection changes
      connection.addEventListener('change', updateConnection);
      
      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    } else {
      // Fallback: Use a simple heuristic based on user agent, but prefer unknown
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobi|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      setConnectionInfo({
        type: isMobile ? 'slow' : 'unknown'
      });
      
      // Return undefined cleanup function for consistency
      return undefined;
    }
  }, []);
  
  return connectionInfo;
}

/**
 * Get optimized image quality based on connection speed
 * 
 * @param connectionType - Current connection type
 * @param defaultQuality - Default image quality (default: 80)
 * @returns Optimized quality value
 */
export function getConnectionAwareQuality(
  connectionType: ConnectionType, 
  defaultQuality: number = 80
): number {
  switch (connectionType) {
    case 'slow':
      return Math.min(60, defaultQuality - 20);
    case 'fast':
      return defaultQuality;
    case 'unknown':
    default:
      return Math.min(75, defaultQuality - 5);
  }
}

/**
 * Get preferred image format based on connection speed and browser support
 * 
 * @param connectionType - Current connection type
 * @returns Preferred image format
 */
export function getConnectionAwareFormat(connectionType: ConnectionType): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'webp'; // Default for SSR
  
  // For slow connections, prefer WebP over AVIF for better compatibility and faster decoding
  if (connectionType === 'slow') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const webpDataURL = canvas.toDataURL('image/webp');
      const webpSupported = webpDataURL && webpDataURL.indexOf('data:image/webp') === 0;
      return webpSupported ? 'webp' : 'jpg';
    } catch {
      return 'jpg';
    }
  }
  
  // For fast connections, prefer the most modern format
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const avifDataURL = canvas.toDataURL('image/avif');
    const avifSupported = avifDataURL && avifDataURL.indexOf('data:image/avif') === 0;
    if (avifSupported) return 'avif';
    
    const webpDataURL = canvas.toDataURL('image/webp');
    const webpSupported = webpDataURL && webpDataURL.indexOf('data:image/webp') === 0;
    if (webpSupported) return 'webp';
  } catch {
    // Fallback if canvas operations fail
  }
  
  return 'jpg';
}

/**
 * Get connection-aware loading strategy
 * 
 * @param connectionInfo - Connection information
 * @returns Loading strategy configuration
 */
export function getConnectionAwareStrategy(connectionInfo: ConnectionInfo) {
  const { type, saveData } = connectionInfo;
  
  return {
    // Reduce quality for slow connections
    quality: getConnectionAwareQuality(type),
    
    // Prefer more compatible formats for slow connections
    preferredFormat: getConnectionAwareFormat(type),
    
    // Disable autoplay and reduce animations on slow connections
    enableAnimations: type !== 'slow' && !saveData,
    
    // Use larger intersection observer margins for slow connections
    intersectionMargin: type === 'slow' ? '100px' : '50px',
    
    // Disable preloading on slow connections
    enablePreloading: type !== 'slow' && !saveData,
    
    // Use blur placeholders more aggressively on slow connections
    enableBlurPlaceholder: true,
    
    // Adjust image sizes for slow connections
    preferSmallerSizes: type === 'slow' || saveData
  };
}

export default useConnectionAware;