import { describe, expect, it } from "vitest";
import { PhysiologyEngine, SimulationClock } from "./index.js";

describe("SimulationClock", () => {
  it("advances only by the configured physiological timestep", () => {
    const clock = new SimulationClock(0.05);

    expect(clock.step()).toEqual({
      simulationTimeSeconds: 0.05,
      stepIndex: 1,
      fixedDtSeconds: 0.05,
    });

    expect(clock.step()).toEqual({
      simulationTimeSeconds: 0.1,
      stepIndex: 2,
      fixedDtSeconds: 0.05,
    });
  });

  it("rejects render-derived or otherwise arbitrary dt values in V0", () => {
    const clock = new SimulationClock(0.05);
    expect(() => clock.step(1 / 60)).toThrow(/fixed physiological timestep/i);
  });
});

describe("PhysiologyEngine", () => {
  it("produces the same clock state for the same sequence of steps", () => {
    const a = new PhysiologyEngine({ fixedDtSeconds: 0.05 });
    const b = new PhysiologyEngine({ fixedDtSeconds: 0.05 });

    for (let index = 0; index < 20; index += 1) {
      a.step();
      b.step();
    }

    expect(a.snapshot()).toEqual(b.snapshot());
    expect(a.snapshot().clock.simulationTimeSeconds).toBe(1);
  });
});
