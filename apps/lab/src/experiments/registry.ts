import type { Edge, Node } from "@xyflow/react";
import {
  GLOMERULAR_FILTER_V0_ID,
  GLOMERULAR_VARIABLE_IDS,
} from "@motor-fisiologico/engine";

export type LabArchitectureLayer = "ui" | "worker" | "engine" | "physics" | "visual";
export type LabEdgeChannel =
  | "command"
  | "state"
  | "dependency"
  | "physics_event_request"
  | "representation";

export interface LabNodeData extends Record<string, unknown> {
  label: string;
  layer: LabArchitectureLayer;
  variableId?: string;
  displayAs?: "number" | "boolean";
}

export interface LabEdgeData extends Record<string, unknown> {
  channel: LabEdgeChannel;
  directPhysiologyWrite?: boolean;
}

export type LabGraphNode = Node<LabNodeData>;
export type LabGraphEdge = Edge<LabEdgeData>;

export interface LabExperimentDefinition {
  id: string;
  title: string;
  description: string;
  graphNodes: readonly LabGraphNode[];
  graphEdges: readonly LabGraphEdge[];
}

export const INTEGRATION_SANDBOX: LabExperimentDefinition = {
  id: "integration-sandbox-v0",
  title: "Integration Sandbox",
  description: "Phase 3 technical sandbox. No physiological mechanism is implied by this topology.",
  graphNodes: [
    { id: "ui", position: { x: 0, y: 80 }, data: { label: "LAB UI", layer: "ui" }, type: "input" },
    { id: "worker", position: { x: 190, y: 80 }, data: { label: "Physiology Worker", layer: "worker" } },
    { id: "engine", position: { x: 400, y: 80 }, data: { label: "Engine Authority", layer: "engine" } },
    { id: "snapshot", position: { x: 620, y: 20 }, data: { label: "State Snapshot", layer: "ui" }, type: "output" },
    { id: "physics", position: { x: 620, y: 145 }, data: { label: "Rapier Representation", layer: "physics" }, type: "output" },
  ],
  graphEdges: [
    { id: "ui-worker", source: "ui", target: "worker", label: "commands", data: { channel: "command" } },
    { id: "worker-engine", source: "worker", target: "engine", label: "engine.step(dt)", data: { channel: "command" } },
    { id: "engine-snapshot", source: "engine", target: "snapshot", label: "authoritative state", data: { channel: "state" } },
    { id: "engine-physics", source: "engine", target: "physics", label: "represent only", animated: true, data: { channel: "representation" } },
  ],
};

export const GLOMERULAR_FILTER_EXPERIMENT: LabExperimentDefinition = {
  id: GLOMERULAR_FILTER_V0_ID,
  title: "Glomerular Filter V0",
  description: "First vertical slice: the Engine evaluates a didactic filtration rule and Rapier represents the decision.",
  graphNodes: [
    {
      id: "gfb-integrity",
      position: { x: 0, y: 10 },
      data: {
        label: "Barrier integrity",
        layer: "engine",
        variableId: GLOMERULAR_VARIABLE_IDS.integrity,
        displayAs: "number",
      },
      type: "input",
    },
    {
      id: "gfb-cutoff",
      position: { x: 190, y: 10 },
      data: {
        label: "Effective cutoff",
        layer: "engine",
        variableId: GLOMERULAR_VARIABLE_IDS.effectiveCutoff,
        displayAs: "number",
      },
    },
    {
      id: "gfb-sensor",
      position: { x: 0, y: 150 },
      data: { label: "Rapier sensor_enter", layer: "physics" },
      type: "input",
    },
    {
      id: "gfb-engine-eval",
      position: { x: 205, y: 145 },
      data: { label: "Engine filtration rule", layer: "engine" },
    },
    {
      id: "gfb-small-pass",
      position: { x: 430, y: 55 },
      data: {
        label: "Small particle PASS",
        layer: "engine",
        variableId: GLOMERULAR_VARIABLE_IDS.smallParticleCanPass,
        displayAs: "boolean",
      },
    },
    {
      id: "gfb-rbc-pass",
      position: { x: 430, y: 170 },
      data: {
        label: "RBC PASS",
        layer: "engine",
        variableId: GLOMERULAR_VARIABLE_IDS.rbcCanPass,
        displayAs: "boolean",
      },
    },
    {
      id: "gfb-physics",
      position: { x: 650, y: 110 },
      data: { label: "Rapier represents result", layer: "physics" },
      type: "output",
    },
  ],
  graphEdges: [
    {
      id: "integrity-cutoff",
      source: "gfb-integrity",
      target: "gfb-cutoff",
      label: "damage modifies",
      data: { channel: "dependency" },
    },
    {
      id: "cutoff-engine-eval",
      source: "gfb-cutoff",
      target: "gfb-engine-eval",
      label: "authoritative input",
      data: { channel: "state" },
    },
    {
      id: "sensor-engine-request",
      source: "gfb-sensor",
      target: "gfb-engine-eval",
      label: "event request",
      animated: true,
      data: { channel: "physics_event_request", directPhysiologyWrite: false },
    },
    {
      id: "engine-small",
      source: "gfb-engine-eval",
      target: "gfb-small-pass",
      label: "canPass",
      data: { channel: "state" },
    },
    {
      id: "engine-rbc",
      source: "gfb-engine-eval",
      target: "gfb-rbc-pass",
      label: "canPass",
      data: { channel: "state" },
    },
    {
      id: "small-physics",
      source: "gfb-small-pass",
      target: "gfb-physics",
      label: "represent",
      data: { channel: "representation" },
    },
    {
      id: "rbc-physics",
      source: "gfb-rbc-pass",
      target: "gfb-physics",
      label: "represent",
      data: { channel: "representation" },
    },
  ],
};

export const LAB_EXPERIMENTS: readonly LabExperimentDefinition[] = [
  GLOMERULAR_FILTER_EXPERIMENT,
  INTEGRATION_SANDBOX,
];

export function getLabExperiment(id: string): LabExperimentDefinition {
  const experiment = LAB_EXPERIMENTS.find((candidate) => candidate.id === id);
  if (!experiment) throw new Error(`Unknown LAB experiment: ${id}`);
  return experiment;
}
