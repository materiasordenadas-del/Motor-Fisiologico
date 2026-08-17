import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const INTERNAL_PACKAGES = [
  "@motor-fisiologico/contracts",
  "@motor-fisiologico/scaling",
  "@motor-fisiologico/engine",
] as const;

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [...INTERNAL_PACKAGES],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
