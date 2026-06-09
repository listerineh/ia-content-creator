'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, ArrowLeft, FileVideo, Clock, Star, Archive, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoredClip {
  id: string;
  name: string;
  format: {
    id: string;
    name: string;
    aspectRatio: string;
  };
  startTime: number;
  endTime: number;
  duration: number;
  url: string;
  score: number;
  reason: string;
}

export function ResultsView() {
  const router = useRouter();
  const [clips] = useState<StoredClip[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('openstage-clips');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedClip, setSelectedClip] = useState<StoredClip | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('openstage-clips');
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredClip[];
    return parsed.length > 0 ? parsed[0] : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (clips.length === 0) {
      router.push('/create');
    }
  }, [clips.length, router]);

  const handleDownloadAll = async () => {
    if (clips.length === 0) return;

    setIsDownloading(true);
    try {
      for (const clip of clips) {
        const a = document.createElement('a');
        a.href = clip.url;
        a.download = `${clip.name}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadClip = (clip: StoredClip) => {
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = `${clip.name}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClearAndRestart = () => {
    localStorage.removeItem('openstage-clips');
    localStorage.removeItem('openstage-wizard-state');
    router.push('/create');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (clips.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FileVideo className="mx-auto h-12 w-12 text-zinc-600" />
          <h2 className="mt-4 text-lg font-medium text-white">No hay clips</h2>
          <p className="mt-2 text-sm text-zinc-400">No se encontraron clips generados.</p>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Crear nuevos clips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/create"
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al wizard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Clips generados</h1>
          <p className="mt-1 text-zinc-400">
            {clips.length} clip{clips.length !== 1 ? 's' : ''} listo
            {clips.length !== 1 ? 's' : ''} para descargar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAndRestart}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Nuevo video
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Descargando...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Descargar todos
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video preview */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {selectedClip ? (
              <div className="relative aspect-video bg-black">
                <video
                  key={selectedClip.id}
                  src={selectedClip.url}
                  className="h-full w-full object-contain"
                  controls
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-zinc-950">
                <p className="text-zinc-500">Selecciona un clip para previsualizar</p>
              </div>
            )}

            {selectedClip && (
              <div className="border-t border-zinc-800 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{selectedClip.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(selectedClip.duration)}
                      </span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                        {selectedClip.format.aspectRatio}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" />
                        {Math.round(selectedClip.score * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">{selectedClip.reason}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadClip(selectedClip)}
                    className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clips list */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">Todos los clips</h3>
          <div className="space-y-2">
            {clips.map(clip => (
              <button
                key={clip.id}
                onClick={() => {
                  setSelectedClip(clip);
                  setIsPlaying(false);
                }}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-all',
                  selectedClip?.id === clip.id
                    ? 'border-violet-500/50 bg-violet-500/5'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      selectedClip?.id === clip.id
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    <FileVideo className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{clip.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{formatTime(clip.duration)}</span>
                      <span>•</span>
                      <span>{clip.format.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3 w-3" />
                    {Math.round(clip.score * 100)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
