import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { FRAME_CONFIG } from './constants';

/**
 * Props for a single framed tapestry on the gallery wall.
 * All values come from a TapestryPlacement entry in constants.ts.
 */
interface FramedTapestryProps {
  imagePath: string;
  displayWidth: number;
  displayHeight: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const { FRAME_WIDTH: fw, FRAME_DEPTH, FRAME_COLOR, WALL_OFFSET } = FRAME_CONFIG;

/**
 * FramedTapestry - Renders a single tapestry image in a dark wood frame
 *
 * Uses useTexture (drei) to load the JPG as a Three.js texture, applies
 * SRGB color space for correct color reproduction and anisotropic filtering
 * for legibility at oblique viewing angles.
 *
 * The tapestry plane is offset slightly from the wall (WALL_OFFSET) to
 * prevent z-fighting. Four box-geometry frame pieces surround the image.
 *
 * @param imagePath - Path to the tapestry JPG in /public
 * @param displayWidth - Width of the tapestry plane in feet
 * @param displayHeight - Height of the tapestry plane in feet
 * @param position - [x, y, z] world position of the tapestry center
 * @param rotation - [rx, ry, rz] Euler rotation to face into the room
 */
export function FramedTapestry({
  imagePath,
  displayWidth: w,
  displayHeight: h,
  position,
  rotation,
}: FramedTapestryProps): React.ReactElement {
  const texture = useTexture(imagePath);

  // Correct color space and improve quality at angles
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return (
    <group position={position} rotation={rotation}>
      {/* Tapestry image plane */}
      <mesh position={[0, 0, WALL_OFFSET]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Frame - Top */}
      <mesh position={[0, h / 2 + fw / 2, WALL_OFFSET]}>
        <boxGeometry args={[w + fw * 2, fw, FRAME_DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Frame - Bottom */}
      <mesh position={[0, -h / 2 - fw / 2, WALL_OFFSET]}>
        <boxGeometry args={[w + fw * 2, fw, FRAME_DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Frame - Left */}
      <mesh position={[-w / 2 - fw / 2, 0, WALL_OFFSET]}>
        <boxGeometry args={[fw, h, FRAME_DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Frame - Right */}
      <mesh position={[w / 2 + fw / 2, 0, WALL_OFFSET]}>
        <boxGeometry args={[fw, h, FRAME_DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
    </group>
  );
}
