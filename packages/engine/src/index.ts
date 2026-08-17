import type { PhysiologyState } from "@motor-fisiologico/contracts";
import { SimulationClock } from "./simulation-clock.js";

export interface PhysiologyEngineOptions {
  fixedDtSeconds: number;
}

export class PhysiologyEngine {
  readonly clock: SimulationClock;
  #revision = 0;
  #variables: Record<string, number> = {};

  constructor(options: PhysiologyEngineOptions) {
    this.clock = new SimulationClock(options.fixedDtSeconds);
  }

  step(dtSeconds: number = this.clock.fixedDtSeconds): PhysiologyState {
    this.clock.step(dtSeconds);
    this.#revision += 1;
    return this.snapshot();
  }

  reset(): PhysiologyState {
    this.clock.reset();
    this.#revision = 0;
    this.#variables = {};
    return this.snapshot();
  }

  snapshot(): PhysiologyState {
    return {
      revision: this.#revision,
      clock: this.clock.snapshot(),
      variables: { ...this.#variables },
      trace: [],
    };
  }
}

export { SimulationClock } from "./simulation-clock.js";
