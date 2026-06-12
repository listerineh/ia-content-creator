<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:gitflow-rules -->

# Git Workflow Rules

**NUNCA hacer commits directamente a `main` o `develop`.**

## Flujo obligatorio:

1. **Features**: Crear branch `feature/nombre` desde `develop`
2. **Hotfixes**: Crear branch `hotfix/nombre` desde `main` (solo bugs críticos en producción)
3. **Releases**: Crear branch `release/vX.X.X` desde `develop`

## Proceso:

```bash
# Nueva feature
git checkout develop
git pull origin develop
git checkout -b feature/mi-feature

# Al terminar
git push origin feature/mi-feature
gh pr create --base develop
gh pr merge --squash --delete-branch

# Release a main
git checkout develop
git pull origin develop
gh pr create --base main --title "Release vX.X.X"
gh pr merge --merge
git tag -a vX.X.X -m "descripción"
git push origin vX.X.X
```

## Versiones

**SIEMPRE actualizar `package.json` con la versión del tag antes de crear el release.**

```bash
# Antes de crear el tag, actualizar version en package.json
# "version": "X.X.X"
```

<!-- END:gitflow-rules -->

<!-- BEGIN:tasks-tracking-rules -->

# Task Tracking Rules

**SIEMPRE revisar y actualizar `TASKS.md` con cada cambio significativo.**

## Operaciones permitidas:

- Marcar tareas como completadas: `- [ ]` → `- [x]`
- Agregar nuevas tareas: `- [ ] Nueva tarea`
- Eliminar tareas obsoletas

## Formato:

Solo modificar las líneas de checkmarks. NO agregar descripciones, archivos, ni detalles adicionales.

```markdown
- [x] Tarea completada
- [ ] Tarea pendiente
```

<!-- END:tasks-tracking-rules -->
