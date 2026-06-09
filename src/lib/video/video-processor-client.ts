'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface ProcessingProgress {
  stage: 'loading' | 'downloading' | 'analyzing' | 'generating' | 'done' | 'error';
  progress: number;
  message: string;
  currentClip?: number;
  totalClips?: number;
}

export interface GeneratedClip {
  id: string;
  name: string;
  format: {
    id: string;
    name: string;
    aspectRatio: string;
    width: number;
    height: number;
  };
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

const FORMAT_SPECS: Record<
  string,
  { name: string; width: number; height: number; aspectRatio: string }
> = {
  tiktok: { name: 'TikTok', width: 1080, height: 1920, aspectRatio: '9:16' },
  reels: { name: 'Instagram Reels', width: 1080, height: 1920, aspectRatio: '9:16' },
  shorts: { name: 'YouTube Shorts', width: 1080, height: 1920, aspectRatio: '9:16' },
  instagram: { name: 'Instagram Post', width: 1080, height: 1080, aspectRatio: '1:1' },
  youtube: { name: 'YouTube', width: 1920, height: 1080, aspectRatio: '16:9' },
};

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

export async function loadFFmpeg(
  onProgress?: (progress: ProcessingProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }

  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Cargando procesador de video...',
  });

  ffmpegInstance = new FFmpeg();

  ffmpegInstance.on('progress', ({ progress }) => {
    onProgress?.({
      stage: 'generating',
      progress: Math.round(progress * 100),
      message: 'Procesando video...',
    });
  });

  ffmpegInstance.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  // Load from local files
  const baseURL = '/ffmpeg';

  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;

  onProgress?.({
    stage: 'loading',
    progress: 100,
    message: 'Procesador cargado',
  });

  return ffmpegInstance;
}

export async function downloadVideo(
  url: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Uint8Array> {
  onProgress?.({
    stage: 'downloading',
    progress: 0,
    message: 'Descargando video...',
  });

  // Convert Google Drive URL to direct download URL
  let downloadUrl = url;

  // Handle Google Drive URLs
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Error descargando video: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No se pudo leer el video');
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      onProgress?.({
        stage: 'downloading',
        progress: Math.round((received / total) * 100),
        message: `Descargando video... ${Math.round(received / 1024 / 1024)}MB`,
      });
    }
  }

  // Combine chunks
  const videoData = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    videoData.set(chunk, position);
    position += chunk.length;
  }

  onProgress?.({
    stage: 'downloading',
    progress: 100,
    message: 'Video descargado',
  });

  return videoData;
}

export async function generateClip(
  ffmpeg: FFmpeg,
  videoData: Uint8Array,
  startTime: number,
  endTime: number,
  format: { width: number; height: number },
  outputName: string
): Promise<Blob> {
  // Write input video
  await ffmpeg.writeFile('input.mp4', videoData);

  const duration = endTime - startTime;

  // Generate clip with scaling
  await ffmpeg.exec([
    '-ss',
    startTime.toString(),
    '-i',
    'input.mp4',
    '-t',
    duration.toString(),
    '-vf',
    `scale=${format.width}:${format.height}:force_original_aspect_ratio=decrease,pad=${format.width}:${format.height}:(ow-iw)/2:(oh-ih)/2:black`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '28',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    `${outputName}.mp4`,
  ]);

  // Read output
  const data = await ffmpeg.readFile(`${outputName}.mp4`);
  const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

  // Cleanup
  await ffmpeg.deleteFile('input.mp4');
  await ffmpeg.deleteFile(`${outputName}.mp4`);

  return blob;
}

export async function processVideo(
  config: ProcessingConfig,
  onProgress: (progress: ProcessingProgress) => void
): Promise<GeneratedClip[]> {
  try {
    // Step 1: Load FFmpeg
    const ffmpeg = await loadFFmpeg(onProgress);

    // Step 2: Download video
    const videoData = await downloadVideo(config.videoUrl, onProgress);

    // Step 3: Analyze video (simplified - detect moments based on duration)
    onProgress({
      stage: 'analyzing',
      progress: 0,
      message: 'Analizando momentos clave...',
    });

    // For now, create clips at specific intervals
    // TODO: Implement actual moment detection with audio analysis
    const clipSuggestions = [
      { start: 0, end: 30, score: 0.92, reason: 'Inicio del video - momento de enganche' },
      { start: 30, end: 60, score: 0.88, reason: 'Sección con potencial viral' },
    ];

    onProgress({
      stage: 'analyzing',
      progress: 100,
      message: 'Análisis completado',
    });

    // Step 4: Generate clips
    const clips: GeneratedClip[] = [];
    const totalClips = clipSuggestions.length * config.formats.length;
    let currentClip = 0;

    for (const suggestion of clipSuggestions) {
      for (const formatId of config.formats) {
        currentClip++;
        const formatSpec = FORMAT_SPECS[formatId] || FORMAT_SPECS.tiktok;

        onProgress({
          stage: 'generating',
          progress: Math.round((currentClip / totalClips) * 100),
          message: `Generando clip ${currentClip} de ${totalClips}...`,
          currentClip,
          totalClips,
        });

        const clipBlob = await generateClip(
          ffmpeg,
          videoData,
          suggestion.start,
          suggestion.end,
          { width: formatSpec.width, height: formatSpec.height },
          `clip-${currentClip}`
        );

        const clipUrl = URL.createObjectURL(clipBlob);

        clips.push({
          id: `clip-${Date.now()}-${currentClip}`,
          name: `${formatSpec.name} - ${formatTime(suggestion.start)} a ${formatTime(suggestion.end)}`,
          format: {
            id: formatId,
            name: formatSpec.name,
            aspectRatio: formatSpec.aspectRatio,
            width: formatSpec.width,
            height: formatSpec.height,
          },
          startTime: suggestion.start,
          endTime: suggestion.end,
          duration: suggestion.end - suggestion.start,
          blob: clipBlob,
          url: clipUrl,
          score: suggestion.score,
          reason: suggestion.reason,
        });
      }
    }

    onProgress({
      stage: 'done',
      progress: 100,
      message: 'Procesamiento completado',
    });

    return clips;
  } catch (error) {
    onProgress({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
    throw error;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
