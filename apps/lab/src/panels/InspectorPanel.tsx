import {
  GLOMERULAR_FILTER_V0_ID,
  GLOMERULAR_VARIABLE_IDS,
} from "@motor-fisiologico/engine";
import type { PhysiologyWorkerController } from "../engine/usePhysiologyWorker.js";

export interface InspectorPanelProps {
  controller: PhysiologyWorkerController;
  experimentId: string;
}

const SPEEDS = [1, 2, 4, 10] as const;

function formatVariable(id: string, value: number): string {
  if (id === GLOMERULAR_VARIABLE_IDS.smallParticleCanPass || id === GLOMERULAR_VARIABLE_IDS.rbcCanPass) {
    return value >= 0.5 ? "PASS" : "BLOCK";
  }
  return Number(value).toFixed(3).replace(/\.000$/, "");
}

export function InspectorPanel({ controller, experimentId }: InspectorPanelProps) {
  const { ready, isPlaying, speedMultiplier, state } = controller;
  const variableEntries = state ? Object.entries(state.variables) : [];
  const isGlomerular = experimentId === GLOMERULAR_FILTER_V0_ID;
  const integrity = state?.variables[GLOMERULAR_VARIABLE_IDS.integrity] ?? 1;

  return (
    <section className="panel inspector-panel" aria-label="Physiology inspector">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">ENGINE</span>
          <h2>Inspector</h2>
        </div>
        <span className={`status-pill ${ready ? "ready" : "offline"}`}>{ready ? "READY" : "INIT"}</span>
      </div>

      <div className="engine-readout">
        <div><span>Time</span><strong>{state?.clock.simulationTimeSeconds.toFixed(2) ?? "—"} s</strong></div>
        <div><span>Step</span><strong>{state?.clock.stepIndex ?? "—"}</strong></div>
        <div><span>dt</span><strong>{state?.clock.fixedDtSeconds.toFixed(3) ?? "—"} s</strong></div>
        <div><span>Revision</span><strong>{state?.revision ?? "—"}</strong></div>
      </div>

      <div className="transport-controls">
        <button type="button" disabled={!ready || isPlaying} onClick={controller.play}>Play</button>
        <button type="button" disabled={!ready || !isPlaying} onClick={controller.pause}>Pause</button>
        <button type="button" disabled={!ready || isPlaying} onClick={controller.step}>Step</button>
        <button type="button" disabled={!ready} onClick={controller.reset}>Reset</button>
      </div>

      <div className="speed-row" aria-label="Simulation speed">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            className={speedMultiplier === speed ? "active" : ""}
            disabled={!ready}
            onClick={() => controller.setSpeed(speed)}
          >
            {speed}×
          </button>
        ))}
      </div>

      {isGlomerular ? (
        <div className="integrity-control">
          <div className="section-title">
            Barrier integrity
            <strong>{integrity.toFixed(2)}</strong>
          </div>
          <input
            aria-label="Glomerular barrier integrity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={integrity}
            disabled={!ready}
            onChange={(event) => controller.setParameter(
              GLOMERULAR_VARIABLE_IDS.integrity,
              Number(event.target.value),
              "1",
            )}
          />
          <div className="integrity-scale"><span>damaged 0</span><span>intact 1</span></div>
          <p className="empty-copy">V0 teaching control. Derived cutoff and PASS/BLOCK decisions come back from the Engine snapshot.</p>
        </div>
      ) : null}

      <div className="inspector-section">
        <div className="section-title">Canonical variables <span>{variableEntries.length}</span></div>
        {variableEntries.length === 0 ? (
          <p className="empty-copy">No physiological variables loaded in this experiment.</p>
        ) : (
          <div className="variable-list">
            {variableEntries.map(([id, value]) => (
              <div className="variable-row" key={id}>
                <code>{id}</code>
                <strong>{formatVariable(id, value)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
