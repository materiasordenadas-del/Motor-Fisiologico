# CLAUDE.md — Motor Fisiológico

## Git workflow

- Do not work directly on `main`.
- `main` is stable/publicable.
- `pruebas` is the integration/validation branch.
- Prefer `feature/*` branches created from `pruebas`; merge/test in `pruebas` before promotion to `main`.

## Non-negotiable architecture

- Physiology lives in `packages/engine`.
- Physiological time is Engine-owned and advances through `engine.step(dt)` or the Engine clock API.
- React/R3F/render loops never drive physiology.
- Rapier/physics is not physiological authority.
- `packages/scaling` owns real/canonical-to-visual conversions.
- `packages/contracts` owns shared cross-module types.
- LAB/UI consumes Engine snapshots; it does not keep an independent physiological truth.

## Scientific integrity

- Keep units explicit and conversions centralized.
- Preserve source/provenance for equations and reference models.
- When a translated OpenModelica/Physiolibrary model is added, add reference data and conformance tests.
- Model disease and treatment effects through mechanisms/parameters when scientifically appropriate.
- Never alter physiology merely to make an animation look correct.

## LAB workflow

When `apps/lab` exists, use the repository dev command for a continuous local feedback loop. Vite HMR should reflect UI/visual edits quickly. Worker/Engine edits may trigger a worker/page reload; do not move Engine logic to the main/render thread to avoid reloads.

Experiments live under `apps/lab/src/experiments/`. Imported GLB files live under `assets/glb/`, with Blender sources under `assets/blender/`.
