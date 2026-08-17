import { describe, expect, it } from "vitest";
import { CentralState } from "./central-state.js";

describe("CentralState", () => {
  it("requires registered variables and stores canonical values", () => {
    const state = new CentralState([
      { id: "test.pressure", name: "Test pressure", kind: "parameter", canonicalUnit: "Pa" },
    ]);
    state.setCanonical("test.pressure", 13332.2387415);
    expect(state.get("test.pressure")).toBeCloseTo(13332.2387415);
    expect(() => state.setCanonical("unknown", 1)).toThrow(/Unknown variable/);
  });
});
