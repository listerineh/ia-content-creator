import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control de OpenStage para gestionar tu banda y contenido.',
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-16 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Bienvenido a OpenStage
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tu plataforma todo-en-uno para crear contenido viral
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-white">Resumen</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">0</p>
                <p className="text-xs text-zinc-500">Clips generados</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">-</p>
                <p className="text-xs text-zinc-500">Alcance total</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">-</p>
                <p className="text-xs text-zinc-500">Seguidores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-white">Comienza ahora</h2>
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h3 className="font-medium text-white">¡Crea tu primer clip viral!</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Usa el Generador de Clips para convertir tus videos en contenido optimizado para redes
            sociales. Soporta TikTok, Reels, Shorts y más.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/tools/clip-generator"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              <Zap className="h-4 w-4" />
              Generar clips
            </Link>
            <Link
              href="/bands"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Gestionar bandas
            </Link>
          </div>
        </div>
      </section>

      {/* Activity (placeholder) */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-white">Actividad reciente</h2>
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500">No hay actividad reciente</p>
          <p className="mt-1 text-xs text-zinc-600">Tus clips y publicaciones aparecerán aquí</p>
        </div>
      </section>
    </div>
  );
}
