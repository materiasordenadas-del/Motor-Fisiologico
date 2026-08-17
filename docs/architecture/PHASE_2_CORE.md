# Fase 2 — Núcleo científico ejecutable

## Implementado

- Unit Registry con normalización a SI y rechazo de dimensiones incompatibles.
- Mapping visual lineal/potencia/fijo separado de la fisiología.
- `CentralState` como almacenamiento único de variables canónicas registradas.
- Precedencia ejecutable y trazable: general → local → disease → treatment → constraint → result.
- Harness genérico de conformidad con `atol + rtol * abs(reference)`.
- Worker V0 con `INIT`, `PLAY`, `PAUSE`, `STEP`, `SET_PARAMETER`, `SET_SPEED` y `RESET`.
- El Worker recomputa la normalización de unidades; no confía en `canonicalValue` enviado por la UI.
- Scheduler del Worker decide cuántos pasos pedir al Engine, pero jamás cambia `fixedDt`.
- Plantillas de principios generales, especificaciones y referencias OpenModelica/Physiolibrary.
- Registros acumulativos de cambios científicos.

## CI

El workflow objetivo está versionado en `docs/architecture/ci.workflow.template.yml`. Debe copiarse a `.github/workflows/ci.yml` desde un checkout local. El conector GitHub utilizado durante esta fase bloqueó escrituras directas dentro de `.github/workflows/`.

El workflow usa build + tests en `pruebas` y `main` y debe mantenerse como gate antes de promoción a `main`.

## A propósito no implementado todavía

- React/Vite/R3F/Rapier/React Flow: Fase 3.
- Parámetros fisiológicos renales concretos: entrarán con fuentes y tests, no como datos de demostración.
- Enfermedades, tratamientos y escenarios ejecutables: el contrato existe; la implementación fisiológica llega después de tener modelos basales validados.
- Perfiles visuales pedagógicos numéricos: los IDs están reservados, pero su parametrización queda pendiente para evitar valores arbitrarios.

## Invariante de arquitectura

`packages/engine` continúa siendo ejecutable sin React, Three.js, Rapier, GLB ni React Flow.
