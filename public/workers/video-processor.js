/**
 * Video Processor Web Worker
 * Handles video processing simulation
 * TODO: Integrate real FFmpeg processing via different approach
 */

// Message handler
self.onmessage = async event => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
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

// Simulate video processing pipeline
async function processVideo({ videoUrl, formats }) {
  try {
    const stages = [
      { stage: 'loading', message: 'Cargando procesador de video...', duration: 1500 },
      { stage: 'extracting', message: 'Extrayendo audio del video...', duration: 2000 },
      { stage: 'analyzing', message: 'Analizando momentos clave...', duration: 2500 },
      { stage: 'transcribing', message: 'Transcribiendo audio...', duration: 2000 },
      { stage: 'generating', message: 'Generando clips...', duration: 3000 },
      { stage: 'subtitles', message: 'Agregando subtítulos...', duration: 1500 },
    ];

    // Simulate each stage
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      // Progress within stage
      for (let p = 0; p <= 100; p += 10) {
        self.postMessage({
          type: 'PROGRESS',
          payload: {
            stage: stage.stage,
            progress: (i / stages.length) * 100 + p / stages.length,
            message: stage.message,
          },
        });
        await sleep(stage.duration / 10);
      }
    }

    // Generate simulated clips
    const clips = [];
    const clipSuggestions = [
      { start: 0, end: 30, score: 0.92, reason: 'Momento de alta energía detectado' },
      { start: 45, end: 75, score: 0.88, reason: 'Sección con mayor engagement potencial' },
    ];

    const formatInfo = {
      tiktok: { name: 'TikTok', aspectRatio: '9:16' },
      reels: { name: 'Instagram Reels', aspectRatio: '9:16' },
      shorts: { name: 'YouTube Shorts', aspectRatio: '9:16' },
      instagram: { name: 'Instagram Post', aspectRatio: '1:1' },
      youtube: { name: 'YouTube', aspectRatio: '16:9' },
    };

    let clipIndex = 0;
    for (const suggestion of clipSuggestions) {
      for (const formatId of formats) {
        clipIndex++;
        const format = formatInfo[formatId] || { name: formatId, aspectRatio: '9:16' };

        clips.push({
          id: `clip-${Date.now()}-${clipIndex}`,
          name: `${format.name} - ${formatTime(suggestion.start)} a ${formatTime(suggestion.end)}`,
          format: { id: formatId, name: format.name, aspectRatio: format.aspectRatio },
          startTime: suggestion.start,
          endTime: suggestion.end,
          duration: suggestion.end - suggestion.start,
          url: videoUrl, // Use original video URL for preview
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

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
