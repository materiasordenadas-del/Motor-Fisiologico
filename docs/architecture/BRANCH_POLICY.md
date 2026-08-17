# Política de ramas

## Flujo oficial

```text
main
  ↑ promoción explícita tras validación
pruebas
  ↑ integración de trabajo validable
feature/*
```

- `main`: versión estable/publicable. No se desarrolla directamente aquí.
- `pruebas`: rama permanente de integración y pruebas. Todo cambio debe pasar por aquí antes de `main`.
- `feature/*`: ramas temporales para cambios acotados, normalmente creadas desde `pruebas`.

## Regla de promoción

Un cambio sigue este recorrido:

```text
feature/* → pruebas → validación → main
```

Nunca:

```text
feature/* → main
```

## Gate mínimo antes de `main`

1. instalación reproducible de dependencias;
2. build limpio;
3. tests automatizados;
4. invariantes fisiológicos aplicables;
5. conformance tests cuando haya traducciones matemáticas de referencia;
6. inspección del LAB cuando el cambio afecte visualización/física/interacción.

`develop` no forma parte del flujo oficial. Puede existir históricamente, pero no debe usarse como base de nuevo trabajo.
