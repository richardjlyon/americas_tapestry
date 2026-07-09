/**
 * Shared types for the virtual gallery.
 *
 * All spatial values are in feet (1 scene unit = 1 foot), origin at the
 * SW corner of the main room, X+ east, Z- north, Y+ up. Eye height 5.5 ft.
 */

/** Serializable tapestry content shipped from the server component. */
export interface GalleryTapestryData {
  /** Content slug, e.g. 'virginia' */
  slug: string;
  /** Display name, e.g. 'Virginia' */
  name: string;
  /** Best >=1920w webp variant for desktop texture */
  imageUrl: string;
  /** 1024w webp variant for mobile texture */
  imageUrlSmall: string;
  /** 640w thumbnail for the HUD tour sheet */
  thumbUrl: string;
  /** Audio description MP3 URL */
  audioUrl: string;
  /** Frontmatter one-liner (a11y label) */
  audioDescription: string;
  /** Plain-text wall label (~450 chars, markdown stripped) */
  description: string;
  /** Full plain-text body for the transcript disclosure */
  transcript: string;
  /** Shop destination for this tapestry's prints (/shop/<slug>) */
  buyUrl: string;
}

/** A stop on the guided tour. Yaw/pitch are derived from lookAt at runtime. */
export interface Viewpoint {
  /** 'intro' | 'credits' | tapestry slug */
  id: string;
  /** HUD label, e.g. 'Virginia' or 'Welcome' */
  label: string;
  /** Camera position, y = 5.5 (eye height) */
  position: [number, number, number];
  /** Point the camera faces at this stop */
  lookAt: [number, number, number];
  /** Tapestry framed at this stop, if any */
  tapestrySlug?: string;
}

/**
 * Coloured accent rectangle behind a tapestry, coplanar with its wall.
 * `range` runs along the wall's horizontal axis (x for north/south-facing
 * walls, z for east/west-facing walls); `yRange` is vertical.
 */
export interface PanelRect {
  color: string;
  range: [number, number];
  yRange: [number, number];
}

/**
 * Where and how one tapestry hangs.
 *
 * `textSide` is viewer-relative: 'left' means the wall-text block sits to
 * the LEFT of the tapestry as seen by a visitor standing at the tour stop
 * facing it, offset `textOffset` feet along the wall from the tapestry
 * centre. Use `wallTextCenter()` in galleryLayout.ts to resolve the world
 * position.
 */
export interface TapestryPlacement {
  slug: string;
  /** Tapestry centre [x, y, z]; y = 5.0 for all 13 */
  position: [number, number, number];
  /** Euler rotation; [0,0,0] faces south, [0,PI,0] north, [0,PI/2,0] east, [0,-PI/2,0] west */
  rotation: [number, number, number];
  /** [width, height] in feet (4.0 x 5.0 for all 13) */
  size: [number, number];
  /** Accent panel behind this tapestry; absent where a continuous band serves instead */
  panel?: PanelRect;
  textSide: 'left' | 'right';
  /** Distance in feet from tapestry centre to text-block centre, along the wall */
  textOffset: number;
}

/** Audio playback state exposed by useGalleryAudio(). */
export interface AudioState {
  /** Slug of the tapestry whose audio is loaded, or null */
  nowPlaying: string | null;
  paused: boolean;
}

/**
 * High-frequency playback progress, exposed by useGalleryAudioProgress()
 * so its ~4 Hz ticks only re-render the subscribing component (the HUD
 * audio card), never the Canvas subtree.
 */
export interface AudioProgress {
  /** Elapsed seconds */
  progress: number;
  /** Total seconds (0 until metadata loads) */
  duration: number;
}

/** Controls returned by useGalleryAudio() alongside the state. */
export interface GalleryAudioControls {
  /** Load + play a tapestry's audio. MUST be called inside a user-gesture handler. */
  play: (slug: string, url: string) => void;
  /** Pause/resume the current track */
  toggle: () => void;
  /** Stop and unload (with a short fade-out where supported) */
  stop: () => void;
  /** Seek to t seconds */
  seek: (t: number) => void;
}

export type GalleryAudio = AudioState & GalleryAudioControls;

/** Props for the DOM overlay HUD (a sibling of the Canvas, not <Html>). */
export interface GalleryHUDProps {
  tapestries: GalleryTapestryData[];
  /** Index into VIEWPOINTS */
  stopIndex: number;
  /** Total stops (VIEWPOINTS.length) */
  stopCount: number;
  /** Label of the current stop, e.g. 'Virginia' */
  stopLabel: string;
  /** Free-walk (WASD) mode active */
  walkMode: boolean;
  /** Camera currently flying between stops */
  flying: boolean;
  audio: AudioState;
  /** WebXR immersive-vr supported on this device */
  vrSupported: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Jump directly to a stop by index */
  onGoTo: (index: number) => void;
  /** Visit a tapestry's stop AND start its audio (user gesture) */
  onVisitTapestry: (slug: string) => void;
  onToggleWalkMode: () => void;
  onToggleAudio: () => void;
  onStopAudio: () => void;
  onSeekAudio: (t: number) => void;
  onEnterVR: () => void;
  /** Re-show the first-load hint pill (help '?' button). Owner: experience. */
  onShowHint?: () => void;
}
