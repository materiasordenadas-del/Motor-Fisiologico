# Local LAB workflow for Codex / Claude Code

## Start

From the repository root:

```bash
pnpm install
pnpm dev:lab
```

`pnpm dev:lab` performs the core build required by the workspace and then runs the package watchers plus Vite.

Open:

```text
http://localhost:5173
```

## Normal development loop

1. Select `Glomerular Filter V0` in the LAB.
2. Edit one layer at a time.
3. Observe Vite/TypeScript watcher output.
4. Inspect the authoritative Engine state in the Inspector.
5. Use Graphs / Events to inspect Worker and Engine events.
6. Run focused tests before moving to another layer.

## Authority rules for agents

Agents may edit:

```text
packages/engine
packages/contracts
packages/scaling
apps/lab
assets metadata
model/specification files
```

but must preserve:

```text
Engine = physiological authority
Engine clock = simulation-time authority
Rapier = physical representation
React Flow = representation/editing
GLB = anatomy/visual asset
```

Forbidden shortcuts:

```text
useFrame() -> engine.step()
Rapier collision -> set physiological variable directly
React state -> second physiological truth
mesh.scale -> filtration decision
React Flow edge -> physiological calculation
```

## Phase 4 smoke test

With `Glomerular Filter V0` selected:

### Intact barrier

```text
integrity = 1.00
```

Press `Reset particles`.

Expected Engine state:

```text
small particle = PASS
RBC = BLOCK
```

### Damaged teaching barrier

Move integrity to:

```text
0.40
```

Press `Reset particles` again.

Expected Engine state:

```text
effective cutoff = 13
small particle = PASS
RBC = PASS
```

These values belong to the V0 teaching abstraction only.

## Full validation gate

Before pushing a phase or major experiment change:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm check
```

Then inspect:

```bash
git status
git diff
```

Changes go:

```text
feature/* -> pruebas -> main
```

Never push experimental work directly to `main`.
