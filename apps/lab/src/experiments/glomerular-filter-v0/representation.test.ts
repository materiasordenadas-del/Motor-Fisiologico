import { describe, expect, it } from "vitest";
import { toGlomerularRepresentationDecision } from "./representation.js";

describe("glomerular representation adapter", () => {
  it("accepts an Engine filtration decision", () => {
    const decision = toGlomerularRepresentationDecision({
      id: "engine-decision:1",
      type: "glomerular_filter_decision",
      source: "engine",
      simulationTimeSeconds: 0,
      payload: { particleId: "glomerular.rbc", canPass: false },
    });
    expect(decision).toEqual({
      eventId: "engine-decision:1",
      particleId: "glomerular.rbc",
      canPass: false,
    });
  });

  it("does not let a physics event decide PASS/BLOCK", () => {
    expect(toGlomerularRepresentationDecision({
      id: "physics:1",
      type: "sensor_enter",
      source: "physics",
      simulationTimeSeconds: 0,
      payload: { particleId: "glomerular.rbc", canPass: true },
    })).toBeNull();
  });
});
