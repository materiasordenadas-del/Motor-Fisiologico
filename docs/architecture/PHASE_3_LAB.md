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

Vite serves the LAB at port 5173 and provides HMR/Fast Refresh for React, CSS and visual code. Editing Worker/Engine code may recreate the Worker and reset the current sandbox state; correctness is preferred over attempting to preserve hot Worker state in V0.

## Phase 3 workspace

The initial LAB contains four areas:

1. **3D Anatomy** — R3F viewport, orbit controls and GLB/GLTF loading.
2. **Causal / Integration Nodes** — React Flow surface. The default Phase 3 graph is technical topology only, not a physiological model.
3. **Inspector** — authoritative Engine clock, revision, variables and Worker controls.
4. **Events** — UI commands, Worker warnings/errors and Engine events.

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
- `pnpm dev:lab` opens the four-panel LAB.
- Worker reaches `READY` and Engine time changes through Play/Step.
- GLB file loading works.
- React Flow renders the registered topology.
- Rapier initializes without any physics → physiology mutation path.
- Vite HMR updates React/CSS/visual code without a manual full rebuild.
