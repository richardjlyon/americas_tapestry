'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface SceneErrorBoundaryProps {
  /** Rendered in place of the children once an error is caught. */
  fallback: ReactNode;
  /** Optional hook for logging / monitoring the caught error. */
  onError?: (error: Error) => void;
  /**
   * When any value in this array changes, the boundary clears its error state
   * and retries its children — used to re-attempt asset loads after a WebGL
   * context restore or a manual retry.
   */
  resetKeys?: readonly unknown[];
  children: ReactNode;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

function keysChanged(
  a: readonly unknown[] | undefined,
  b: readonly unknown[] | undefined,
): boolean {
  if (a === b) return false;
  if (!a || !b || a.length !== b.length) return true;
  return a.some((value, i) => !Object.is(value, b[i]));
}

/**
 * Fault-isolation boundary for the 3D gallery.
 *
 * A rejected asset load (e.g. a CORS-blocked R2 texture) throws through
 * React's <Suspense> — Suspense only catches *pending* promises, not
 * *rejections* — so without a boundary a single failed texture unmounts the
 * whole gallery to the route error page. Wrapping each texture-loading subtree
 * lets one failure fall back to its placeholder while the rest of the room
 * stays alive.
 *
 * Renderer-agnostic: React class boundaries work inside the R3F reconciler
 * (the fallback is a scene node) exactly as they do in the DOM (the fallback is
 * markup), so the same component guards individual meshes and the whole Canvas.
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  override state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[gallery] asset subtree failed — showing fallback:', error, info);
    }
  }

  override componentDidUpdate(prevProps: SceneErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      keysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ hasError: false });
    }
  }

  override render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
