import { TAPESTRY_PLACEMENTS } from './constants';
import { FramedTapestry } from './FramedTapestry';

/**
 * TapestryWall - Renders all 13 colony tapestries on Gallery 7 walls
 *
 * Maps over TAPESTRY_PLACEMENTS configuration and renders a FramedTapestry
 * for each entry. This component should be wrapped in a Suspense boundary
 * so the room geometry renders immediately while textures load.
 */
export default function TapestryWall(): React.ReactElement {
  return (
    <group>
      {TAPESTRY_PLACEMENTS.map((placement) => (
        <FramedTapestry
          key={placement.slug}
          imagePath={placement.imagePath}
          displayWidth={placement.displayWidth}
          displayHeight={placement.displayHeight}
          position={placement.position}
          rotation={placement.rotation}
        />
      ))}
    </group>
  );
}
