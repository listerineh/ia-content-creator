'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProcessingProgress {
  stage:
    | 'loading'
    | 'extracting'
    | 'analyzing'
    | 'transcribing'
    | 'generating'
    | 'subtitles'
    | 'done'
    | 'error';
  progress: number;
  message: string;
  currentClip?: number;
  totalClips?: number;
}

export interface GeneratedClip {
  id: string;
  name: string;
  format: { id: string; name: string; aspectRatio: string };
  startTime: number;
  endTime: number;
  duration: number;
  blob: Blob;
  url: string;
  score: number;
  reason: string;
}

export interface ProcessingConfig {
  videoUrl: string;
  formats: string[];
  intent: string;
  subtitles: {
    enabled: boolean;
    style: string;
    position: string;
    alignment: string;
    language: string;
  };
}

interface UseVideoProcessorReturn {
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  clips: GeneratedClip[];
  error: string | null;
  startProcessing: (config: ProcessingConfig) => void;
  reset: () => void;
}

export function useVideoProcessor(): UseVideoProcessorReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [clips, setClips] = useState<GeneratedClip[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    workerRef.current = new Worker('/workers/video-processor.js', { type: 'module' });

    workerRef.current.onmessage = event => {
      const { type, payload } = event.data;

      switch (type) {
        case 'PROGRESS':
          setProgress(payload);
          break;

        case 'PROCESSING_COMPLETE':
          setClips(payload.clips);
          setIsProcessing(false);
          setProgress({ stage: 'done', progress: 100, message: 'Completado' });
          break;

        case 'ERROR':
          setError(payload.error);
          setIsProcessing(false);
          setProgress({ stage: 'error', progress: 0, message: payload.error });
          break;
      }
    };

    workerRef.current.onerror = err => {
      setError(err.message || 'Error en el worker');
      setIsProcessing(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startProcessing = useCallback((config: ProcessingConfig) => {
    if (!workerRef.current) {
      setError('Worker no disponible');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setClips([]);
    setProgress({ stage: 'loading', progress: 0, message: 'Iniciando...' });

    workerRef.current.postMessage({
      type: 'PROCESS_VIDEO',
      payload: config,
    });
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(null);
    setClips([]);
    setError(null);
  }, []);

  return {
    isProcessing,
    progress,
    clips,
    error,
    startProcessing,
    reset,
  };
}
