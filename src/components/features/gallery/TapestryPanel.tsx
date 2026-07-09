'use client';

import { useTexture } from '@react-three/drei';
import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { type MeshStandardMaterial, SRGBColorSpace } from 'three';
import WallText from './WallText';
import {
  FRAME_CONFIG,
  PALETTE,
  WALL_TEXT,
  wallTextCenter,
} from './galleryLayout';
import type { GalleryTapestryData, TapestryPlacement } from './types';

export interface TapestryPanelProps {
  data: GalleryTapestryData;
  placement: TapestryPlacement;
  /** This tapestry's stop is the current one */
  selected: boolean;
  /** Visit this tapestry's stop AND play its audio (user gesture) */
  onSelect: (slug: string) => void;
}

/**
 * Distance the accent panel sits behind the textile quad along the wall
 * normal. Placement positions bake the tapestry's proud offset (0.06 ft on
 * partition/south walls, 0.12 ft on the envelope walls), so a fixed 0.04 ft
 * setback keeps the panel strictly between wall and tapestry everywhere
 * (+0.02 ft minimum off the wall plane — no z-fighting on either side).
 */
const PANEL_SETBACK = 0.04;

/** R3F click events fire after drag-look releases; ignore moved pointers. */
const CLICK_DRAG_TOLERANCE_PX = 6;

// Shared drag guard: R3F's e.delta is NET displacement, so a drag that
// returns near its origin still "clicks". Track whether the pointer ever
// moved beyond the tolerance since pointerdown (one window listener pair,
// ref-counted across panels).
let dragGuardMounts = 0;
let dragGuardDownX = 0;
let dragGuardDownY = 0;
let dragGuardMoved = false;
function onDragGuardDown(e: PointerEvent): void {
  dragGuardDownX = e.clientX;
  dragGuardDownY = e.clientY;
  dragGuardMoved = false;
}
function onDragGuardMove(e: PointerEvent): void {
  if (dragGuardMoved) return;
  if (
    Math.hypot(e.clientX - dragGuardDownX, e.clientY - dragGuardDownY) >
    CLICK_DRAG_TOLERANCE_PX
  ) {
    dragGuardMoved = true;
  }
}
function useDragGuard(): void {
  useEffect(() => {
    if (dragGuardMounts === 0) {
      window.addEventListener('pointerdown', onDragGuardDown);
      window.addEventListener('pointermove', onDragGuardMove);
    }
    dragGuardMounts += 1;
    return () => {
      dragGuardMounts -= 1;
      if (dragGuardMounts === 0) {
        window.removeEventListener('pointerdown', onDragGuardDown);
        window.removeEventListener('pointermove', onDragGuardMove);
      }
    };
  }, []);
}

/** Hover emissive lift: target intensity, ~150ms exponential approach. */
const HOVER_EMISSIVE = 0.08;
const HOVER_LAMBDA = 20;

/** Unit wall normal [nx, nz] for the four cardinal wall orientations. */
function wallNormal(yaw: number): [number, number] {
  if (yaw === 0) return [0, 1]; // faces south
  if (yaw === Math.PI) return [0, -1]; // faces north
  if (yaw === Math.PI / 2) return [1, 0]; // faces east (west wall)
  return [-1, 0]; // faces west (east wall)
}

/** Accent colour behind this placement (its panel, or the wall's band). */
function accentColor(placement: TapestryPlacement): string {
  if (placement.panel) return placement.panel.color;
  // Band-mounted tapestries: west wall carries the navy band, east the oxblood.
  return placement.rotation[1] === Math.PI / 2
    ? PALETTE.navyBand
    : PALETTE.oxbloodBand;
}

/**
 * Frame centre offset along the local wall normal: the 0.06-ft-deep frame
 * spans -0.015..+0.045 around the textile plane, so its front face sits
 * proud of the textile (the textile reads as set inside the frame) while
 * its back face still clears the accent panel 0.04 ft behind.
 */
const FRAME_CENTER_OFFSET = 0.015;

/** Narrow charcoal box frame around the textile quad (all four sides). */
function TapestryFrame({
  placement,
}: {
  placement: TapestryPlacement;
}): React.ReactElement {
  const [width, height] = placement.size;
  const border = FRAME_CONFIG.frameWidth;
  const depth = FRAME_CONFIG.depth;
  const pieces: Array<{
    key: string;
    position: [number, number, number];
    args: [number, number, number];
  }> = [
    {
      key: 'top',
      position: [0, height / 2 + border / 2, FRAME_CENTER_OFFSET],
      args: [width + 2 * border, border, depth],
    },
    {
      key: 'bottom',
      position: [0, -(height / 2 + border / 2), FRAME_CENTER_OFFSET],
      args: [width + 2 * border, border, depth],
    },
    {
      key: 'left',
      position: [-(width / 2 + border / 2), 0, FRAME_CENTER_OFFSET],
      args: [border, height, depth],
    },
    {
      key: 'right',
      position: [width / 2 + border / 2, 0, FRAME_CENTER_OFFSET],
      args: [border, height, depth],
    },
  ];
  return (
    <group position={placement.position} rotation={placement.rotation}>
      {pieces.map((piece) => (
        <mesh key={piece.key} position={piece.position}>
          <boxGeometry args={piece.args} />
          <meshStandardMaterial
            color={FRAME_CONFIG.color}
            roughness={FRAME_CONFIG.roughness}
          />
        </mesh>
      ))}
    </group>
  );
}

