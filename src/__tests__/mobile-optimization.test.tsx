/**
 * Mobile Optimization Tests
 * Tests for Phase 4 mobile optimization features including:
 * - Connection-aware loading
 * - Mobile device detection
 * - Adaptive image serving
 * - Responsive image utilities
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the components and utilities to test
import { OptimizedImage } from '@/components/ui/optimized-image';
import { 
  useConnectionAware, 
  getConnectionAwareQuality, 
  getConnectionAwareFormat,
  getConnectionAwareStrategy 
} from '@/hooks/use-connection-aware';
import {
  isMobileDevice,
  getMobileOptimizedPath,
  getAdaptiveImagePath,
  getImageSizes
} from '@/lib/image-utils';

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, onLoad, onError, className, priority, quality, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="optimized-image"
      data-priority={priority?.toString()}
      data-quality={quality?.toString()}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
  MockImage.displayName = 'MockImage';
  return {
    __esModule: true,
    default: MockImage,
  };
});

// Mock window properties for different test scenarios
const mockWindowProperties = (properties: Partial<Window & { connection?: any }>) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: properties.innerWidth || 1024,
  });
  
  if (properties.connection !== undefined) {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: properties.connection,
    });
  }
  
  if ('userAgent' in properties) {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: properties.userAgent,
    });
  }
};

describe('Mobile Device Detection', () => {
  beforeEach(() => {
    // Reset window properties
    mockWindowProperties({});
  });

  test('detects mobile viewport correctly', () => {
    mockWindowProperties({ innerWidth: 480 });
    expect(isMobileDevice()).toBe(true);
  });

  test('detects desktop viewport correctly', () => {
    mockWindowProperties({ innerWidth: 1024 });
    expect(isMobileDevice()).toBe(false);
  });

  test('detects mobile user agent', () => {
    mockWindowProperties({ 
      innerWidth: 1024,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    } as any);
    
    // Mock touch capability
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: true,
    });
    
    expect(isMobileDevice()).toBe(true);
  });

  test('detects Android device', () => {
    mockWindowProperties({ 
      innerWidth: 1024,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)'
    } as any);
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
    
    expect(isMobileDevice()).toBe(true);
  });
});

describe('Connection-Aware Hook', () => {
  beforeEach(() => {
    // Clean up navigator.connection and reset window properties
    delete (navigator as any).connection;
    mockWindowProperties({ innerWidth: 1024 });
  });

  test('returns unknown connection type when API not available', () => {
    // Ensure mobile detection returns false
    mockWindowProperties({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any);
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
    
    const { result } = renderHook(() => useConnectionAware());
    expect(result.current.type).toBe('unknown');
  });

  test('detects slow connection (2G)', () => {
    mockWindowProperties({
      connection: {
        effectiveType: '2g',
        downlink: 0.5,
        rtt: 400,
        saveData: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    const { result } = renderHook(() => useConnectionAware());
    
    // Wait for useEffect to run
    expect(result.current.type).toBe('slow');
    expect(result.current.effectiveType).toBe('2g');
  });

  test('detects fast connection (4G)', () => {
    mockWindowProperties({
      connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    const { result } = renderHook(() => useConnectionAware());
    expect(result.current.type).toBe('fast');
  });

  test('detects save data mode as slow connection', () => {
    mockWindowProperties({
      connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    const { result } = renderHook(() => useConnectionAware());
    expect(result.current.type).toBe('slow');
  });
});

describe('Connection-Aware Strategies', () => {
  test('getConnectionAwareQuality adjusts quality for slow connections', () => {
    expect(getConnectionAwareQuality('slow', 80)).toBe(60);
    expect(getConnectionAwareQuality('fast', 80)).toBe(80);
    expect(getConnectionAwareQuality('unknown', 80)).toBe(75);
  });

  test('getConnectionAwareFormat prefers efficient formats for slow connections', () => {
    // Mock canvas for format detection
    const mockCanvas = {
      width: 1,
      height: 1,
      toDataURL: jest.fn()
        .mockReturnValueOnce('data:image/webp;base64,') // WebP supported for slow
        .mockReturnValueOnce('data:image/avif;base64,') // AVIF supported for fast
        .mockReturnValueOnce('data:image/webp;base64,') // WebP supported for fast fallback
    };
    
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockReturnValue(mockCanvas);

    expect(getConnectionAwareFormat('slow')).toBe('webp');
    expect(getConnectionAwareFormat('fast')).toBe('avif');
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  test('getConnectionAwareStrategy provides comprehensive configuration', () => {
    const slowStrategy = getConnectionAwareStrategy({ type: 'slow', saveData: true });
    const fastStrategy = getConnectionAwareStrategy({ type: 'fast', saveData: false });

    expect(slowStrategy.quality).toBeLessThan(fastStrategy.quality);
    expect(slowStrategy.enablePreloading).toBe(false);
    expect(fastStrategy.enablePreloading).toBe(true);
    expect(slowStrategy.intersectionMargin).toBe('100px');
    expect(fastStrategy.intersectionMargin).toBe('50px');
  });
});

describe('Mobile-Optimized Image Paths', () => {
  beforeEach(() => {
    mockWindowProperties({ 
      innerWidth: 1024,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any);
    
    // Ensure touch is not detected
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  test('getMobileOptimizedPath returns original path for desktop', () => {
    const originalPath = '/images/tapestries/south-carolina/south-carolina-tapestry-main.jpg';
    const result = getMobileOptimizedPath(originalPath, 'hero');
    expect(result).toBe(originalPath);
  });

  test('getMobileOptimizedPath returns optimized path for mobile', () => {
    mockWindowProperties({ innerWidth: 480 });
    
    const originalPath = '/images/tapestries/south-carolina/south-carolina-tapestry-main.jpg';
    const result = getMobileOptimizedPath(originalPath, 'hero');
    expect(result).toBe('/images/tapestries/south-carolina/south-carolina-tapestry-main-1024w.webp');
  });

  test('getMobileOptimizedPath handles different roles correctly', () => {
    mockWindowProperties({ innerWidth: 480 });
    
    const basePath = '/images/tapestries/test.jpg';
    
    expect(getMobileOptimizedPath(basePath, 'hero')).toContain('-1024w.webp');
    expect(getMobileOptimizedPath(basePath, 'gallery')).toContain('-640w.webp');
    expect(getMobileOptimizedPath(basePath, 'card')).toContain('-400w.webp');
    expect(getMobileOptimizedPath(basePath, 'thumbnail')).toContain('-200w.webp');
  });

  test('getAdaptiveImagePath combines device and connection awareness', () => {
    const basePath = '/images/tapestries/test.jpg';
    
    // Test on desktop (non-mobile)
    mockWindowProperties({ 
      innerWidth: 1920,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any);
    
    const slowResult = getAdaptiveImagePath(basePath, 'hero', 'slow');
    const fastResult = getAdaptiveImagePath(basePath, 'hero', 'fast');
    
    expect(slowResult).toContain('-640w.webp');
    expect(fastResult).toContain('-1920w.avif');
  });
});

describe('Responsive Image Sizes', () => {
  test('getImageSizes returns correct sizes for different roles', () => {
    expect(getImageSizes('hero')).toBe('100vw');
    expect(getImageSizes('gallery')).toContain('480px');
    expect(getImageSizes('card')).toContain('95vw');
    expect(getImageSizes('thumbnail')).toContain('40vw');
  });

  test('getImageSizes includes mobile-first breakpoints', () => {
    const gallerySize = getImageSizes('gallery');
    expect(gallerySize).toContain('(max-width: 480px)');
    expect(gallerySize).toContain('(max-width: 768px)');
    expect(gallerySize).toContain('(max-width: 1024px)');
  });
});

describe('OptimizedImage Component', () => {
  let mockIntersectionObserver: jest.Mock;
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(() => {
    // Clean up any existing mocks
    jest.clearAllMocks();
    
    // Mock IntersectionObserver
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    mockIntersectionObserver = jest.fn().mockImplementation((_callback) => ({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
    }));
    
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: mockIntersectionObserver,
    });

    // Mock document.createElement for blur placeholder generation
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 1,
          height: 1,
          toDataURL: jest.fn().mockReturnValue('data:image/svg+xml;base64,mocked'),
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    // Reset window properties for clean test state
    mockWindowProperties({ 
      innerWidth: 1024,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any);
    
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    // Restore original createElement
    const originalCreateElement = document.createElement;
    document.createElement = originalCreateElement;
  });

  test('renders with basic props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={true}
      />
    );

    expect(screen.getByTestId('optimized-image')).toBeInTheDocument();
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-image')).toHaveAttribute('src', '/test-image.jpg');
  });

  test('applies connection-aware quality', () => {
    // Mock slow connection
    mockWindowProperties({
      connection: {
        effectiveType: '2g',
        downlink: 0.5,
        saveData: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={true}
      />
    );

    const image = screen.getByTestId('optimized-image');
    
    // Should have quality attribute set by connection-aware logic
    expect(image).toHaveAttribute('data-quality');
    const quality = image.getAttribute('data-quality');
    expect(parseInt(quality || '0')).toBeLessThan(70); // Slow connection = lower quality
  });

  test('shows skeleton placeholder when not in view', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={false}
      />
    );

    // Should render skeleton initially (before intersection observer triggers)
    const container = screen.getByRole('img', { name: /loading test image/i });
    expect(container).toHaveClass('animate-pulse');
    expect(container).toHaveClass('bg-gray-200');
  });

  test('respects priority prop for immediate loading', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={true}
      />
    );

    // Should render image immediately when priority is true
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-priority', 'true');
  });

  test('handles error state gracefully', async () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test image"
        role="gallery"
        showErrorMessage={true}
        fallbackSrc="/also-non-existent.jpg"
        priority={true}
      />
    );

    let image = screen.getByTestId('optimized-image');
    
    // Simulate first image error (should try fallback)
    fireEvent.error(image);

    // Wait for fallback to be attempted
    await waitFor(() => {
      const updatedImage = screen.getByTestId('optimized-image');
      expect(updatedImage).toHaveAttribute('src', '/also-non-existent.jpg');
    });

    // Simulate fallback image error (should show error message)
    image = screen.getByTestId('optimized-image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  test('falls back to fallback image on error', async () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test image"
        role="gallery"
        fallbackSrc="/fallback.jpg"
        priority={true}
      />
    );

    const image = screen.getByTestId('optimized-image');
    
    // Simulate image error
    fireEvent.error(image);

    await waitFor(() => {
      const updatedImage = screen.getByTestId('optimized-image');
      expect(updatedImage).toHaveAttribute('src', '/fallback.jpg');
    });
  });

  test('uses intersection observer for lazy loading', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={false}
      />
    );

    // IntersectionObserver should be called
    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  test('does not use intersection observer for priority images', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={true}
      />
    );

    // IntersectionObserver should not be used for priority images
    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  test('applies connection-aware intersection margins', () => {
    // Mock slow connection
    mockWindowProperties({
      connection: {
        effectiveType: '2g',
        saveData: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        role="gallery"
        priority={false}
      />
    );

    // Should use larger margin for slow connections
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '100px' // Slow connection = larger margin
      })
    );
  });
});

describe('Integration Tests', () => {
  test('mobile device with slow connection uses most aggressive optimization', () => {
    mockWindowProperties({ 
      innerWidth: 480,
      connection: {
        effectiveType: '2g',
        saveData: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    } as any);

    const basePath = '/images/tapestries/test.jpg';
    const result = getAdaptiveImagePath(basePath, 'hero', 'slow');
    
    expect(result).toContain('-640w.webp');
  });

  test('desktop with fast connection uses high quality optimization', () => {
    mockWindowProperties({ 
      innerWidth: 1920,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any);
    
    // Ensure not mobile
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const basePath = '/images/tapestries/test.jpg';
    const result = getAdaptiveImagePath(basePath, 'hero', 'fast');
    
    expect(result).toContain('-1920w.avif');
  });
});

describe('Performance Validation', () => {
  test('connection-aware strategy reduces resource usage for slow connections', () => {
    const slowStrategy = getConnectionAwareStrategy({ type: 'slow', saveData: true });
    const fastStrategy = getConnectionAwareStrategy({ type: 'fast', saveData: false });

    // Slow connections should have:
    expect(slowStrategy.quality).toBeLessThan(70); // Lower quality
    expect(slowStrategy.enablePreloading).toBe(false); // No preloading
    expect(slowStrategy.preferSmallerSizes).toBe(true); // Smaller images
    expect(slowStrategy.intersectionMargin).toBe('100px'); // Larger margin

    // Fast connections should have:
    expect(fastStrategy.quality).toBeGreaterThan(75); // Higher quality
    expect(fastStrategy.enablePreloading).toBe(true); // Preloading enabled
    expect(fastStrategy.preferSmallerSizes).toBe(false); // Full-size images
    expect(fastStrategy.intersectionMargin).toBe('50px'); // Smaller margin
  });

  test('mobile optimizations reduce bandwidth usage', () => {
    mockWindowProperties({ innerWidth: 480 });
    
    const mobilePath = getMobileOptimizedPath('/test.jpg', 'hero');
    
    // Mobile should use smaller variants
    expect(mobilePath).toContain('-1024w'); // Smaller than desktop
    expect(mobilePath).toContain('.webp'); // Efficient format
  });
});