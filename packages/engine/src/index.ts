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
  #revision = 0;

  constructor(options: PhysiologyEngineOptions) {
    this.clock = new SimulationClock(options.fixedDtSeconds);
    this.state = new CentralState(options.variableDefinitions ?? []);
  }

  setCanonical(variableId: VariableId, value: number): PhysiologyState {
    this.state.setCanonical(variableId, value);
    this.#revision += 1;
    return this.snapshot();
  }

  applyRules(operations: readonly RuleOperation[]): PhysiologyState {
    const resolution = resolveRuleOperations(this.state.values(), operations);
    for (const [variableId, value] of Object.entries(resolution.values)) {
      this.state.setCanonical(variableId, value);
    }
    this.state.setTrace(resolution.trace);
    this.#revision += 1;
    return this.snapshot();
  }

  step(dtSeconds: number = this.clock.fixedDtSeconds): PhysiologyState {
    this.clock.step(dtSeconds);
    this.#revision += 1;
    return this.snapshot();
  }

  reset(): PhysiologyState {
    this.clock.reset();
    this.#revision = 0;
    this.state.resetValues();
    return this.snapshot();
  }

  snapshot(): PhysiologyState {
    return {
      revision: this.#revision,
      clock: this.clock.snapshot(),
      variables: this.state.values(),
      trace: this.state.trace(),
    };
  }
}

export { CentralState } from "./central-state.js";
export { compareNumericSeries } from "./conformance.js";
export { resolveRuleOperations, type RuleResolution } from "./rule-resolver.js";
export { SimulationClock } from "./simulation-clock.js";
