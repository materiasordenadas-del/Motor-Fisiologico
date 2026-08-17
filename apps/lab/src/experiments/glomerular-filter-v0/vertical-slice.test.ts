import {
  GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
  GLOMERULAR_PARTICLES,
  GLOMERULAR_SENSOR_ID,
  PhysiologyEngine,
  handleGlomerularPhysicsEventV0,
  initializeGlomerularFilterV0,
  setGlomerularBarrierIntegrityV0,
} from "@motor-fisiologico/engine";
import { describe, expect, it } from "vitest";
import { toGlomerularRepresentationDecision } from "./representation.js";

function requestDecision(engine: PhysiologyEngine, particleId: string) {
  const engineEvent = handleGlomerularPhysicsEventV0(engine, {
    id: `physics-request:${particleId}`,
    type: "sensor_enter",
    source: "physics",
    simulationTimeSeconds: engine.snapshot().clock.simulationTimeSeconds,
    payload: { sensorId: GLOMERULAR_SENSOR_ID, particleId },
  });
  if (!engineEvent) throw new Error("Expected an Engine filtration decision event");
  return toGlomerularRepresentationDecision(engineEvent);
}

describe("glomerular filter vertical slice", () => {
  it("flows from physics request through Engine authority to representation", () => {
    const engine = new PhysiologyEngine({
      fixedDtSeconds: 0.05,
      variableDefinitions: GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
    });
    initializeGlomerularFilterV0(engine);

    expect(requestDecision(engine, GLOMERULAR_PARTICLES.small.id)?.canPass).toBe(true);
    expect(requestDecision(engine, GLOMERULAR_PARTICLES.rbc.id)?.canPass).toBe(false);

    setGlomerularBarrierIntegrityV0(engine, 0.4);
    expect(requestDecision(engine, GLOMERULAR_PARTICLES.rbc.id)?.canPass).toBe(true);
  });
});
