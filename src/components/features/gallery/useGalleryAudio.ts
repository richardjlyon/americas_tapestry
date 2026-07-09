'use client';

/**
 * useGalleryAudio — singleton audio player for the tapestry narrations.
 *
 * One module-level HTMLAudioElement, created lazily INSIDE play() so the
 * element is constructed and started synchronously in the user-gesture call
 * stack (iOS autoplay rule). Progress updates are throttled to ~4 Hz and
 * delivered only to useGalleryAudioProgress() subscribers (the HUD audio
 * card), so ticks never re-render the Canvas subtree. stop() and track
 * switches apply a 150ms volume fade-out (rAF ramp); a pending-track token
 * keeps toggle()/stop() during that fade from desyncing UI and element.
 * StrictMode-safe: the element lives at module level (double-invoked
 * effects can't spawn two players) and unmount cleanup only pauses — it
 * never destroys the element.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AudioProgress, GalleryAudio } from './types';

const FADE_MS = 150;
const PROGRESS_THROTTLE_MS = 250;

/** Callbacks the active hook instance registers with the singleton. */
interface AudioSubscriber {
  onEnded: () => void;
  onError: () => void;
  onPlayState: (paused: boolean) => void;
}

/** Progress callbacks (separate so ticks only reach the audio card). */
interface ProgressSubscriber {
  onTime: (t: number) => void;
  onDuration: (d: number) => void;
}

let audioEl: HTMLAudioElement | null = null;
let currentSlug: string | null = null;
let subscriber: AudioSubscriber | null = null;
const progressSubscribers = new Set<ProgressSubscriber>();
let fadeRaf = 0;
/** Track queued behind an outgoing fade; null once it actually starts. */
let pendingTrack: { slug: string; url: string } | null = null;

function emitTime(t: number): void {
  for (const sub of progressSubscribers) sub.onTime(t);
}

function emitDuration(d: number): void {
  for (const sub of progressSubscribers) sub.onDuration(d);
}

function getAudio(): HTMLAudioElement {
  if (audioEl) return audioEl;
  const el = new Audio();
  el.preload = 'auto';
  let lastEmit = 0;
  el.addEventListener('timeupdate', () => {
    const now = performance.now();
    if (now - lastEmit < PROGRESS_THROTTLE_MS) return;
    lastEmit = now;
    emitTime(el.currentTime);
  });
  el.addEventListener('durationchange', () => {
    if (Number.isFinite(el.duration)) emitDuration(el.duration);
  });
  el.addEventListener('ended', () => {
    emitTime(0);
    subscriber?.onEnded();
  });
  el.addEventListener('error', () => subscriber?.onError());
  el.addEventListener('play', () => subscriber?.onPlayState(false));
  el.addEventListener('pause', () => subscriber?.onPlayState(true));
  audioEl = el;
  return el;
}

function cancelFade(): void {
  if (fadeRaf !== 0) {
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
  }
}

/** Ramp volume to 0 over FADE_MS, then pause, restore volume, and call done. */
function fadeOutThen(el: HTMLAudioElement, done: () => void): void {
  cancelFade();
  const startVolume = el.volume;
  const t0 = performance.now();
  const step = (): void => {
    const k = (performance.now() - t0) / FADE_MS;
    if (k >= 1 || el.paused) {
      fadeRaf = 0;
      el.pause();
      el.volume = 1;
      done();
      return;
    }
    el.volume = startVolume * (1 - k);
    fadeRaf = requestAnimationFrame(step);
  };
  fadeRaf = requestAnimationFrame(step);
}

export function useGalleryAudio(): GalleryAudio {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    subscriber = {
      onEnded: () => setPaused(true),
      onError: () => {
        currentSlug = null;
        pendingTrack = null;
        setPaused(true);
        setNowPlaying(null);
      },
      onPlayState: setPaused,
    };
    // Re-sync with the singleton after a remount (StrictMode / fast refresh).
    if (audioEl && currentSlug) {
      setNowPlaying(currentSlug);
      setPaused(audioEl.paused);
    }
    return () => {
      subscriber = null;
      audioEl?.pause(); // pause only — never destroy the singleton
    };
  }, []);

  const play = useCallback((slug: string, url: string) => {
    const el = getAudio();
    cancelFade();
    if (currentSlug === slug && pendingTrack === null) {
      // Same track: resume if paused, otherwise leave it playing.
      el.volume = 1;
      if (el.paused) {
        void el.play().catch(() => subscriber?.onError());
      }
      return;
    }
    const wasPlaying = !el.paused;
    currentSlug = slug;
    pendingTrack = null;
    setNowPlaying(slug);
    setPaused(false);
    emitTime(0);
    emitDuration(0);
    const startNew = (): void => {
      el.src = url;
      el.currentTime = 0;
      el.volume = 1;
      void el.play().catch(() => subscriber?.onError());
    };
    if (wasPlaying) {
      // Fade the outgoing track first. The element is already
      // gesture-unlocked, so the deferred play() is still permitted.
      pendingTrack = { slug, url };
      fadeOutThen(el, () => {
        // A later play()/toggle()/stop() supersedes this switch.
        if (pendingTrack?.slug !== slug) return;
        pendingTrack = null;
        startNew();
      });
    } else {
      startNew();
    }
  }, []);

  const toggle = useCallback(() => {
    const el = audioEl;
    if (!el || currentSlug === null) return;
    cancelFade();
    if (pendingTrack) {
      // Pause pressed mid track-switch fade: land the new track, paused
      // at 0:00, so UI state and element stay in sync.
      el.pause();
      el.src = pendingTrack.url;
      el.currentTime = 0;
      el.volume = 1;
      pendingTrack = null;
      return;
    }
    el.volume = 1;
    if (el.paused) {
      void el.play().catch(() => subscriber?.onError());
    } else {
      el.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const el = audioEl;
    currentSlug = null;
    pendingTrack = null;
    setNowPlaying(null);
    setPaused(true);
    emitTime(0);
    emitDuration(0);
    if (!el) return;
    cancelFade();
    if (el.paused) {
      el.currentTime = 0;
      return;
    }
    fadeOutThen(el, () => {
      el.currentTime = 0;
    });
  }, []);

  const seek = useCallback((t: number) => {
    const el = audioEl;
    if (!el || currentSlug === null) return;
    el.currentTime = t;
    emitTime(t);
  }, []);

  // Stable identity while playback state is unchanged, so effects that
  // depend on the audio object don't re-register every render.
  return useMemo(
    () => ({ nowPlaying, paused, play, toggle, stop, seek }),
    [nowPlaying, paused, play, toggle, stop, seek],
  );
}

/**
 * Playback progress/duration at ~4 Hz. Subscribe from the component that
 * actually displays it (the HUD audio card) so ticks re-render only that
 * subtree.
 */
export function useGalleryAudioProgress(): AudioProgress {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const sub: ProgressSubscriber = {
      onTime: setProgress,
      onDuration: setDuration,
    };
    progressSubscribers.add(sub);
    // Re-sync after a remount (StrictMode / fast refresh).
    if (audioEl && currentSlug) {
      setProgress(audioEl.currentTime);
      if (Number.isFinite(audioEl.duration)) setDuration(audioEl.duration);
    }
    return () => {
      progressSubscribers.delete(sub);
    };
  }, []);

  return { progress, duration };
}
