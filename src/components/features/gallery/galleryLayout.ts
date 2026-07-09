/**
 * Gallery 7 layout — single source of truth for the virtual gallery's
 * architecture, tapestry placements, palette, and tour.
 *
 * UNITS AND AXES (binding convention):
 *   1 scene unit = 1 foot. Origin at the SW corner of the main room,
 *   floor level. X+ east, Z- north (into the room), Y+ up.
 *   Eye height 5.5 ft, ceiling 10 ft.
 *
 * Rotations: a surface with rotation [0,0,0] faces south (visitor looks
 * north at it); [0,PI,0] faces north; [0,PI/2,0] faces east (on the west
 * wall); [0,-PI/2,0] faces west (on the east wall).
 *
 * The room is L-shaped: main rectangle + an alcove extending north from
 * the west side. Transcribed from the layout spec — do not eyeball-edit.
 */

import type { TapestryPlacement, Viewpoint } from './types';

/**
 * Gallery 7 room dimensions (feet). The main room is widened east-west and
 * deepened north-south relative to the survey (26.17 x 23.0) so the east
 * wall stops get a proper ~8.5 ft stand-off and every wall run fits its
 * tapestries + text blocks with >=0.35 ft clearance.
 */
export const ROOM_CONFIG = {
  main: { width: 32.0, depth: 25.0, height: 10.0 },
  alcove: { width: 13.0, depth: 16.04, height: 10.0 },
  wallThickness: 0.5,
  eyeHeight: 5.5,
} as const;

/** Entrance gap in the south wall (7'-0" opening) */
export const ENTRANCE = {
  gapStart: 14.17,
  gapEnd: 21.17,
} as const;

/**
 * Dimmed entrance vestibule box behind the south-wall doorway
 * (z runs POSITIVE here — outside the main room). An invisible collider
 * at z = colliderZ stops the visitor walking out.
 */
export const VESTIBULE = {
  xRange: [14.17, 21.17] as [number, number],
  zRange: [0, 4.0] as [number, number],
  colliderZ: 1.0,
} as const;

/** Spawn at the entrance, facing north into the room */
export const SPAWN: Viewpoint = {
  id: 'spawn',
  label: 'Entrance',
  position: [17.67, 5.5, -1.0],
  lookAt: [17.67, 5.5, -11.0],
};

/**
 * Layering offsets from a wall plane (feet). Never DoubleSide on
 * coplanar quads: wall 0 -> band/panel +0.02 -> text +0.04 -> tapestry +0.10.
 */
export const SURFACE_OFFSETS = {
  band: 0.02,
  panel: 0.02,
  text: 0.04,
  tapestry: 0.1,
} as const;

// ---------------------------------------------------------------------------
// Walls
// ---------------------------------------------------------------------------

/** A straight wall segment, rendered as a box extending outward from `plane`. */
export interface WallSegmentDef {
  id: string;
  /** Axis the wall RUNS along: 'x' = east-west run (constant z), 'z' = north-south run (constant x) */
  along: 'x' | 'z';
  /** Inner-face plane coordinate (a z value for along='x', an x value for along='z') */
  plane: number;
  /** [min, max] extent along the run axis */
  range: [number, number];
  /** Direction the visible (inner) face points */
  faces: 'north' | 'south' | 'east' | 'west';
  /** Render darker (entrance vestibule) */
  dimmed?: boolean;
}

