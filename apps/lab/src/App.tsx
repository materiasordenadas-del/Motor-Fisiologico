import { useEffect, useMemo, useState } from "react";
import { usePhysiologyWorker } from "./engine/usePhysiologyWorker.js";
import {
  GLOMERULAR_FILTER_EXPERIMENT,
  LAB_EXPERIMENTS,
  getLabExperiment,
} from "./experiments/registry.js";
import { AnatomyPanel } from "./panels/AnatomyPanel.js";
import { CausalGraphPanel } from "./panels/CausalGraphPanel.js";
import { EventLogPanel } from "./panels/EventLogPanel.js";
import { InspectorPanel } from "./panels/InspectorPanel.js";

export function App() {
  const controller = usePhysiologyWorker();
  const [experimentId, setExperimentId] = useState(GLOMERULAR_FILTER_EXPERIMENT.id);
  const experiment = useMemo(() => getLabExperiment(experimentId), [experimentId]);

  useEffect(() => {
    if (!controller.ready) return;
    controller.loadScenario(experimentId);
  }, [controller.ready, controller.loadScenario, experimentId]);

  return (
    <div className="lab-app">
      <header className="lab-header">
        <div>
          <span className="lab-eyebrow">MOTOR FISIOLÓGICO</span>
          <h1>Integration LAB</h1>
        </div>
        <div className="experiment-picker">
          <label htmlFor="experiment-select">Experiment</label>
          <select
            id="experiment-select"
            value={experimentId}
            onChange={(event) => setExperimentId(event.target.value)}
          >
            {LAB_EXPERIMENTS.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
            ))}
          </select>
        </div>
        <div className="header-status">
          <span>Phase 4</span>
          <strong>{controller.ready ? "Engine connected" : "Connecting Worker…"}</strong>
        </div>
      </header>

      <main className="lab-grid">
        <div className="area-anatomy">
          <AnatomyPanel experimentId={experiment.id} controller={controller} />
        </div>
        <div className="area-graph">
          <CausalGraphPanel experiment={experiment} state={controller.state} />
        </div>
        <div className="area-inspector">
          <InspectorPanel controller={controller} experimentId={experiment.id} />
        </div>
        <div className="area-events"><EventLogPanel logs={controller.logs} /></div>
      </main>
    </div>
  );
}
