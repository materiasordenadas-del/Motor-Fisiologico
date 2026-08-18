import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import {
  GLOMERULAR_PARTICLES,
  GLOMERULAR_SENSOR_ID,
  GLOMERULAR_VARIABLE_IDS,
} from "@motor-fisiologico/engine";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { PhysiologyWorkerController } from "../../engine/usePhysiologyWorker.js";
import {
  toGlomerularRepresentationDecision,
  type GlomerularRepresentationDecision,
} from "./representation.js";

interface ParticleBodyProps {
  particleId: string;
  y: number;
  radius: number;
  decision: GlomerularRepresentationDecision | undefined;
  resetKey: number;
  kind: "small" | "rbc";
}

function ParticleBody({ particleId, y, radius, decision, resetKey, kind }: ParticleBodyProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setTranslation({ x: -2.1, y, z: 0 }, true);
    body.setLinvel({ x: 1.15, y: 0, z: 0 }, true);
  }, [resetKey, y]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !decision?.canPass) return;
    body.setTranslation({ x: radius + 0.06, y, z: 0 }, true);
    body.setLinvel({ x: 1.15, y: 0, z: 0 }, true);
  }, [decision?.canPass, decision?.eventId, y]);

  return (
    <RigidBody
      ref={bodyRef}
      name={particleId}
      colliders={false}
      gravityScale={0}
      linearDamping={0}
      angularDamping={1}
      lockRotations
      position={[-2.1, y, 0]}
      linearVelocity={[1.15, 0, 0]}
    >
      <BallCollider args={[radius]} />
      {kind === "rbc" ? (
        <mesh scale={[1, 0.35, 1]}>
          <sphereGeometry args={[radius, 28, 18]} />
          <meshStandardMaterial roughness={0.55} />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[radius, 20, 14]} />
          <meshStandardMaterial roughness={0.45} />
        </mesh>
      )}
    </RigidBody>
  );
}

interface GlomerularWorldProps {
  controller: PhysiologyWorkerController;
  resetKey: number;
}

function GlomerularWorld({ controller, resetKey }: GlomerularWorldProps) {
  const integrity = controller.state?.variables[GLOMERULAR_VARIABLE_IDS.integrity] ?? 1;
  const latestDecisions = useMemo(() => {
    const result = new Map<string, GlomerularRepresentationDecision>();
    for (const event of controller.simulationEvents) {
      const decision = toGlomerularRepresentationDecision(event);
      if (decision) result.set(decision.particleId, decision);
    }
    return result;
  }, [controller.simulationEvents]);

  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[3, 5, 4]} intensity={2.3} />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} />

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.09, 2.5, 2.1]} />
        <meshStandardMaterial transparent opacity={0.25 + integrity * 0.45} roughness={0.4} />
      </mesh>

      <mesh position={[-1.45, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.07, 12, 48]} />
        <meshStandardMaterial roughness={0.6} />
      </mesh>

      <Physics gravity={[0, 0, 0]} timeStep={1 / 60}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[0.05, 1.15, 0.95]}
            position={[-0.24, 0, 0]}
            sensor
            onIntersectionEnter={({ other }) => {
              const particleId = other.rigidBodyObject?.name;
              if (!particleId) return;
              controller.emitPhysicsEvent("sensor_enter", {
                sensorId: GLOMERULAR_SENSOR_ID,
                particleId,
              });
            }}
          />
          <CuboidCollider args={[0.045, 1.2, 1]} position={[0, 0, 0]} />
        </RigidBody>

        <ParticleBody
          particleId={GLOMERULAR_PARTICLES.small.id}
          y={0.5}
          radius={0.13}
          kind="small"
          resetKey={resetKey}
          decision={latestDecisions.get(GLOMERULAR_PARTICLES.small.id)}
        />
        <ParticleBody
          particleId={GLOMERULAR_PARTICLES.rbc.id}
          y={-0.45}
          radius={0.28}
          kind="rbc"
          resetKey={resetKey}
          decision={latestDecisions.get(GLOMERULAR_PARTICLES.rbc.id)}
        />
      </Physics>

      <gridHelper args={[6, 24]} position={[0, -1.35, 0]} />
      <OrbitControls makeDefault enableDamping target={[-0.35, 0, 0]} />
    </>
  );
}

export interface GlomerularFilterSceneProps {
  controller: PhysiologyWorkerController;
  resetKey: number;
}

export function GlomerularFilterScene({ controller, resetKey }: GlomerularFilterSceneProps) {
  return (
    <Canvas camera={{ position: [0.4, 2.1, 4.8], fov: 44 }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <GlomerularWorld controller={controller} resetKey={resetKey} />
      </Suspense>
    </Canvas>
  );
}
