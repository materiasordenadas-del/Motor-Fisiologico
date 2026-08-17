import { useEffect, useState } from "react";
import { LabScene } from "../visual/LabScene.js";
import { ViewportErrorBoundary } from "../visual/ViewportErrorBoundary.js";

export function AnatomyPanel() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [modelName, setModelName] = useState("No GLB loaded");

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

  return (
    <section className="panel anatomy-panel" aria-label="3D anatomy">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">VIEWPORT</span>
          <h2>3D Anatomy</h2>
        </div>
        <span className="panel-meta" title={modelName}>{modelName}</span>
      </div>

      <div className="model-toolbar">
        <label className="file-button">
          Open GLB
          <input
            type="file"
            accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
            onChange={(event) => loadFile(event.target.files?.[0])}
          />
        </label>
        <input
          className="model-url-input"
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          placeholder="/models/example.glb or URL"
          aria-label="GLB URL"
        />
        <button type="button" onClick={loadManualUrl}>Load URL</button>
      </div>

      <div className="viewport-shell">
        <ViewportErrorBoundary key={modelUrl ?? "empty-scene"}>
          <LabScene modelUrl={modelUrl} />
        </ViewportErrorBoundary>
      </div>
    </section>
  );
}
