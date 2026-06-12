'use client';

import { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranscription } from '@/hooks/use-transcription';
import { extractAudioFromVideo } from '@/lib/transcription/audio-extractor';
import { TranscriptionViewer } from './transcription-viewer';

interface TranscriptionButtonProps {
  videoFile: File | null;
  videoUrl?: string;
}

export function TranscriptionButton({ videoFile, videoUrl }: TranscriptionButtonProps) {
  const { initialize, transcribe, isInitializing, isTranscribing, progress, result, error } =
    useTranscription();
  const [isExtracting, setIsExtracting] = useState(false);

  const handleTranscribe = async () => {
    try {
      // 1. Initialize Whisper model
      await initialize('tiny');

      // 2. Extract audio from video
      setIsExtracting(true);
      let audioFile: File;

      if (videoFile) {
        audioFile = await extractAudioFromVideo(videoFile);
      } else if (videoUrl) {
        // Download video from URL first
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const tempVideoFile = new File([blob], 'video.mp4', { type: 'video/mp4' });
        audioFile = await extractAudioFromVideo(tempVideoFile);
      } else {
        throw new Error('No video file or URL provided');
      }

      setIsExtracting(false);

      // 3. Transcribe audio
      await transcribe(audioFile, 'es');
    } catch (err) {
      console.error('Transcription error:', err);
      setIsExtracting(false);
    }
  };

  const getButtonText = () => {
    if (isInitializing) return 'Cargando modelo...';
    if (isExtracting) return 'Extrayendo audio...';
    if (isTranscribing) return 'Transcribiendo...';
    if (result) return 'Transcripción completada';
    return 'Transcribir video';
  };

  const isLoading = isInitializing || isExtracting || isTranscribing;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleTranscribe}
          disabled={isLoading || (!videoFile && !videoUrl)}
          className="bg-violet-600 hover:bg-violet-500"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {getButtonText()}
        </Button>

        {progress && (
          <span className="text-sm text-zinc-500">
            {progress.message}
            {progress.progress !== undefined && ` (${progress.progress}%)`}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">Error en la transcripción</p>
            <p className="text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <TranscriptionViewer
          segments={result.segments}
          fullText={result.fullText}
          language={result.language}
        />
      )}
    </div>
  );
}