export const WALL_SEGMENTS: WallSegmentDef[] = [
  // Main room envelope
  { id: 'south-west', along: 'x', plane: 0, range: [0, 14.17], faces: 'north' },
  {
    id: 'south-east',
    along: 'x',
    plane: 0,
    range: [21.17, 32.0],
    faces: 'north',
  },
  { id: 'west-main', along: 'z', plane: 0, range: [-25.0, 0], faces: 'east' },
  {
    id: 'east-main',
    along: 'z',
    plane: 32.0,
    range: [-25.0, 0],
    faces: 'west',
  },
  {
    id: 'north-main',
    along: 'x',
    plane: -25.0,
    range: [13.0, 32.0],
    faces: 'south',
  },
  // Alcove (mouth at z = -25, x 0..13, is OPEN)
  {
    id: 'alcove-west',
    along: 'z',
    plane: 0,
    range: [-41.04, -25.0],
    faces: 'east',
  },
  {
    id: 'alcove-east',
    along: 'z',
    plane: 13.0,
    range: [-41.04, -25.0],
    faces: 'west',
  },
  {
    id: 'intro-wall',
    along: 'x',
    plane: -41.04,
    range: [0, 13.0],
    faces: 'south',
  },
  // Entrance vestibule (dimmed box behind the doorway, z positive)
  {
    id: 'vestibule-west',
    along: 'z',
    plane: 14.17,
    range: [0, 4.0],
    faces: 'east',
    dimmed: true,
  },
  {
    id: 'vestibule-east',
    along: 'z',
    plane: 21.17,
    range: [0, 4.0],
    faces: 'west',
    dimmed: true,
  },
  {
    id: 'vestibule-back',
    along: 'x',
    plane: 4.0,
    range: [14.17, 21.17],
    faces: 'north',
    dimmed: true,
  },
];

