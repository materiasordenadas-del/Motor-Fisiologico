/// <reference lib="webworker" />

import type {
  UiToWorkerMessage,
  WorkerInitConfig,
  WorkerToUiMessage,
} from "@motor-fisiologico/contracts";
import {
  GLOMERULAR_FILTER_V0_ID,
  GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
  GLOMERULAR_VARIABLE_IDS,
  PhysiologyEngine,
  handleGlomerularPhysicsEventV0,
  initializeGlomerularFilterV0,
  setGlomerularBarrierIntegrityV0,
} from "@motor-fisiologico/engine";
import { getUnitDefinition, toCanonical } from "@motor-fisiologico/scaling";

const scope = self as DedicatedWorkerGlobalScope;
const INTEGRATION_SANDBOX_ID = "integration-sandbox-v0";

let engine: PhysiologyEngine | undefined;
let activeScenarioId = INTEGRATION_SANDBOX_ID;
let config: Required<Pick<WorkerInitConfig, "fixedDtSeconds" | "schedulerHz" | "snapshotEverySteps">> | undefined;
let timer: number | undefined;
let speedMultiplier = 1;
let stepAccumulator = 0;
let stepsSinceSnapshot = 0;

function post(message: WorkerToUiMessage): void {
  scope.postMessage(message);
}

function requireEngine(): PhysiologyEngine {
  if (!engine) throw new Error("Worker is not initialized. Send INIT first.");
  return engine;
}

function requireConfig() {
  if (!config) throw new Error("Worker scheduler configuration is missing");
  return config;
}

function stopScheduler(): void {
  if (timer !== undefined) {
    scope.clearInterval(timer);
    timer = undefined;
  }
}

function publishSnapshot(): void {
  post({ type: "STATE_SNAPSHOT", state: requireEngine().snapshot() });
  stepsSinceSnapshot = 0;
}

function runScheduledTick(): void {
  const activeEngine = requireEngine();
  const activeConfig = requireConfig();
  const simulatedSecondsRequested = speedMultiplier / activeConfig.schedulerHz;
  stepAccumulator += simulatedSecondsRequested / activeEngine.clock.fixedDtSeconds;

  const stepsToRun = Math.floor(stepAccumulator);
  stepAccumulator -= stepsToRun;

  for (let i = 0; i < stepsToRun; i += 1) {
    activeEngine.step();
    stepsSinceSnapshot += 1;
    if (stepsSinceSnapshot >= activeConfig.snapshotEverySteps) {
      publishSnapshot();
    }
  }
}

function initialize(init: WorkerInitConfig): void {
  stopScheduler();
  const schedulerHz = init.schedulerHz ?? 20;
  const snapshotEverySteps = init.snapshotEverySteps ?? 1;
  if (!Number.isFinite(schedulerHz) || schedulerHz <= 0) {
    throw new Error("schedulerHz must be a finite number greater than zero");
  }
  if (!Number.isInteger(snapshotEverySteps) || snapshotEverySteps <= 0) {
    throw new Error("snapshotEverySteps must be a positive integer");
  }

  config = {
    fixedDtSeconds: init.fixedDtSeconds,
    schedulerHz,
    snapshotEverySteps,
  };
  activeScenarioId = INTEGRATION_SANDBOX_ID;
  engine = new PhysiologyEngine({
    fixedDtSeconds: init.fixedDtSeconds,
    variableDefinitions: init.variableDefinitions ?? [],
  });
  speedMultiplier = 1;
  stepAccumulator = 0;
  stepsSinceSnapshot = 0;
  post({ type: "READY", state: engine.snapshot() });
}

function loadScenario(scenarioId: string): void {
  const activeConfig = requireConfig();
  stopScheduler();
  stepAccumulator = 0;
  stepsSinceSnapshot = 0;

  if (scenarioId === GLOMERULAR_FILTER_V0_ID) {
    engine = new PhysiologyEngine({
      fixedDtSeconds: activeConfig.fixedDtSeconds,
      variableDefinitions: GLOMERULAR_FILTER_V0_VARIABLE_DEFINITIONS,
    });
    activeScenarioId = scenarioId;
    const state = initializeGlomerularFilterV0(engine);
    post({ type: "STATE_SNAPSHOT", state });
    post({
      type: "SIMULATION_EVENT",
      event: {
        id: `scenario-loaded:${scenarioId}`,
        type: "scenario_loaded",
        source: "system",
        simulationTimeSeconds: state.clock.simulationTimeSeconds,
        payload: { scenarioId },
      },
    });
    return;
  }

  if (scenarioId === INTEGRATION_SANDBOX_ID) {
    engine = new PhysiologyEngine({ fixedDtSeconds: activeConfig.fixedDtSeconds });
    activeScenarioId = scenarioId;
    post({ type: "STATE_SNAPSHOT", state: engine.snapshot() });
    return;
  }

  throw new Error(`Unknown LAB scenario: ${scenarioId}`);
}

