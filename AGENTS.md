# AGENTS.md — Motor Fisiológico

These rules apply to Codex and other coding agents working in this repository.

## Branch policy

- Never develop directly on `main`.
- `main` is the stable/publicable branch.
- `pruebas` is the integration and validation branch.
- New work should normally use `feature/*` branches created from `pruebas` and merge back into `pruebas` first.

## Architectural authorities

1. `packages/engine` is the authority for physiological state, equations, disease effects, treatment effects, constraints and simulation time.
2. Physiological time advances only through `engine.step(dt)` or an equivalent Engine-owned clock API.
3. React, React Three Fiber, render loops and `useFrame` must never advance physiology.
4. `packages/physics` and Rapier are non-authoritative: they may represent contacts, sensors and motion, but they do not decide quantitative physiology.
5. `packages/scaling` converts scientific/canonical magnitudes to visual representation. Visual mesh size must not be used as a physiological rule.
6. Shared data contracts live in `packages/contracts`; do not create incompatible duplicate types in apps/packages.
7. The LAB consumes Engine snapshots. UI state must not become a second physiological source of truth.

## Scientific change rules

- Keep units explicit.
- Preserve provenance for mathematical models.
- Mathematical translations from OpenModelica/Physiolibrary require reference datasets and conformance tests when introduced.
- Disease and treatment behavior should modify mechanisms/parameters rather than directly forcing clinical outputs when a known intermediate mechanism exists.
- Do not silently weaken physiological invariants to make a visual demo pass.

## Development behavior

- Prefer small modules and explicit public APIs.
- Add or update tests when changing Engine, contracts, scaling or precedence behavior.
- Keep experiments isolated under `apps/lab/src/experiments/<experiment-id>/`.
- GLB assets belong under `assets/glb/`; Blender source files belong under `assets/blender/`.
- Do not embed core physiological logic inside `.blend` files, React components, shaders or Rapier callbacks.

## Local feedback loop

Once `apps/lab` is present, run the repository dev command and keep it running while editing. Vite hot module replacement should be the default feedback loop for UI/visual code. Engine Worker changes may restart/reload the worker or page as needed; correctness takes priority over preserving transient simulation state during development.
