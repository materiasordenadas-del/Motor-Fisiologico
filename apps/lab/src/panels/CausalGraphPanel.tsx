import type { PhysiologyState } from "@motor-fisiologico/contracts";
import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import type { LabExperimentDefinition, LabGraphNode } from "../experiments/registry.js";

export interface CausalGraphPanelProps {
  experiment: LabExperimentDefinition;
  state: PhysiologyState | null;
}

function bindStateToNode(node: LabGraphNode, state: PhysiologyState | null): LabGraphNode {
  const variableId = node.data.variableId;
  if (!variableId) return node;
  const value = state?.variables[variableId];
  const baseLabel = node.data.label.split(" · ")[0] ?? node.data.label;
  if (value === undefined) return { ...node, data: { ...node.data, label: `${baseLabel} · —` } };

  const rendered = node.data.displayAs === "boolean"
    ? (value >= 0.5 ? "PASS" : "BLOCK")
    : Number(value).toFixed(2);
  return { ...node, data: { ...node.data, label: `${baseLabel} · ${rendered}` } };
}

export function CausalGraphPanel({ experiment, state }: CausalGraphPanelProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<LabGraphNode>(
    experiment.graphNodes.map((node) => bindStateToNode(node, state)),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([...experiment.graphEdges]);

  useEffect(() => {
    setNodes(experiment.graphNodes.map((node) => bindStateToNode(node, state)));
    setEdges([...experiment.graphEdges]);
  }, [experiment, setEdges, setNodes]);

  useEffect(() => {
    setNodes((current) => current.map((node) => bindStateToNode(node, state)));
  }, [setNodes, state]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );

  const resetGraph = useCallback(() => {
    setNodes(experiment.graphNodes.map((node) => bindStateToNode(node, state)));
    setEdges([...experiment.graphEdges]);
  }, [experiment, setEdges, setNodes, state]);

  return (
    <section className="panel graph-panel" aria-label="Causal graph">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">GRAPH</span>
          <h2>Causal / Integration Nodes</h2>
        </div>
        <div className="panel-header-actions">
          <span className="panel-meta">{experiment.id}</span>
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
      <p className="panel-footnote">Editable directed graph; cycles are allowed. Values mirror Engine snapshots. Graph edits never advance or solve physiology.</p>
    </section>
  );
}
