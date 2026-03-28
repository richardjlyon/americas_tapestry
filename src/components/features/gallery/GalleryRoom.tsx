import * as THREE from 'three';
import { ROOM_CONFIG } from './constants';

const { main, alcove } = ROOM_CONFIG;

/** Total depth from south wall to alcove north wall */
const totalDepth = main.depth + alcove.depth; // 39.04

/**
 * Wall material colors
 */
const WALL_COLOR = '#F5F0E8'; // warm off-white / cream
const FLOOR_COLOR = '#8B7355'; // wood tone
const CEILING_COLOR = '#FAFAFA'; // near-white

/**
 * GalleryRoom - L-shaped Gallery 7 room geometry
 *
 * Renders walls, floor, and ceiling for the Gallery 7 L-shaped room.
 * Main room: 26.17' x 23' x 10' high
 * Alcove: 13' x 16.04' x 10' high, extending north from the west side
 *
 * Coordinate system:
 *   Origin at south-west corner, floor level
 *   X+ = east, Z- = north, Y+ = up
 */
interface GalleryRoomProps {
  hideCeiling?: boolean;
}

export default function GalleryRoom({ hideCeiling = false }: GalleryRoomProps): React.ReactElement {
  return (
    <group>
      {/* ---- Lighting ---- */}
      <ambientLight intensity={0.6} />
      <pointLight position={[13, 9, -11.5]} intensity={0.8} />

      {/* ---- Floors ---- */}
      {/* Main floor */}
      <mesh position={[main.width / 2, 0, -main.depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[main.width, main.depth]} />
        <meshStandardMaterial color={FLOOR_COLOR} side={THREE.DoubleSide} />
      </mesh>
      {/* Alcove floor */}
      <mesh
        position={[alcove.width / 2, 0, -(main.depth + alcove.depth / 2)]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[alcove.width, alcove.depth]} />
        <meshStandardMaterial color={FLOOR_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* ---- Ceilings ---- */}
      {!hideCeiling && (
        <>
          {/* Main ceiling */}
          <mesh
            position={[main.width / 2, main.height, -main.depth / 2]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[main.width, main.depth]} />
            <meshStandardMaterial color={CEILING_COLOR} side={THREE.DoubleSide} />
          </mesh>
          {/* Alcove ceiling */}
          <mesh
            position={[alcove.width / 2, alcove.height, -(main.depth + alcove.depth / 2)]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[alcove.width, alcove.depth]} />
            <meshStandardMaterial color={CEILING_COLOR} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* ---- Walls ---- */}

      {/* South wall - LEFT segment (x=0 to x=13.17) */}
      <mesh position={[13.17 / 2, main.height / 2, 0]}>
        <planeGeometry args={[13.17, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* South wall - RIGHT segment (x=20.17 to x=26.17) */}
      <mesh position={[(20.17 + main.width) / 2, main.height / 2, 0]}>
        <planeGeometry args={[main.width - 20.17, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* West wall (x=0, full length from z=0 to z=-39.04) */}
      <mesh position={[0, main.height / 2, -totalDepth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[totalDepth, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* East wall of main room (x=26.17, z=0 to z=-23) */}
      <mesh
        position={[main.width, main.height / 2, -main.depth / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[main.depth, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* North wall of main room - east portion (z=-23, x=13 to x=26.17) */}
      <mesh
        position={[(alcove.width + main.width) / 2, main.height / 2, -main.depth]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[main.width - alcove.width, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* East wall of alcove (x=13, z=-23 to z=-39.04) */}
      <mesh
        position={[alcove.width, main.height / 2, -(main.depth + alcove.depth / 2)]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[alcove.depth, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* North wall of alcove (z=-39.04, x=0 to x=13) */}
      <mesh
        position={[alcove.width / 2, main.height / 2, -totalDepth]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[alcove.width, main.height]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
