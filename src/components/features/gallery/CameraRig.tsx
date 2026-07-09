'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import { ROOM_CONFIG, WALK_SPINE, clampToRoom } from './galleryLayout';
import type { Viewpoint } from './types';

export interface CameraRigProps {
  /** Current tour stop the camera should settle at */
  stop: Viewpoint;
  /** Free-walk (WASD) mode active — detaches the rig from the stop */
  walkMode: boolean;
  /** Increment to trigger a new flight to `stop` */
  flightId: number;
  /** Called once the flight to the current stop completes */
  onArrive: () => void;
}

/** Exponential damping rate for the settled follow (1 - exp(-LAMBDA * dt)). */
const LAMBDA = 4;
/** Free-walk speed, ft/s */
const WALK_SPEED = 6;
/** Drag-look pitch limit around a stop's base orientation (tour mode) */
const PITCH_LIMIT = MathUtils.degToRad(25);
/** Pitch clamp while free-walking (yaw is unlimited there) */
const WALK_PITCH_LIMIT = MathUtils.degToRad(60);
/** Look sensitivity (radians per pixel), per ux-spec §3 */
const MOUSE_SENS = MathUtils.degToRad(0.25);
const TOUCH_SENS = MathUtils.degToRad(0.32);
/** Inertial look decay: ~0.9/frame at 60fps, capped at 300ms after release */
const INERTIA_DECAY = 0.9;
const INERTIA_MAX_MS = 300;
/** Reduced-motion: HUD fades to black over 200ms, THEN the camera cuts. */
const REDUCED_MOTION_FADE_MS = 200;
const WASD_CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

/**
 * Derive camera yaw/pitch (Euler 'YXZ') from a stop's position and lookAt.
 * yaw 0 faces -Z (north); positive pitch looks up.
 */
export function yawPitchFromLookAt(
  position: [number, number, number],
  lookAt: [number, number, number],
): { yaw: number; pitch: number } {
  const dx = lookAt[0] - position[0];
  const dy = lookAt[1] - position[1];
  const dz = lookAt[2] - position[2];
  const length = Math.hypot(dx, dy, dz) || 1;
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.asin(dy / length) };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Closest point to (x, z) on the walkable spine polyline. */
function nearestOnSpine(x: number, z: number): [number, number] {
  let best: [number, number] = [x, z];
  let bestDistSq = Number.POSITIVE_INFINITY;
  for (let i = 0; i < WALK_SPINE.length - 1; i++) {
    const a = WALK_SPINE[i];
    const b = WALK_SPINE[i + 1];
    if (!a || !b) continue;
    const [ax, az] = a;
    const [bx, bz] = b;
    const abx = bx - ax;
    const abz = bz - az;
    const t = MathUtils.clamp(
      ((x - ax) * abx + (z - az) * abz) / (abx * abx + abz * abz || 1),
      0,
      1,
    );
    const px = ax + abx * t;
    const pz = az + abz * t;
    const distSq = (x - px) ** 2 + (z - pz) ** 2;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = [px, pz];
    }
  }
  return best;
}

const SCRATCH_EULER = new Euler(0, 0, 0, 'YXZ');

function quatFromYawPitch(
  yaw: number,
  pitch: number,
  out: Quaternion,
): Quaternion {
  SCRATCH_EULER.set(pitch, yaw, 0);
  return out.setFromEuler(SCRATCH_EULER);
}

interface LookState {
  yawOff: number;
  pitchOff: number;
  dragging: boolean;
  pointerId: number;
  lastX: number;
  lastY: number;
  /** Last per-event look deltas, reused as inertial velocity after release */
  vYaw: number;
  vPitch: number;
  releasedAt: number;
}

/** Apply a look delta with mode-appropriate clamping. Mutates `look`. */
function applyLook(
  look: LookState,
  walkMode: boolean,
  dYaw: number,
  dPitch: number,
): void {
  // Yaw is unlimited in both modes — visitors can turn a full 360°.
  look.yawOff += dYaw;
  look.pitchOff = MathUtils.clamp(
    look.pitchOff + dPitch,
    walkMode ? -WALK_PITCH_LIMIT : -PITCH_LIMIT,
    walkMode ? WALK_PITCH_LIMIT : PITCH_LIMIT,
  );
}

interface FlightState {
  from: Vector3;
  fromQuat: Quaternion;
  to: Vector3;
  toQuat: Quaternion;
  /** Quadratic Bézier control point, pulled 60% toward the walk spine */
  ctrl: Vector3;
  duration: number;
  elapsed: number;
  targetId: string;
  endYaw: number;
  endPitch: number;
}

