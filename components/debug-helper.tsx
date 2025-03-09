"use client";

import { useEffect } from "react";

export function DebugHelper() {
  useEffect(() => {
    // Override console.error to capture all errors and log them to the server
    const originalError = console.error;
    console.error = (...args) => {
      // Log to the original console.error
      originalError.apply(console, args);
      
      // Send detailed error to the server console
      const errorDetails = args.map(arg => {
        if (arg instanceof Error) {
          return {
            message: arg.message,
            stack: arg.stack,
            name: arg.name,
            cause: arg.cause
          };
        }
        return arg;
      });
      
      // Log error to server via fetch - this will show in terminal
      fetch('/api/debug-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: errorDetails }),
      }).catch(e => {
        // Don't do anything if the debug route fails
      });
    };

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });

    // Capture runtime errors
    window.addEventListener('error', (event) => {
      console.error('Runtime Error:', event.error);
    });

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}