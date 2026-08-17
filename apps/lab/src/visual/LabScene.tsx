import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useMemo } from "react";

export interface LabSceneProps {
  modelUrl: string | null;
}

function GltfModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return <primitive object={scene} />;
}

function EmptySceneMarker() {
  return (
    <mesh>
      <icosahedronGeometry args={[0.65, 2]} />
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

export function LabScene({ modelUrl }: LabSceneProps) {
  return (
    <Canvas camera={{ position: [2.6, 1.8, 4.2], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Center>{modelUrl ? <GltfModel url={modelUrl} /> : <EmptySceneMarker />}</Center>
        </Bounds>

        <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[5, 0.05, 5]} position={[0, -1.25, 0]} />
          </RigidBody>
        </Physics>
      </Suspense>

      <gridHelper args={[10, 20]} position={[0, -1.2, 0]} />
      <OrbitControls makeDefault enableDamping />
    </Canvas>
  );
}