interface QuadProps {
  placement: TapestryPlacement;
  slug: string;
  onSelect: (slug: string) => void;
}

/** Accent-coloured stand-in shown while the textile texture streams in. */
function PlaceholderQuad({
  placement,
  slug,
  onSelect,
}: QuadProps): React.ReactElement {
  useDragGuard();
  const handleClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    if (dragGuardMoved || e.delta > CLICK_DRAG_TOLERANCE_PX) return;
    onSelect(slug);
  };
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: R3F mesh, not DOM — keyboard access is the hidden tapestry nav
    <mesh
      position={placement.position}
      rotation={placement.rotation}
      onClick={handleClick}
    >
      <planeGeometry args={placement.size} />
      <meshBasicMaterial color={accentColor(placement)} />
    </mesh>
  );
}

interface TextileQuadProps extends QuadProps {
  url: string;
}

/** The tapestry textile itself — suspends until its texture loads. */
function TextileQuad({
  url,
  placement,
  slug,
  onSelect,
}: TextileQuadProps): React.ReactElement {
  const gl = useThree((state) => state.gl);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);
  useDragGuard();

  const texture = useTexture(url, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
    loaded.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  });

  // Reset the cursor if this panel unmounts mid-hover.
  useEffect(
    () => () => {
      if (hoveredRef.current) document.body.style.cursor = 'auto';
    },
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const target = hoveredRef.current ? HOVER_EMISSIVE : 0;
    const k = 1 - Math.exp(-HOVER_LAMBDA * Math.min(delta, 0.1));
    material.emissiveIntensity += (target - material.emissiveIntensity) * k;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    if (dragGuardMoved || e.delta > CLICK_DRAG_TOLERANCE_PX) return;
    onSelect(slug);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    hoveredRef.current = true;
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (): void => {
    hoveredRef.current = false;
    document.body.style.cursor = 'auto';
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: R3F mesh, not DOM — keyboard access is the hidden tapestry nav
    <mesh
      position={placement.position}
      rotation={placement.rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={placement.size} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        roughness={0.9}
        emissive="#ffffff"
        emissiveIntensity={0}
      />
    </mesh>
  );
}

/**
 * One hung tapestry: optional per-state accent panel (coplanar with the
 * wall, +0.02 ft minimum offset), the textile quad proud of the surface,
 * and its wall-text label block. The textile is the click/hover target.
 */
export default function TapestryPanel({
  data,
  placement,
  onSelect,
}: TapestryPanelProps): React.ReactElement {
  const yaw = placement.rotation[1];
  const [nx, nz] = wallNormal(yaw);

  let panelMesh: React.ReactElement | null = null;
  if (placement.panel) {
    const { color, range, yRange } = placement.panel;
    const width = range[1] - range[0];
    const height = yRange[1] - yRange[0];
    const midAlong = (range[0] + range[1]) / 2;
    const midY = (yRange[0] + yRange[1]) / 2;
    // `range` runs along x for north/south-facing walls, along z otherwise.
    const position: [number, number, number] =
      nz !== 0
        ? [midAlong, midY, placement.position[2] - nz * PANEL_SETBACK]
        : [placement.position[0] - nx * PANEL_SETBACK, midY, midAlong];
    panelMesh = (
      <mesh position={position} rotation={placement.rotation}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    );
  }

  return (
    <group>
      {panelMesh}
      <TapestryFrame placement={placement} />
      <Suspense
        fallback={
          <PlaceholderQuad
            placement={placement}
            slug={data.slug}
            onSelect={onSelect}
          />
        }
      >
        <TextileQuad
          url={data.imageUrl}
          placement={placement}
          slug={data.slug}
          onSelect={onSelect}
        />
      </Suspense>
      {/* Outside the Suspense boundary: labels never wait for the textile image. */}
      <WallText
        position={wallTextCenter(placement)}
        rotation={placement.rotation}
        size={WALL_TEXT.size}
        heading={data.name.toUpperCase()}
        paragraphs={[data.description]}
        color="#FFFFFF"
        align="justify"
      />
    </group>
  );
}
