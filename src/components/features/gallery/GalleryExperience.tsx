'use client';

import { useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type Group, NoToneMapping, Vector3, type WebGLRenderer } from 'three';
import CameraRig, { yawPitchFromLookAt } from './CameraRig';
import GalleryHUD from './GalleryHUD';
import GalleryRoom from './GalleryRoom';
import TapestryPanel from './TapestryPanel';
import WelcomeModal from './WelcomeModal';
import {
  PALETTE,
  SPAWN,
  SPOOL_SVG_URL,
  TAPESTRY_PLACEMENTS,
  VIEWPOINTS,
} from './galleryLayout';
import { disposeProceduralTextures } from './proceduralTextures';
import type { GalleryTapestryData, Viewpoint } from './types';
import { useGalleryAudio } from './useGalleryAudio';
import { useWebXR } from './useWebXR';

export interface GalleryExperienceProps {
  tapestries: GalleryTapestryData[];
}

const WELCOME_STORAGE_KEY = 'at_gallery_welcome_seen';
const HINT_DURATION_MS = 6000;
const LOAD_HOLD_MS = 300;
const LOAD_FADE_MS = 600;
const LOAD_TIMEOUT_MS = 8000;
const URL_DEBOUNCE_MS = 400;

const DESKTOP_HINT =
  'Drag to look around · → next tapestry · click a tapestry to hear its story';
const TOUCH_HINT =
  'Swipe to look around · tap ⟩ for the next tapestry · tap a tapestry to hear its story';

const UP = new Vector3(0, 1, 0);

/** Bounds-safe VIEWPOINTS lookup (noUncheckedIndexedAccess). */
function viewpointAt(index: number): Viewpoint {
  return VIEWPOINTS[index] ?? SPAWN;
}

/** Initial stop from the ?stop= deep link (read once on mount). */
function initialStopIndex(): number {
  if (typeof window === 'undefined') return 0;
  const param = new URLSearchParams(window.location.search).get('stop');
  if (!param) return 0;
  const index = VIEWPOINTS.findIndex((v) => v.id === param);
  return index >= 0 ? index : 0;
}

interface WorldRigProps {
  stop: Viewpoint;
  active: boolean;
  children: React.ReactNode;
}

/**
 * World-rig group for WebXR (tech-spec §6): while a session presents, the
 * whole scene is inversely repositioned (translate + yaw, instant snap) so
 * the current stop lands at the headset origin. Identity outside XR.
 */
function WorldRig({
  stop,
  active,
  children,
}: WorldRigProps): React.ReactElement {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    const rig = groupRef.current;
    if (!rig) return;
    if (!active) {
      rig.position.set(0, 0, 0);
      rig.rotation.set(0, 0, 0);
      return;
    }
    const { yaw } = yawPitchFromLookAt(stop.position, stop.lookAt);
    rig.rotation.set(0, -yaw, 0);
    // rig = R(-yaw) · T(-stopPos): floor-level teleport, headset owns height.
    const offset = new Vector3(-stop.position[0], 0, -stop.position[2]);
    offset.applyAxisAngle(UP, -yaw);
    rig.position.copy(offset);
  }, [stop, active]);

  return <group ref={groupRef}>{children}</group>;
}

/**
 * GalleryExperience — owns all gallery state (current stop, walk mode,
 * flight status, audio) and composes the Canvas scene with its DOM siblings
 * (HUD, loading overlay, hint pill, a11y nav, live region).
 */
