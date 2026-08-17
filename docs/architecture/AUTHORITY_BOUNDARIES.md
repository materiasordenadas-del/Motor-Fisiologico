# Fronteras de autoridad V0

## Autoridad fisiológica

`packages/engine` es la única autoridad para:

- estado fisiológico;
- ecuaciones;
- reglas e invariantes;
- progresión temporal fisiológica;
- efectos de enfermedad;
- efectos de tratamiento;
- resultados cuantitativos.

## Autoridad temporal

La fisiología avanza únicamente mediante el reloj del Engine.

```text
engine.step(dt)
```

En V0 el paso es fijo y controlado por el Engine. R3F, `requestAnimationFrame`, Rapier y la frecuencia del monitor no pueden determinar `dt` fisiológico.

## Physics Non-Authority

Rapier puede representar:

- contacto;
- sensores;
- colisiones;
- movimiento;
- consecuencias visuales de una decisión del Engine.

Rapier no puede calcular directamente TFG, proteinuria, hematuria, clearance, presión fisiológica, balances o respuesta farmacológica.

## Scaling

`packages/scaling` será la única autoridad para pasar de magnitudes científicas/canónicas a magnitudes de escena.

Nunca usar:

```text
mesh.scale → decisión fisiológica
```

Una regla de filtración debe utilizar valores fisiológicos explícitos como `filterSize`, `effectiveCutoff`, integridad y permeabilidad.

## LAB

`apps/lab` será consumidor e interfaz de integración. Puede enviar comandos al Engine y representar snapshots; no puede convertirse en una segunda fuente de verdad fisiológica.
