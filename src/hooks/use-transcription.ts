import { useState, useCallback } from 'react';
import {
  initTranscriber,
  transcribeAudio,
  destroyTranscriber,
  type TranscriptionResult,
  type TranscriptionProgress,
  type ModelSize,
} from '@/lib/transcription/whisper-service';

export function useTranscription() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async (modelSize: ModelSize = 'tiny') => {
    setIsInitializing(true);
    setError(null);

    try {
      await initTranscriber(modelSize, prog => {
        setProgress(prog);
      });
      setIsInitializing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inicializar');
      setIsInitializing(false);
      throw err;
    }
  }, []);

  const transcribe = useCallback(async (audioFile: File | string, language: string = 'auto') => {
    setIsTranscribing(true);
    setError(null);
    setResult(null);

    try {
      const transcriptionResult = await transcribeAudio(audioFile, language, prog => {
        setProgress(prog);
      });

      setResult(transcriptionResult);
      setIsTranscribing(false);
      return transcriptionResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la transcripción');
      setIsTranscribing(false);
      throw err;
    }
  }, []);

  const cleanup = useCallback(() => {
    destroyTranscriber();
    setResult(null);
    setProgress(null);
    setError(null);
  }, []);

  return {
    initialize,
    transcribe,
    cleanup,
    isInitializing,
    isTranscribing,
    progress,
    result,
    error,
  };
}
