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

/** Tapestry placement on gallery walls */
export interface TapestryPlacement {
  slug: string;
  name: string;
  imagePath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  displayWidth: number;
  displayHeight: number;
}

/**
 * All 13 colony tapestry placements across Gallery 7 walls.
 *
 * Wall assignments:
 *   - South wall LEFT (z=0, faces north): Connecticut, Delaware
 *   - West wall (x=0, faces east): Georgia, Maryland, Massachusetts, New Hampshire, New Jersey
 *   - East wall main (x=26.17, faces west): New York, North Carolina, Pennsylvania
 *   - North wall main east (z=-23, faces south): Rhode Island
 *   - East wall alcove (x=13, faces west): South Carolina
 *   - North wall alcove (z=-39.04, faces south): Virginia
 *
 * Group A (1024x1317, displayHeight=5.14): CT, MD, MA, NH, NJ, NC, RI, SC, VA
 * Group B (1024x1434, displayHeight=5.6): DE, GA, NY, PA
 */
export const TAPESTRY_PLACEMENTS: TapestryPlacement[] = [
  // South wall LEFT (faces north, rotation [0,0,0])
  {
    slug: 'connecticut',
    name: 'Connecticut',
    imagePath: '/images/tapestries/connecticut/connecticut-tapestry-1024w.jpg',
    position: [3.5, 5.0, 0],
    rotation: [0, 0, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  {
    slug: 'delaware',
    name: 'Delaware',
    imagePath: '/images/tapestries/delaware/delaware-tapestry-1024w.jpg',
    position: [9.5, 5.0, 0],
    rotation: [0, 0, 0],
    displayWidth: 4,
    displayHeight: 5.6,
  },
  // West wall (faces east, rotation [0, PI/2, 0])
  {
    slug: 'georgia',
    name: 'Georgia',
    imagePath: '/images/tapestries/georgia/georgia-tapestry-main-1024w.jpg',
    position: [0, 5.0, -4.0],
    rotation: [0, Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.6,
  },
  {
    slug: 'maryland',
    name: 'Maryland',
    imagePath: '/images/tapestries/maryland/maryland-tapestry-1024w.jpg',
    position: [0, 5.0, -11.5],
    rotation: [0, Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  {
    slug: 'massachusetts',
    name: 'Massachusetts',
    imagePath: '/images/tapestries/massachusetts/massachusetts-tapestry-main-1024w.jpg',
    position: [0, 5.0, -19.0],
    rotation: [0, Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  {
    slug: 'new-hampshire',
    name: 'New Hampshire',
    imagePath: '/images/tapestries/new-hampshire/new-hampshire-tapestry-main-1024w.jpg',
    position: [0, 5.0, -26.5],
    rotation: [0, Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  {
    slug: 'new-jersey',
    name: 'New Jersey',
    imagePath: '/images/tapestries/new-jersey/new-jersey-tapestry-main-1024w.jpg',
    position: [0, 5.0, -33.5],
    rotation: [0, Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  // East wall main (faces west, rotation [0, -PI/2, 0])
  {
    slug: 'new-york',
    name: 'New York',
    imagePath: '/images/tapestries/new-york/new-york-tapestry-main-1024w.jpg',
    position: [26.17, 5.0, -5.0],
    rotation: [0, -Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.6,
  },
  {
    slug: 'north-carolina',
    name: 'North Carolina',
    imagePath: '/images/tapestries/north-carolina/north-carolina-tapestry-main-1024w.jpg',
    position: [26.17, 5.0, -11.5],
    rotation: [0, -Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    imagePath: '/images/tapestries/pennsylvania/pennsylvania-tapestry-main-1024w.jpg',
    position: [26.17, 5.0, -18.0],
    rotation: [0, -Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.6,
  },
  // North wall main east (faces south, rotation [0, PI, 0])
  {
    slug: 'rhode-island',
    name: 'Rhode Island',
    imagePath: '/images/tapestries/rhode-island/rhode-island-tapestry-main-1024w.jpg',
    position: [19.6, 5.0, -23.0],
    rotation: [0, Math.PI, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  // East wall alcove (faces west, rotation [0, -PI/2, 0])
  {
    slug: 'south-carolina',
    name: 'South Carolina',
    imagePath: '/images/tapestries/south-carolina/south-carolina-tapestry-main-1024w.jpg',
    position: [13.0, 5.0, -31.0],
    rotation: [0, -Math.PI / 2, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
  // North wall alcove (faces south, rotation [0, PI, 0])
  {
    slug: 'virginia',
    name: 'Virginia',
    imagePath: '/images/tapestries/virginia/viginia-tapestry-main-1024w.jpg',
    position: [6.5, 5.0, -39.04],
    rotation: [0, Math.PI, 0],
    displayWidth: 4,
    displayHeight: 5.14,
  },
];

/** Frame styling for framed tapestries */
export const FRAME_CONFIG = {
  /** Frame border width in feet */
  FRAME_WIDTH: 0.2,
  /** Frame extrusion depth in feet */
  FRAME_DEPTH: 0.15,
  /** Dark wood color */
  FRAME_COLOR: '#3D2B1F',
  /** Offset from wall surface to prevent z-fighting (feet) */
  WALL_OFFSET: 0.05,
} as const;

/** Keyboard mapping for @react-three/drei KeyboardControls */
export const KEY_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];
