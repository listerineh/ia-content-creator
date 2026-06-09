export {
  loadFFmpeg,
  extractAudio,
  generateClip,
  generateMultipleClips,
  addSubtitlesToClip,
  isFFmpegLoaded,
  unloadFFmpeg,
  type ClipConfig,
  type ProcessingProgress,
} from './ffmpeg-service';

export {
  detectMoments,
  quickDetect,
  type AudioMoment,
  type DetectionConfig,
  type DetectionResult,
  type ClipSuggestion,
} from './moment-detection';
