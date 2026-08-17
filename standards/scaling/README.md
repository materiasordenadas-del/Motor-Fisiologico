# Scaling Standard V0

La fisiología conserva magnitudes reales/canónicas; la capa visual solicita una representación de escena.

## Autoridad ejecutable

El registro ejecutable de conversiones está en `packages/scaling/src/unit-registry.ts`. Los YAML de esta carpeta fijan la convención, ecuaciones y perfiles permitidos; no deben introducir factores de conversión alternativos.

## Unidades canónicas V0

- longitud: `m`
- área: `m2`
- volumen: `m3`
- tiempo: `s`
- flujo: `m3/s`
- masa: `kg`
- cantidad: `mol`
- presión: `Pa`
- adimensional: `1`

No se admiten conversiones implícitas dentro de modelos fisiológicos o componentes visuales.
