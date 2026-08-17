# Phase 3 — Integration LAB

## Objective

Turn `apps/lab` into the local integration workspace where visual assets, the physiology Worker, Engine snapshots, causal/integration nodes, physics representation and inspection tools can be viewed together without collapsing authority boundaries.

## Runtime boundaries

```text
React / LAB UI
    │ commands + snapshots
    ▼
physiology.worker.ts
    │
    ▼
PhysiologyEngine
```

The Engine remains the physiological and simulation-time authority. `engine.step(dt)` is the only physiological time advancement path.

Three/R3F render independently. Rapier runs its own physics timestep and must not directly mutate physiological state.

## Local development

```bash
pnpm install
pnpm dev:lab
```

`pnpm dev:lab` performs an initial build of `contracts`, `scaling` and `engine`, then starts their TypeScript compilers in watch mode together with the Vite development server. The internal workspace packages are excluded from Vite dependency prebundling so updates are not frozen into an optimization cache.

Vite serves the LAB at port 5173 and provides HMR/Fast Refresh for React, CSS and visual code. Changes in Engine/contracts/scaling rebuild their `dist` output through `tsc --watch`; the LAB consumes those linked workspace outputs. Editing Worker/Engine code may recreate the Worker and reset the current sandbox state. Correctness is preferred over preserving hot Worker state in V0.

## Phase 3 workspace

The initial LAB contains four areas in the documented layout:

1. **3D Anatomy** — top-left; R3F viewport, orbit controls and GLB/GLTF loading.
2. **Causal / Integration Nodes** — top-right; editable React Flow directed graph with cycles allowed.
3. **Inspector** — bottom-left; authoritative Engine clock, revision, variables and Worker controls.
4. **Graphs / Events** — bottom-right; UI commands, Worker warnings/errors and Engine events in Phase 3, with physiological plotting reserved for experiments that expose variables.

React Flow is representation and editing only. It is not the physiological solver.

## 3D and physics separation

The visible GLB is not automatically used as a collision mesh. Rapier is initialized as an independent representation layer with its own fixed physics timestep. A later experiment can provide simplified colliders explicitly.

There is no physics-to-Engine mutation callback in the Phase 3 sandbox.

## 3D asset workflow

Source Blender files remain under:

```text
assets/blender/
```

Canonical exported runtime models remain under:

```text
assets/glb/
```

For fastest iteration the LAB file picker can open a `.glb` or `.gltf` directly from disk without copying it into the repository.

For stable Vite URLs, place a runtime copy under:

```text
apps/lab/public/models/
```

which is served as:

```text
/models/<file>.glb
```

The public copy is a development-serving artifact; `assets/glb` remains the canonical repository location for exported models.

Invalid GLB/GLTF loads are isolated to the viewport through an error boundary so the rest of the LAB remains usable.

## Experiment registry

Experiments are registered under:

```text
apps/lab/src/experiments/
```

Phase 3 contains only `integration-sandbox-v0`. The glomerular filtration vertical slice belongs to Phase 4 and must not be silently introduced here.

## Phase 3 exit gate

- `pnpm install` resolves the updated lockfile.
- `pnpm build` passes.
- `pnpm test` passes.
- `pnpm dev:lab` opens the four-panel LAB from a clean checkout without a manual core build.
- Worker reaches `READY` and Engine time changes through Play/Step.
- GLB file loading works and a bad model does not crash the whole LAB.
- React Flow supports node movement, edge editing and directed cycles.
- Rapier initializes without any physics → physiology mutation path.
- Editing React/CSS/visual code updates through Vite HMR.
- Editing contracts/scaling/Engine code rebuilds automatically through the watch processes and becomes visible to the LAB without a manual full build.
