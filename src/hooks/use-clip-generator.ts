'use client';

import { useState, useCallback, useRef } from 'react';
import { type AudioMoment } from '@/lib/audio';
import {
  type ClipResult,
  type ClipProgress,
  type GeneratorState,
  CLIP_FORMATS,
} from '@/lib/clip-generator/types';
import { generateClipConfigs } from '@/lib/clip-generator/duration';
import { generateMultipleClips } from '@/lib/clip-generator/ffmpeg-worker';

const initialState: GeneratorState = {
  isGenerating: false,
  currentClip: 0,
  totalClips: 0,
  clips: [],
  progress: [],
  error: null,
};

export function useClipGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const abortRef = useRef(false);

  const generate = useCallback(
    async (
      videoUrl: string,
      moments: AudioMoment[],
      selectedIndices: number[],
      videoDuration: number,
      formatId: string = 'tiktok'
    ) => {
      if (state.isGenerating) return;

      abortRef.current = false;

      const format = CLIP_FORMATS.find(f => f.id === formatId) || CLIP_FORMATS[0];
      const configs = generateClipConfigs(moments, selectedIndices, videoDuration, format);

      setState({
        isGenerating: true,
        currentClip: 0,
        totalClips: configs.length,
        clips: [],
        progress: configs.map(c => ({
          momentIndex: c.momentIndex,
          stage: 'queued' as const,
          progress: 0,
          message: 'En cola...',
        })),
        error: null,
      });

      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (!fileIdMatch) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'URL de video inválida',
        }));
        return;
      }

      const downloadUrl = `/api/download-video?fileId=${fileIdMatch[1]}`;

      try {
        await generateMultipleClips(
          downloadUrl,
          configs,
          (progress: ClipProgress) => {
            if (abortRef.current) return;

            setState(prev => ({
              ...prev,
              progress: prev.progress.map(p =>
                p.momentIndex === progress.momentIndex ? progress : p
              ),
              currentClip: progress.stage === 'done' ? prev.currentClip + 1 : prev.currentClip,
            }));
          },
          (momentIndex: number, blob: Blob) => {
            if (abortRef.current) return;

            const config = configs.find(c => c.momentIndex === momentIndex);
            if (!config) return;

            const result: ClipResult = {
              id: `clip-${momentIndex}-${Date.now()}`,
              momentIndex,
              blob,
              url: URL.createObjectURL(blob),
              duration: config.duration,
              format: config.format,
              timestamp: config.moment.timestamp,
            };

            setState(prev => ({
              ...prev,
              clips: [...prev.clips, result],
            }));
          }
        );

        setState(prev => ({
          ...prev,
          isGenerating: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Error generando clips',
        }));
      }
    },
    [state.isGenerating]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      isGenerating: false,
      error: 'Generación cancelada',
    }));
  }, []);

  const reset = useCallback(() => {
    state.clips.forEach(clip => {
      URL.revokeObjectURL(clip.url);
    });
    setState(initialState);
  }, [state.clips]);

  const downloadClip = useCallback((clip: ClipResult, filename?: string) => {
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = filename || `clip_${clip.momentIndex + 1}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAllClips = useCallback(() => {
    state.clips.forEach((clip, index) => {
      setTimeout(() => {
        downloadClip(clip, `clip_${index + 1}.mp4`);
      }, index * 500);
    });
  }, [state.clips, downloadClip]);

  return {
    ...state,
    generate,
    abort,
    reset,
    downloadClip,
    downloadAllClips,
    formats: CLIP_FORMATS,
  };
}
