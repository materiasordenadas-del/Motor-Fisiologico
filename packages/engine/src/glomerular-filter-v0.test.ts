import { describe, expect, it } from "vitest";
import { PhysiologyEngine } from "./index.js";
import {
  GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
  GLOMERULAR_PARTICLES,
  GLOMERULAR_SENSOR_ID,
  GLOMERULAR_VARIABLE_IDS,
  evaluateGlomerularParticleFromStateV0,
  handleGlomerularPhysicsEventV0,
  initializeGlomerularFilterV0,
  setGlomerularBarrierIntegrityV0,
} from "./glomerular-filter-v0.js";

function createEngine() {
  return new PhysiologyEngine({
    fixedDtSeconds: 0.05,
    variableDefinitions: GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
  });
}

describe("glomerular-filter-v0", () => {
  it("blocks the RBC and passes the small particle with an intact baseline barrier", () => {
    const engine = createEngine();
    const state = initializeGlomerularFilterV0(engine);

    expect(state.variables[GLOMERULAR_VARIABLE_IDS.integrity]).toBe(1);
    expect(state.variables[GLOMERULAR_VARIABLE_IDS.effectiveCutoff]).toBe(7);
    expect(state.variables[GLOMERULAR_VARIABLE_IDS.smallParticleCanPass]).toBe(1);
    expect(state.variables[GLOMERULAR_VARIABLE_IDS.rbcCanPass]).toBe(0);

    expect(evaluateGlomerularParticleFromStateV0(engine, GLOMERULAR_PARTICLES.small.id).canPass).toBe(true);
    expect(evaluateGlomerularParticleFromStateV0(engine, GLOMERULAR_PARTICLES.rbc.id).canPass).toBe(false);
  });

  it("allows the RBC after sufficient didactic barrier damage", () => {
    const engine = createEngine();
    initializeGlomerularFilterV0(engine);
    const state = setGlomerularBarrierIntegrityV0(engine, 0.4);

    expect(state.variables[GLOMERULAR_VARIABLE_IDS.effectiveCutoff]).toBeCloseTo(13, 12);
    expect(state.variables[GLOMERULAR_VARIABLE_IDS.permeability]).toBeCloseTo(0.6, 12);
    expect(state.variables[GLOMERULAR_VARIABLE_IDS.rbcCanPass]).toBe(1);
    expect(evaluateGlomerularParticleFromStateV0(engine, GLOMERULAR_PARTICLES.rbc.id).canPass).toBe(true);
  });

  it("produces an Engine decision from a physics sensor event without Rapier", () => {
    const engine = createEngine();
    initializeGlomerularFilterV0(engine);

    const event = handleGlomerularPhysicsEventV0(engine, {
      id: "sensor-request-1",
      type: "sensor_enter",
      source: "physics",
      simulationTimeSeconds: 0,
      payload: {
        sensorId: GLOMERULAR_SENSOR_ID,
        particleId: GLOMERULAR_PARTICLES.rbc.id,
      },
    });

    expect(event?.source).toBe("engine");
    expect(event?.type).toBe("glomerular_filter_decision");
    expect(event?.payload?.canPass).toBe(false);
  });

  it("clamps integrity to 0..1", () => {
    const engine = createEngine();
    initializeGlomerularFilterV0(engine);
    expect(setGlomerularBarrierIntegrityV0(engine, -1).variables[GLOMERULAR_VARIABLE_IDS.integrity]).toBe(0);
    expect(setGlomerularBarrierIntegrityV0(engine, 2).variables[GLOMERULAR_VARIABLE_IDS.integrity]).toBe(1);
  });
});
