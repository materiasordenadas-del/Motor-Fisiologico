/// <reference lib="webworker" />

import type {
  UiToWorkerMessage,
  WorkerInitConfig,
  WorkerToUiMessage,
} from "@motor-fisiologico/contracts";
import { PhysiologyEngine } from "@motor-fisiologico/engine";
import { getUnitDefinition, toCanonical } from "@motor-fisiologico/scaling";

const scope = self as DedicatedWorkerGlobalScope;

let engine: PhysiologyEngine | undefined;
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
  const activeConfig = config;
  if (!activeConfig) throw new Error("Worker scheduler configuration is missing");

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
  engine = new PhysiologyEngine({
    fixedDtSeconds: init.fixedDtSeconds,
    variableDefinitions: init.variableDefinitions ?? [],
  });
  speedMultiplier = 1;
  stepAccumulator = 0;
  stepsSinceSnapshot = 0;
  post({ type: "READY", state: engine.snapshot() });
}

function handleMessage(message: UiToWorkerMessage): void {
  switch (message.type) {
    case "INIT":
      initialize(message.config);
      return;
    case "PLAY": {
      const activeConfig = config;
      requireEngine();
      if (!activeConfig) throw new Error("Worker scheduler configuration is missing");
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
    case "SET_PARAMETER": {
      const activeEngine = requireEngine();
      const definition = activeEngine.state.definition(message.variableId);
      if (definition.kind !== "parameter" && definition.kind !== "input") {
        throw new Error(`SET_PARAMETER cannot mutate ${definition.kind} variable ${message.variableId}`);
      }
      const normalized = toCanonical(message.value.value, message.value.unit);
      if (definition.dimension !== undefined && getUnitDefinition(message.value.unit).dimension !== definition.dimension) {
        throw new Error(
          `Unit dimension mismatch for ${message.variableId}: expected ${definition.dimension}, received ${getUnitDefinition(message.value.unit).dimension}`,
        );
      }
      if (normalized.canonicalUnit !== definition.canonicalUnit) {
        throw new Error(
          `Unit mismatch for ${message.variableId}: expected ${definition.canonicalUnit}, received ${normalized.canonicalUnit}`,
        );
      }
      const state = activeEngine.setCanonical(message.variableId, normalized.canonicalValue);
      post({ type: "STATE_SNAPSHOT", state });
      return;
    }
    case "SET_SPEED":
      if (!Number.isFinite(message.multiplier) || message.multiplier <= 0) {
        throw new Error("Speed multiplier must be a finite number greater than zero");
      }
      speedMultiplier = message.multiplier;
      return;
    case "RESET": {
      stopScheduler();
      stepAccumulator = 0;
      stepsSinceSnapshot = 0;
      const state = requireEngine().reset();
      post({ type: "STATE_SNAPSHOT", state });
      return;
    }
    case "SET_DISEASE":
    case "SET_TREATMENT":
    case "LOAD_SCENARIO":
      post({
        type: "WARNING",
        code: "NOT_IMPLEMENTED_PHASE_2",
        message: `${message.type} is contracted but not yet implemented in the Phase 2 Engine.`,
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
