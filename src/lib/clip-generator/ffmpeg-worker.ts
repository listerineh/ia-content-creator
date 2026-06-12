import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { type ClipConfig, type ClipProgress } from './types';

let ffmpeg: FFmpeg | null = null;

async function loadFFmpeg(onProgress: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    onProgress(`Procesando: ${Math.round(progress * 100)}%`);
  });

  onProgress('Cargando FFmpeg...');

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  onProgress('FFmpeg listo');
  return ffmpeg;
}

export async function generateClip(
  videoUrl: string,
  config: ClipConfig,
  onProgress: (progress: ClipProgress) => void
): Promise<Blob> {
  const { momentIndex, startTime, duration, format } = config;

  onProgress({
    momentIndex,
    stage: 'downloading',
    progress: 0,
    message: 'Descargando video...',
  });

  const ff = await loadFFmpeg(msg => {
    onProgress({
      momentIndex,
      stage: 'downloading',
      progress: 10,
      message: msg,
    });
  });

  onProgress({
    momentIndex,
    stage: 'downloading',
    progress: 20,
    message: 'Obteniendo archivo de video...',
  });

  const videoData = await fetchFile(videoUrl);
  await ff.writeFile('input.mp4', videoData);

  onProgress({
    momentIndex,
    stage: 'processing',
    progress: 30,
    message: 'Cortando clip...',
  });

  const outputName = `clip_${momentIndex}.mp4`;

  const ffmpegArgs = [
    '-i',
    'input.mp4',
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-vf',
    `scale=${format.width}:${format.height}:force_original_aspect_ratio=decrease,pad=${format.width}:${format.height}:(ow-iw)/2:(oh-ih)/2`,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    outputName,
  ];

  onProgress({
    momentIndex,
    stage: 'encoding',
    progress: 50,
    message: 'Codificando video...',
  });

  await ff.exec(ffmpegArgs);

  onProgress({
    momentIndex,
    stage: 'encoding',
    progress: 90,
    message: 'Finalizando...',
  });

  const data = await ff.readFile(outputName);
  const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

  await ff.deleteFile('input.mp4');
  await ff.deleteFile(outputName);

  onProgress({
    momentIndex,
    stage: 'done',
    progress: 100,
    message: 'Clip generado',
  });

  return blob;
}

export async function generateMultipleClips(
  videoUrl: string,
  configs: ClipConfig[],
  onProgress: (progress: ClipProgress) => void,
  onClipComplete: (momentIndex: number, blob: Blob) => void
): Promise<void> {
  for (const config of configs) {
    onProgress({
      momentIndex: config.momentIndex,
      stage: 'queued',
      progress: 0,
      message: 'En cola...',
    });
  }

  for (const config of configs) {
    try {
      const blob = await generateClip(videoUrl, config, onProgress);
      onClipComplete(config.momentIndex, blob);
    } catch (error) {
      console.error(`Error generating clip ${config.momentIndex}:`, error);
      onProgress({
        momentIndex: config.momentIndex,
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}
