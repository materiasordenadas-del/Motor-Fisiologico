import { describe, expect, it } from "vitest";
import { LAB_EXPERIMENTS } from "./registry.js";

describe("LAB experiment registry", () => {
  it("keeps experiment ids unique", () => {
    const ids = LAB_EXPERIMENTS.map((experiment) => experiment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never allows physics to write physiological state directly", () => {
    for (const experiment of LAB_EXPERIMENTS) {
      const nodeLayers = new Map(experiment.graphNodes.map((node) => [node.id, node.data.layer] as const));
      for (const edge of experiment.graphEdges) {
        expect(edge.data?.directPhysiologyWrite).not.toBe(true);

        const fromPhysics = nodeLayers.get(edge.source) === "physics";
        const toEngine = nodeLayers.get(edge.target) === "engine";
        if (fromPhysics && toEngine) {
          expect(edge.data?.channel).toBe("physics_event_request");
        }
      }
    }
  });
});
