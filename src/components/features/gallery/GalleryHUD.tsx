'use client';

/**
 * GalleryHUD — DOM overlay for the virtual gallery (sibling of the Canvas,
 * never drei <Html>).
 *
 * Composition (ux-spec §2/§4/§5, SPEC-BUILD trim):
 * - Bottom-right: ‹ › chevrons (56px) + "Virginia · 2 of 16" label-button,
 *   with an "Explore freely" WASD toggle above (desktop pointers only).
 * - Top-right: [?] [VR] [⛶] [☰] 44px cluster; ☰ opens a 320px navy tour
 *   sheet (one row per stop with thumbnails, oxblood current marker, Exit
 *   footer).
 * - Top-left: quiet "← americastapestry.org" exit link.
 * - Bottom-centre: audio card (play/pause, name, seekable progress, time,
 *   transcript disclosure, close) that morphs between states.
 * - Hidden a11y nav of 13 tapestry buttons + one polite aria-live region.
 * - Reduced-motion fade overlay (flights become 200ms fades).
 */

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VIEWPOINTS } from './galleryLayout';
import type { GalleryHUDProps, GalleryTapestryData } from './types';
import { useGalleryAudioProgress } from './useGalleryAudio';

// Palette (SPEC-BUILD): navy #12284C, parchment #F5EFE0, oxblood #8C4A4A —
// applied via Tailwind arbitrary values below.

/** 44px parchment-on-navy icon button (top-right cluster). */
const ICON_BTN =
  'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl ' +
  'bg-[#F5EFE0]/90 text-[#12284C] shadow-[0_2px_8px_rgba(0,0,0,0.25)] ' +
  'transition-colors hover:bg-[#F5EFE0] hover:text-[#8C4A4A] active:scale-95 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0] ' +
  'focus-visible:ring-offset-1 focus-visible:ring-offset-[#12284C]';

/** 40px quiet button inside the navy audio card. */
const CARD_BTN =
  'pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center ' +
  'rounded-lg text-[#F5EFE0]/80 transition-colors hover:bg-white/10 ' +
  'hover:text-[#F5EFE0] focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-[#F5EFE0]';

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Vendor-prefixed fullscreen APIs (Safari / iPadOS ship webkit-only). */
interface WebkitFullscreenDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}
interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

