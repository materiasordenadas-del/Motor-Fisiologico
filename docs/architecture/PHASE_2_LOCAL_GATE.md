# Fase 2 — Gate local obligatorio antes de merge a `pruebas`

El conector GitHub usado para construir la Fase 2 no permite escribir directamente en `.github/workflows/`. Desde un checkout local de `feature/phase-2-scientific-core`, Codex o Claude Code debe ejecutar:

```bash
git checkout feature/phase-2-scientific-core
mkdir -p .github/workflows
cp docs/architecture/ci.workflow.template.yml .github/workflows/ci.yml
pnpm install
pnpm check
```

Si `pnpm install` genera `pnpm-lock.yaml`, conservarlo y versionarlo.

Si `pnpm check` pasa:

```bash
git add .github/workflows/ci.yml pnpm-lock.yaml
git commit -m "ci: install scientific core validation workflow"
git push
```

Después revisar que el PR #2 siga apuntando a `pruebas` y que el CI pase. Solo entonces fusionar.

## Si falla

No mover código fisiológico al render thread ni desactivar tests para forzar el merge. Corregir la causa en la rama `feature/phase-2-scientific-core` y repetir el gate.
