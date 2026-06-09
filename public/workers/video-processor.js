/**
 * Video Processor Web Worker
 * Handles heavy video processing tasks off the main thread
 */

let ffmpeg = null;
let ffmpegLoaded = false;

// Message handler
self.onmessage = async event => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'LOAD_FFMPEG':
        await loadFFmpeg();
        self.postMessage({ type: 'FFMPEG_LOADED', id });
        break;

      case 'EXTRACT_AUDIO':
        const audioBlob = await extractAudio(payload.videoUrl);
        self.postMessage({ type: 'AUDIO_EXTRACTED', id, payload: { audioBlob } });
        break;

      case 'GENERATE_CLIP':
        const clipBlob = await generateClip(payload);
        self.postMessage({ type: 'CLIP_GENERATED', id, payload: { clipBlob } });
        break;

      case 'PROCESS_VIDEO':
        await processVideo(payload);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      payload: { error: error.message || 'Unknown error' },
    });
  }
};

// Load FFmpeg
async function loadFFmpeg() {
  if (ffmpegLoaded) return;

  self.postMessage({
    type: 'PROGRESS',
    payload: { stage: 'loading', progress: 0, message: 'Cargando FFmpeg...' },
  });

  // Import FFmpeg dynamically
  const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js');
  const { toBlobURL } = await import('https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js');

  ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    self.postMessage({
      type: 'PROGRESS',
      payload: {
        stage: 'processing',
        progress: Math.round(progress * 100),
        message: 'Procesando...',
      },
    });
  });

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;
  self.postMessage({
    type: 'PROGRESS',
    payload: { stage: 'loading', progress: 100, message: 'FFmpeg cargado' },
  });
}

// Extract audio from video
async function extractAudio(videoUrl) {
  if (!ffmpegLoaded) await loadFFmpeg();

  const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js');

  self.postMessage({
    type: 'PROGRESS',
    payload: { stage: 'extracting', progress: 0, message: 'Descargando video...' },
  });

  const videoData = await fetchFile(videoUrl);
  await ffmpeg.writeFile('input.mp4', videoData);

  self.postMessage({
    type: 'PROGRESS',
    payload: { stage: 'extracting', progress: 50, message: 'Extrayendo audio...' },
  });

  await ffmpeg.exec([
    '-i',
    'input.mp4',
    '-vn',
    '-acodec',
    'pcm_s16le',
    '-ar',
    '16000',
    '-ac',
    '1',
    'output.wav',
  ]);

  const audioData = await ffmpeg.readFile('output.wav');
  const audioBlob = new Blob([audioData.buffer], { type: 'audio/wav' });

  await ffmpeg.deleteFile('input.mp4');
  await ffmpeg.deleteFile('output.wav');

  self.postMessage({
    type: 'PROGRESS',
    payload: { stage: 'extracting', progress: 100, message: 'Audio extraído' },
  });

  return audioBlob;
}

// Generate a single clip
async function generateClip({ videoUrl, startTime, endTime, format, outputName }) {
  if (!ffmpegLoaded) await loadFFmpeg();

  const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js');

  const videoData = await fetchFile(videoUrl);
  await ffmpeg.writeFile('input.mp4', videoData);

  const duration = endTime - startTime;
  const { width, height } = format;

  // Build FFmpeg command for clip generation with scaling
  const args = [
    '-ss',
    startTime.toString(),
    '-i',
    'input.mp4',
    '-t',
    duration.toString(),
    '-vf',
    `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
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
    `${outputName}.mp4`,
  ];

  await ffmpeg.exec(args);

  const clipData = await ffmpeg.readFile(`${outputName}.mp4`);
  const clipBlob = new Blob([clipData.buffer], { type: 'video/mp4' });

  await ffmpeg.deleteFile('input.mp4');
  await ffmpeg.deleteFile(`${outputName}.mp4`);

  return clipBlob;
}

// Full video processing pipeline
async function processVideo({ videoUrl, formats, intent, subtitles }) {
  try {
    // Step 1: Load FFmpeg
    await loadFFmpeg();

    // Step 2: Extract audio
    self.postMessage({
      type: 'PROGRESS',
      payload: { stage: 'extracting', progress: 0, message: 'Extrayendo audio...' },
    });
    const audioBlob = await extractAudio(videoUrl);

    // Step 3: Analyze moments (simplified - just create segments)
    self.postMessage({
      type: 'PROGRESS',
      payload: { stage: 'analyzing', progress: 0, message: 'Analizando momentos...' },
    });

    // For now, create simple 30-second clips
    // TODO: Implement actual moment detection
    const clipSuggestions = [
      { start: 0, end: 30, score: 0.9, reason: 'Inicio del video' },
      { start: 30, end: 60, score: 0.85, reason: 'Momento destacado' },
    ];

    self.postMessage({
      type: 'PROGRESS',
      payload: { stage: 'analyzing', progress: 100, message: 'Análisis completado' },
    });

    // Step 4: Generate clips
    const clips = [];
    const totalClips = clipSuggestions.length * formats.length;
    let currentClip = 0;

    for (const suggestion of clipSuggestions) {
      for (const formatId of formats) {
        currentClip++;
        const progress = (currentClip / totalClips) * 100;

        self.postMessage({
          type: 'PROGRESS',
          payload: {
            stage: 'generating',
            progress,
            message: `Generando clip ${currentClip} de ${totalClips}...`,
            currentClip,
            totalClips,
          },
        });

        // Get format dimensions
        const formatDimensions = {
          tiktok: { width: 1080, height: 1920 },
          reels: { width: 1080, height: 1920 },
          shorts: { width: 1080, height: 1920 },
          instagram: { width: 1080, height: 1080 },
          youtube: { width: 1920, height: 1080 },
        };

        const format = formatDimensions[formatId] || { width: 1080, height: 1920 };

        const clipBlob = await generateClip({
          videoUrl,
          startTime: suggestion.start,
          endTime: suggestion.end,
          format,
          outputName: `clip-${currentClip}`,
        });

        const clipUrl = URL.createObjectURL(clipBlob);

        clips.push({
          id: `clip-${Date.now()}-${currentClip}`,
          name: `${formatId} - ${formatTime(suggestion.start)}-${formatTime(suggestion.end)}`,
          format: {
            id: formatId,
            name: formatId,
            aspectRatio: format.width > format.height ? '16:9' : '9:16',
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

    self.postMessage({
      type: 'PROGRESS',
      payload: { stage: 'done', progress: 100, message: 'Procesamiento completado' },
    });

    self.postMessage({
      type: 'PROCESSING_COMPLETE',
      payload: { clips },
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: error.message || 'Error en el procesamiento' },
    });
  }
}

// Helper to format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
