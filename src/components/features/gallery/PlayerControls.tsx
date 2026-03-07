import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { clampToRoom, ROOM_CONFIG } from './constants';

/** Walking speed in feet per second */
const MOVE_SPEED = 5;

/**
 * Reusable Vector3 instances allocated once at module level
 * to avoid garbage collection pressure inside useFrame.
 */
const frontVector = new Vector3();
const sideVector = new Vector3();
const direction = new Vector3();

/**
 * PlayerControls - First-person navigation for the gallery
 *
 * Combines PointerLockControls (mouse look on click) with WASD/arrow key
 * movement. Movement is relative to camera facing direction. Wall collision
 * is enforced via clampToRoom, and camera Y is locked to eye height.
 */
export default function PlayerControls(): React.ReactElement {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();

  useFrame((_state, delta) => {
    const { forward, backward, left, right } = getKeys() as {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
    };

    // Calculate movement direction relative to camera facing
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta)
      .applyEuler(camera.rotation);

    // Compute candidate position
    const newX = camera.position.x + direction.x;
    const newZ = camera.position.z + direction.z;

    // Clamp to room boundaries (L-shape collision with wall sliding)
    const [clampedX, clampedZ] = clampToRoom(
      newX,
      newZ,
      camera.position.x,
      camera.position.z
    );

    camera.position.x = clampedX;
    camera.position.z = clampedZ;

    // Lock Y to eye height (prevents flying from pitch + movement)
    camera.position.y = ROOM_CONFIG.eyeHeight;
  });

  return <PointerLockControls />;
}
