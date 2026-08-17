import { describe, expect, it } from "vitest";
import { PhysiologyEngine } from "./index.js";

describe("CentralState", () => {
  it("requires registered variables and stores canonical values", () => {
    const engine = new PhysiologyEngine({
      fixedDtSeconds: 0.05,
      variableDefinitions: [
        { id: "test.pressure", name: "Test pressure", kind: "parameter", canonicalUnit: "Pa" },
      ],
    });

    const initial = engine.snapshot();
    const updated = engine.setCanonical("test.pressure", 13332.2387415);

    expect(updated.variables["test.pressure"]).toBeCloseTo(13332.2387415);
    expect(updated.revision).toBe(initial.revision + 1);
    expect(initial.variables["test.pressure"]).toBeUndefined();
    expect(() => engine.setCanonical("unknown", 1)).toThrow(/Unknown variable/);
  });
});
