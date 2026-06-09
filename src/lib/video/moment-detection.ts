/**
 * Moment Detection Service
 * Analyzes audio to detect key moments for clip generation
 */

export interface AudioMoment {
  start: number; // seconds
  end: number; // seconds
  type: 'peak' | 'silence' | 'speech' | 'music' | 'applause';
  score: number; // 0-1, relevance score
  label?: string;
}

export interface DetectionConfig {
  intent: 'viral' | 'songs' | 'highlights' | 'funny';
  minClipDuration: number; // seconds
  maxClipDuration: number; // seconds
  targetClipCount?: number;
}

export interface DetectionResult {
  moments: AudioMoment[];
  suggestedClips: ClipSuggestion[];
  audioDuration: number;
}

export interface ClipSuggestion {
  start: number;
  end: number;
  score: number;
  reason: string;
}

interface AudioAnalysis {
  sampleRate: number;
  duration: number;
  rms: Float32Array; // Root Mean Square energy per frame
  peaks: number[]; // Indices of peak frames
  silences: { start: number; end: number }[];
  energyThreshold: number;
}

const FRAME_SIZE = 2048;
const HOP_SIZE = 512;

/**
 * Analyze audio buffer to extract features
 */
async function analyzeAudio(audioBuffer: AudioBuffer): Promise<AudioAnalysis> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  const numFrames = Math.floor((channelData.length - FRAME_SIZE) / HOP_SIZE) + 1;
  const rms = new Float32Array(numFrames);

  // Calculate RMS energy for each frame
  for (let i = 0; i < numFrames; i++) {
    const start = i * HOP_SIZE;
    let sum = 0;
    for (let j = 0; j < FRAME_SIZE; j++) {
      const sample = channelData[start + j] || 0;
      sum += sample * sample;
    }
    rms[i] = Math.sqrt(sum / FRAME_SIZE);
  }

  // Calculate energy threshold (adaptive)
  const sortedRms = Array.from(rms).sort((a, b) => a - b);
  const medianRms = sortedRms[Math.floor(sortedRms.length / 2)];
  const energyThreshold = medianRms * 0.3;

  // Detect peaks (high energy moments)
  const peaks: number[] = [];
  const peakThreshold = medianRms * 2;
  for (let i = 1; i < rms.length - 1; i++) {
    if (rms[i] > peakThreshold && rms[i] > rms[i - 1] && rms[i] > rms[i + 1]) {
      peaks.push(i);
    }
  }

  // Detect silences
  const silences: { start: number; end: number }[] = [];
  let silenceStart: number | null = null;
  const minSilenceDuration = 0.5; // seconds
  const minSilenceFrames = Math.floor((minSilenceDuration * sampleRate) / HOP_SIZE);

  for (let i = 0; i < rms.length; i++) {
    if (rms[i] < energyThreshold) {
      if (silenceStart === null) silenceStart = i;
    } else {
      if (silenceStart !== null) {
        const silenceLength = i - silenceStart;
        if (silenceLength >= minSilenceFrames) {
          silences.push({
            start: (silenceStart * HOP_SIZE) / sampleRate,
            end: (i * HOP_SIZE) / sampleRate,
          });
        }
        silenceStart = null;
      }
    }
  }

  return {
    sampleRate,
    duration,
    rms,
    peaks,
    silences,
    energyThreshold,
  };
}

/**
 * Convert frame index to time in seconds
 */
function frameToTime(frame: number, sampleRate: number): number {
  return (frame * HOP_SIZE) / sampleRate;
}

/**
 * Find high-energy segments for viral clips
 */
