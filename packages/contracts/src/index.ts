export type VariableId = string;
export type EntityId = string;
export type ModelId = string;
export type SourceId = string;

export interface SourceReference {
  id: SourceId;
  title: string;
  version?: string;
  locator?: string;
  notes?: string;
}

export interface UnitValue {
  value: number;
  unit: string;
  canonicalValue: number;
  canonicalUnit: string;
}

export interface VariableDefinition {
  id: VariableId;
  name: string;
  kind: "state" | "calculated" | "parameter" | "input" | "output";
  canonicalUnit: string;
  displayUnit?: string;
  description?: string;
  normalRange?: {
    min?: number;
    max?: number;
    unit: string;
  };
  sources?: SourceReference[];
}

export interface RuleScope {
  id: string;
  domain: string;
  appliesTo: readonly EntityId[] | "*";
  preconditions?: readonly string[];
  exceptionsAllowed: false;
}

export type RuleLayer =
  | "general_principle"
  | "local_specification"
  | "disease_modifier"
  | "treatment_modifier"
  | "constraint"
  | "result";

export const RULE_PRECEDENCE: readonly RuleLayer[] = [
  "general_principle",
  "local_specification",
  "disease_modifier",
  "treatment_modifier",
  "constraint",
  "result",
] as const;

export interface RuleTraceEntry {
  layer: RuleLayer;
  ruleId: string;
  target: VariableId;
  before?: number;
  after?: number;
  note?: string;
}

export interface GeneralPrinciple {
  id: string;
  name: string;
  scope: RuleScope;
  inputs: readonly VariableId[];
  outputs: readonly VariableId[];
  equationId?: string;
  defaultParameters?: Readonly<Record<string, UnitValue>>;
  constraints?: readonly string[];
  sources: readonly SourceReference[];
  sourceVersion?: string;
  status: "draft" | "reviewed" | "validated";
}

export interface LocalSpecification {
  id: string;
  name: string;
  target: EntityId;
  basedOn: readonly string[];
  parameterOverrides?: Readonly<Record<string, UnitValue>>;
  mechanismModifiers?: Readonly<Record<string, number>>;
  sources: readonly SourceReference[];
  status: "draft" | "reviewed" | "validated";
}

export interface DiseaseModifier {
  id: string;
  name: string;
  targets: readonly VariableId[];
  mechanism: string;
  sources: readonly SourceReference[];
}

export interface TreatmentModifier {
  id: string;
  name: string;
  targets: readonly VariableId[];
  mechanism: string;
  sources: readonly SourceReference[];
}

export interface SimulationClockSnapshot {
  simulationTimeSeconds: number;
  stepIndex: number;
  fixedDtSeconds: number;
}

export interface PhysiologyState {
  revision: number;
  clock: SimulationClockSnapshot;
  variables: Readonly<Record<VariableId, number>>;
  trace: readonly RuleTraceEntry[];
}

export interface SimulationEvent {
  id: string;
  type: string;
  simulationTimeSeconds: number;
  source: "engine" | "physics" | "ui" | "system";
  payload?: Readonly<Record<string, unknown>>;
}

export interface AnatomyBinding {
  id: string;
  variableId: VariableId;
  anatomyObjectId: string;
  transform: "scale" | "position" | "rotation" | "material" | "morph" | "visibility" | "custom";
  scaleProfileId?: string;
}

export interface Particle {
  id: string;
  kind: string;
  physiologicalSize?: UnitValue;
  filterSize?: number;
  visualScaleProfileId?: string;
  representationFactor?: number;
}

export interface BarrierState {
  id: string;
  integrity: number;
  effectiveCutoff?: number;
  permeability?: number;
}

export interface ScaleProfile {
  id: string;
  domain: "length" | "volume" | "flow" | "particles";
  canonicalUnit: string;
  mappingType: "linear" | "power" | "fixed";
  referenceValue: number;
  visualReference: number;
  exponent?: number;
  minVisual?: number;
  maxVisual?: number;
  version: string;
}

export type UiToWorkerMessage =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STEP"; dtSeconds?: number }
  | { type: "SET_PARAMETER"; variableId: VariableId; value: UnitValue }
  | { type: "SET_DISEASE"; diseaseId: string; enabled: boolean }
  | { type: "SET_TREATMENT"; treatmentId: string; enabled: boolean }
  | { type: "SET_SPEED"; multiplier: number }
  | { type: "RESET" }
  | { type: "LOAD_SCENARIO"; scenarioId: string };

export type WorkerToUiMessage =
  | { type: "READY"; state: PhysiologyState }
  | { type: "STATE_SNAPSHOT"; state: PhysiologyState }
  | { type: "SIMULATION_EVENT"; event: SimulationEvent }
  | { type: "WARNING"; code: string; message: string }
  | { type: "ERROR"; code: string; message: string };
