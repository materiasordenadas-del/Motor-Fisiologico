import { describe, expect, it } from "vitest";
import { LAB_EXPERIMENTS } from "./registry.js";

describe("LAB experiment registry", () => {
  it("keeps experiment ids unique", () => {
    const ids = LAB_EXPERIMENTS.map((experiment) => experiment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not create a physics-to-engine authority edge", () => {
    for (const experiment of LAB_EXPERIMENTS) {
      const forbidden = experiment.graphEdges.some(
        (edge) => edge.source === "physics" && edge.target === "engine",
      );
      expect(forbidden).toBe(false);
    }
  });
});