/** Freestanding element rendered as a full box (also a collision exclusion). */
export interface FreestandingBoxDef {
  id: 'ctmd-partition' | 'credits-partition' | 'spool-pillar';
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * The three freestanding elements in the main room. Note z: `min[2]` is the
 * more-negative (northern) coordinate.
 */
export const FREESTANDING: FreestandingBoxDef[] = [
  // A. CT/MD partition — attached to the west wall, 4.5 ft south of the alcove mouth.
  //    South face (z=-20.5) carries the Connecticut + Maryland composition.
  { id: 'ctmd-partition', min: [0, 0, -21.5], max: [14.17, 10.0, -20.5] },
  // B. Credits partition — attached to the south wall east of the doorway.
  //    West face (x=22.4) carries the credits composition.
  { id: 'credits-partition', min: [22.4, 0, -8.0], max: [23.4, 10.0, 0] },
  // C. NE spool pillar — attached to the main north wall.
  //    Spool watermark on the west face (x=21.0).
  { id: 'spool-pillar', min: [21.0, 0, -25.0], max: [25.0, 10.0, -21.0] },
];

// ---------------------------------------------------------------------------
// Palette & materials
// ---------------------------------------------------------------------------

export const PALETTE = {
  /** Matte warm white walls & partitions, roughness 0.95 */
  wall: '#F4F2ED',
  ceiling: '#FAFAF8',
  /** Light ash planks (E-W run, 0.6 ft wide x 6-8 ft long) */
  floorBase: '#DCCFB6',
  floorPlankMin: '#CBBD9F',
  floorPlankMax: '#E7DCC6',
  /** Narrow very-dark-charcoal tapestry frame */
  frame: '#26262A',
  /** Intro wall vertical panel + title/text navy */
  navyPanel: '#16213C',
  /** West wall continuous band */
  navyBand: '#1B2740',
  /** East wall continuous band */
  oxbloodBand: '#6E1D22',
  spoolWatermark: '#C7CCD2',
  textNavy: '#16213C',
  /** Per-state accent panels */
  panels: {
    connecticut: '#7C8C99',
    maryland: '#2F4741',
    massachusetts: '#60635A',
    'new-hampshire': '#708399',
    'new-york': '#63665C',
    'south-carolina': '#6D1F2C',
  },
  /** Credits wall logo colours */
  setonHillRed: '#9E1B32',
  muscarelleYellow: '#F2B705',
} as const;

/**
 * Narrow charcoal frame around every tapestry (and the shop mockups):
 * ~0.1 ft border, ~0.06 ft deep, matte (roughness 0.6). The textile quad
 * sits inside it, slightly recessed from the frame's front face.
 */
export const FRAME_CONFIG = {
  frameWidth: 0.1,
  depth: 0.06,
  color: PALETTE.frame,
  roughness: 0.6,
} as const;

/**
 * Recessed perimeter ceiling soffit (cove): 1.5-ft-wide channel inset
 * 1.5 ft from every wall, recessed 0.7 ft, emissive cool-white strip inside.
 */
export const CEILING_COVE = {
  inset: 1.5,
  width: 1.5,
  depth: 0.7,
} as const;

/** Continuous accent band on a side wall (coplanar quad at +0.02 offset). */
export interface AccentBandDef {
  id: string;
  /** Wall plane x coordinate */
  x: number;
  /** [min, max] extent in z (min is more negative) */
  zRange: [number, number];
  yRange: [number, number];
  color: string;
  faces: 'east' | 'west';
}

/** Bands are 2.5 ft tall, centred on the tapestry centre-line y = 5.0. */
export const ACCENT_BANDS: AccentBandDef[] = [
  // West wall navy band — stops at the CT/MD partition.
  {
    id: 'west-navy',
    x: 0,
    zRange: [-20.5, 0],
    yRange: [3.75, 6.25],
    color: PALETTE.navyBand,
    faces: 'east',
  },
  // East wall oxblood band — full length.
  {
    id: 'east-oxblood',
    x: 32.0,
    zRange: [-25.0, 0],
    yRange: [3.75, 6.25],
    color: PALETTE.oxbloodBand,
    faces: 'west',
  },
];

// ---------------------------------------------------------------------------
// Tapestry placements
// ---------------------------------------------------------------------------

/**
 * Wall-text block metrics shared by all 13 state labels: white type on the
 * coloured panel/band behind it, centre y = 5.0.
 */
export const WALL_TEXT = {
  size: [1.7, 2.2] as [number, number],
  centerY: 5.0,
  /** State-name letterspaced caps */
  capHeight: 0.09,
  /** Justified body paragraphs */
  bodySize: 0.05,
} as const;

const PANEL_Y: [number, number] = [1.6, 8.4];

/**
 * All 13 placements. Display size 4.0 w x 5.0 h ft, centre y = 5.0.
 * Positions bake in the tapestry's offset proud of its surface.
 * Paired-panel compositions (CT/MD, NY/SC, MA/NH): each tapestry overlaps
 * the INNER edge of its accent panel; text blocks sit on the outer thirds.
 *
 * Clearance rule (binding): every text-block edge clears the FRAMED
 * tapestry edge by >=0.35 ft. Framed half-width = 2.0 + 0.1 (frame) = 2.1;
 * text half-width = 0.85; so textOffset >= 2.1 + 0.35 + 0.85 = 3.3.
 */
export const TAPESTRY_PLACEMENTS: TapestryPlacement[] = [
  {
    // Intro wall (alcove north), overlapping the navy panel's east edge
    slug: 'virginia',
    position: [5.6, 5.0, -40.92],
    rotation: [0, 0, 0],
    size: [4.0, 5.0],
    panel: { color: PALETTE.navyPanel, range: [1.0, 5.4], yRange: [0.8, 9.4] },
    textSide: 'left',
    textOffset: 3.4,
  },
  {
    // Alcove west wall ("Second Wall")
    slug: 'massachusetts',
    position: [0.12, 5.0, -30.6],
    rotation: [0, Math.PI / 2, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels.massachusetts,
      range: [-31.6, -26.1],
      yRange: PANEL_Y,
    },
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'new-hampshire',
    position: [0.12, 5.0, -35.4],
    rotation: [0, Math.PI / 2, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels['new-hampshire'],
      range: [-39.9, -35.4],
      yRange: PANEL_Y,
    },
    textSide: 'right',
    textOffset: 3.3,
  },
  {
    // CT/MD partition south face
    slug: 'connecticut',
    position: [4.7, 5.0, -20.44],
    rotation: [0, 0, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels.connecticut,
      range: [0.2, 5.0],
      yRange: PANEL_Y,
    },
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'maryland',
    position: [9.47, 5.0, -20.44],
    rotation: [0, 0, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels.maryland,
      range: [9.17, 13.97],
      yRange: PANEL_Y,
    },
    textSide: 'right',
    textOffset: 3.3,
  },
  {
    // West wall, on the navy band
    slug: 'rhode-island',
    position: [0.12, 5.0, -17.85],
    rotation: [0, Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'delaware',
    position: [0.12, 5.0, -11.25],
    rotation: [0, Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'north-carolina',
    position: [0.12, 5.0, -4.65],
    rotation: [0, Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    // South wall west segment
    slug: 'south-carolina',
    position: [4.7, 5.0, -0.06],
    rotation: [0, Math.PI, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels['south-carolina'],
      range: [0.2, 5.0],
      yRange: PANEL_Y,
    },
    textSide: 'right',
    textOffset: 3.3,
  },
  {
    slug: 'new-york',
    position: [9.47, 5.0, -0.06],
    rotation: [0, Math.PI, 0],
    size: [4.0, 5.0],
    panel: {
      color: PALETTE.panels['new-york'],
      range: [9.17, 13.97],
      yRange: PANEL_Y,
    },
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    // East wall, on the oxblood band
    slug: 'new-jersey',
    position: [31.88, 5.0, -5.0],
    rotation: [0, -Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'pennsylvania',
    position: [31.88, 5.0, -11.7],
    rotation: [0, -Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
  {
    slug: 'georgia',
    position: [31.88, 5.0, -18.4],
    rotation: [0, -Math.PI / 2, 0],
    size: [4.0, 5.0],
    textSide: 'left',
    textOffset: 3.3,
  },
];

/**
 * Resolve the world-space centre of a placement's wall-text block.
 * 'left'/'right' are viewer-relative (standing at the tour stop, facing the
 * tapestry). Derivation: viewer-left = the wall's along-axis direction
 * obtained by rotating the viewing direction +90 degrees about Y.
 */
export function wallTextCenter(
  placement: TapestryPlacement,
): [number, number, number] {
  const yaw = placement.rotation[1];
  // Viewer-left unit vector [dx, dz] for each of the four wall orientations.
  let left: [number, number];
  if (yaw === 0) {
    left = [-1, 0]; // surface faces south, viewer looks north: left = west
  } else if (yaw === Math.PI) {
    left = [1, 0]; // faces north, viewer looks south: left = east
  } else if (yaw === Math.PI / 2) {
    left = [0, 1]; // faces east, viewer looks west: left = south
  } else {
    left = [0, -1]; // faces west, viewer looks east: left = north
  }
  const sign = placement.textSide === 'left' ? 1 : -1;
  return [
    placement.position[0] + sign * left[0] * placement.textOffset,
    WALL_TEXT.centerY,
    placement.position[2] + sign * left[1] * placement.textOffset,
  ];
}

// ---------------------------------------------------------------------------
// Intro wall composition (alcove north wall, z = -39.04, faces south)
// ---------------------------------------------------------------------------

/** Viewer facing the intro wall: image-left = west (low x). */
export const INTRO_WALL = {
  z: -41.04,
  /** Near floor-to-ceiling navy vertical panel */
  navyPanel: {
    color: PALETTE.navyPanel,
    xRange: [1.0, 5.4] as [number, number],
    yRange: [0.8, 9.4] as [number, number],
  },
  /** Virginia wall text (white) on the panel */
  virginiaText: {
    center: [2.2, 5.4] as [number, number],
    size: [1.6, 2.8] as [number, number],
    heading: 'VIRGINIA',
  },
  /**
   * Title lockup, navy on white, centred at x = 10.5. Cap heights are sized
   * so the widest lines fit the span between the FRAMED tapestry's right
   * edge (x = 7.7, +0.35 clearance) and the alcove-east wall corner (x = 13).
   */
  lockup: {
    centerX: 10.5,
    spool: { size: [1.2, 1.6] as [number, number], centerY: 7.7 },
    title: { text: "America's Tapestry", capHeight: 0.4, centerY: 6.55 },
    tagline: {
      text: '13 Colonies. 13 Stories. 1 Nation.',
      capHeight: 0.18,
      centerY: 5.85,
    },
    paragraphs: {
      blockSize: [4.8, 3.4] as [number, number],
      centerY: 3.9,
      text: [
        "The nation's founding story comes together in this special exhibition in commemoration of America's 250th anniversary.",
        'Nearly 2,000 volunteers, ranging in age from 3 to 98 have come together across the thirteen original colonies to create something extraordinary together.',
        'Devoting more than 20,000 hours and 50,000 yards of embroidery floss, they have brought thirteen panels to life — each one honoring stories of the American Revolution seldom told in the popular account of our founding.',
        'In these panels, you will meet the ordinary men and women who, in moments of courage and conviction, helped to forge a nation.',
      ],
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Credits wall composition (credits partition west face, x = 22.4, faces west)
// ---------------------------------------------------------------------------

export const CREDITS_WALL = {
  x: 22.4,
  /** Centred column width / centre */
  columnWidth: 5.5,
  centerZ: -4.0,
  spool: { size: [0.8, 1.0] as [number, number], centerY: 8.6 },
  intro:
    "America's Tapestry is the work of many hands. We are grateful for the volunteers and collaborators who made this project possible.",
  sections: [
    {
      heading: 'PROJECT DIRECTOR',
      names: ['Stefan Romero'],
    },
    {
      heading: 'STATE DIRECTORS',
      names: [
        'Deborah Barlow',
        'Denise De More',
        'Raven Fagelson',
        'Amy Gilley',
        'Becky Gutin',
        'Kiki Haumann',
        'Laura Kasowitz',
        'Karen Katin',
        'Michelle McPheron',
        'Jennifer Paperman',
        'Carol Prevost',
        'Sally Poole',
        'Gail Smith',
        'Robin Starnes',
        'Carol Tewes Ganse',
        'Catherine Theron',
        'Mary Tod',
        'Mary Van Tyne',
        'Karen Wallach',
      ],
    },
    {
      heading: 'HISTORICAL COLLABORATORS',
      names: [
        'Atlanta History Center',
        'Coastal Heritage Society of Savannah',
        'Connecticut Old State House',
        'Fraunces Tavern Museum',
        'Fuller Craft Museum',
        'Historic Lewes',
        'Maryland Center For History And Culture',
        'Maryland State Archives',
        'MD 250 Commission',
        'Millyard Museum',
        'New Hampshire Historical Society',
        'North Carolina Department of Natural and Cultural Resources',
        'Passaic County Department of Historic and Cultural Affairs',
        'Rhode Island Historical Society',
        'Seton Hill University',
        'Town Of Wytheville Museums',
      ],
    },
    {
      heading: 'SPONSORS',
      names: [
        'Coby Foundation',
        'National Endowment for the Arts',
        'Wichelt',
        'Fleur de Paris',
        'Westmoreland County Tourism Grant Program',
        'Yarn Tree',
      ],
    },
  ],
  setonHill: { color: PALETTE.setonHillRed, centerY: 2.3 },
  muscarelle: { color: PALETTE.muscarelleYellow, centerY: 1.5 },
} as const;

// ---------------------------------------------------------------------------
// Shop wall composition (main-room north wall, z = -25, faces south)
// ---------------------------------------------------------------------------

/**
 * Shop stop: heading, three framed product mockups, and a paragraph on the
 * visible north-wall span (x 13..21 — the spool pillar occupies x 21..25).
 * Product images are the fine-art photograph gallery variants (640w,
 * generated by scripts/generate-gallery-textures.mjs).
 */
export const SHOP_WALL = {
  z: -25.0,
  centerX: 17.0,
  heading: {
    text: 'Take the Tapestry Home',
    capHeight: 0.45,
    centerY: 7.6,
  },
  paragraph: {
    text: "Every panel in this exhibition is available from the America's Tapestry shop — fine-art prints, posters, and postcard sets for each of the thirteen colonies.",
    blockSize: [6.6, 1.3] as [number, number],
    centerY: 2.6,
  },
  products: {
    size: [1.8, 2.25] as [number, number],
    centerY: 5.0,
    /** Centre-to-centre spacing, centred on centerX */
    spacing: 2.4,
    images: [
      '/images/tapestries/virginia/virginia-fineart-gallery-640w.webp',
      '/images/tapestries/massachusetts/massachusetts-fineart-gallery-640w.webp',
      '/images/tapestries/pennsylvania/pennsylvania-fineart-gallery-640w.webp',
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Spool watermark (NE pillar west face)
// ---------------------------------------------------------------------------

export const SPOOL_SVG_URL = '/images/gallery/spool.svg';

export const SPOOL_WATERMARK = {
  /** On the pillar's x=21.0 plane, nudged west to avoid z-fighting */
  position: [20.98, 5.0, -23.0] as [number, number, number],
  rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  size: [3.4, 6.5] as [number, number],
  color: PALETTE.spoolWatermark,
} as const;

// ---------------------------------------------------------------------------
// Guided tour — canonical 16-stop order
// ---------------------------------------------------------------------------

/**
 * Canonical tour: intro -> alcove pair -> partition -> west wall southbound
 * -> south wall -> east wall northbound -> credits -> shop. Wraps.
 * Stand-off ~7.5 ft from each surface, eye y = 5.5, lookAt = composition centre.
 */
export const VIEWPOINTS: Viewpoint[] = [
  {
    id: 'intro',
    label: 'Welcome',
    position: [6.5, 5.5, -31.0],
    lookAt: [6.5, 5.0, -41.04],
  },
  {
    id: 'virginia',
    label: 'Virginia',
    position: [5.6, 5.5, -34.5],
    lookAt: [5.6, 5.0, -41.04],
    tapestrySlug: 'virginia',
  },
  {
    id: 'massachusetts',
    label: 'Massachusetts',
    position: [7.5, 5.5, -30.6],
    lookAt: [0, 5.0, -30.6],
    tapestrySlug: 'massachusetts',
  },
  {
    id: 'new-hampshire',
    label: 'New Hampshire',
    position: [7.5, 5.5, -35.4],
    lookAt: [0, 5.0, -35.4],
    tapestrySlug: 'new-hampshire',
  },
  {
    id: 'connecticut',
    label: 'Connecticut',
    position: [4.7, 5.5, -13.0],
    lookAt: [4.7, 5.0, -20.5],
    tapestrySlug: 'connecticut',
  },
  {
    id: 'maryland',
    label: 'Maryland',
    position: [9.47, 5.5, -13.0],
    lookAt: [9.47, 5.0, -20.5],
    tapestrySlug: 'maryland',
  },
  {
    id: 'rhode-island',
    label: 'Rhode Island',
    position: [7.5, 5.5, -17.85],
    lookAt: [0, 5.0, -17.85],
    tapestrySlug: 'rhode-island',
  },
  {
    id: 'delaware',
    label: 'Delaware',
    position: [7.5, 5.5, -11.25],
    lookAt: [0, 5.0, -11.25],
    tapestrySlug: 'delaware',
  },
  {
    id: 'north-carolina',
    label: 'North Carolina',
    position: [7.5, 5.5, -4.65],
    lookAt: [0, 5.0, -4.65],
    tapestrySlug: 'north-carolina',
  },
  {
    id: 'south-carolina',
    label: 'South Carolina',
    position: [4.7, 5.5, -7.5],
    lookAt: [4.7, 5.0, 0],
    tapestrySlug: 'south-carolina',
  },
  {
    id: 'new-york',
    label: 'New York',
    position: [9.47, 5.5, -7.5],
    lookAt: [9.47, 5.0, 0],
    tapestrySlug: 'new-york',
  },
  {
    // Just east of the credits partition (padded max x = 23.7), dead-on
    // frontal at an ~8.1 ft stand-off in the widened room.
    id: 'new-jersey',
    label: 'New Jersey',
    position: [23.8, 5.5, -5.0],
    lookAt: [32.0, 5.0, -5.0],
    tapestrySlug: 'new-jersey',
  },
  {
    id: 'pennsylvania',
    label: 'Pennsylvania',
    position: [23.5, 5.5, -11.7],
    lookAt: [32.0, 5.0, -11.7],
    tapestrySlug: 'pennsylvania',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    position: [23.5, 5.5, -18.4],
    lookAt: [32.0, 5.0, -18.4],
    tapestrySlug: 'georgia',
  },
  {
    // Aimed slightly higher so the spool logo at the top of the
    // composition clears the frame.
    id: 'credits',
    label: 'Credits',
    position: [14.6, 5.5, -4.0],
    lookAt: [22.4, 5.4, -4.0],
  },
  {
    id: 'shop',
    label: 'Shop',
    position: [17.0, 5.5, -17.0],
    lookAt: [17.0, 5.0, -25.0],
  },
];

/**
 * Walkable spine polyline [x, z] used to bend flight paths through open
 * space (Bezier control points get pulled toward the nearest spine point).
 * Runs: entrance -> south-wall stops -> west side -> main-room centre ->
 * east side -> NE -> around the CT/MD partition's east end -> alcove
 * centre -> intro-wall approach. Every vertex is inside the walkable
 * union and clear of the three freestanding boxes (0.3 ft padding).
 */
export const WALK_SPINE: [number, number][] = [
  [17.67, -1.5], // entrance
  [16.0, -6.0],
  [9.47, -6.5], // near the south-wall pair (SC/NY)
  [7.5, -13.0], // west side, near the band stops
  [13.0, -13.0], // main-room centre
  [23.5, -13.0], // east side, near the band stops
  [23.5, -18.4], // NE, clear of the spool pillar
  [15.0, -17.5], // heading for the partition's east end
  [15.0, -23.0], // the slot between partition and north wall (x ~ 15)
  [10.0, -24.0], // turning west toward the alcove mouth
  [6.5, -28.0], // into the alcove
  [6.5, -33.0], // alcove centre
  [6.5, -36.0], // intro-wall approach
];

// ---------------------------------------------------------------------------
// Collision
// ---------------------------------------------------------------------------

/** Padding from walls / freestanding elements for collision (feet) */
const WALL_PADDING = 0.3;

/**
 * Walkable rectangles: the L-union (main room + alcove) plus the shallow
 * entrance vestibule (walkable down to the invisible collider at z = +1).
 * The vestibule rect overlaps the main-room rect so the doorway is
 * continuous.
 */
const WALKABLE_RECTS = [
  {
    // Main room
    minX: WALL_PADDING,
    maxX: ROOM_CONFIG.main.width - WALL_PADDING,
    minZ: -(ROOM_CONFIG.main.depth - WALL_PADDING),
    maxZ: -WALL_PADDING,
  },
  {
    // Alcove
    minX: WALL_PADDING,
    maxX: ROOM_CONFIG.alcove.width - WALL_PADDING,
    minZ: -(ROOM_CONFIG.main.depth + ROOM_CONFIG.alcove.depth - WALL_PADDING),
    maxZ: -(ROOM_CONFIG.main.depth + WALL_PADDING),
  },
  {
    // Entrance vestibule (z positive, capped by the collider at z = +1)
    minX: ENTRANCE.gapStart + WALL_PADDING,
    maxX: ENTRANCE.gapEnd - WALL_PADDING,
    minZ: -1.0,
    maxZ: VESTIBULE.colliderZ - WALL_PADDING,
  },
] as const;

/** Exclusion AABBs: the freestanding boxes, padded outward */
const EXCLUSION_BOXES = FREESTANDING.map((box) => ({
  minX: box.min[0] - WALL_PADDING,
  maxX: box.max[0] + WALL_PADDING,
  minZ: box.min[2] - WALL_PADDING,
  maxZ: box.max[2] + WALL_PADDING,
}));

/** Point is inside the walkable union and outside every exclusion box. */
function isWalkable(x: number, z: number): boolean {
  const inside = WALKABLE_RECTS.some(
    (r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ,
  );
  if (!inside) return false;
  return !EXCLUSION_BOXES.some(
    (b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ,
  );
}

/**
 * Clamp a candidate position to the walkable area (L-shaped room minus the
 * three freestanding elements, plus the entrance vestibule).
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
  oldZ: number,
): [number, number] {
  if (isWalkable(newX, newZ)) return [newX, newZ];
  if (isWalkable(newX, oldZ)) return [newX, oldZ];
  if (isWalkable(oldX, newZ)) return [oldX, newZ];
  return [oldX, oldZ];
}
