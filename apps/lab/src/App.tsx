import { usePhysiologyWorker } from "./engine/usePhysiologyWorker.js";
import { AnatomyPanel } from "./panels/AnatomyPanel.js";
import { CausalGraphPanel } from "./panels/CausalGraphPanel.js";
import { EventLogPanel } from "./panels/EventLogPanel.js";
import { InspectorPanel } from "./panels/InspectorPanel.js";

export function App() {
  const controller = usePhysiologyWorker();

  return (
    <div className="lab-app">
      <header className="lab-header">
        <div>
          <span className="lab-eyebrow">MOTOR FISIOLÓGICO</span>
          <h1>Integration LAB</h1>
        </div>
        <div className="header-status">
          <span>Phase 3</span>
          <strong>{controller.ready ? "Engine connected" : "Connecting Worker…"}</strong>
        </div>
      </header>

      <main className="lab-grid">
        <div className="area-anatomy"><AnatomyPanel /></div>
        <div className="area-graph"><CausalGraphPanel /></div>
        <div className="area-inspector"><InspectorPanel controller={controller} /></div>
        <div className="area-events"><EventLogPanel logs={controller.logs} /></div>
      </main>
    </div>
  );
}
