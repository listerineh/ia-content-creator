// Re-export clip generator (unificado)
export {
  generateMultipleClips,
  type ClipConfig,
  type ClipProgress,
  type ClipResult,
  type ClipFormat,
  CLIP_FORMATS,
} from '../clip-generator';

// Re-export constants for convenience
export {
  OUTPUT_FORMATS,
  OUTPUT_FORMATS_MAP,
  VIDEO_INTENTS,
  SUBTITLE_STYLES,
  LANGUAGES,
  DEFAULT_SUBTITLE_SETTINGS,
  type OutputFormat,
  type VideoIntent,
  type VideoIntentId,
  type SubtitleStyle,
  type SubtitleSettings,
  type SubtitleStyleId,
  type Language,
} from '../constants';
