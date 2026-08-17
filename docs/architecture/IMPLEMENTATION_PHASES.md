# Implementación en cuatro fases

## Fase 1 — Fundación y autoridad

Entrega:

- política `feature/* → pruebas → main`;
- monorepo pnpm + TypeScript estricto;
- `packages/contracts`;
- `packages/engine` mínimo;
- `SimulationClock` y `engine.step(dt)`;
- guardrails para Codex/Claude Code;
- tests del reloj determinista.

Criterio de salida: el Engine puede compilar/ejecutarse sin React, Three.js, Rapier ni GLB y el tiempo fisiológico no depende del render.

## Fase 2 — Núcleo científico ejecutable

Entrega prevista:

- `packages/scaling` y Unit Registry SI;
- Central State formal;
- Worker Boundary V0 (`physiology.worker.ts`);
- mensajes UI ↔ Worker;
- estructura de principios generales/especificaciones;
- precedencia ejecutable y trazable;
- esqueletos de provenance/reference datasets;
- conformance/invariant test harness;
- CI de build/tests.

Criterio de salida: motor + scaling + worker funcionan sin depender del LAB 3D.

## Fase 3 — LAB de integración

Entrega prevista:

- `apps/lab` con React + TypeScript + Vite;
- Three.js / React Three Fiber;
- Rapier;
- React Flow;
- worker conectado al Engine;
- layout inicial Anatomía 3D / nodos / inspector / eventos;
- cargador de GLB y convenciones de assets;
- experiment registry;
- hot reload local para trabajo rápido con Codex/Claude Code.

Criterio de salida: se puede abrir el LAB, modificar código y ver los cambios de UI/visualización mediante el servidor de desarrollo sin recompilar manualmente toda la aplicación.

## Fase 4 — Vertical slice y banco de pruebas utilizable

Entrega prevista:

- experimento `glomerular-filter-v0`;
- barrera + partícula pequeña + RBC;
- Engine decide PASS/BLOCK;
- Rapier representa la consecuencia sin ser autoridad fisiológica;
- slider/controles de integridad;
- inspector del estado real del Engine;
- React Flow ligado al mismo estado;
- ruta documentada para añadir tus GLB y bindings;
- validación end-to-end básica;
- guía de trabajo local para Codex/Claude Code.

Criterio de salida: `apps/lab` es el lugar normal de trabajo para importar modelos, modificar código, experimentar con física y fisiología y observar cambios durante el desarrollo.
