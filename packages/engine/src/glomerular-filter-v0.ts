import type {
  Particle,
  PhysiologyState,
  RuleOperation,
  SimulationEvent,
  VariableDefinition,
} from "@motor-fisiologico/contracts";

export const GLOMERULAR_FILTER_V0_ID = "glomerular-filter-v0";
export const GLOMERULAR_BARRIER_ID = "renal.glomerular_barrier";
export const GLOMERULAR_SENSOR_ID = "renal.glomerular_barrier.sensor";

export const GLOMERULAR_VARIABLE_IDS = {
  integrity: "renal.glomerular_barrier.integrity",
  baseCutoff: "renal.glomerular_barrier.base_cutoff",
  effectiveCutoff: "renal.glomerular_barrier.effective_cutoff",
  permeability: "renal.glomerular_barrier.permeability",
  smallParticleCanPass: "renal.glomerular_filter.small_particle_can_pass",
  rbcCanPass: "renal.glomerular_filter.rbc_can_pass",
} as const;

export const GLOMERULAR_PARTICLES = {
  small: {
    id: "glomerular.small-particle",
    kind: "small-particle",
    filterSize: 2,
    representationFactor: 1,
  },
  rbc: {
    id: "glomerular.rbc",
    kind: "erythrocyte",
    filterSize: 12,
    representationFactor: 1,
  },
} as const satisfies Record<string, Particle>;

/**
 * Teaching-only V0 calibration. These values are dimensionless filter units,
 * not pore diameters or direct biological measurements.
 *
 * The architecture document explicitly permits this temporary size-cutoff
 * abstraction for the first vertical slice. RBC handling is intentionally
 * isolated so it can later be replaced by a structural leak/probability model.
 */
export const GLOMERULAR_FILTER_V0_CALIBRATION = {
  baseCutoff: 7,
  damageCutoffGain: 10,
} as const;

export const GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS: readonly VariableDefinition[] = [
  {
    id: GLOMERULAR_VARIABLE_IDS.integrity,
    name: "Glomerular barrier integrity",
    kind: "parameter",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "0..1",
    description: "Normalized teaching control. 1 = intact baseline, 0 = maximal damage in this V0 experiment.",
  },
  {
    id: GLOMERULAR_VARIABLE_IDS.baseCutoff,
    name: "Base didactic filter cutoff",
    kind: "parameter",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "filter units",
    description: "Teaching-only size cutoff baseline; not a biological pore diameter.",
  },
  {
    id: GLOMERULAR_VARIABLE_IDS.effectiveCutoff,
    name: "Effective didactic filter cutoff",
    kind: "calculated",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "filter units",
  },
  {
    id: GLOMERULAR_VARIABLE_IDS.permeability,
    name: "Normalized permeability index",
    kind: "calculated",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "0..1",
    description: "Pedagogical V0 index derived from integrity; not a measured permeability coefficient.",
  },
  {
    id: GLOMERULAR_VARIABLE_IDS.smallParticleCanPass,
    name: "Small particle can pass",
    kind: "output",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "boolean 0/1",
  },
  {
    id: GLOMERULAR_VARIABLE_IDS.rbcCanPass,
    name: "RBC can pass",
    kind: "output",
    canonicalUnit: "1",
    dimension: "dimensionless",
    displayUnit: "boolean 0/1",
    description: "V0 teaching abstraction only. Future RBC leak must use a dedicated structural/probabilistic mechanism.",
  },
] as const;

export interface GlomerularBarrierDerivedState {
  integrity: number;
  baseCutoff: number;
  effectiveCutoff: number;
  permeability: number;
}

export interface GlomerularFiltrationDecision {
  particleId: string;
  barrierId: string;
  canPass: boolean;
  filterSize: number;
  effectiveCutoff: number;
  integrity: number;
  mechanismId: "didactic-size-cutoff-v0";
}

interface EngineStatePort {
  get(variableId: string): number | undefined;
}

export interface GlomerularEnginePort {
  readonly state: EngineStatePort;
  applyRules(operations: readonly RuleOperation[]): PhysiologyState;
  snapshot(): PhysiologyState;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Barrier integrity must be finite");
  return Math.min(1, Math.max(0, value));
}

export function deriveGlomerularBarrierV0(integrity: number): GlomerularBarrierDerivedState {
  const normalizedIntegrity = clamp01(integrity);
  const damage = 1 - normalizedIntegrity;
  const baseCutoff = GLOMERULAR_FILTER_V0_CALIBRATION.baseCutoff;
  return {
    integrity: normalizedIntegrity,
    baseCutoff,
    effectiveCutoff: baseCutoff + damage * GLOMERULAR_FILTER_V0_CALIBRATION.damageCutoffGain,
    permeability: damage,
  };
}

