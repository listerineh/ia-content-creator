'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { IntentSelector } from '@/components/features/clip-settings';
import { PageContainer } from '@/components/ui/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Loader2 } from 'lucide-react';
import Link from 'next/link';

function IntentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video');
  const formats = searchParams.get('formats');

  const [selectedIntent, setSelectedIntent] = useState<string | null>('viral');

  if (!videoUrl || !formats) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-400">Configuración incompleta</p>
          <Link
            href="/upload"
            className="mt-4 text-sm text-violet-400 transition-colors hover:text-violet-300"
          >
            Volver a inicio
          </Link>
        </div>
      </PageContainer>
    );
  }

  const handleContinue = () => {
    if (selectedIntent) {
      const params = new URLSearchParams({
        video: videoUrl,
        formats: formats,
        intent: selectedIntent,
      });
      router.push(`/clips/new/subtitles?${params.toString()}`);
    }
  };

  const backUrl = `/clips/new?video=${encodeURIComponent(videoUrl)}`;

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="space-y-6">
          <BackLink href={backUrl} />
          <PageHeader title="Tipo de contenido" description="¿Qué tipo de clips quieres generar?" />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Film className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {formats.split(',').length} formato{formats.split(',').length > 1 ? 's' : ''}{' '}
                seleccionado{formats.split(',').length > 1 ? 's' : ''}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{formats.split(',').join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-base font-medium text-white">Intención del video</h2>
            <IntentSelector selectedIntent={selectedIntent} onSelectionChange={setSelectedIntent} />
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-800/50">
            <Button onClick={handleContinue} disabled={!selectedIntent}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );
}

export default function IntentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IntentPageContent />
    </Suspense>
  );
}
