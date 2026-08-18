# Registro de cambios — Especificaciones

## Índice

| ID | Fecha | Documento | Regla/Sección |
|----|-------|-----------|---------------|
| ESP-001 | 2026-08-17 | `models/physiology/glomerular-filtration/glomerular-filter-v0.yaml` | Filtración glomerular V0 didáctica |

## ESP-001 — vertical slice de filtración glomerular V0

Fecha: 2026-08-17
Documento: `models/physiology/glomerular-filtration/glomerular-filter-v0.yaml`
Sección/Regla: `particle.filterSize <= barrier.effectiveCutoff`

### Antes

No existía una especificación ejecutable del primer vertical slice de filtración glomerular.

### Cambio

Se registra una calibración explícitamente didáctica y experimental para probar el pipeline completo. La integridad normalizada modifica un cutoff efectivo en `filter units`; una partícula pequeña pasa con barrera íntegra y un eritrocito queda bloqueado. Con daño de demostración suficiente, el mismo Engine puede producir RBC PASS.

### Razón

Validar de extremo a extremo la autoridad del Engine, Central State, eventos, sensor/collider Rapier, React Flow e Inspector sin presentar la abstracción V0 como una medición fisiológica real. El modelo deja explícita la futura separación entre permeabilidad macromolecular y fuga estructural/probabilística de eritrocitos.

## Formato de nueva entrada

```text
## ESP-XXX — nombre breve

Fecha:
Documento:
Sección/Regla:

### Antes

### Cambio

### Razón
```
