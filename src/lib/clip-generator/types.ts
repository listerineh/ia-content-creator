import { type AudioMoment } from '@/lib/audio';

export interface ClipConfig {
  moment: AudioMoment;
  momentIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  format: ClipFormat;
}

export interface ClipFormat {
  id: string;
  name: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  width: number;
  height: number;
  maxDuration: number;
}

export interface ClipResult {
  id: string;
  momentIndex: number;
  blob: Blob;
  url: string;
  duration: number;
  format: ClipFormat;
  timestamp: number;
}

export interface ClipProgress {
  momentIndex: number;
  stage: 'queued' | 'downloading' | 'processing' | 'encoding' | 'done' | 'error';
  progress: number;
  message: string;
}

export interface GeneratorState {
  isGenerating: boolean;
  currentClip: number;
  totalClips: number;
  clips: ClipResult[];
  progress: ClipProgress[];
  error: string | null;
}

export const CLIP_FORMATS: ClipFormat[] = [
  { id: 'tiktok', name: 'TikTok', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 60 },
  {
    id: 'reels',
    name: 'Instagram Reels',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 90,
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 60,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    maxDuration: 600,
  },
  { id: 'square', name: 'Square', aspectRatio: '1:1', width: 1080, height: 1080, maxDuration: 60 },
  {
    id: 'instagram',
    name: 'Instagram Post',
    aspectRatio: '4:5',
    width: 1080,
    height: 1350,
    maxDuration: 60,
  },
];

export const DURATION_BY_MOMENT_TYPE: Record<
  AudioMoment['type'],
  { min: number; ideal: number; max: number }
> = {
  peak: { min: 15, ideal: 30, max: 45 },
  silence: { min: 10, ideal: 20, max: 30 },
  transition: { min: 20, ideal: 40, max: 60 },
};
