import type { Edge, Node } from "@xyflow/react";

export interface LabExperimentDefinition {
  id: string;
  title: string;
  description: string;
  graphNodes: readonly Node[];
  graphEdges: readonly Edge[];
}

export const INTEGRATION_SANDBOX: LabExperimentDefinition = {
  id: "integration-sandbox-v0",
  title: "Integration Sandbox",
  description: "Phase 3 technical sandbox. No physiological mechanism is implied by this topology.",
  graphNodes: [
    { id: "ui", position: { x: 0, y: 80 }, data: { label: "LAB UI" }, type: "input" },
    { id: "worker", position: { x: 190, y: 80 }, data: { label: "Physiology Worker" } },
    { id: "engine", position: { x: 400, y: 80 }, data: { label: "Engine Authority" } },
    { id: "snapshot", position: { x: 620, y: 20 }, data: { label: "State Snapshot" }, type: "output" },
    { id: "physics", position: { x: 620, y: 145 }, data: { label: "Rapier Representation" }, type: "output" },
  ],
  graphEdges: [
    { id: "ui-worker", source: "ui", target: "worker", label: "commands" },
    { id: "worker-engine", source: "worker", target: "engine", label: "engine.step(dt)" },
    { id: "engine-snapshot", source: "engine", target: "snapshot", label: "authoritative state" },
    { id: "engine-physics", source: "engine", target: "physics", label: "represent only", animated: true },
  ],
};

export const LAB_EXPERIMENTS: readonly LabExperimentDefinition[] = [INTEGRATION_SANDBOX];
