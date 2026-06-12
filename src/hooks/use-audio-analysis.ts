import { useState, useCallback } from 'react';
import { analyzeAudio, type AudioAnalysisResult } from '@/lib/audio/analyzer';

interface UseAudioAnalysisReturn {
  analyze: (videoUrl: string) => Promise<void>;
  result: AudioAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  isRateLimited: boolean;
  reset: () => void;
}

export function useAudioAnalysis(): UseAudioAnalysisReturn {
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const analyze = useCallback(async (videoUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setIsRateLimited(false);

    try {
      const analysisResult = await analyzeAudio(videoUrl);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze audio';

      // Detectar si es rate limit
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        setIsRateLimited(true);
        setError(
          'Google Drive está limitando las descargas. Espera unos minutos e intenta de nuevo.'
        );
      } else {
        setError(errorMessage);
      }

      console.error('Audio analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setIsRateLimited(false);
  }, []);

  return {
    analyze,
    result,
    isAnalyzing,
    error,
    isRateLimited,
    reset,
  };
}