const TARGET_POS = new Vector3();
const TARGET_QUAT = new Quaternion();

/**
 * CameraRig — owns all camera motion. Idle until the first flight is
 * triggered (the camera holds its spawn pose under the loading overlay).
 * Flights are distance-scaled easeInOutCubic quadratic Béziers bent toward
 * WALK_SPINE with quaternion slerp; a repeat flightId bump for the same stop
 * skips to the end. Settled stops get damped follow + clamped drag-look;
 * walk mode is WASD at 6 ft/s constrained by clampToRoom. Renders nothing.
 */
export default function CameraRig({
  stop,
  walkMode,
  flightId,
  onArrive,
}: CameraRigProps): null {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  const flightRef = useRef<FlightState | null>(null);
  /** Base orientation of the current stop (offsets apply around it) */
  const baseRef = useRef({ yaw: 0, pitch: 0 });
  /** False until the first flight — the rig leaves the camera alone */
  const engagedRef = useRef(false);
  const lookRef = useRef<LookState>({
    yawOff: 0,
    pitchOff: 0,
    dragging: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    vYaw: 0,
    vPitch: 0,
    releasedAt: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const reducedMotionRef = useRef(false);
  const walkModeRef = useRef(walkMode);
  walkModeRef.current = walkMode;
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = query.matches;
    const onChange = (e: MediaQueryListEvent): void => {
      reducedMotionRef.current = e.matches;
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Drag-look pointer events on the canvas element (StrictMode-safe cleanup).
  useEffect(() => {
    const el = gl.domElement;
    const look = lookRef.current;
    const prevTouchAction = el.style.touchAction;
    el.style.touchAction = 'none';

    const onPointerDown = (e: PointerEvent): void => {
      if (flightRef.current || !engagedRef.current) return;
      look.dragging = true;
      look.pointerId = e.pointerId;
      look.lastX = e.clientX;
      look.lastY = e.clientY;
      look.vYaw = 0;
      look.vPitch = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent): void => {
      if (!look.dragging || e.pointerId !== look.pointerId) return;
      const sens = e.pointerType === 'touch' ? TOUCH_SENS : MOUSE_SENS;
      // Grab-the-world: dragging right pans the view left (yaw increases).
      const dYaw = (e.clientX - look.lastX) * sens;
      const dPitch = (e.clientY - look.lastY) * sens;
      look.lastX = e.clientX;
      look.lastY = e.clientY;
      applyLook(look, walkModeRef.current, dYaw, dPitch);
      look.vYaw = dYaw;
      look.vPitch = dPitch;
    };
    const onPointerEnd = (e: PointerEvent): void => {
      if (e.pointerId !== look.pointerId) return;
      look.dragging = false;
      look.releasedAt = performance.now();
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    return () => {
      el.style.touchAction = prevTouchAction;
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [gl]);

  // WASD key tracking (movement is applied per-frame in walk mode).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (WASD_CODES.includes(e.code)) keysRef.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent): void => {
      keysRef.current.delete(e.code);
    };
    const onBlur = (): void => keysRef.current.clear();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Flight trigger. A repeat bump targeting the stop already in flight is
  // the "impatient second press" — snap to the end instantly.
  useEffect(() => {
    if (flightId === 0) return undefined;
    const active = flightRef.current;
    if (active && active.targetId === stop.id) {
      camera.position.copy(active.to);
      camera.quaternion.copy(active.toQuat);
      baseRef.current = { yaw: active.endYaw, pitch: active.endPitch };
      flightRef.current = null;
      onArriveRef.current();
      return undefined;
    }

    const { yaw, pitch } = yawPitchFromLookAt(stop.position, stop.lookAt);
    const to = new Vector3(...stop.position);
    const toQuat = quatFromYawPitch(yaw, pitch, new Quaternion());
    const look = lookRef.current;
    look.yawOff = 0;
    look.pitchOff = 0;
    look.vYaw = 0;
    look.vPitch = 0;
    look.dragging = false;
    engagedRef.current = true;

    if (gl.xr.isPresenting) {
      // XR: the WorldRig snaps the scene and the headset owns the camera —
      // never fly. Arrive immediately so `flying` doesn't wedge navigation.
      baseRef.current = { yaw, pitch };
      flightRef.current = null;
      onArriveRef.current();
      return undefined;
    }

    const distance = camera.position.distanceTo(to);
    if (distance < 0.01) {
      // Already standing at this stop.
      camera.position.copy(to);
      camera.quaternion.copy(toQuat);
      baseRef.current = { yaw, pitch };
      flightRef.current = null;
      onArriveRef.current();
      return undefined;
    }
    if (reducedMotionRef.current) {
      // Sequence with the HUD cover: fade to black, cut, then fade back.
      const timer = window.setTimeout(() => {
        camera.position.copy(to);
        camera.quaternion.copy(toQuat);
        baseRef.current = { yaw, pitch };
        flightRef.current = null;
        onArriveRef.current();
      }, REDUCED_MOTION_FADE_MS);
      return () => window.clearTimeout(timer);
    }

    const from = camera.position.clone();
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const [spineX, spineZ] = nearestOnSpine(mid.x, mid.z);
    flightRef.current = {
      from,
      fromQuat: camera.quaternion.clone(),
      to,
      toQuat,
      ctrl: new Vector3(
        MathUtils.lerp(mid.x, spineX, 0.6),
        ROOM_CONFIG.eyeHeight,
        MathUtils.lerp(mid.z, spineZ, 0.6),
      ),
      duration: MathUtils.clamp(0.35 + distance * 0.04, 0.8, 1.6),
      elapsed: 0,
      targetId: stop.id,
      endYaw: yaw,
      endPitch: pitch,
    };
    return undefined;
  }, [flightId, stop, camera, gl]);

  useFrame((state, delta) => {
    if (state.gl.xr.isPresenting) return; // headset owns the camera in XR
    const dt = Math.min(delta, 0.1);
    const cam = state.camera;

    const flight = flightRef.current;
    if (flight) {
      flight.elapsed += dt;
      const t = Math.min(1, flight.elapsed / flight.duration);
      const e = easeInOutCubic(t);
      const u = 1 - e;
      cam.position.set(
        u * u * flight.from.x + 2 * u * e * flight.ctrl.x + e * e * flight.to.x,
        u * u * flight.from.y + 2 * u * e * flight.ctrl.y + e * e * flight.to.y,
        u * u * flight.from.z + 2 * u * e * flight.ctrl.z + e * e * flight.to.z,
      );
      cam.quaternion.slerpQuaternions(flight.fromQuat, flight.toQuat, e);
      if (t >= 1) {
        baseRef.current = { yaw: flight.endYaw, pitch: flight.endPitch };
        flightRef.current = null;
        onArriveRef.current();
      }
      return;
    }

    if (!engagedRef.current) return; // pre-first-flight: hold the spawn pose

    // Inertial look decay after release (disabled for reduced motion).
    const look = lookRef.current;
    if (
      !look.dragging &&
      !reducedMotionRef.current &&
      (look.vYaw !== 0 || look.vPitch !== 0)
    ) {
      if (performance.now() - look.releasedAt > INERTIA_MAX_MS) {
        look.vYaw = 0;
        look.vPitch = 0;
      } else {
        applyLook(look, walkMode, look.vYaw, look.vPitch);
        const decay = INERTIA_DECAY ** (dt * 60);
        look.vYaw *= decay;
        look.vPitch *= decay;
        if (Math.abs(look.vYaw) < 1e-4 && Math.abs(look.vPitch) < 1e-4) {
          look.vYaw = 0;
          look.vPitch = 0;
        }
      }
    }

    if (walkMode) {
      const yaw = baseRef.current.yaw + look.yawOff;
      const pitch = MathUtils.clamp(
        baseRef.current.pitch + look.pitchOff,
        -WALK_PITCH_LIMIT,
        WALK_PITCH_LIMIT,
      );
      quatFromYawPitch(yaw, pitch, cam.quaternion);

      const keys = keysRef.current;
      let forward = 0;
      let strafe = 0;
      if (keys.has('KeyW')) forward += 1;
      if (keys.has('KeyS')) forward -= 1;
      if (keys.has('KeyD')) strafe += 1;
      if (keys.has('KeyA')) strafe -= 1;
      if (forward !== 0 || strafe !== 0) {
        const step = (WALK_SPEED * dt) / Math.hypot(forward, strafe);
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * step;
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * step;
        const [x, z] = clampToRoom(
          cam.position.x + dx,
          cam.position.z + dz,
          cam.position.x,
          cam.position.z,
        );
        cam.position.set(x, ROOM_CONFIG.eyeHeight, z);
      }
      return;
    }

    // Settled at a stop: damped follow of position + look-offset orientation.
    const k = 1 - Math.exp(-LAMBDA * dt);
    TARGET_POS.set(...stop.position);
    cam.position.lerp(TARGET_POS, k);
    quatFromYawPitch(
      baseRef.current.yaw + look.yawOff,
      baseRef.current.pitch + look.pitchOff,
      TARGET_QUAT,
    );
    cam.quaternion.slerp(TARGET_QUAT, k);
  });

  return null;
}
