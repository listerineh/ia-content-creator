# 📚 OpenStage - Base de Conocimiento

Este archivo documenta decisiones técnicas, aprendizajes y soluciones encontradas durante el desarrollo.

---

## Decisiones de Arquitectura

### Stack Tecnológico (Junio 2026)

| Componente    | Tecnología                    | Razón                                  |
| ------------- | ----------------------------- | -------------------------------------- |
| Frontend      | Next.js 16 + React 19         | SSR, App Router, ecosistema maduro     |
| UI            | Tailwind CSS 4 + shadcn/ui    | Componentes accesibles, diseño moderno |
| Backend       | Next.js API Routes + Supabase | Serverless, escala automáticamente     |
| Base de datos | Supabase (PostgreSQL)         | Tier gratis generoso, auth incluido    |
| Auth          | Supabase Auth                 | OAuth providers, gratis                |

### Procesamiento de Video

**Decisión:** Enfoque híbrido - browser-first con API fallback

- **Transcripción:** Whisper.cpp (WASM) en browser, Groq API como fallback
- **Corte de video:** FFmpeg.wasm en browser
- **Detección de momentos:** Análisis de audio local (peaks, silencios)

**Razón:** Minimizar costos operativos, mantener el proyecto open source viable.

### Límites Definidos

| Parámetro           | Valor       | Notas                                  |
| ------------------- | ----------- | -------------------------------------- |
| Tamaño máx. video   | 500MB - 1GB | Ajustable según storage                |
| Duración máx. video | 30min - 1hr | Balance entre utilidad y procesamiento |

---

## Convenciones de Código

### Estructura de Carpetas

```
src/
├── app/           # Rutas (Next.js App Router)
├── components/
│   ├── ui/        # shadcn/ui (no modificar directamente)
│   └── features/  # Componentes específicos por feature
├── lib/           # Utilidades y clientes
├── hooks/         # Custom hooks
├── stores/        # Estado global (Zustand)
└── types/         # TypeScript types/interfaces
```

### Convención de Commits

Formato: `tipo(alcance): descripción`

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formato (sin cambios de código)
- `refactor` - Refactorización
- `test` - Tests
- `chore` - Mantenimiento

### Versionado

Seguimos SemVer: `vMAJOR.MINOR.PATCH`

---

## Problemas Resueltos

### [2026-06-09] Configuración inicial

**Problema:** Configurar proyecto con todas las herramientas de desarrollo.

**Solución:**

- Next.js 16 con App Router y TypeScript
- Tailwind CSS 4 + shadcn/ui para UI
- ESLint + Prettier + Husky para calidad de código
- lint-staged para pre-commit hooks

---

## Limitaciones Conocidas

### APIs de Redes Sociales

| Plataforma | Limitación                                | Workaround                         |
| ---------- | ----------------------------------------- | ---------------------------------- |
| TikTok     | Requiere app review para producción       | Usar modo desarrollo inicialmente  |
| Instagram  | Requiere Business account                 | Documentar requisito para usuarios |
| Twitter/X  | Tier gratis muy limitado (1500 reads/mes) | Evaluar si vale la pena integrar   |

### Procesamiento en Browser

- Videos muy largos (>30min) pueden ser lentos
- Dispositivos con poca RAM pueden tener problemas
- Solución futura: Ofrecer procesamiento en servidor como opción

---

## TODOs Técnicos

- [ ] Investigar WebCodecs API para mejor rendimiento de video
- [ ] Evaluar Cloudflare Workers AI para procesamiento serverless barato
- [ ] Implementar sistema de caché para transcripciones

---

_Última actualización: 9 de Junio 2026_
