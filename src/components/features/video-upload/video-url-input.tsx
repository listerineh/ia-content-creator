'use client';

import { useState } from 'react';
import { Link2, ExternalLink, CheckCircle, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUrlInputProps {
  onUrlSubmit: (url: string) => void;
  disabled?: boolean;
}

export function VideoUrlInput({ onUrlSubmit, disabled = false }: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const validateGoogleDriveUrl = (inputUrl: string): string | null => {
    // Formatos válidos de Google Drive:
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    // https://drive.google.com/uc?id=FILE_ID
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = inputUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const getDirectUrl = (fileId: string): string => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  const handleSubmit = async () => {
    setError(null);
    setIsValidating(true);

    try {
      const fileId = validateGoogleDriveUrl(url);

      if (!fileId) {
        setError('URL no válida. Asegúrate de usar un enlace de Google Drive.');
        return;
      }

      const directUrl = getDirectUrl(fileId);
      onUrlSubmit(directUrl);
    } catch {
      setError('Error al validar la URL. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="video-url" className="block text-sm font-medium text-zinc-300">
          URL del video en Google Drive
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              disabled={disabled || isValidating}
              className={cn(
                'w-full rounded-md border bg-zinc-900 py-2 pl-10 pr-3 text-white placeholder-zinc-500',
                'focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500',
                error ? 'border-red-500' : 'border-zinc-700'
              )}
            />
          </div>
          <Button onClick={handleSubmit} disabled={!url || disabled || isValidating}>
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowTutorial(!showTutorial)}
        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
      >
        <HelpCircle className="h-4 w-4" />
        {showTutorial ? 'Ocultar instrucciones' : '¿Cómo subo mi video a Google Drive?'}
      </button>

      {showTutorial && <GoogleDriveTutorial />}
    </div>
  );
}

function GoogleDriveTutorial() {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h3 className="font-medium text-white">Cómo subir tu video a Google Drive</h3>

      <ol className="mt-4 space-y-4 text-sm text-zinc-300">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">
            1
          </span>
          <div>
            <p>
              Ve a{' '}
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                Google Drive
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">
            2
          </span>
          <div>
            <p>Haz clic en &quot;Nuevo&quot; → &quot;Subir archivo&quot; y selecciona tu video</p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">
            3
          </span>
          <div>
            <p>Una vez subido, haz clic derecho en el archivo → &quot;Compartir&quot;</p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">
            4
          </span>
          <div>
            <p>
              Cambia el acceso a <strong>&quot;Cualquier persona con el enlace&quot;</strong>
            </p>
            <p className="mt-1 text-zinc-500">
              Esto es necesario para que podamos procesar tu video
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">
            5
          </span>
          <div>
            <p>Copia el enlace y pégalo arriba</p>
          </div>
        </li>
      </ol>

      <div className="mt-4 rounded-md bg-zinc-800 p-3 text-xs text-zinc-400">
        <strong className="text-zinc-300">Formatos soportados:</strong> MP4, MOV, WebM, AVI, MKV
        <br />
        <strong className="text-zinc-300">Tamaño máximo:</strong> Sin límite (depende de tu Google
        Drive)
      </div>
    </div>
  );
}
