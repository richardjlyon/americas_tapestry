/**
 * Gallery 7 room configuration and navigation constants
 *
 * All dimensions are in feet (1 scene unit = 1 foot).
 * Coordinate system:
 *   - Origin (0, 0, 0) at south-west corner of main room, floor level
 *   - X increases eastward (room width)
 *   - Z is negative going northward (into room)
 *   - Y increases upward (floor=0, ceiling=10)
 *
 * The room is L-shaped: a main rectangle plus an alcove extending
 * north from the left (west) side.
 */

/** Gallery 7 room dimensions */
export const ROOM_CONFIG = {
  main: { width: 26.17, depth: 23.0, height: 10.0 },
  alcove: { width: 13.0, depth: 16.04, height: 10.0 },
  wallThickness: 0.5,
  eyeHeight: 5.5,
} as const;

/** Entrance gap in the south wall (7'-0" opening) */
export const ENTRANCE = {
  gapStart: 13.17,
  gapEnd: 20.17,
} as const;

/** Player start position at the entrance, facing north into the room */
export const START_POSITION = {
  x: 16.67,
  z: -1.0,
} as const;

/** Padding from walls for collision detection (feet) */
const WALL_PADDING = 0.3;

/**
 * Collision boundary rectangles for the L-shaped room.
 * Each rect is defined by its padded min/max in X and Z.
 */
const COLLISION_RECTS = {
  mainRoom: {
    minX: WALL_PADDING,
    maxX: ROOM_CONFIG.main.width - WALL_PADDING,
    minZ: -(ROOM_CONFIG.main.depth - WALL_PADDING),
    maxZ: -WALL_PADDING,
  },
  alcove: {
    minX: WALL_PADDING,
    maxX: ROOM_CONFIG.alcove.width - WALL_PADDING,
    minZ: -(ROOM_CONFIG.main.depth + ROOM_CONFIG.alcove.depth - WALL_PADDING),
    maxZ: -(ROOM_CONFIG.main.depth + WALL_PADDING),
  },
} as const;

/** Check whether a point is inside either collision rectangle */
function isInsideRoom(x: number, z: number): boolean {
  const m = COLLISION_RECTS.mainRoom;
  const a = COLLISION_RECTS.alcove;

  const inMain = x >= m.minX && x <= m.maxX && z >= m.minZ && z <= m.maxZ;
  const inAlcove = x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ;

  return inMain || inAlcove;
}

/**
 * Clamp a candidate position to the L-shaped room boundaries.
 *
 * Tries the full move first, then slides along each axis independently,
 * and falls back to the old position if nothing works.
 *
 * @param newX - Candidate X position
 * @param newZ - Candidate Z position
 * @param oldX - Previous X position (known valid)
 * @param oldZ - Previous Z position (known valid)
 * @returns Clamped [x, z] tuple
 */
export function clampToRoom(
  newX: number,
  newZ: number,
  oldX: number,
  oldZ: number
): [number, number] {
  // Full move succeeds
  if (isInsideRoom(newX, newZ)) return [newX, newZ];

  // Slide along X (keep old Z)
  if (isInsideRoom(newX, oldZ)) return [newX, oldZ];

  // Slide along Z (keep old X)
  if (isInsideRoom(oldX, newZ)) return [oldX, newZ];

  // No valid move -- stay put
  return [oldX, oldZ];
}

/** Keyboard mapping for @react-three/drei KeyboardControls */
export const KEY_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];