function setParameter(message: Extract<UiToWorkerMessage, { type: "SET_PARAMETER" }>): void {
  const activeEngine = requireEngine();
  const definition = activeEngine.state.definition(message.variableId);
  if (definition.kind !== "parameter" && definition.kind !== "input") {
    throw new Error(`SET_PARAMETER cannot mutate ${definition.kind} variable ${message.variableId}`);
  }

  const unitDefinition = getUnitDefinition(message.value.unit);
  const normalized = toCanonical(message.value.value, message.value.unit);
  if (definition.dimension !== undefined && unitDefinition.dimension !== definition.dimension) {
    throw new Error(
      `Unit dimension mismatch for ${message.variableId}: expected ${definition.dimension}, received ${unitDefinition.dimension}`,
    );
  }
  if (normalized.canonicalUnit !== definition.canonicalUnit) {
    throw new Error(
      `Unit mismatch for ${message.variableId}: expected ${definition.canonicalUnit}, received ${normalized.canonicalUnit}`,
    );
  }

  if (activeScenarioId === GLOMERULAR_FILTER_V0_ID && message.variableId === GLOMERULAR_VARIABLE_IDS.integrity) {
    const state = setGlomerularBarrierIntegrityV0(activeEngine, normalized.canonicalValue);
    post({ type: "STATE_SNAPSHOT", state });
    return;
  }

  const state = activeEngine.setCanonical(message.variableId, normalized.canonicalValue);
  post({ type: "STATE_SNAPSHOT", state });
}

function handlePhysicsEvent(message: Extract<UiToWorkerMessage, { type: "PHYSICS_EVENT" }>): void {
  if (activeScenarioId !== GLOMERULAR_FILTER_V0_ID) {
    post({
      type: "WARNING",
      code: "PHYSICS_EVENT_IGNORED",
      message: `No Engine physics-event rule is registered for scenario ${activeScenarioId}.`,
    });
    return;
  }

  const decisionEvent = handleGlomerularPhysicsEventV0(requireEngine(), message.event);
  if (decisionEvent) post({ type: "SIMULATION_EVENT", event: decisionEvent });
}

function resetActiveScenario(): void {
  stopScheduler();
  stepAccumulator = 0;
  stepsSinceSnapshot = 0;
  const activeEngine = requireEngine();
  activeEngine.reset();
  const state = activeScenarioId === GLOMERULAR_FILTER_V0_ID
    ? initializeGlomerularFilterV0(activeEngine)
    : activeEngine.snapshot();
  post({ type: "STATE_SNAPSHOT", state });
}

function handleMessage(message: UiToWorkerMessage): void {
  switch (message.type) {
    case "INIT":
      initialize(message.config);
      return;
    case "PLAY": {
      const activeConfig = requireConfig();
      requireEngine();
      if (timer === undefined) {
        timer = scope.setInterval(runScheduledTick, 1000 / activeConfig.schedulerHz);
      }
      return;
    }
    case "PAUSE":
      stopScheduler();
      return;
    case "STEP": {
      const activeEngine = requireEngine();
      const state = activeEngine.step(message.dtSeconds ?? activeEngine.clock.fixedDtSeconds);
      post({ type: "STATE_SNAPSHOT", state });
      return;
    }
    case "SET_PARAMETER":
      setParameter(message);
      return;
    case "SET_SPEED":
      if (!Number.isFinite(message.multiplier) || message.multiplier <= 0) {
        throw new Error("Speed multiplier must be a finite number greater than zero");
      }
      speedMultiplier = message.multiplier;
      return;
    case "RESET":
      resetActiveScenario();
      return;
    case "LOAD_SCENARIO":
      loadScenario(message.scenarioId);
      return;
    case "PHYSICS_EVENT":
      handlePhysicsEvent(message);
      return;
    case "SET_DISEASE":
    case "SET_TREATMENT":
      post({
        type: "WARNING",
        code: "NOT_IMPLEMENTED_V0",
        message: `${message.type} is contracted but not yet implemented in the current Engine.`,
      });
      return;
  }
}

scope.addEventListener("message", (event: MessageEvent<UiToWorkerMessage>) => {
  try {
    handleMessage(event.data);
  } catch (error) {
    post({
      type: "ERROR",
      code: "WORKER_COMMAND_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
