# Motor Fisiológico

Repositorio raíz del proyecto **Motor Fisiológico**.

## Branch policy

```text
feature/*
    ↓
pruebas
    ↓
main
```

- `main`: estable/publicable.
- `pruebas`: integración y validación antes de publicación.
- `feature/*`: trabajo aislado.
- `develop` no forma parte del flujo oficial.

## LAB local

Después de instalar dependencias con `pnpm install`:

```bash
pnpm dev:lab
```

El LAB de integración vive en `apps/lab` y usa Vite HMR. El Engine fisiológico continúa ejecutándose en `physiology.worker.ts`; React/R3F/Rapier no son autoridad fisiológica ni temporal.

Consulta `docs/architecture/` antes de modificar límites entre Engine, Worker, visualización o física.
