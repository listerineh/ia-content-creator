import { useState, useCallback } from 'react';
import { analyzeAudio, type AudioAnalysisResult } from '@/lib/audio/analyzer';

interface UseAudioAnalysisReturn {
  analyze: (videoUrl: string) => Promise<void>;
  result: AudioAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  reset: () => void;
}

export function useAudioAnalysis(): UseAudioAnalysisReturn {
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (videoUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeAudio(videoUrl);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze audio';
      setError(errorMessage);
      console.error('Audio analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyze,
    result,
    isAnalyzing,
    error,
    reset,
  };
}