function findViralMoments(analysis: AudioAnalysis, config: DetectionConfig): AudioMoment[] {
  const moments: AudioMoment[] = [];
  const { rms, peaks, sampleRate, duration } = analysis;

  // Group nearby peaks into segments
  const segments: { start: number; end: number; peakCount: number; avgEnergy: number }[] = [];
  const minGap = Math.floor((config.minClipDuration * sampleRate) / HOP_SIZE);

  let currentSegment: {
    start: number;
    end: number;
    peakCount: number;
    totalEnergy: number;
  } | null = null;

  for (const peak of peaks) {
    if (!currentSegment) {
      currentSegment = { start: peak, end: peak, peakCount: 1, totalEnergy: rms[peak] };
    } else if (peak - currentSegment.end < minGap) {
      currentSegment.end = peak;
      currentSegment.peakCount++;
      currentSegment.totalEnergy += rms[peak];
    } else {
      segments.push({
        ...currentSegment,
        avgEnergy: currentSegment.totalEnergy / currentSegment.peakCount,
      });
      currentSegment = { start: peak, end: peak, peakCount: 1, totalEnergy: rms[peak] };
    }
  }

  if (currentSegment) {
    segments.push({
      ...currentSegment,
      avgEnergy: currentSegment.totalEnergy / currentSegment.peakCount,
    });
  }

  // Convert segments to moments
  for (const seg of segments) {
    const startTime = Math.max(0, frameToTime(seg.start, sampleRate) - 2);
    const endTime = Math.min(duration, frameToTime(seg.end, sampleRate) + 2);
    const clipDuration = endTime - startTime;

    if (clipDuration >= config.minClipDuration && clipDuration <= config.maxClipDuration) {
      moments.push({
        start: startTime,
        end: endTime,
        type: 'peak',
        score: Math.min(1, seg.avgEnergy * 5),
        label: `Alta energía (${seg.peakCount} picos)`,
      });
    }
  }

  return moments.sort((a, b) => b.score - a.score);
}

/**
 * Find song boundaries using silence detection
 */
function findSongMoments(analysis: AudioAnalysis, config: DetectionConfig): AudioMoment[] {
  const moments: AudioMoment[] = [];
  const { silences, duration } = analysis;

  // Songs are segments between silences
  let lastEnd = 0;

  for (const silence of silences) {
    if (silence.start - lastEnd >= config.minClipDuration) {
      const songDuration = silence.start - lastEnd;
      moments.push({
        start: lastEnd,
        end: silence.start,
        type: 'music',
        score: Math.min(1, songDuration / 180), // Longer songs score higher, max at 3min
        label: `Canción (${Math.round(songDuration)}s)`,
      });
    }
    lastEnd = silence.end;
  }

  // Last segment
  if (duration - lastEnd >= config.minClipDuration) {
    const songDuration = duration - lastEnd;
    moments.push({
      start: lastEnd,
      end: duration,
      type: 'music',
      score: Math.min(1, songDuration / 180),
      label: `Canción (${Math.round(songDuration)}s)`,
    });
  }

  return moments;
}

/**
 * Find highlight moments (combination of peaks and context)
 */
function findHighlightMoments(analysis: AudioAnalysis, config: DetectionConfig): AudioMoment[] {
  const moments: AudioMoment[] = [];
  const { rms, sampleRate, duration } = analysis;

  // Calculate moving average energy
  const windowSize = Math.floor((10 * sampleRate) / HOP_SIZE); // 10 second window
  const movingAvg = new Float32Array(rms.length);

  for (let i = 0; i < rms.length; i++) {
    let sum = 0;
    let count = 0;
    for (
      let j = Math.max(0, i - windowSize / 2);
      j < Math.min(rms.length, i + windowSize / 2);
      j++
    ) {
      sum += rms[j];
      count++;
    }
    movingAvg[i] = sum / count;
  }

  // Find segments where energy is above average
  const threshold = (Array.from(movingAvg).reduce((a, b) => a + b, 0) / movingAvg.length) * 1.5;
  let segmentStart: number | null = null;

  for (let i = 0; i < movingAvg.length; i++) {
    if (movingAvg[i] > threshold) {
      if (segmentStart === null) segmentStart = i;
    } else {
      if (segmentStart !== null) {
        const startTime = frameToTime(segmentStart, sampleRate);
        const endTime = frameToTime(i, sampleRate);
        const clipDuration = endTime - startTime;

        if (clipDuration >= config.minClipDuration && clipDuration <= config.maxClipDuration) {
          moments.push({
            start: startTime,
            end: endTime,
            type: 'peak',
            score: movingAvg[Math.floor((segmentStart + i) / 2)] / threshold,
            label: 'Momento destacado',
          });
        }
        segmentStart = null;
      }
    }
  }

  // Handle last segment
  if (segmentStart !== null) {
    const startTime = frameToTime(segmentStart, sampleRate);
    const endTime = duration;
    const clipDuration = endTime - startTime;

    if (clipDuration >= config.minClipDuration && clipDuration <= config.maxClipDuration) {
      moments.push({
        start: startTime,
        end: endTime,
        type: 'peak',
        score: 0.7,
        label: 'Momento destacado',
      });
    }
  }

  return moments.sort((a, b) => b.score - a.score);
}

