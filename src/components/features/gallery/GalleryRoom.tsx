'use client';

/**
 * All static architecture for the virtual gallery: the L-room walls and
 * entrance vestibule, the three freestanding elements, continuous accent
 * bands, procedural wood floor, ceilings with recessed perimeter coves,
 * lighting, the NE-pillar spool watermark, and the intro- and credits-wall
 * compositions. No props — everything comes from galleryLayout.
 *
 * The 13 per-state tapestries, their backing accent panels, and their
 * state-label text blocks are rendered by TapestryPanel, not here.
 */

import { Text, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { type CanvasTexture, SRGBColorSpace } from 'three';
import WallText from './WallText';
import {
  ACCENT_BANDS,
  type AccentBandDef,
  CEILING_COVE,
  CREDITS_WALL,
  ENTRANCE,
  FRAME_CONFIG,
  FREESTANDING,
  type FreestandingBoxDef,
  INTRO_WALL,
  PALETTE,
  ROOM_CONFIG,
  SHOP_WALL,
  SPOOL_SVG_URL,
  SPOOL_WATERMARK,
  SURFACE_OFFSETS,
  VESTIBULE,
  WALL_SEGMENTS,
  type WallSegmentDef,
} from './galleryLayout';
import {
  FLOOR_TILE_FT,
  makeSvgTexture,
  makeWoodFloorTexture,
} from './proceduralTextures';

const HEADING_FONT = '/fonts/eb-garamond-600.woff';
/** Approximate cap-height / font-size ratio for EB Garamond */
const CAP_RATIO = 0.7;
const WALL_HEIGHT = ROOM_CONFIG.main.height;
const TOTAL_DEPTH = ROOM_CONFIG.main.depth + ROOM_CONFIG.alcove.depth;
/** Darker wall/floor tones for the dimmed entrance vestibule */
const DIMMED_WALL = '#D8D3CA';
const DIMMED_FLOOR = '#B7AC97';
const DIMMED_CEILING = '#E4E2DC';
/** Fascia sides of the ceiling cove, slightly shaded */
const COVE_FASCIA = '#ECEAE5';
/** Rasterisation density for SVG quads */
const SVG_PX_PER_FT = 220;

// ---------------------------------------------------------------------------
// Walls & freestanding elements
// ---------------------------------------------------------------------------

function WallBox({ seg }: { seg: WallSegmentDef }): ReactElement {
  const t = ROOM_CONFIG.wallThickness;
  const length = seg.range[1] - seg.range[0];
  const mid = (seg.range[0] + seg.range[1]) / 2;
  let position: [number, number, number];
  let args: [number, number, number];
  if (seg.along === 'x') {
    // Runs east-west at z = plane; body extends away from the visible face
    const z = seg.faces === 'north' ? seg.plane + t / 2 : seg.plane - t / 2;
    position = [mid, WALL_HEIGHT / 2, z];
    args = [length, WALL_HEIGHT, t];
  } else {
    const x = seg.faces === 'east' ? seg.plane - t / 2 : seg.plane + t / 2;
    position = [x, WALL_HEIGHT / 2, mid];
    args = [t, WALL_HEIGHT, length];
  }
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={seg.dimmed ? DIMMED_WALL : PALETTE.wall}
        roughness={0.95}
      />
    </mesh>
  );
}

function FreestandingBox({ box }: { box: FreestandingBoxDef }): ReactElement {
  const position: [number, number, number] = [
    (box.min[0] + box.max[0]) / 2,
    (box.min[1] + box.max[1]) / 2,
    (box.min[2] + box.max[2]) / 2,
  ];
  const args: [number, number, number] = [
    box.max[0] - box.min[0],
    box.max[1] - box.min[1],
    box.max[2] - box.min[2],
  ];
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={PALETTE.wall} roughness={0.95} />
    </mesh>
  );
}

