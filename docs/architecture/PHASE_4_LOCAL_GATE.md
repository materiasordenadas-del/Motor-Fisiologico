# Phase 4 local gate

Run this gate from `feature/phase-4-glomerular-filter-v0` before the Phase 4 branch is promoted to `pruebas`.

## Automated gate

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm check
```

Do not weaken strict TypeScript, remove tests or bypass failures.

## Engine-only checks

The tests must prove without React/R3F/Rapier/GLB:

```text
integrity 1.0
small particle PASS
RBC BLOCK
```

and:

```text
integrity 0.4
small particle PASS
RBC PASS
```

The physics request test must produce an Engine-owned `glomerular_filter_decision` event.

## LAB smoke test

Start:

```bash
pnpm dev:lab
```

Open `http://localhost:5173` and select `Glomerular Filter V0`.

Verify:

1. Worker reaches READY and the scenario loads.
2. Inspector contains the six glomerular variables.
3. Integrity defaults to `1.00`.
4. Effective cutoff is `7`.
5. Small particle state is PASS.
6. RBC state is BLOCK.
7. Press `Reset particles`: small particle crosses; RBC hits the barrier collider.
8. Move integrity to `0.40`.
9. Effective cutoff becomes `13`.
10. RBC state becomes PASS.
11. Press `Reset particles`: RBC now crosses after the Engine decision event.
12. Graph labels update from the same Engine snapshot.
13. Graph edits do not change physiological values.
14. Event log receives `sensor_enter` requests and `glomerular_filter_decision` Engine events.
15. Switch to `Integration Sandbox`: generic GLB loading still works.

## Authority audit

Search for forbidden patterns and inspect matches:

```bash
rg "engine\.step|setCanonical|applyRules" apps/lab/src
rg "onCollision|onIntersection|useFrame" apps/lab/src
```

Expected architecture:

```text
Worker -> Engine methods: allowed
Rapier sensor -> PHYSICS_EVENT request: allowed
Engine SIMULATION_EVENT -> Rapier representation: allowed
Rapier callback -> physiological state write: forbidden
React Flow callback -> physiological state write: forbidden
useFrame -> engine.step: forbidden
```

## Development workflow check

With `pnpm dev:lab` running:

- make and revert one harmless React/CSS change;
- make and revert one harmless Engine text/metadata change;
- verify Vite/watchers update without manual full rebuild;
- Worker restart/reset is acceptable in V0.

## Git gate

After all checks pass:

```bash
git status
git diff
git add .
git commit -m "test(lab): complete phase 4 vertical slice validation"
git push
```

Do not merge to `main`.
Do not merge Phase 4 until Phase 3 is present in `pruebas` and the Phase 4 diff against `pruebas` contains only Phase 4 work.
