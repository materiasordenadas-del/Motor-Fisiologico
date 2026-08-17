import type { SimulationClockSnapshot } from "@motor-fisiologico/contracts";

const EPSILON = 1e-12;

export class SimulationClock {
  readonly fixedDtSeconds: number;
  #simulationTimeSeconds = 0;
  #stepIndex = 0;

  constructor(fixedDtSeconds: number) {
    if (!Number.isFinite(fixedDtSeconds) || fixedDtSeconds <= 0) {
      throw new RangeError("fixedDtSeconds must be a finite positive number");
    }

    this.fixedDtSeconds = fixedDtSeconds;
  }

  step(dtSeconds: number = this.fixedDtSeconds): SimulationClockSnapshot {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
      throw new RangeError("dtSeconds must be a finite positive number");
    }

    if (Math.abs(dtSeconds - this.fixedDtSeconds) > EPSILON) {
      throw new RangeError(
        `V0 uses a fixed physiological timestep of ${this.fixedDtSeconds}s; received ${dtSeconds}s`,
      );
    }

    this.#stepIndex += 1;
    this.#simulationTimeSeconds = this.#stepIndex * this.fixedDtSeconds;

    return this.snapshot();
  }

  reset(): SimulationClockSnapshot {
    this.#simulationTimeSeconds = 0;
    this.#stepIndex = 0;
    return this.snapshot();
  }

  snapshot(): SimulationClockSnapshot {
    return {
      simulationTimeSeconds: this.#simulationTimeSeconds,
      stepIndex: this.#stepIndex,
      fixedDtSeconds: this.fixedDtSeconds,
    };
  }
}