function currentFullscreenElement(): Element | null {
  const doc = document as WebkitFullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

interface AudioCardProps {
  tapestry: GalleryTapestryData;
  slug: string;
  /** This tapestry's audio is the loaded track */
  isLoaded: boolean;
  paused: boolean;
  transcriptOpen: boolean;
  reducedMotion: boolean;
  onToggleTranscript: () => void;
  onToggleAudio: () => void;
  onVisitTapestry: (slug: string) => void;
  onSeekAudio: (t: number) => void;
  onClose: () => void;
}

/**
 * Bottom-centre audio card. Subscribes to playback progress itself
 * (useGalleryAudioProgress) so the ~4 Hz ticks re-render only this card,
 * never the Canvas subtree. Below 716px it docks above the chevron
 * cluster (which would otherwise overlap it).
 */
function AudioCard({
  tapestry,
  slug,
  isLoaded,
  paused,
  transcriptOpen,
  reducedMotion,
  onToggleTranscript,
  onToggleAudio,
  onVisitTapestry,
  onSeekAudio,
  onClose,
}: AudioCardProps): React.ReactElement {
  const { progress, duration } = useGalleryAudioProgress();
  const cardProgress = isLoaded ? progress : 0;
  const cardDuration = isLoaded ? duration : 0;
  const playFraction =
    cardDuration > 0 ? Math.min(1, cardProgress / cardDuration) : 0;

  // Seekable progress bar (24px hit band around a 3px bar). Scrub writes
  // are rAF-throttled so pointermove doesn't hammer audio.currentTime.
  const seekRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const scrubXRef = useRef(0);
  const scrubRafRef = useRef(0);
  const seekToClientX = useCallback(
    (clientX: number) => {
      const el = seekRef.current;
      if (!el || cardDuration <= 0) return;
      const rect = el.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeekAudio(frac * cardDuration);
    },
    [cardDuration, onSeekAudio],
  );
  const scheduleScrub = useCallback(
    (clientX: number) => {
      scrubXRef.current = clientX;
      if (scrubRafRef.current !== 0) return;
      scrubRafRef.current = requestAnimationFrame(() => {
        scrubRafRef.current = 0;
        if (draggingRef.current) seekToClientX(scrubXRef.current);
      });
    },
    [seekToClientX],
  );
  useEffect(() => () => cancelAnimationFrame(scrubRafRef.current), []);

  return (
    <div
      className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(420px,calc(100%-32px))] -translate-x-1/2 rounded-[14px] bg-[#12284C]/95 px-[18px] py-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.35)] max-[715px]:bottom-[calc(env(safe-area-inset-bottom,0px)+88px)]"
      style={
        reducedMotion ? undefined : { animation: 'at-hud-rise 250ms ease-out' }
      }
    >
      {transcriptOpen && (
        <div className="mb-3 max-h-[38vh] overflow-y-auto border-b border-white/15 pb-3 font-serif text-[15px] leading-[1.6] text-[#F5EFE0]">
          {tapestry.transcript}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={
            isLoaded && !paused
              ? `Pause audio description for ${tapestry.name}`
              : `Play audio description for ${tapestry.name}`
          }
          onClick={() => {
            if (isLoaded) onToggleAudio();
            else onVisitTapestry(slug);
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5EFE0] text-[#12284C] transition-colors hover:text-[#8C4A4A] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12284C]"
        >
          {isLoaded && !paused ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="2.5" y="1.5" width="4" height="13" rx="1" />
              <rect x="9.5" y="1.5" width="4" height="13" rx="1" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.5 1.8a1 1 0 0 1 1.52-.85l9.2 5.7a1 1 0 0 1 0 1.7l-9.2 5.7a1 1 0 0 1-1.52-.85V1.8Z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg leading-tight text-[#F5EFE0]">
            {tapestry.name}
          </p>
          <p className="text-xs text-[#F5EFE0]/60">Audio description</p>
        </div>
        <button
          type="button"
          aria-label="Show transcript"
          aria-pressed={transcriptOpen}
          onClick={onToggleTranscript}
          className={CARD_BTN}
        >
          <span className="font-serif text-lg italic" aria-hidden="true">
            T
          </span>
        </button>
        <button
          type="button"
          aria-label="Close audio player"
          onClick={onClose}
          className={CARD_BTN}
        >
          <span className="text-lg" aria-hidden="true">
            ✕
          </span>
        </button>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div
          ref={seekRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek audio"
          aria-valuemin={0}
          aria-valuemax={Math.round(cardDuration)}
          aria-valuenow={Math.round(cardProgress)}
          aria-valuetext={`${formatTime(cardProgress)} of ${formatTime(cardDuration)}`}
          onPointerDown={(e) => {
            if (!isLoaded) return;
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seekToClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) scheduleScrub(e.clientX);
          }}
          onPointerUp={(e) => {
            if (draggingRef.current) seekToClientX(e.clientX);
            draggingRef.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onKeyDown={(e) => {
            if (!isLoaded) return;
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onSeekAudio(Math.max(0, cardProgress - 5));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              onSeekAudio(Math.min(cardDuration, cardProgress + 5));
            }
          }}
          className="flex h-6 flex-1 cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0]"
        >
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#F5EFE0]/20">
            <div
              className="h-full bg-[#8C4A4A]"
              style={{ width: `${playFraction * 100}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-[#F5EFE0]/80 tabular-nums">
          {formatTime(cardProgress)} / {formatTime(cardDuration)}
        </p>
      </div>
      <a
        href={tapestry.buyUrl}
        className="mt-3 flex min-h-[44px] items-center justify-center rounded-full bg-[#8C4A4A] px-5 font-serif text-[15px] text-[#F5EFE0] transition-colors hover:bg-[#7B3F3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0]"
      >
        Buy this tapestry →
      </a>
    </div>
  );
}

export default function GalleryHUD({
  tapestries,
  stopIndex,
  stopCount,
  stopLabel,
  walkMode,
  flying,
  audio,
  vrSupported,
  onPrev,
  onNext,
  onGoTo,
  onVisitTapestry,
  onToggleWalkMode,
  onToggleAudio,
  onStopAudio,
  onSeekAudio,
  onEnterVR,
  onShowHint,
}: GalleryHUDProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const bySlug = useMemo(() => {
    const map = new Map<string, GalleryTapestryData>();
    for (const t of tapestries) map.set(t.slug, t);
    return map;
  }, [tapestries]);

  // The tapestry the audio card describes: whatever is loaded, else the
  // tapestry at the current stop (card persists across chevron navigation,
  // showing "play" at 0:00 for the new stop — ux-spec §4).
  const cardSlug =
    audio.nowPlaying ?? VIEWPOINTS[stopIndex]?.tapestrySlug ?? null;
  const cardTapestry = cardSlug ? bySlug.get(cardSlug) : undefined;
  const cardIsLoaded =
    audio.nowPlaying !== null && audio.nowPlaying === cardSlug;
  const showCard = cardOpen && cardTapestry !== undefined;
  const atShopStop = VIEWPOINTS[stopIndex]?.id === 'shop';

  // Environment probes (client only).
  useEffect(() => {
    setCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    const doc = document as WebkitFullscreenDocument;
    setFullscreenAvailable(
      doc.fullscreenEnabled || doc.webkitFullscreenEnabled === true,
    );
    const onFsChange = (): void =>
      setIsFullscreen(currentFullscreenElement() !== null);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Open the card whenever a track starts.
  useEffect(() => {
    if (audio.nowPlaying !== null) setCardOpen(true);
  }, [audio.nowPlaying]);

  // Polite announcements: stop changes, then audio state changes.
  useEffect(() => {
    setAnnouncement(
      `Now viewing ${stopLabel}, stop ${stopIndex + 1} of ${stopCount}`,
    );
  }, [stopLabel, stopIndex, stopCount]);
  useEffect(() => {
    if (audio.nowPlaying === null) return;
    const name = bySlug.get(audio.nowPlaying)?.name ?? audio.nowPlaying;
    setAnnouncement(
      audio.paused ? 'Audio paused' : `Playing audio description for ${name}`,
    );
  }, [audio.nowPlaying, audio.paused, bySlug]);

  // Esc closes the topmost layer (sheet, then transcript). Capture phase +
  // preventDefault so the experience-level Escape handler (walk-mode exit)
  // only acts when nothing here consumed the key. Space is owned by the
  // experience-level keydown handler.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      if (sheetOpen) {
        e.preventDefault();
        setSheetOpen(false);
      } else if (transcriptOpen) {
        e.preventDefault();
        setTranscriptOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [sheetOpen, transcriptOpen]);

  // Tour-sheet focus management: move focus into the sheet on open and
  // restore it to the opener (☰ or the stop label) on close.
  const sheetRef = useRef<HTMLElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);
  const sheetReturnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (sheetOpen) {
      const active = document.activeElement;
      sheetReturnFocusRef.current =
        active instanceof HTMLElement ? active : null;
      sheetCloseRef.current?.focus();
    } else if (sheetReturnFocusRef.current) {
      sheetReturnFocusRef.current.focus();
      sheetReturnFocusRef.current = null;
    }
  }, [sheetOpen]);

  /** Basic Tab containment while the tour sheet is open. */
  const containSheetFocus = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (e.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = sheet.querySelectorAll<HTMLElement>('button, a[href]');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  const toggleFullscreen = useCallback(() => {
    const doc = document as WebkitFullscreenDocument;
    if (currentFullscreenElement()) {
      if (typeof doc.exitFullscreen === 'function') {
        void Promise.resolve(doc.exitFullscreen()).catch((err: unknown) => {
          console.warn('[gallery] exitFullscreen failed:', err);
          doc.webkitExitFullscreen?.();
        });
      } else {
        doc.webkitExitFullscreen?.();
      }
      return;
    }
    // The HUD's parent wraps both the Canvas and this overlay.
    const target = (rootRef.current?.parentElement ??
      document.documentElement) as WebkitFullscreenElement;
    if (typeof target.requestFullscreen === 'function') {
      void Promise.resolve(target.requestFullscreen()).catch((err: unknown) => {
        console.warn('[gallery] requestFullscreen failed:', err);
        target.webkitRequestFullscreen?.();
      });
    } else if (typeof target.webkitRequestFullscreen === 'function') {
      target.webkitRequestFullscreen();
    } else {
      console.warn('[gallery] no fullscreen API available');
    }
  }, []);

  const closeCard = useCallback(() => {
    setCardOpen(false);
    onStopAudio();
  }, [onStopAudio]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-10 select-none"
    >
      <style>{`
        @keyframes at-hud-rise {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes at-hud-slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Reduced-motion flight cover: flights become a 200ms fade. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[35] bg-black transition-opacity duration-200 ${
          reducedMotion && flying ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Hidden a11y tour: 13 real buttons, Enter = visit + play. */}
      <nav aria-label="Tapestries" className="sr-only">
        {tapestries.map((t) => (
          <button
            key={t.slug}
            type="button"
            className="pointer-events-auto"
            onClick={() => onVisitTapestry(t.slug)}
          >
            Visit the {t.name} tapestry and play its audio description
          </button>
        ))}
      </nav>
      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>

      {/* Top-left: quiet exit link (subtle navy pill for legibility over light walls). */}
      <a
        href="/"
        className="pointer-events-auto absolute top-4 left-4 z-[45] rounded-full bg-[#12284C]/60 px-3 py-2 text-[13px] text-[#F5EFE0] backdrop-blur-sm transition-colors hover:bg-[#12284C]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0]"
      >
        ← americastapestry.org
      </a>

      {/* Top-right cluster: [?] [VR] [fullscreen] [menu]. */}
      <div className="absolute top-4 right-[max(1rem,env(safe-area-inset-right))] z-[45] flex items-center gap-2">
        <button
          type="button"
          className={ICON_BTN}
          aria-label="Show help"
          onClick={() => onShowHint?.()}
        >
          <span className="font-serif text-xl font-semibold">?</span>
        </button>
        {vrSupported && (
          <button
            type="button"
            className={ICON_BTN}
            aria-label="Enter virtual reality"
            onClick={onEnterVR}
          >
            <span className="font-serif text-base font-semibold tracking-wide">
              VR
            </span>
          </button>
        )}
        {fullscreenAvailable && (
          <button
            type="button"
            className={ICON_BTN}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M7 1v6H1M11 1v6h6M7 17v-6H1M11 17v-6h6" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M1 7V1h6M11 1h6v6M17 11v6h-6M7 17H1v-6" />
              </svg>
            )}
          </button>
        )}
        <button
          type="button"
          className={ICON_BTN}
          aria-label="Open tour list"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
        >
          <span className="text-xl" aria-hidden="true">
            ☰
          </span>
        </button>
      </div>

      {/* Bottom-right: walk toggle, stop label, chevrons. */}
      <div className="absolute right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[45] flex flex-col items-end gap-3">
        {!coarsePointer && (
          <button
            type="button"
            aria-pressed={walkMode}
            onClick={onToggleWalkMode}
            className={`pointer-events-auto rounded-full px-3 py-1.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0] ${
              walkMode
                ? 'bg-[#8C4A4A] text-[#F5EFE0]'
                : 'bg-[rgba(18,40,76,0.92)] text-[#F5EFE0] hover:bg-[#12284C]'
            }`}
          >
            Explore freely
          </button>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="pointer-events-auto rounded-full bg-[rgba(18,40,76,0.92)] px-3 py-1.5 font-serif text-sm text-[#F5EFE0] transition-colors hover:bg-[#12284C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0]"
        >
          {walkMode
            ? 'Free exploration'
            : `${stopLabel} · ${stopIndex + 1} of ${stopCount}`}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Previous stop"
            onClick={onPrev}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5EFE0]/[0.92] text-[#12284C] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#F5EFE0] hover:text-[#8C4A4A] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0] focus-visible:ring-offset-1 focus-visible:ring-offset-[#12284C]"
          >
            <span className="text-[40px] leading-none" aria-hidden="true">
              ‹
            </span>
          </button>
          <button
            type="button"
            aria-label="Next stop"
            onClick={onNext}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5EFE0]/[0.92] text-[#12284C] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#F5EFE0] hover:text-[#8C4A4A] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0] focus-visible:ring-offset-1 focus-visible:ring-offset-[#12284C]"
          >
            <span className="text-[40px] leading-none" aria-hidden="true">
              ›
            </span>
          </button>
        </div>
      </div>

      {/* Bottom-centre: shop stop call-to-action (the shop stop has no audio card). */}
      {atShopStop && !showCard && (
        <Link
          href="/shop"
          className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex min-h-[44px] -translate-x-1/2 items-center rounded-full bg-[#F5EFE0] px-6 font-serif text-[17px] text-[#12284C] shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-colors hover:text-[#8C4A4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12284C] max-[715px]:bottom-[calc(env(safe-area-inset-bottom,0px)+88px)]"
          style={
            reducedMotion
              ? undefined
              : { animation: 'at-hud-rise 250ms ease-out' }
          }
        >
          Visit the shop →
        </Link>
      )}

      {/* Bottom-centre: audio card. */}
      {showCard && cardTapestry && cardSlug && (
        <AudioCard
          tapestry={cardTapestry}
          slug={cardSlug}
          isLoaded={cardIsLoaded}
          paused={audio.paused}
          transcriptOpen={transcriptOpen}
          reducedMotion={reducedMotion}
          onToggleTranscript={() => setTranscriptOpen((open) => !open)}
          onToggleAudio={onToggleAudio}
          onVisitTapestry={onVisitTapestry}
          onSeekAudio={onSeekAudio}
          onClose={closeCard}
        />
      )}

      {/* Tour sheet + scrim. */}
      {sheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close tour list"
            onClick={() => setSheetOpen(false)}
            className="pointer-events-auto absolute inset-0 z-[48] cursor-default bg-black/30"
          />
          <aside
            ref={sheetRef}
            aria-label="Tour"
            onKeyDown={containSheetFocus}
            className="pointer-events-auto absolute top-0 right-0 z-50 flex h-full w-[320px] max-w-full flex-col bg-[#12284C]/[0.97] shadow-[-4px_0_24px_rgba(0,0,0,0.4)]"
            style={
              reducedMotion
                ? undefined
                : { animation: 'at-hud-slide 240ms ease-out' }
            }
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-serif text-xl font-semibold text-[#F5EFE0]">
                Tour
              </h2>
              <button
                ref={sheetCloseRef}
                type="button"
                aria-label="Close tour list"
                onClick={() => setSheetOpen(false)}
                className={CARD_BTN}
              >
                <span className="text-lg" aria-hidden="true">
                  ✕
                </span>
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto pb-2">
              {VIEWPOINTS.map((vp, i) => {
                const thumb = vp.tapestrySlug
                  ? bySlug.get(vp.tapestrySlug)
                  : undefined;
                const current = i === stopIndex;
                return (
                  <li key={vp.id}>
                    <button
                      type="button"
                      aria-current={current ? 'true' : undefined}
                      onClick={() => {
                        setSheetOpen(false);
                        onGoTo(i);
                      }}
                      className={`flex min-h-[52px] w-full items-center gap-3 border-l-2 px-4 py-1 text-left font-serif text-[17px] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5EFE0] ${
                        current
                          ? 'border-[#8C4A4A] bg-white/5 font-semibold text-[#F5EFE0]'
                          : 'border-transparent text-[#F5EFE0]/90'
                      }`}
                    >
                      {thumb ? (
                        <Image
                          src={thumb.thumbUrl}
                          alt=""
                          width={40}
                          height={52}
                          className="h-[52px] w-10 shrink-0 rounded-sm object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="h-[52px] w-10 shrink-0 rounded-sm bg-white/10"
                        />
                      )}
                      <span className="truncate">{vp.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/15 p-4">
              <a
                href="/"
                className="font-serif text-[15px] text-[#F5EFE0]/90 underline-offset-4 hover:text-[#F5EFE0] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EFE0]"
              >
                Exit gallery
              </a>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
