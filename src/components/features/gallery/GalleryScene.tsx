import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import GalleryRoom from './GalleryRoom';
import TapestryWall from './TapestryWall';
import PlayerControls from './PlayerControls';
import { KEY_MAP, START_POSITION, ROOM_CONFIG } from './constants';

/**
 * GalleryScene - Composed 3D gallery scene with room and controls
 *
 * Renders the Gallery 7 L-shaped room with first-person navigation.
 * KeyboardControls wraps Canvas (not inside it) per drei requirements.
 * Camera starts at the entrance facing north into the room.
 *
 * This component is dynamically imported with ssr: false by GalleryClient,
 * so it is guaranteed to run only in the browser.
 */
export default function GalleryScene(): React.ReactElement {
  return (
    <KeyboardControls map={KEY_MAP}>
      <Canvas
        camera={{
          fov: 75,
          position: [START_POSITION.x, ROOM_CONFIG.eyeHeight, START_POSITION.z],
          near: 0.1,
          far: 100,
        }}
      >
        <GalleryRoom />
        <Suspense fallback={null}>
          <TapestryWall />
        </Suspense>
        <PlayerControls />
      </Canvas>
    </KeyboardControls>
  );
}