export function evaluateGlomerularParticleV0(
  particle: Particle,
  barrier: GlomerularBarrierDerivedState,
): GlomerularFiltrationDecision {
  if (particle.filterSize === undefined || !Number.isFinite(particle.filterSize)) {
    throw new Error(`Particle ${particle.id} requires a finite filterSize`);
  }
  return {
    particleId: particle.id,
    barrierId: GLOMERULAR_BARRIER_ID,
    canPass: particle.filterSize <= barrier.effectiveCutoff,
    filterSize: particle.filterSize,
    effectiveCutoff: barrier.effectiveCutoff,
    integrity: barrier.integrity,
    mechanismId: "didactic-size-cutoff-v0",
  };
}

function stateOperations(integrity: number): readonly RuleOperation[] {
  const barrier = deriveGlomerularBarrierV0(integrity);
  const smallDecision = evaluateGlomerularParticleV0(GLOMERULAR_PARTICLES.small, barrier);
  const rbcDecision = evaluateGlomerularParticleV0(GLOMERULAR_PARTICLES.rbc, barrier);

  return [
    {
      id: "glomerular-filter-v0.integrity",
      layer: "constraint",
      target: GLOMERULAR_VARIABLE_IDS.integrity,
      operation: "set",
      value: barrier.integrity,
      note: "Clamp integrity to the V0 normalized range 0..1.",
    },
    {
      id: "glomerular-filter-v0.base-cutoff",
      layer: "local_specification",
      target: GLOMERULAR_VARIABLE_IDS.baseCutoff,
      operation: "set",
      value: barrier.baseCutoff,
      note: "Teaching-only baseline in didactic filter units.",
    },
    {
      id: "glomerular-filter-v0.effective-cutoff",
      layer: "result",
      target: GLOMERULAR_VARIABLE_IDS.effectiveCutoff,
      operation: "set",
      value: barrier.effectiveCutoff,
    },
    {
      id: "glomerular-filter-v0.permeability",
      layer: "result",
      target: GLOMERULAR_VARIABLE_IDS.permeability,
      operation: "set",
      value: barrier.permeability,
    },
    {
      id: "glomerular-filter-v0.small-particle-decision",
      layer: "result",
      target: GLOMERULAR_VARIABLE_IDS.smallParticleCanPass,
      operation: "set",
      value: smallDecision.canPass ? 1 : 0,
    },
    {
      id: "glomerular-filter-v0.rbc-decision",
      layer: "result",
      target: GLOMERULAR_VARIABLE_IDS.rbcCanPass,
      operation: "set",
      value: rbcDecision.canPass ? 1 : 0,
      note: "V0 uses the didactic cutoff; future RBC leak uses a dedicated structural/probabilistic mechanism.",
    },
  ] as const;
}

export function initializeGlomerularFilterV0(engine: GlomerularEnginePort): PhysiologyState {
  return engine.applyRules(stateOperations(1));
}

export function setGlomerularBarrierIntegrityV0(
  engine: GlomerularEnginePort,
  integrity: number,
): PhysiologyState {
  return engine.applyRules(stateOperations(integrity));
}

export function currentGlomerularBarrierV0(engine: GlomerularEnginePort): GlomerularBarrierDerivedState {
  const integrity = engine.state.get(GLOMERULAR_VARIABLE_IDS.integrity);
  if (integrity === undefined) {
    throw new Error("Glomerular filter V0 is not initialized");
  }
  return deriveGlomerularBarrierV0(integrity);
}

export function evaluateGlomerularParticleFromStateV0(
  engine: GlomerularEnginePort,
  particleId: string,
): GlomerularFiltrationDecision {
  const particle = Object.values(GLOMERULAR_PARTICLES).find((candidate) => candidate.id === particleId);
  if (!particle) throw new Error(`Unknown glomerular V0 particle: ${particleId}`);
  return evaluateGlomerularParticleV0(particle, currentGlomerularBarrierV0(engine));
}

export function handleGlomerularPhysicsEventV0(
  engine: GlomerularEnginePort,
  event: SimulationEvent,
): SimulationEvent | null {
  if (event.source !== "physics") {
    throw new Error("Glomerular physics-event evaluation only accepts source=physics");
  }
  if (event.type !== "sensor_enter") return null;
  if (event.payload?.sensorId !== GLOMERULAR_SENSOR_ID) return null;

  const particleId = event.payload.particleId;
  if (typeof particleId !== "string") {
    throw new Error("Glomerular sensor event requires payload.particleId");
  }

  const decision = evaluateGlomerularParticleFromStateV0(engine, particleId);
  return {
    id: `engine-decision:${event.id}`,
    type: "glomerular_filter_decision",
    simulationTimeSeconds: engine.snapshot().clock.simulationTimeSeconds,
    source: "engine",
    payload: {
      particleId: decision.particleId,
      barrierId: decision.barrierId,
      canPass: decision.canPass,
      filterSize: decision.filterSize,
      effectiveCutoff: decision.effectiveCutoff,
      integrity: decision.integrity,
      mechanismId: decision.mechanismId,
      requestEventId: event.id,
    },
  };
}
