import {
  GLOMERULAR_FILTER_V0_ID,
  GLOMERULAR_VARIABLE_IDS,
} from "@motor-fisiologico/engine";
import { useEffect, useState } from "react";
import type { PhysiologyWorkerController } from "../engine/usePhysiologyWorker.js";
import { GlomerularFilterScene } from "../experiments/glomerular-filter-v0/GlomerularFilterScene.js";
import { LabScene } from "../visual/LabScene.js";
import { ViewportErrorBoundary } from "../visual/ViewportErrorBoundary.js";

export interface AnatomyPanelProps {
  experimentId: string;
  controller: PhysiologyWorkerController;
}

export function AnatomyPanel({ experimentId, controller }: AnatomyPanelProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [modelName, setModelName] = useState("No GLB loaded");
  const [particleResetKey, setParticleResetKey] = useState(0);
  const isGlomerular = experimentId === GLOMERULAR_FILTER_V0_ID;

  useEffect(() => {
    return () => {
      if (modelUrl?.startsWith("blob:")) URL.revokeObjectURL(modelUrl);
    };
  }, [modelUrl]);

  const loadFile = (file: File | undefined) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setModelUrl(objectUrl);
    setModelName(file.name);
  };

  const loadManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    setModelUrl(trimmed);
    setModelName(trimmed);
  };

  const smallPass = controller.state?.variables[GLOMERULAR_VARIABLE_IDS.smallParticleCanPass];
  const rbcPass = controller.state?.variables[GLOMERULAR_VARIABLE_IDS.rbcCanPass];

  return (
    <section className="panel anatomy-panel" aria-label="3D anatomy">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">VIEWPORT</span>
          <h2>3D Anatomy</h2>
        </div>
        <span className="panel-meta" title={isGlomerular ? "Glomerular Filter V0" : modelName}>
          {isGlomerular ? "Glomerular Filter V0" : modelName}
        </span>
      </div>

      {isGlomerular ? (
        <div className="model-toolbar glomerular-toolbar">
          <button type="button" onClick={() => setParticleResetKey((value) => value + 1)}>Reset particles</button>
          <span className="decision-chip">small {smallPass === undefined ? "—" : smallPass >= 0.5 ? "PASS" : "BLOCK"}</span>
          <span className="decision-chip">RBC {rbcPass === undefined ? "—" : rbcPass >= 0.5 ? "PASS" : "BLOCK"}</span>
        </div>
      ) : (
        <div className="model-toolbar">
          <label className="file-button">
            Open GLB
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
          </label>
          <input
            className="model-url-input"
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="/models/example.glb, .gltf URL, or remote URL"
            aria-label="GLB or GLTF URL"
          />
          <button type="button" onClick={loadManualUrl}>Load URL</button>
        </div>
      )}

      <div className="viewport-shell">
        {isGlomerular ? (
          <GlomerularFilterScene controller={controller} resetKey={particleResetKey} />
        ) : (
          <ViewportErrorBoundary key={modelUrl ?? "empty-scene"}>
            <LabScene modelUrl={modelUrl} />
          </ViewportErrorBoundary>
        )}
      </div>
    </section>
  );
}
