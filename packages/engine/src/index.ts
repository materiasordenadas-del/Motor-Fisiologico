import type {
  PhysiologyState,
  RuleOperation,
  VariableDefinition,
  VariableId,
} from "@motor-fisiologico/contracts";
import { CentralState } from "./central-state.js";
import { resolveRuleOperations } from "./rule-resolver.js";
import { SimulationClock } from "./simulation-clock.js";

export interface PhysiologyEngineOptions {
  fixedDtSeconds: number;
  variableDefinitions?: readonly VariableDefinition[];
}

export class PhysiologyEngine {
  readonly clock: SimulationClock;
  readonly state: CentralState;

  constructor(options: PhysiologyEngineOptions) {
    this.clock = new SimulationClock(options.fixedDtSeconds);
    this.state = new CentralState(options.variableDefinitions ?? []);
  }

  setCanonical(variableId: VariableId, value: number): PhysiologyState {
    this.state.setCanonical(variableId, value);
    this.state.revise();
    return this.snapshot();
  }

  applyRules(operations: readonly RuleOperation[]): PhysiologyState {
    const resolution = resolveRuleOperations(this.state.values(), operations);
    for (const [variableId, value] of Object.entries(resolution.values)) {
      this.state.setCanonical(variableId, value);
    }
    this.state.setTrace(resolution.trace);
    this.state.revise();
    return this.snapshot();
  }

  step(dtSeconds: number = this.clock.fixedDtSeconds): PhysiologyState {
    this.clock.step(dtSeconds);
    this.state.revise();
    return this.snapshot();
  }

  reset(): PhysiologyState {
    this.clock.reset();
    this.state.resetValues();
    this.state.resetRevision();
    return this.snapshot();
  }

  snapshot(): PhysiologyState {
    return this.state.snapshot(this.clock.snapshot());
  }
}

export { CentralState } from "./central-state.js";
export { compareNumericSeries } from "./conformance.js";
export {
  GLOMERULAR_BARRIER_ID,
  GLOMERULAR_FILTER_V0_CALIBRATION,
  GLOMERULAR_FILTER_V0_ID,
  GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
  GLOMERULAR_PARTICLES,
  GLOMERULAR_SENSOR_ID,
  GLOMERULAR_VARIABLE_IDS,
  currentGlomerularBarrierV0,
  deriveGlomerularBarrierV0,
  evaluateGlomerularParticleFromStateV0,
  evaluateGlomerularParticleV0,
  handleGlomerularPhysicsEventV0,
  initializeGlomerularFilterV0,
  setGlomerularBarrierIntegrityV0,
  type GlomerularBarrierDerivedState,
  type GlomerularEnginePort,
  type GlomerularFiltrationDecision,
} from "./glomerular-filter-v0.js";
export { resolveRuleOperations, type RuleResolution } from "./rule-resolver.js";
export { SimulationClock } from "./simulation-clock.js";
