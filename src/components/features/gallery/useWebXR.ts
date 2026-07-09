'use client';

/**
 * useWebXR — minimal immersive-vr support (no @react-three/xr).
 *
 * Feature-detects navigator.xr?.isSessionSupported('immersive-vr'); when
 * supported the HUD shows a custom Enter-VR button that calls enterVR()
 * (must run in a user gesture). In XR the headset owns the camera, so the
 * scene sits in a world-rig <group>; "teleporting" repositions the rig
 * inversely so the current viewpoint lands at the user — translate + yaw
 * only, instant snap, never animated (VR comfort). Controller selectstart
 * advances to the next stop, squeezestart to the previous. Session end
 * restores the rig (via onSessionEnd) and normal tour mode.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Group, WebGLRenderer } from 'three';
import type { Viewpoint } from './types';

export interface WebXRState {
  /** immersive-vr is available on this device */
  supported: boolean;
  /** An XR session is currently presenting */
  active: boolean;
  /** Start an immersive-vr session (call from a user gesture) */
  enterVR: () => void;
}

export interface WebXRHandlers {
  /** Controller trigger (selectstart) — go to next stop */
  onNext?: () => void;
  /** Controller grip (squeezestart) — go to previous stop */
  onPrev?: () => void;
  /** Session ended — restore the world rig and tour mode */
  onSessionEnd?: () => void;
}

/**
 * Position/rotate the world rig so `viewpoint` lands at the XR user.
 *
 * With local-floor reference space the user stands at the origin facing -Z.
 * We rotate the world by -yaw (derived from the viewpoint's lookAt) and
 * translate so the viewpoint's floor position maps to the origin. Y stays 0:
 * the scene floor (y=0) aligns with the physical floor and the headset
 * supplies eye height. Instant snap — never animate the rig in VR.
 */
export function applyStopToRig(rig: Group, viewpoint: Viewpoint): void {
  const [px, , pz] = viewpoint.position;
  const [lx, , lz] = viewpoint.lookAt;
  // Object yaw convention: rotation.y = yaw faces (-sin yaw, 0, -cos yaw).
  const yaw = Math.atan2(-(lx - px), -(lz - pz));
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  rig.rotation.set(0, -yaw, 0);
  // rig.position = -( R(-yaw) · [px, 0, pz] )
  rig.position.set(-(px * cos - pz * sin), 0, -(px * sin + pz * cos));
  rig.updateMatrixWorld();
}

/** Restore the world rig to identity (call when the XR session ends). */
export function resetRig(rig: Group): void {
  rig.position.set(0, 0, 0);
  rig.rotation.set(0, 0, 0);
  rig.updateMatrixWorld();
}

export function useWebXR(
  gl: WebGLRenderer | null,
  handlers?: WebXRHandlers,
): WebXRState {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const handlersRef = useRef<WebXRHandlers | undefined>(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let cancelled = false;
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((ok) => {
          if (!cancelled) setSupported(ok);
        })
        .catch(() => {
          if (!cancelled) setSupported(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const enterVR = useCallback(() => {
    if (!gl || typeof navigator === 'undefined' || !navigator.xr) return;
    // Must be set before setSession.
    gl.xr.enabled = true;
    navigator.xr
      .requestSession('immersive-vr', { optionalFeatures: ['local-floor'] })
      .then(async (session) => {
        const onSelect = (): void => handlersRef.current?.onNext?.();
        const onSqueeze = (): void => handlersRef.current?.onPrev?.();
        const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
        for (const controller of controllers) {
          controller.addEventListener('selectstart', onSelect);
          controller.addEventListener('squeezestart', onSqueeze);
        }
        session.addEventListener('end', () => {
          for (const controller of controllers) {
            controller.removeEventListener('selectstart', onSelect);
            controller.removeEventListener('squeezestart', onSqueeze);
          }
          gl.xr.enabled = false;
          setActive(false);
          handlersRef.current?.onSessionEnd?.();
        });
        await gl.xr.setSession(session);
        setActive(true);
      })
      .catch(() => {
        gl.xr.enabled = false;
      });
  }, [gl]);

  return { supported, active, enterVR };
}
