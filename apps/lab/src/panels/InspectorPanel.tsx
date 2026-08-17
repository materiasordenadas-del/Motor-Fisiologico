import type { PhysiologyWorkerController } from "../engine/usePhysiologyWorker.js";

export interface InspectorPanelProps {
  controller: PhysiologyWorkerController;
}

const SPEEDS = [1, 2, 4, 10] as const;

export function InspectorPanel({ controller }: InspectorPanelProps) {
  const { ready, isPlaying, speedMultiplier, state } = controller;
  const variableEntries = state ? Object.entries(state.variables) : [];

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

      <div className="inspector-section">
        <div className="section-title">Canonical variables <span>{variableEntries.length}</span></div>
        {variableEntries.length === 0 ? (
          <p className="empty-copy">No physiological variables loaded in the Phase 3 integration sandbox.</p>
        ) : (
          <div className="variable-list">
            {variableEntries.map(([id, value]) => (
              <div className="variable-row" key={id}>
                <code>{id}</code>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
