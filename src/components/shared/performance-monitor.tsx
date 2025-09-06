'use client';

import { useEffect, useState } from 'react';
import {
  getPerformanceMonitor,
  type PerformanceMetric,
  type WebVitalsMetrics,
} from '@/lib/performance';

interface PerformanceMonitorProps {
  /**
   * Whether to show the performance widget in development
   */
  showWidget?: boolean;
  /**
   * Custom callback when metrics are received
   */
  onMetric?: (metric: PerformanceMetric) => void;
}

/**
 * PerformanceMonitor component for tracking Core Web Vitals
 *
 * Usage:
 * ```tsx
 * // In your root layout or app component
 * <PerformanceMonitor showWidget={process.env['NODE_ENV'] === 'development'} />
 * ```
 */
export function PerformanceMonitor({
  showWidget = false,
  onMetric,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const monitor = getPerformanceMonitor();

    // Set up metric callback
    monitor.onMetric((metric) => {
      setMetrics((prev) => ({
        ...prev,
        [metric.name]: metric,
      }));

      if (onMetric) {
        onMetric(metric);
      }
    });
  }, [onMetric]);

  // Don't render widget in production or if not enabled
  if (!showWidget || process.env['NODE_ENV'] === 'production') {
    return null;
  }

  const summary = Object.values(metrics);
  const hasMetrics = summary.length > 0;

  return (
    <>
      {/* Performance widget toggle */}
      <div className="fixed bottom-4 right-4 z-50" style={{ zIndex: 9999 }}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          title="Toggle Performance Monitor"
        >
          ⚡ {hasMetrics ? summary.length : 0}
        </button>
      </div>

      {/* Performance widget */}
      {isVisible && (
        <div
          className="fixed bottom-16 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 max-w-sm"
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {!hasMetrics ? (
              <p className="text-sm text-gray-500">Loading metrics...</p>
            ) : (
              <>
                {Object.entries(metrics).map(([name, metric]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getMetricColor(metric.rating)}`}
                      />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">
                        {formatMetricValue(name, metric.value)}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {metric.rating.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Score</span>
                    <span
                      className={`font-semibold ${getOverallScoreColor(summary)}`}
                    >
                      {getOverallScore(summary)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Get color class for metric rating
 */
function getMetricColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'bg-green-500';
    case 'needs-improvement':
      return 'bg-yellow-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Format metric value for display
 */
function formatMetricValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Calculate overall performance score
 */
function getOverallScore(metrics: PerformanceMetric[]): number {
  if (metrics.length === 0) return 0;

  const scores = metrics.map((metric) => {
    switch (metric.rating) {
      case 'good':
        return 100;
      case 'needs-improvement':
        return 60;
      case 'poor':
        return 20;
      default:
        return 0;
    }
  });

  const average =
    scores.reduce((sum, score) => sum + score, 0 as number) / scores.length;
  return Math.round(average) as 0 | 20 | 60 | 100;
}

/**
 * Get color class for overall score
 */
function getOverallScoreColor(metrics: PerformanceMetric[]): string {
  const score = getOverallScore(metrics);

  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Hook for using performance metrics in components
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});

  useEffect(() => {
    const monitor = getPerformanceMonitor();

    monitor.onMetric((metric) => {
      setMetrics((prev) => ({
        ...prev,
        [metric.name]: metric,
      }));
    });

    // Get current metrics
    setMetrics(monitor.getMetrics());
  }, []);

  return metrics;
}

export default PerformanceMonitor;
