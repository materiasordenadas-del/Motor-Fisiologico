# Adding GLB assets and physiology bindings

## 1. Source and runtime asset locations

Keep editable Blender source files under:

```text
assets/blender/<domain>/<asset>.blend
```

Export canonical runtime GLB files under:

```text
assets/glb/<domain>/<asset>.glb
```

For direct Vite serving during LAB development, copy or link a runtime copy under:

```text
apps/lab/public/models/<asset>.glb
```

The public copy is a serving artifact. `assets/glb` remains the canonical exported asset location.

## 2. Stable object identifiers

Objects that need bindings should use stable semantic identifiers rather than Blender-generated names.

Example:

```text
renal.glomerulus.gfb
renal.glomerulus.capillary
renal.glomerulus.bowman_space
```

When possible store the same identifier as custom metadata such as:

```text
sim_id = renal.glomerulus.gfb
```

## 3. Do not encode physiology in geometry

Never use:

```text
mesh.scale
object dimensions
material opacity
collider size
```

as the physiological source of truth.

Correct direction:

```text
ENGINE variable/event
        ↓
AnatomyBinding
        ↓
visual transform/material/animation
```

## 4. AnatomyBinding

Shared binding contracts live in `packages/contracts`.

Example metadata:

```json
{
  "id": "binding.gfb.integrity.material",
  "variableId": "renal.glomerular_barrier.integrity",
  "anatomyObjectId": "renal.glomerulus.gfb",
  "transform": "material"
}
```

The binding tells the visual layer what to represent. It does not change the Engine variable.

## 5. Visual mesh vs collision mesh

A high-detail GLB should not automatically become a Rapier collider.

Prefer:

```text
VISUAL MESH
high-quality teaching anatomy

COLLISION MESH
simple wall/sensor/collider geometry
```

For the Phase 4 glomerular experiment the procedural collider remains independent from any future glomerulus GLB.

## 6. Replacing the procedural Phase 4 scene

When a glomerulus GLB is ready:

1. place the source `.blend` under `assets/blender/renal/glomerulus/`;
2. export the `.glb` to `assets/glb/renal/glomerulus/`;
3. add stable `sim_id` values to relevant objects;
4. create/update binding metadata under `assets/metadata/bindings/`;
5. load the GLB only in the visual layer;
6. keep the Rapier sensor/collider separate unless a simplified collision mesh is intentionally authored;
7. do not move `filterSize`, `effectiveCutoff`, `integrity` or `canPass` into the GLB;
8. rerun Engine-only and LAB tests.

The Engine must produce the same filtration decisions with the GLB completely absent.
