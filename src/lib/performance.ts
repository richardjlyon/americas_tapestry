/**
 * Performance monitoring utilities for tracking Core Web Vitals
 * and other performance metrics in the America's Tapestry website
 */

// Declare gtag global function
declare global {
  function gtag(...args: any[]): void;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  timestamp: number;
}

export interface WebVitalsMetrics {
  FCP?: PerformanceMetric; // First Contentful Paint
  LCP?: PerformanceMetric; // Largest Contentful Paint
  CLS?: PerformanceMetric; // Cumulative Layout Shift
  FID?: PerformanceMetric; // First Input Delay
  INP?: PerformanceMetric; // Interaction to Next Paint
  TTFB?: PerformanceMetric; // Time to First Byte
}

/**
 * Get performance rating based on metric thresholds
 */
function getPerformanceRating(
  name: string,
  value: number,
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    FCP: { good: 1800, poor: 3000 }, // milliseconds
    LCP: { good: 2500, poor: 4000 }, // milliseconds
    CLS: { good: 0.1, poor: 0.25 }, // score
    FID: { good: 100, poor: 300 }, // milliseconds
    INP: { good: 200, poor: 500 }, // milliseconds
    TTFB: { good: 800, poor: 1800 }, // milliseconds
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track and report Web Vitals metrics
 */
export function trackWebVitals(onMetric: (metric: PerformanceMetric) => void) {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Import web-vitals dynamically to avoid SSR issues
  import('web-vitals')
    .then(({ onCLS, onFCP, onFID, onINP, onLCP, onTTFB }) => {
      const handleMetric = (metric: any) => {
        const performanceMetric: PerformanceMetric = {
          name: metric.name,
          value: metric.value,
          rating: getPerformanceRating(metric.name, metric.value),
          delta: metric.delta,
          id: metric.id,
          timestamp: Date.now(),
        };

        onMetric(performanceMetric);
      };

      // Track all Core Web Vitals
      onCLS(handleMetric);
      onFCP(handleMetric);
      onFID(handleMetric);
      onINP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
    })
    .catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
}

/**
 * Log performance metrics to console (development)
 */
export function logPerformanceMetric(metric: PerformanceMetric) {
  if (process.env['NODE_ENV'] !== 'development') return;

  const emoji =
    metric.rating === 'good'
      ? '🟢'
      : metric.rating === 'needs-improvement'
        ? '🟡'
        : '🔴';
  console.log(
    `${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`,
    metric,
  );
}

/**
 * Send performance metrics to analytics service
 * Replace with your preferred analytics service
 */
export function sendToAnalytics(metric: PerformanceMetric) {
  // Example: Send to Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: {
        metric_rating: metric.rating,
      },
    });
  }

  // Example: Send to Vercel Analytics
  if (typeof window !== 'undefined' && 'va' in window) {
    (window as any).va.track('Web Vitals', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Performance monitoring hook for React components
 */
export class PerformanceMonitor {
  private metrics: WebVitalsMetrics = {};
  private callbacks: Array<(metric: PerformanceMetric) => void> = [];

  constructor(
    options: {
      enableLogging?: boolean;
      enableAnalytics?: boolean;
    } = {},
  ) {
    const { enableLogging = false, enableAnalytics = false } = options;

    trackWebVitals((metric) => {
      this.metrics[metric.name as keyof WebVitalsMetrics] = metric;

      if (enableLogging) {
        logPerformanceMetric(metric);
      }

      if (enableAnalytics) {
        sendToAnalytics(metric);
      }

      // Execute custom callbacks
      this.callbacks.forEach((callback) => callback(metric));
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
  } {
    const metrics = Object.values(this.metrics);
    const summary = {
      good: metrics.filter((m) => m.rating === 'good').length,
      needsImprovement: metrics.filter((m) => m.rating === 'needs-improvement')
        .length,
      poor: metrics.filter((m) => m.rating === 'poor').length,
      total: metrics.length,
    };

    return summary;
  }

  /**
   * Add callback for metric updates
   */
  onMetric(callback: (metric: PerformanceMetric) => void) {
    this.callbacks.push(callback);
  }

  /**
   * Check if all Core Web Vitals are "good"
   */
  hasGoodVitals(): boolean {
    const coreMetrics = ['LCP', 'FID', 'CLS'] as const;
    return coreMetrics.every((metric) => {
      const m = this.metrics[metric];
      return m && m.rating === 'good';
    });
  }
}

/**
 * Image loading performance tracker
 */
export class ImagePerformanceTracker {
  private loadTimes: Map<string, number> = new Map();
  private failedImages: Set<string> = new Set();

  /**
   * Track image load start
   */
  startImageLoad(src: string) {
    this.loadTimes.set(src, Date.now());
  }

  /**
   * Track image load completion
   */
  completeImageLoad(src: string): number {
    const startTime = this.loadTimes.get(src);
    if (!startTime) return 0;

    const loadTime = Date.now() - startTime;
    this.loadTimes.delete(src);

    if (process.env['NODE_ENV'] === 'development') {
      console.log(`Image loaded: ${src} (${loadTime}ms)`);
    }

    return loadTime;
  }

  /**
   * Track image load failure
   */
  failImageLoad(src: string) {
    this.failedImages.add(src);
    this.loadTimes.delete(src);

    if (process.env['NODE_ENV'] === 'development') {
      console.warn(`Image failed to load: ${src}`);
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      activeLoads: this.loadTimes.size,
      failedImages: Array.from(this.failedImages),
      failedCount: this.failedImages.size,
    };
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global performance monitor
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor({
      enableLogging: process.env['NODE_ENV'] === 'development',
      enableAnalytics: process.env['NODE_ENV'] === 'production',
    });
  }
  return globalPerformanceMonitor;
}

/**
 * Simple performance measurement utility
 */
export function measureTime<T>(
  label: string,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  const start = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        if (process.env['NODE_ENV'] === 'development') {
          console.log(`${label}: ${(end - start).toFixed(2)}ms`);
        }
      });
    } else {
      const end = performance.now();
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
      }
      return result;
    }
  } catch (error) {
    const end = performance.now();
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`${label} (error): ${(end - start).toFixed(2)}ms`);
    }
    throw error;
  }
}
