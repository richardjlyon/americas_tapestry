import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrthographicCamera } from '@react-three/drei';
import GalleryRoom from './GalleryRoom';
import TapestryWall from './TapestryWall';
import PlayerControls from './PlayerControls';
import { KEY_MAP, START_POSITION, ROOM_CONFIG } from './constants';

/** Temporary: set to true for overhead floor-plan view (no ceiling, top-down) */
const DEBUG_OVERHEAD = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('overhead');

/**
 * GalleryScene - Composed 3D gallery scene with room and controls
 *
 * Renders the Gallery 7 L-shaped room with first-person navigation.
 * KeyboardControls wraps Canvas (not inside it) per drei requirements.
 * Camera starts at the entrance facing north into the room.
 *
 * Add ?overhead to URL for top-down debug view (no ceiling).
 *
 * This component is dynamically imported with ssr: false by GalleryClient,
 * so it is guaranteed to run only in the browser.
 */
export default function GalleryScene(): React.ReactElement {
  const totalDepth = ROOM_CONFIG.main.depth + ROOM_CONFIG.alcove.depth;
  const centerX = ROOM_CONFIG.main.width / 2;
  const centerZ = -totalDepth / 2;

  return (
    <KeyboardControls map={KEY_MAP}>
      <Canvas
        {...(DEBUG_OVERHEAD
          ? { orthographic: true }
          : {
              camera: {
                fov: 75,
                position: [START_POSITION.x, ROOM_CONFIG.eyeHeight, START_POSITION.z] as [number, number, number],
                near: 0.1,
                far: 100,
              },
            })}
      >
        {DEBUG_OVERHEAD && (
          <OrthographicCamera
            makeDefault
            position={[centerX, 50, centerZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            zoom={12}
            near={0.1}
            far={200}
          />
        )}
        <GalleryRoom hideCeiling={DEBUG_OVERHEAD} />
        <Suspense fallback={null}>
          <TapestryWall />
        </Suspense>
        {!DEBUG_OVERHEAD && <PlayerControls />}
      </Canvas>
    </KeyboardControls>
  );
}
