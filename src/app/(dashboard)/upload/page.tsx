'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoUrlInput } from '@/components/features/video-upload';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
  };

  const handleContinue = () => {
    if (videoUrl) {
      router.push(`/clips/new?video=${encodeURIComponent(videoUrl)}`);
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Agregar Video</h1>
          <p className="mt-2 text-zinc-400">
            Comparte un video desde Google Drive para generar clips optimizados
          </p>
        </div>

        <div className="space-y-6">
          {!videoUrl ? (
            <VideoUrlInput onUrlSubmit={handleUrlSubmit} />
          ) : (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Film className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Video listo para procesar</p>
                  <p className="mt-1 text-sm text-zinc-500 truncate">{videoUrl}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={handleReset} className="text-zinc-400">
                  Cambiar video
                </Button>
                <Button onClick={handleContinue} size="lg">
                  Continuar a generar clips
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
