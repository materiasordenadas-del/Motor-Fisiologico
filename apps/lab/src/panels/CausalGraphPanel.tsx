import { Background, Controls, ReactFlow } from "@xyflow/react";
import { INTEGRATION_SANDBOX } from "../experiments/registry.js";

export function CausalGraphPanel() {
  return (
    <section className="panel graph-panel" aria-label="Causal graph">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">GRAPH</span>
          <h2>Causal / Integration Nodes</h2>
        </div>
        <span className="panel-meta">{INTEGRATION_SANDBOX.id}</span>
      </div>
      <div className="graph-shell">
        <ReactFlow
          nodes={[...INTEGRATION_SANDBOX.graphNodes]}
          edges={[...INTEGRATION_SANDBOX.graphEdges]}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="panel-footnote">Technical topology only. Physiological causal nodes arrive with experiments; this graph does not define physiology.</p>
    </section>
  );
}
