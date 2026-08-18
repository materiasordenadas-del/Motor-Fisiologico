import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
} from "@xyflow/react";
import { useCallback } from "react";
import { INTEGRATION_SANDBOX } from "../experiments/registry.js";

export function CausalGraphPanel() {
  const [nodes, setNodes, onNodesChange] = useNodesState([...INTEGRATION_SANDBOX.graphNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([...INTEGRATION_SANDBOX.graphEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );

  const resetGraph = useCallback(() => {
    setNodes([...INTEGRATION_SANDBOX.graphNodes]);
    setEdges([...INTEGRATION_SANDBOX.graphEdges]);
  }, [setEdges, setNodes]);

  return (
    <section className="panel graph-panel" aria-label="Causal graph">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">GRAPH</span>
          <h2>Causal / Integration Nodes</h2>
        </div>
        <div className="panel-header-actions">
          <span className="panel-meta">{INTEGRATION_SANDBOX.id}</span>
          <button type="button" className="panel-action" onClick={resetGraph}>Reset</button>
        </div>
      </div>
      <div className="graph-shell">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable
          nodesConnectable
          elementsSelectable
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="panel-footnote">Editable directed graph; cycles are allowed. The graph is representation/editing only and never advances physiology.</p>
    </section>
  );
}
