# Phase 4 — Glomerular Filter V0

## Purpose

Validate the first complete Motor Fisiológico vertical slice without weakening the authority boundaries established in Phases 1–3.

The experiment id is:

```text
glomerular-filter-v0
```

## Required pipeline

```text
Rapier sensor_enter
        ↓ request only
physiology.worker.ts
        ↓
packages/engine/glomerular-filter-v0
        ↓
Engine decision: canPass
        ↓
SIMULATION_EVENT
        ↓
Rapier representation
        ↓
3D visual result
```

Rapier never calculates `canPass`.

## V0 elements

The scene contains:

- one teaching glomerular scene;
- one visible barrier;
- one Rapier sensor;
- one barrier collider;
- one representative RBC;
- one representative small particle;
- one barrier-integrity control.

The procedural geometry is temporary teaching geometry. It can later be replaced by GLB assets without moving the filtration rule out of the Engine.

## Engine-only rule

The first V0 abstraction is:

```text
filterSize <= effectiveCutoff
→ canPass
```

The calibration is registered in:

```text
models/physiology/glomerular-filtration/glomerular-filter-v0.yaml
```

All `filter units` are didactic, dimensionless experiment units. They are not pore diameters.

Baseline demonstration:

```text
integrity = 1.0
effectiveCutoff = 7
small particle = PASS
RBC = BLOCK
```

Damage demonstration:

```text
integrity = 0.4
effectiveCutoff = 13
small particle = PASS
RBC = PASS
```

The RBC branch is deliberately marked temporary. A later scientific model must separate macromolecule permeability from structural/probabilistic RBC leakage.

## Central State variables

```text
renal.glomerular_barrier.integrity
renal.glomerular_barrier.base_cutoff
renal.glomerular_barrier.effective_cutoff
renal.glomerular_barrier.permeability
renal.glomerular_filter.small_particle_can_pass
renal.glomerular_filter.rbc_can_pass
```

React, React Flow and Three/Rapier consume these values or Engine events; they do not maintain independent physiological copies.

## Physics boundary

The sensor is allowed to emit:

```text
sensor_enter
```

with:

```text
sensorId
particleId
```

The Worker routes that request into the Engine. The representation layer accepts only:

```text
source = engine
type = glomerular_filter_decision
```

before visually allowing a particle to cross.

A physics event containing a fabricated `canPass` is ignored by the representation adapter.

## React Flow

The graph mirrors Engine variables and documents the request/decision topology.

A physics → Engine edge is allowed only as:

```text
channel = physics_event_request
directPhysiologyWrite = false
```

The graph remains editable and can contain cycles, but graph edits never solve physiology.

## Tests

Phase 4 adds tests for:

- intact barrier: small PASS / RBC BLOCK;
- damaged teaching barrier: RBC PASS;
- Engine decision generation without Rapier;
- integrity clamping;
- rejection of physics-originated PASS/BLOCK representation commands;
- graph prohibition of direct physics → physiology writes.

## Exit gate

Before merging to `pruebas`:

- `pnpm install` succeeds;
- `pnpm build` succeeds;
- `pnpm typecheck` succeeds;
- `pnpm test` succeeds;
- `pnpm check` succeeds;
- `pnpm dev:lab` opens the Phase 4 LAB;
- Worker loads `glomerular-filter-v0`;
- intact barrier visibly blocks RBC and passes small particle;
- integrity `0.4` followed by particle reset visibly allows RBC;
- Inspector and React Flow show the same Engine state;
- disabling/removing the Rapier scene does not change Engine-only test results;
- no `useFrame`, collision callback, graph callback or mesh scale writes physiological state.
