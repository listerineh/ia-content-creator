import { type AudioMoment } from '@/lib/audio';
import { type ClipFormat } from './types';

export interface DurationResult {
  startTime: number;
  endTime: number;
  duration: number;
}

export function calculateSmartDuration(
  moment: AudioMoment,
  videoDuration: number,
  format: ClipFormat,
  allMoments: AudioMoment[] = []
): DurationResult {
  // Usar la duración ideal del formato directamente
  // TikTok: 30s, Reels: 30s, Shorts: 45s, Story: 15s, YouTube: 120s
  const formatIdeal = format.idealDuration;
  const maxAllowed = format.maxDuration;

  // Duración mínima: 80% del ideal, mínimo 10 segundos
  const minDuration = Math.max(10, Math.round(formatIdeal * 0.8));

  // Usar el ideal del formato como base
  let clipDuration = formatIdeal;

  // Pequeño ajuste por confianza (±10% máximo)
  if (moment.confidence > 0.8) {
    clipDuration = Math.round(clipDuration * 1.1);
  } else if (moment.confidence < 0.5) {
    clipDuration = Math.round(clipDuration * 0.9);
  }

  // Asegurar que esté dentro de los límites estrictos
  clipDuration = Math.min(clipDuration, maxAllowed);
  clipDuration = Math.max(clipDuration, minDuration);

  const halfDuration = clipDuration / 2;
  let startTime = moment.timestamp - halfDuration;
  let endTime = moment.timestamp + halfDuration;

  // Ajustar si el clip empieza antes del video
  if (startTime < 0) {
    startTime = 0;
    endTime = Math.min(clipDuration, videoDuration);
  }

  // Ajustar si el clip termina después del video
  if (endTime > videoDuration) {
    endTime = videoDuration;
    startTime = Math.max(0, videoDuration - clipDuration);
  }

  // Verificar si hay suficiente espacio para el clip mínimo
  const availableDuration = endTime - startTime;
  if (availableDuration < minDuration) {
    // No hay suficiente espacio - extender hacia atrás si es posible
    const needed = minDuration - availableDuration;
    if (startTime >= needed) {
      startTime -= needed;
    } else {
      // Usar todo el espacio disponible desde el inicio
      startTime = 0;
      endTime = Math.min(minDuration, videoDuration);
    }
  }

  // Buscar momentos cercanos para posible extensión
  const nearbyMoments = allMoments.filter(m => {
    if (m === moment) return false;
    const diff = Math.abs(m.timestamp - moment.timestamp);
    return diff < clipDuration && diff > 2;
  });

  if (nearbyMoments.length > 0) {
    const furthestMoment = nearbyMoments.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.timestamp - moment.timestamp);
      const currDiff = Math.abs(curr.timestamp - moment.timestamp);
      return currDiff > prevDiff ? curr : prev;
    });

    const extendedEnd = Math.min(furthestMoment.timestamp + 3, videoDuration);
    if (extendedEnd - startTime <= maxAllowed) {
      endTime = extendedEnd;
    }
  }

  // Calcular duración final con mínimo garantizado
  const finalStartTime = Math.max(0, Math.round(startTime * 100) / 100);
  const finalEndTime = Math.min(videoDuration, Math.round(endTime * 100) / 100);
  const finalDuration = Math.max(minDuration, Math.round(finalEndTime - finalStartTime));

  return {
    startTime: finalStartTime,
    endTime: Math.max(finalStartTime + minDuration, finalEndTime),
    duration: finalDuration,
  };
}

export function generateClipConfigs(
  moments: AudioMoment[],
  selectedIndices: number[],
  videoDuration: number,
  format: ClipFormat
) {
  return selectedIndices.map(index => {
    const moment = moments[index];
    const { startTime, endTime, duration } = calculateSmartDuration(
      moment,
      videoDuration,
      format,
      moments
    );

    return {
      moment,
      momentIndex: index,
      startTime,
      endTime,
      duration,
      format,
    };
  });
}
