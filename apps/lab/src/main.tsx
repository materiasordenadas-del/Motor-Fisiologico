import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import { App } from "./App.js";
import "./styles.css";
import "./phase3.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("LAB root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
