import { Canvas } from '@react-three/fiber';

/**
 * GalleryScene - R3F Canvas with proof-of-life 3D scene
 *
 * This component is dynamically imported with ssr: false by GalleryClient,
 * so it is guaranteed to run only in the browser. It renders a simple
 * orange box as proof that the R3F pipeline is working correctly.
 *
 * This scene will be replaced with the full gallery environment in Plan 02.
 */
export default function GalleryScene(): React.ReactElement {
  return (
    <Canvas camera={{ fov: 75, position: [0, 2, 5] }}>
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Canvas>
  );
}
