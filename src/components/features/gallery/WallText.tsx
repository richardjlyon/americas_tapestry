'use client';

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { CanvasTexture } from 'three';
import {
  type TextPanelOptions,
  makeTextPanelTexture,
} from './proceduralTextures';

export interface WallTextProps {
  /** World-space centre of the text block */
  position: [number, number, number];
  /** Same wall-orientation convention as TapestryPlacement */
  rotation: [number, number, number];
  /** Block [width, height] in feet */
  size: [number, number];
  /** Letterspaced-caps heading (e.g. state name); omit for paragraph-only blocks */
  heading?: string | undefined;
  /** Body paragraphs, justified by default */
  paragraphs?: string[] | undefined;
  /** Text colour (white on panels/bands, navy on white walls) */
  color: string;
  align?: 'left' | 'center' | 'justify' | undefined;
  /** Heading cap height in feet (default 0.09) */
  headingCapFt?: number | undefined;
  /** Body cap height in feet (default 0.05) */
  bodyCapFt?: number | undefined;
  /** Synthetic-oblique body text */
  italic?: boolean | undefined;
}

/**
 * A wall-mounted text quad: paragraphs (and an optional letterspaced-caps
 * heading) rendered to a CanvasTexture in EB Garamond. Renders nothing
 * until the async texture resolves — the canvas draw awaits the FontFace
 * load, so this uses effect + state rather than Suspense.
 */
export default function WallText({
  position,
  rotation,
  size,
  heading,
  paragraphs,
  color,
  align,
  headingCapFt,
  bodyCapFt,
  italic,
}: WallTextProps): ReactElement | null {
  // Serialised options double as a stable effect dependency
  const optionsKey = JSON.stringify({
    title: heading,
    paragraphs: paragraphs ?? [],
    widthFt: size[0],
    heightFt: size[1],
    color,
    align,
    titleCapFt: headingCapFt,
    bodyCapFt,
    italic,
  } satisfies TextPanelOptions);

  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let active = true;
    makeTextPanelTexture(JSON.parse(optionsKey) as TextPanelOptions)
      .then((tex) => {
        if (active) setTexture(tex);
      })
      .catch(() => {
        // Texture stays null; the block simply doesn't render
      });
    return () => {
      active = false;
    };
  }, [optionsKey]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}
