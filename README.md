# 🎸 OpenStage

**Plataforma open source para que músicos generen y gestionen contenido para redes sociales.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 ¿Qué es OpenStage?

OpenStage es una plataforma all-in-one diseñada para bandas y músicos que quieren:

- **Generar clips** optimizados automáticamente desde videos largos (shows, ensayos, sesiones)
- **Añadir subtítulos** y formatear para cada red social (TikTok, Instagram, YouTube)
- **Centralizar métricas** de todas las plataformas (Spotify prioritario)
- **Gestionar equipos** (bandas) con roles y permisos
- **Programar publicaciones** en múltiples redes sociales

## ✨ Características Principales

- 🎬 **Generación inteligente de clips** - Detecta momentos clave, canciones completas, highlights
- 📝 **Subtítulos automáticos** - Transcripción con Whisper, estilos personalizables
- 📊 **Dashboard unificado** - Métricas de Spotify, YouTube, TikTok, Instagram en un solo lugar
- 👥 **Gestión de bandas** - Invita miembros, asigna roles, colabora
- 📁 **Almacén de contenido** - Organiza tus clips en carpetas, historial completo
- 🚀 **Publicación directa** - Sube a redes sociales sin salir de la plataforma

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm 10+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/listerineh/ia-content-creator.git
cd ia-content-creator

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── features/          # Componentes por feature
├── lib/
│   ├── supabase/          # Cliente y tipos de Supabase
│   ├── video/             # Procesamiento de video
│   └── ai/                # Integraciones de IA
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## 🛠️ Scripts Disponibles

| Comando             | Descripción                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Inicia servidor de desarrollo    |
| `pnpm build`        | Construye para producción        |
| `pnpm start`        | Inicia servidor de producción    |
| `pnpm lint`         | Ejecuta ESLint                   |
| `pnpm lint:fix`     | Corrige errores de ESLint        |
| `pnpm format`       | Formatea código con Prettier     |
| `pnpm format:check` | Verifica formato                 |
| `pnpm db:migrate`   | Aplica migraciones a Supabase    |
| `pnpm db:reset`     | Resetea la base de datos         |
| `pnpm db:types`     | Genera tipos TypeScript de la DB |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](docs/CONTRIBUTING.md) para detalles sobre el proceso.

### Flujo de Git

- `main` - Producción estable
- `develop` - Integración y staging
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Corrección de bugs

### Convención de Commits

```
tipo(alcance): descripción breve

Ejemplos:
feat(auth): agregar login con Google
fix(video): corregir error en upload
docs(readme): actualizar instrucciones
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Whisper](https://github.com/openai/whisper) - Transcripción de audio

---

**Hecho con ❤️ para músicos, por músicos.**