/** Continuous accent band, coplanar quad at +0.02 ft off its wall plane. */
function AccentBand({ band }: { band: AccentBandDef }): ReactElement {
  const width = band.zRange[1] - band.zRange[0];
  const height = band.yRange[1] - band.yRange[0];
  const x =
    band.x +
    (band.faces === 'east' ? SURFACE_OFFSETS.band : -SURFACE_OFFSETS.band);
  const rotation: [number, number, number] =
    band.faces === 'east' ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0];
  return (
    <mesh
      position={[
        x,
        (band.yRange[0] + band.yRange[1]) / 2,
        (band.zRange[0] + band.zRange[1]) / 2,
      ]}
      rotation={rotation}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={band.color} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Floor
// ---------------------------------------------------------------------------

/**
 * One plane covers the L-shape's bounding box; the surplus corner
 * (x > 13, z < -23) is sealed off behind the alcove-east / main-north walls.
 */
function Floor(): ReactElement {
  const map = useMemo(() => {
    const texture = makeWoodFloorTexture();
    texture.repeat.set(
      ROOM_CONFIG.main.width / FLOOR_TILE_FT,
      TOTAL_DEPTH / FLOOR_TILE_FT,
    );
    return texture;
  }, []);
  return (
    <mesh
      position={[ROOM_CONFIG.main.width / 2, 0, -TOTAL_DEPTH / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[ROOM_CONFIG.main.width, TOTAL_DEPTH]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Ceiling with recessed perimeter cove
// ---------------------------------------------------------------------------

interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const MAIN_RECT: Rect = {
  minX: 0,
  maxX: ROOM_CONFIG.main.width,
  minZ: -ROOM_CONFIG.main.depth,
  maxZ: 0,
};
const ALCOVE_RECT: Rect = {
  minX: 0,
  maxX: ROOM_CONFIG.alcove.width,
  minZ: -TOTAL_DEPTH,
  maxZ: -ROOM_CONFIG.main.depth,
};
const VESTIBULE_RECT: Rect = {
  minX: ENTRANCE.gapStart,
  maxX: ENTRANCE.gapEnd,
  minZ: VESTIBULE.zRange[0],
  maxZ: VESTIBULE.zRange[1],
};

/** Downward-facing rectangle at height y (unlit, exact colour). */
function DownPlane({
  rect,
  y,
  color,
}: {
  rect: Rect;
  y: number;
  color: string;
}): ReactElement {
  return (
    <mesh
      position={[(rect.minX + rect.maxX) / 2, y, (rect.minZ + rect.maxZ) / 2]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[rect.maxX - rect.minX, rect.maxZ - rect.minZ]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * Four strips forming a rectangular ring between wall-offsets a..b.
 * flushOuter extends the N/S strips into the corners.
 */
function ringRects(r: Rect, a: number, b: number, flushOuter: boolean): Rect[] {
  const ox = flushOuter ? 0 : a;
  return [
    {
      minX: r.minX + ox,
      maxX: r.maxX - ox,
      minZ: r.minZ + a,
      maxZ: r.minZ + b,
    },
    {
      minX: r.minX + ox,
      maxX: r.maxX - ox,
      minZ: r.maxZ - b,
      maxZ: r.maxZ - a,
    },
    { minX: r.minX + a, maxX: r.minX + b, minZ: r.minZ + b, maxZ: r.maxZ - b },
    { minX: r.maxX - b, maxX: r.maxX - a, minZ: r.minZ + b, maxZ: r.maxZ - b },
  ];
}

interface FasciaDef {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
}

/**
 * Ceiling at y = 10 with the recessed perimeter soffit from the renders:
 * a 1.5-ft channel inset 1.5 ft from every wall, recessed 0.7 ft, with an
 * emissive white top (the cove light) and shaded vertical fascias.
 */
function CeilingWithCove({ rect }: { rect: Rect }): ReactElement {
  const i1 = CEILING_COVE.inset;
  const i2 = CEILING_COVE.inset + CEILING_COVE.width;
  const yTop = WALL_HEIGHT + CEILING_COVE.depth;
  const yMid = WALL_HEIGHT + CEILING_COVE.depth / 2;
  const { minX, maxX, minZ, maxZ } = rect;

  const outerRing = ringRects(rect, 0, i1, true);
  const channel = ringRects(rect, i1, i2, false);
  const central: Rect = {
    minX: minX + i2,
    maxX: maxX - i2,
    minZ: minZ + i2,
    maxZ: maxZ - i2,
  };

  const midX = (minX + maxX) / 2;
  const midZ = (minZ + maxZ) / 2;
  const spanX = maxX - minX;
  const spanZ = maxZ - minZ;
  const fascias: FasciaDef[] = [
    // Outer (wall-side) fascias face the room centre
    {
      position: [midX, yMid, minZ + i1],
      rotation: [0, 0, 0],
      width: spanX - 2 * i1,
    },
    {
      position: [midX, yMid, maxZ - i1],
      rotation: [0, Math.PI, 0],
      width: spanX - 2 * i1,
    },
    {
      position: [minX + i1, yMid, midZ],
      rotation: [0, Math.PI / 2, 0],
      width: spanZ - 2 * i1,
    },
    {
      position: [maxX - i1, yMid, midZ],
      rotation: [0, -Math.PI / 2, 0],
      width: spanZ - 2 * i1,
    },
    // Inner fascias face outward, toward the walls
    {
      position: [midX, yMid, minZ + i2],
      rotation: [0, Math.PI, 0],
      width: spanX - 2 * i2,
    },
    {
      position: [midX, yMid, maxZ - i2],
      rotation: [0, 0, 0],
      width: spanX - 2 * i2,
    },
    {
      position: [minX + i2, yMid, midZ],
      rotation: [0, -Math.PI / 2, 0],
      width: spanZ - 2 * i2,
    },
    {
      position: [maxX - i2, yMid, midZ],
      rotation: [0, Math.PI / 2, 0],
      width: spanZ - 2 * i2,
    },
  ];

  return (
    <group>
      {outerRing.map((r, i) => (
        <DownPlane
          key={`outer-${i}-${r.minX}-${r.minZ}`}
          rect={r}
          y={WALL_HEIGHT}
          color={PALETTE.ceiling}
        />
      ))}
      {channel.map((r, i) => (
        <DownPlane
          key={`channel-${i}-${r.minX}-${r.minZ}`}
          rect={r}
          y={yTop}
          color="#FFFFFF"
        />
      ))}
      <DownPlane rect={central} y={WALL_HEIGHT} color={PALETTE.ceiling} />
      {fascias.map((f) => (
        <mesh
          key={`fascia-${f.position.join(',')}-${f.rotation.join(',')}`}
          position={f.position}
          rotation={f.rotation}
        >
          <planeGeometry args={[f.width, CEILING_COVE.depth]} />
          <meshBasicMaterial color={COVE_FASCIA} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// SVG quad (spool logo / watermark)
// ---------------------------------------------------------------------------

interface SvgQuadProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  /** Flatten the artwork to this colour (watermark treatment) */
  tint?: string;
}

function SvgQuad({
  url,
  position,
  rotation,
  size,
  tint,
}: SvgQuadProps): ReactElement | null {
  const [width, height] = size;
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let active = true;
    makeSvgTexture(
      url,
      Math.round(width * SVG_PX_PER_FT),
      Math.round(height * SVG_PX_PER_FT),
      tint,
    )
      .then((tex) => {
        if (active) setTexture(tex);
      })
      .catch(() => {
        // Quad simply doesn't render if the SVG fails to load
      });
    return () => {
      active = false;
    };
  }, [url, tint, width, height]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Intro wall (alcove north wall) — navy panel + title lockup
// ---------------------------------------------------------------------------

/**
 * Navy panel and the "America's Tapestry" title lockup. The Virginia
 * tapestry and its wall text are placed here by TapestryPanel.
 */
function IntroWall(): ReactElement {
  const { navyPanel, lockup } = INTRO_WALL;
  const textZ = INTRO_WALL.z + SURFACE_OFFSETS.text;
  const panelWidth = navyPanel.xRange[1] - navyPanel.xRange[0];
  const panelHeight = navyPanel.yRange[1] - navyPanel.yRange[0];

  return (
    <group>
      <mesh
        position={[
          (navyPanel.xRange[0] + navyPanel.xRange[1]) / 2,
          (navyPanel.yRange[0] + navyPanel.yRange[1]) / 2,
          INTRO_WALL.z + SURFACE_OFFSETS.panel,
        ]}
      >
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color={navyPanel.color} />
      </mesh>

      <SvgQuad
        url={SPOOL_SVG_URL}
        position={[lockup.centerX, lockup.spool.centerY, textZ]}
        rotation={[0, 0, 0]}
        size={[...lockup.spool.size]}
      />
      <Text
        font={HEADING_FONT}
        fontSize={lockup.title.capHeight / CAP_RATIO}
        color={PALETTE.textNavy}
        anchorX="center"
        anchorY="middle"
        position={[lockup.centerX, lockup.title.centerY, textZ]}
      >
        {lockup.title.text}
      </Text>
      <Text
        font={HEADING_FONT}
        fontSize={lockup.tagline.capHeight / CAP_RATIO}
        letterSpacing={0.12}
        color={PALETTE.textNavy}
        anchorX="center"
        anchorY="middle"
        position={[lockup.centerX, lockup.tagline.centerY, textZ]}
      >
        {lockup.tagline.text}
      </Text>
      <WallText
        position={[lockup.centerX, lockup.paragraphs.centerY, textZ]}
        rotation={[0, 0, 0]}
        size={[...lockup.paragraphs.blockSize]}
        paragraphs={[...lockup.paragraphs.text]}
        color={PALETTE.textNavy}
        align="center"
        bodyCapFt={0.1}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Shop wall (main-room north wall, faces south)
// ---------------------------------------------------------------------------

/** One framed product mockup: slim frame quad behind an image quad. */
function ShopProduct({
  url,
  centerX,
}: {
  url: string;
  centerX: number;
}): ReactElement {
  const [width, height] = SHOP_WALL.products.size;
  const texture = useTexture(url, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
  });
  return (
    <group>
      <mesh
        position={[
          centerX,
          SHOP_WALL.products.centerY,
          SHOP_WALL.z + SURFACE_OFFSETS.panel,
        ]}
      >
        <planeGeometry
          args={[
            width + 2 * FRAME_CONFIG.frameWidth,
            height + 2 * FRAME_CONFIG.frameWidth,
          ]}
        />
        <meshBasicMaterial color={FRAME_CONFIG.color} />
      </mesh>
      <mesh
        position={[
          centerX,
          SHOP_WALL.products.centerY,
          SHOP_WALL.z + SURFACE_OFFSETS.text,
        ]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Shop-stop composition: heading, three framed product mockups, and a
 * paragraph, centred at x = 17 on the north wall's visible span.
 */
function ShopWall(): ReactElement {
  const textZ = SHOP_WALL.z + SURFACE_OFFSETS.text;
  const { images, spacing } = SHOP_WALL.products;
  return (
    <group>
      <Text
        font={HEADING_FONT}
        fontSize={SHOP_WALL.heading.capHeight / CAP_RATIO}
        color={PALETTE.textNavy}
        anchorX="center"
        anchorY="middle"
        position={[SHOP_WALL.centerX, SHOP_WALL.heading.centerY, textZ]}
      >
        {SHOP_WALL.heading.text}
      </Text>
      <Suspense fallback={null}>
        {images.map((url, i) => (
          <ShopProduct
            key={url}
            url={url}
            centerX={
              SHOP_WALL.centerX + (i - (images.length - 1) / 2) * spacing
            }
          />
        ))}
      </Suspense>
      <WallText
        position={[SHOP_WALL.centerX, SHOP_WALL.paragraph.centerY, textZ]}
        rotation={[0, 0, 0]}
        size={[...SHOP_WALL.paragraph.blockSize]}
        paragraphs={[SHOP_WALL.paragraph.text]}
        color={PALETTE.textNavy}
        align="center"
        bodyCapFt={0.1}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Credits wall (credits partition west face)
// ---------------------------------------------------------------------------

/** Vertical slots for the four credit sections (centre y, block height). */
const CREDITS_SECTION_SLOTS: Array<{ y: number; h: number }> = [
  { y: 6.95, h: 0.7 }, // PROJECT DIRECTOR
  { y: 5.95, h: 1.2 }, // STATE DIRECTORS
  { y: 4.35, h: 1.9 }, // HISTORICAL COLLABORATORS
  { y: 3.1, h: 0.9 }, // SPONSORS
];

/**
 * Credits composition: spool, thanks line, four name sections, and the
 * Seton Hill / Muscarelle acknowledgements as small text lines (the
 * wordmark/logo blocks from the renders are deliberately skipped).
 */
function CreditsWall(): ReactElement {
  // The face points west, so content sits WEST of the plane (-x offset)
  const x = CREDITS_WALL.x - SURFACE_OFFSETS.text;
  const rotation: [number, number, number] = [0, -Math.PI / 2, 0];
  const z = CREDITS_WALL.centerZ;
  const columnWidth = CREDITS_WALL.columnWidth;

  return (
    <group>
      <SvgQuad
        url={SPOOL_SVG_URL}
        position={[x, CREDITS_WALL.spool.centerY, z]}
        rotation={rotation}
        size={[...CREDITS_WALL.spool.size]}
      />
      <WallText
        position={[x, 7.75, z]}
        rotation={rotation}
        size={[columnWidth - 0.5, 0.8]}
        paragraphs={[CREDITS_WALL.intro]}
        color={PALETTE.textNavy}
        align="center"
        italic
        bodyCapFt={0.09}
      />
      {CREDITS_WALL.sections.map((section, i) => {
        const slot = CREDITS_SECTION_SLOTS[i] ?? { y: 3, h: 1 };
        return (
          <WallText
            key={section.heading}
            position={[x, slot.y, z]}
            rotation={rotation}
            size={[columnWidth, slot.h]}
            heading={section.heading}
            paragraphs={[section.names.join(', ')]}
            color={PALETTE.textNavy}
            align="center"
            headingCapFt={0.1}
            bodyCapFt={0.09}
          />
        );
      })}
      <WallText
        position={[x, CREDITS_WALL.setonHill.centerY, z]}
        rotation={rotation}
        size={[4.0, 0.5]}
        paragraphs={['Seton Hill University']}
        color={CREDITS_WALL.setonHill.color}
        align="center"
        bodyCapFt={0.14}
      />
      <WallText
        position={[x, CREDITS_WALL.muscarelle.centerY, z]}
        rotation={rotation}
        size={[4.0, 0.5]}
        paragraphs={['Muscarelle Museum of Art']}
        color={CREDITS_WALL.muscarelle.color}
        align="center"
        bodyCapFt={0.14}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

export default function GalleryRoom(): ReactElement {
  return (
    <group>
      {/*
        Bright shadowless museum light. Tech-spec values (ambient 1.1,
        hemi 0.5, dir 0.6) assumed legacy lighting; three's physical mode
        divides diffuse by PI, so intensities are scaled ~x PI to match
        the renders' near-white walls.
      */}
      <ambientLight intensity={2.2} />
      <hemisphereLight args={['#ffffff', '#d8d2c8', 0.7]} />
      <directionalLight position={[12, 20, -6]} intensity={0.5} />

      {WALL_SEGMENTS.map((seg) => (
        <WallBox key={seg.id} seg={seg} />
      ))}
      {FREESTANDING.map((box) => (
        <FreestandingBox key={box.id} box={box} />
      ))}
      {ACCENT_BANDS.map((band) => (
        <AccentBand key={band.id} band={band} />
      ))}

      <Floor />
      {/* Dimmed vestibule floor (outside the wood-floor plane, z > 0) */}
      <mesh
        position={[
          (ENTRANCE.gapStart + ENTRANCE.gapEnd) / 2,
          0,
          (VESTIBULE.zRange[0] + VESTIBULE.zRange[1]) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[
            ENTRANCE.gapEnd - ENTRANCE.gapStart,
            VESTIBULE.zRange[1] - VESTIBULE.zRange[0],
          ]}
        />
        <meshStandardMaterial color={DIMMED_FLOOR} roughness={0.9} />
      </mesh>

      <CeilingWithCove rect={MAIN_RECT} />
      <CeilingWithCove rect={ALCOVE_RECT} />
      <DownPlane rect={VESTIBULE_RECT} y={WALL_HEIGHT} color={DIMMED_CEILING} />

      {/* Spool watermark on the NE pillar's west face */}
      <SvgQuad
        url={SPOOL_SVG_URL}
        position={[...SPOOL_WATERMARK.position]}
        rotation={[...SPOOL_WATERMARK.rotation]}
        size={[...SPOOL_WATERMARK.size]}
        tint={SPOOL_WATERMARK.color}
      />

      <IntroWall />
      <CreditsWall />
      <ShopWall />
    </group>
  );
}
