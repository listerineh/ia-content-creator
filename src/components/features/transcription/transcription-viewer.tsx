'use client';

import { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranscriptionSegment } from '@/lib/transcription/whisper-service';

interface TranscriptionViewerProps {
  segments: TranscriptionSegment[];
  fullText: string;
  language: string;
}

export function TranscriptionViewer({ segments, fullText, language }: TranscriptionViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-medium text-white">Transcripción</h3>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className="text-sm text-zinc-500 hover:text-white"
          >
            {showTimestamps ? 'Ocultar' : 'Mostrar'} timestamps
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Transcription content */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        {showTimestamps ? (
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <span className="shrink-0 text-xs font-mono text-zinc-500">
                  {formatTime(segment.start)}
                </span>
                <p className="text-sm text-zinc-300">{segment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{fullText}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>{segments.length} segmentos</span>
        <span>{fullText.split(' ').length} palabras</span>
        <span>{formatTime(segments[segments.length - 1]?.end || 0)} duración</span>
      </div>
    </div>
  );
}
