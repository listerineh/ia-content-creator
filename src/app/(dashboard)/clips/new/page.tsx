'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormatSelector } from '@/components/features/clip-settings';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Film, Loader2 } from 'lucide-react';
import Link from 'next/link';

function NewClipContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video');

  const [selectedFormats, setSelectedFormats] = useState<string[]>(['tiktok', 'reels', 'shorts']);

  if (!videoUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <div className="text-center">
          <p className="text-zinc-400">No se ha seleccionado ningún video</p>
          <Link href="/upload" className="mt-4 inline-block text-violet-400 hover:underline">
            Ir a agregar video
          </Link>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    const params = new URLSearchParams({
      video: videoUrl,
      formats: selectedFormats.join(','),
    });
    router.push(`/clips/new/intent?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/upload"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Configurar Clips</h1>
          <p className="mt-2 text-zinc-400">Selecciona los formatos de salida para tus clips</p>
        </div>

        <div className="mb-8 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Film className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Video seleccionado</p>
              <p className="text-xs text-zinc-500 truncate">{videoUrl}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Formatos de Salida</h2>
            <FormatSelector
              selectedFormats={selectedFormats}
              onSelectionChange={setSelectedFormats}
              multiple={true}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button onClick={handleContinue} disabled={selectedFormats.length === 0} size="lg">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );
}

export default function NewClipPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewClipContent />
    </Suspense>
  );
}