/**
 * Find funny moments (sudden energy changes, potential reactions)
 */
function findFunnyMoments(analysis: AudioAnalysis, config: DetectionConfig): AudioMoment[] {
  const moments: AudioMoment[] = [];
  const { rms, sampleRate, duration } = analysis;

  // Look for sudden energy spikes (potential laughs, reactions)
  const spikeThreshold = 3; // 3x the local average

  for (let i = 50; i < rms.length - 50; i++) {
    // Calculate local average (excluding current frame)
    let localSum = 0;
    for (let j = i - 50; j < i - 10; j++) localSum += rms[j];
    const localAvg = localSum / 40;

    if (rms[i] > localAvg * spikeThreshold && localAvg > 0.01) {
      const startTime = Math.max(0, frameToTime(i, sampleRate) - 3);
      const endTime = Math.min(duration, frameToTime(i, sampleRate) + config.minClipDuration);

      // Check if we already have a moment nearby
      const hasNearby = moments.some(m => Math.abs(m.start - startTime) < config.minClipDuration);

      if (!hasNearby) {
        moments.push({
          start: startTime,
          end: endTime,
          type: 'applause',
          score: Math.min(1, rms[i] / localAvg / spikeThreshold),
          label: 'Posible reacción',
        });
      }
    }
  }

  return moments.sort((a, b) => b.score - a.score);
}

/**
 * Generate clip suggestions from moments
 */
function generateClipSuggestions(
  moments: AudioMoment[],
  config: DetectionConfig,
  duration: number
): ClipSuggestion[] {
  const suggestions: ClipSuggestion[] = [];
  const targetCount = config.targetClipCount || 5;

  // Sort by score and take top moments
  const topMoments = moments.slice(0, targetCount * 2);

  for (const moment of topMoments) {
    // Adjust clip duration to fit constraints
    let clipDuration = moment.end - moment.start;

    if (clipDuration < config.minClipDuration) {
      const padding = (config.minClipDuration - clipDuration) / 2;
      moment.start = Math.max(0, moment.start - padding);
      moment.end = Math.min(duration, moment.end + padding);
      clipDuration = moment.end - moment.start;
    }

    if (clipDuration > config.maxClipDuration) {
      // Center the clip around the peak
      const center = (moment.start + moment.end) / 2;
      moment.start = center - config.maxClipDuration / 2;
      moment.end = center + config.maxClipDuration / 2;
    }

    // Check for overlap with existing suggestions
    const hasOverlap = suggestions.some(s => !(moment.end < s.start || moment.start > s.end));

    if (!hasOverlap) {
      suggestions.push({
        start: Math.max(0, moment.start),
        end: Math.min(duration, moment.end),
        score: moment.score,
        reason: moment.label || moment.type,
      });
    }

    if (suggestions.length >= targetCount) break;
  }

  return suggestions.sort((a, b) => a.start - b.start);
}

/**
 * Main detection function
 */
export async function detectMoments(
  audioBlob: Blob,
  config: DetectionConfig
): Promise<DetectionResult> {
  // Decode audio
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Analyze audio
  const analysis = await analyzeAudio(audioBuffer);

  // Detect moments based on intent
  let moments: AudioMoment[];

  switch (config.intent) {
    case 'viral':
      moments = findViralMoments(analysis, config);
      break;
    case 'songs':
      moments = findSongMoments(analysis, config);
      break;
    case 'highlights':
      moments = findHighlightMoments(analysis, config);
      break;
    case 'funny':
      moments = findFunnyMoments(analysis, config);
      break;
    default:
      moments = findViralMoments(analysis, config);
  }

  // Generate clip suggestions
  const suggestedClips = generateClipSuggestions(moments, config, analysis.duration);

  // Cleanup
  await audioContext.close();

  return {
    moments,
    suggestedClips,
    audioDuration: analysis.duration,
  };
}

/**
 * Quick detection with default config
 */
export async function quickDetect(
  audioBlob: Blob,
  intent: DetectionConfig['intent'] = 'viral'
): Promise<ClipSuggestion[]> {
  const config: DetectionConfig = {
    intent,
    minClipDuration: intent === 'songs' ? 30 : 15,
    maxClipDuration: intent === 'songs' ? 300 : 60,
    targetClipCount: intent === 'songs' ? 10 : 5,
  };

  const result = await detectMoments(audioBlob, config);
  return result.suggestedClips;
}