export default function GalleryExperience({
  tapestries,
}: GalleryExperienceProps): React.ReactElement {
  const [stopIndex, setStopIndex] = useState<number>(initialStopIndex);
  const [walkMode, setWalkMode] = useState(false);
  const [flying, setFlying] = useState(false);
  const [flightId, setFlightId] = useState(0);
  const [overlay, setOverlay] = useState<'loading' | 'fading' | 'hidden'>(
    'loading',
  );
  const [hintVisible, setHintVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [glRenderer, setGlRenderer] = useState<WebGLRenderer | null>(null);
  const lastDirRef = useRef<'prev' | 'next' | null>(null);
  const introStartedRef = useRef(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const audio = useGalleryAudio();
  const { progress } = useProgress();

  const stopCount = VIEWPOINTS.length;
  const currentStop = viewpointAt(stopIndex);

  // Small-device gate: coarse pointer OR a small screen in either
  // orientation (catches tablets and landscape phones, not just narrow
  // viewports).
  const [useSmallTextures] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        Math.min(window.screen.width, window.screen.height) <= 820),
  );
  const isTouch = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches,
    [],
  );

  const sizedTapestries = useMemo(
    () =>
      useSmallTextures
        ? tapestries.map((t) => ({ ...t, imageUrl: t.imageUrlSmall }))
        : tapestries,
    [tapestries, useSmallTextures],
  );
  const bySlug = useMemo(
    () => new Map(sizedTapestries.map((t) => [t.slug, t])),
    [sizedTapestries],
  );

  // Dev-time sanity check: every placement should have content.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    for (const placement of TAPESTRY_PLACEMENTS) {
      if (!bySlug.has(placement.slug)) {
        console.warn(
          `[gallery] no content for placement "${placement.slug}" — panel skipped`,
        );
      }
    }
  }, [bySlug]);

  /** Navigate to a stop. Chevron/keyboard nav: fade-stop audio, no autoplay. */
  const goTo = useCallback(
    (index: number, dir?: 'prev' | 'next'): void => {
      setHintVisible(false);
      if (flying) {
        // Second press of the same chevron skips the flight to its end.
        if (dir) {
          if (dir === lastDirRef.current) setFlightId((n) => n + 1);
          return;
        }
        // Direct selection (tour sheet, Home/End): retarget mid-flight.
      }
      lastDirRef.current = dir ?? null;
      audio.stop();
      setWalkMode(false);
      setStopIndex(index);
      setFlying(true);
      setFlightId((n) => n + 1);
    },
    [flying, audio],
  );

  const handlePrev = useCallback((): void => {
    goTo((stopIndex + stopCount - 1) % stopCount, 'prev');
  }, [goTo, stopIndex, stopCount]);

  const handleNext = useCallback((): void => {
    goTo((stopIndex + 1) % stopCount, 'next');
  }, [goTo, stopIndex, stopCount]);

  /** Visit a tapestry's stop AND play its audio in the same gesture. */
  const handleVisitTapestry = useCallback(
    (slug: string): void => {
      if (flying) return;
      const index = VIEWPOINTS.findIndex((v) => v.tapestrySlug === slug);
      const data = bySlug.get(slug);
      if (index < 0 || !data) return;
      setHintVisible(false);
      // Synchronous inside the click/tap handler (iOS autoplay rule).
      audio.play(slug, data.audioUrl);
      lastDirRef.current = null;
      if (index === stopIndex && !walkMode) return; // already framed
      setWalkMode(false);
      setStopIndex(index);
      setFlying(true);
      setFlightId((n) => n + 1);
    },
    [flying, stopIndex, walkMode, bySlug, audio],
  );

  const handleArrive = useCallback((): void => {
    setFlying(false);
  }, []);

  const handleShowHint = useCallback((): void => {
    setHintVisible(true);
  }, []);

  const handleToggleWalkMode = useCallback((): void => {
    if (walkMode) {
      // Leaving free walk: fly back onto the rail at the current stop.
      setWalkMode(false);
      setFlying(true);
      setFlightId((n) => n + 1);
    } else if (!flying) {
      setWalkMode(true);
    }
  }, [walkMode, flying]);

  // Keyboard navigation (ux-spec §2.2, number keys deliberately skipped).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented) return;
      if (welcomeVisible) return; // modal owns the keyboard while open
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(stopCount - 1);
          break;
        case ' ':
          if (tag === 'BUTTON') return; // keep native Space on focused buttons
          if (audio.nowPlaying) {
            e.preventDefault();
            audio.toggle();
          }
          break;
        case 'Escape':
          if (walkMode) handleToggleWalkMode();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handlePrev,
    handleNext,
    goTo,
    stopCount,
    audio,
    walkMode,
    handleToggleWalkMode,
    welcomeVisible,
  ]);

  // Debounced ?stop= URL sync.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('stop', viewpointAt(stopIndex).id);
      window.history.replaceState(null, '', url);
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [stopIndex]);

  // Loading overlay: fade after useProgress completes (300ms hold)…
  useEffect(() => {
    if (overlay !== 'loading' || progress < 100) return;
    const timer = window.setTimeout(() => setOverlay('fading'), LOAD_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [progress, overlay]);

  // …or after an 8s failsafe timeout.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setOverlay((o) => (o === 'loading' ? 'fading' : o)),
      LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  // When the fade starts, walk the camera in (the one automatic flight).
  useEffect(() => {
    if (overlay !== 'fading') return;
    if (!introStartedRef.current) {
      introStartedRef.current = true;
      setFlying(true);
      setFlightId((n) => n + 1);
    }
    const timer = window.setTimeout(() => setOverlay('hidden'), LOAD_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [overlay]);

  // First-visit welcome modal (session-scoped). The hint pill is no longer
  // auto-shown — it remains available via the '?' help button.
  useEffect(() => {
    if (overlay !== 'hidden') return;
    if (window.sessionStorage.getItem(WELCOME_STORAGE_KEY)) return;
    window.sessionStorage.setItem(WELCOME_STORAGE_KEY, '1');
    setWelcomeVisible(true);
  }, [overlay]);

  const handleCloseWelcome = useCallback((): void => {
    setWelcomeVisible(false);
    canvasWrapRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!hintVisible) return;
    const timer = window.setTimeout(
      () => setHintVisible(false),
      HINT_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hintVisible]);

  const xr = useWebXR(glRenderer, { onNext: handleNext, onPrev: handlePrev });

  // Release procedural CanvasTextures when the gallery unmounts. Caches
  // regenerate on demand, so the StrictMode remount just redraws them.
  useEffect(() => () => disposeProceduralTextures(), []);

  return (
    <div className="relative h-full w-full">
      <div
        ref={canvasWrapRef}
        tabIndex={-1}
        className="absolute inset-0 focus:outline-none"
        role="application"
        aria-label="3D gallery view. Use the tapestry list or arrow keys to navigate."
      >
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ fov: 60, position: SPAWN.position, near: 0.1, far: 200 }}
          onCreated={({ gl }) => {
            gl.toneMapping = NoToneMapping;
            setGlRenderer(gl);
          }}
        >
          <color attach="background" args={[PALETTE.wall]} />
          <Suspense fallback={null}>
            <WorldRig stop={currentStop} active={xr.active}>
              <GalleryRoom />
              {TAPESTRY_PLACEMENTS.map((placement) => {
                const data = bySlug.get(placement.slug);
                if (!data) return null;
                return (
                  <TapestryPanel
                    key={placement.slug}
                    data={data}
                    placement={placement}
                    selected={currentStop.tapestrySlug === placement.slug}
                    onSelect={handleVisitTapestry}
                  />
                );
              })}
            </WorldRig>
          </Suspense>
          <CameraRig
            stop={currentStop}
            walkMode={walkMode}
            flightId={flightId}
            onArrive={handleArrive}
          />
        </Canvas>
      </div>

      <GalleryHUD
        tapestries={tapestries}
        stopIndex={stopIndex}
        stopCount={stopCount}
        stopLabel={currentStop.label}
        walkMode={walkMode}
        flying={flying}
        audio={audio}
        vrSupported={xr.supported}
        onPrev={handlePrev}
        onNext={handleNext}
        onGoTo={goTo}
        onVisitTapestry={handleVisitTapestry}
        onToggleWalkMode={handleToggleWalkMode}
        onToggleAudio={audio.toggle}
        onStopAudio={audio.stop}
        onSeekAudio={audio.seek}
        onEnterVR={xr.enterVR}
        onShowHint={handleShowHint}
      />

      {/* The hidden tapestry nav + polite live region live in GalleryHUD. */}

      {hintVisible && (
        <div className="absolute bottom-[68px] left-1/2 z-[55] -translate-x-1/2 rounded-full border border-[#F5EFE0]/20 bg-[#12284C]/90 px-5 py-3 text-center text-[15px] text-[#F5EFE0]">
          {isTouch ? TOUCH_HINT : DESKTOP_HINT}
        </div>
      )}

      {welcomeVisible && overlay === 'hidden' && (
        <WelcomeModal isTouch={isTouch} onClose={handleCloseWelcome} />
      )}

      {overlay !== 'hidden' && (
        <div
          className={`absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#F5EFE0] transition-opacity duration-[600ms] ${
            overlay === 'fading'
              ? 'pointer-events-none opacity-0'
              : 'opacity-100'
          }`}
        >
          {/* Static asset, decorative — next/image adds nothing here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SPOOL_SVG_URL} alt="" className="h-16 w-auto" />
          <p className="font-serif text-[32px] text-[#12284C]">
            America&rsquo;s Tapestry
          </p>
          <div className="h-[3px] w-[240px] bg-[#12284C]/15">
            <div
              className="h-full bg-[#12284C]"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
