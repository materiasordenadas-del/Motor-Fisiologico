import type {
  PhysiologyState,
  SimulationEvent,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from "@motor-fisiologico/contracts";
import { toCanonical } from "@motor-fisiologico/scaling";
import { useCallback, useEffect, useRef, useState } from "react";

export type LabLogLevel = "info" | "warning" | "error";
export type LabLogSource = "ui" | "worker" | "engine" | "physics";

export interface LabLogEntry {
  id: string;
  level: LabLogLevel;
  source: LabLogSource;
  message: string;
  receivedAt: string;
  simulationTimeSeconds?: number;
}

export interface PhysiologyWorkerController {
  ready: boolean;
  isPlaying: boolean;
  speedMultiplier: number;
  state: PhysiologyState | null;
  logs: readonly LabLogEntry[];
  simulationEvents: readonly SimulationEvent[];
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (multiplier: number) => void;
  loadScenario: (scenarioId: string) => void;
  setParameter: (variableId: string, value: number, unit?: string) => void;
  emitPhysicsEvent: (type: string, payload: Readonly<Record<string, unknown>>) => void;
}

const MAX_LOG_ENTRIES = 200;
const MAX_SIMULATION_EVENTS = 100;

export function usePhysiologyWorker(): PhysiologyWorkerController {
  const workerRef = useRef<Worker | null>(null);
  const stateRef = useRef<PhysiologyState | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [state, setState] = useState<PhysiologyState | null>(null);
  const [logs, setLogs] = useState<LabLogEntry[]>([]);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);

  const appendLog = useCallback((level: LabLogLevel, source: LabLogSource, message: string) => {
    const simulationTimeSeconds = stateRef.current?.clock.simulationTimeSeconds;
    const entry: LabLogEntry = {
      id: crypto.randomUUID(),
      level,
      source,
      message,
      receivedAt: new Date().toISOString(),
      ...(simulationTimeSeconds === undefined ? {} : { simulationTimeSeconds }),
    };
    setLogs((current) => [...current.slice(-(MAX_LOG_ENTRIES - 1)), entry]);
  }, []);

  const post = useCallback(
    (message: UiToWorkerMessage) => {
      const worker = workerRef.current;
      if (!worker) {
        appendLog("error", "ui", `Worker unavailable for ${message.type}`);
        return;
      }
      worker.postMessage(message);
      appendLog(message.type === "PHYSICS_EVENT" ? "info" : "info", message.type === "PHYSICS_EVENT" ? "physics" : "ui", message.type);
    },
    [appendLog],
  );

  useEffect(() => {
    const worker = new Worker(new URL("../workers/physiology.worker.ts", import.meta.url), {
      type: "module",
      name: "motor-fisiologico-physiology",
    });
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<WorkerToUiMessage>) => {
      const message = event.data;
      switch (message.type) {
        case "READY":
          stateRef.current = message.state;
          setState(message.state);
          setReady(true);
          appendLog("info", "worker", "READY");
          return;
        case "STATE_SNAPSHOT":
          stateRef.current = message.state;
          setState(message.state);
          return;
        case "SIMULATION_EVENT":
          setSimulationEvents((current) => [
            ...current.slice(-(MAX_SIMULATION_EVENTS - 1)),
            message.event,
          ]);
          appendLog("info", "engine", message.event.type);
          return;
        case "WARNING":
          appendLog("warning", "worker", `${message.code}: ${message.message}`);
          return;
        case "ERROR":
          appendLog("error", "worker", `${message.code}: ${message.message}`);
          return;
      }
    };

    const handleWorkerError = (event: ErrorEvent) => {
      appendLog("error", "worker", event.message || "Unhandled worker error");
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleWorkerError);
    worker.postMessage({
      type: "INIT",
      config: {
        fixedDtSeconds: 0.05,
        schedulerHz: 20,
        snapshotEverySteps: 1,
        variableDefinitions: [],
      },
    } satisfies UiToWorkerMessage);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleWorkerError);
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
      setReady(false);
      setIsPlaying(false);
    };
  }, [appendLog]);

  const play = useCallback(() => {
    post({ type: "PLAY" });
    setIsPlaying(true);
  }, [post]);

  const pause = useCallback(() => {
    post({ type: "PAUSE" });
    setIsPlaying(false);
  }, [post]);

  const step = useCallback(() => {
    post({ type: "STEP" });
  }, [post]);

  const reset = useCallback(() => {
    post({ type: "RESET" });
    setIsPlaying(false);
  }, [post]);

  const setSpeed = useCallback(
    (multiplier: number) => {
      post({ type: "SET_SPEED", multiplier });
      setSpeedMultiplier(multiplier);
    },
    [post],
  );

  const loadScenario = useCallback(
    (scenarioId: string) => {
      post({ type: "LOAD_SCENARIO", scenarioId });
      setIsPlaying(false);
      setSimulationEvents([]);
    },
    [post],
  );

  const setParameter = useCallback(
    (variableId: string, value: number, unit = "1") => {
      post({
        type: "SET_PARAMETER",
        variableId,
        value: toCanonical(value, unit),
      });
    },
    [post],
  );

  const emitPhysicsEvent = useCallback(
    (type: string, payload: Readonly<Record<string, unknown>>) => {
      const simulationTimeSeconds = stateRef.current?.clock.simulationTimeSeconds ?? 0;
      const event: SimulationEvent = {
        id: `physics:${crypto.randomUUID()}`,
        type,
        source: "physics",
        simulationTimeSeconds,
        payload,
      };
      post({ type: "PHYSICS_EVENT", event });
    },
    [post],
  );

  return {
    ready,
    isPlaying,
    speedMultiplier,
    state,
    logs,
    simulationEvents,
    play,
    pause,
    step,
    reset,
    setSpeed,
    loadScenario,
    setParameter,
    emitPhysicsEvent,
  };
}
