'use client';

import { useState } from 'react';
import { Zap, Volume2, TrendingUp, Clock, CheckCircle2, Play, Pause } from 'lucide-react';
import { type AudioMoment, formatTimestamp, getMomentDescription } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface AudioMomentsListProps {
  moments: AudioMoment[];
  selectedMoments: number[];
  onToggleMoment: (index: number) => void;
  className?: string;
}

export function AudioMomentsList({
  moments,
  selectedMoments,
  onToggleMoment,
  className,
}: AudioMomentsListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getMomentIcon = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return Zap;
      case 'silence':
        return Volume2;
      case 'transition':
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const getMomentColor = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'silence':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'transition':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (moments.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center',
          className
        )}
      >
        <Volume2 className="mx-auto h-12 w-12 text-zinc-600" />
        <p className="mt-4 text-sm text-zinc-500">No se detectaron momentos interesantes</p>
        <p className="mt-1 text-xs text-zinc-600">Intenta con un video diferente</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Momentos detectados ({moments.length})</h3>
        <p className="text-xs text-zinc-500">{selectedMoments.length} seleccionados</p>
      </div>

      <div className="space-y-2">
        {moments.map((moment, index) => {
          const Icon = getMomentIcon(moment.type);
          const isSelected = selectedMoments.includes(index);
          const isHovered = hoveredIndex === index;
          const colorClasses = getMomentColor(moment.type);

          return (
            <button
              key={index}
              onClick={() => onToggleMoment(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'group relative w-full rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all',
                    isSelected ? 'border-violet-500/50 bg-violet-500/20' : colorClasses
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {getMomentDescription(moment)}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatTimestamp(moment.timestamp)}
                      </p>
                    </div>

                    {/* Confidence badge */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {Math.round(moment.confidence * 100)}%
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-400" />}
                    </div>
                  </div>

                  {/* Energy bar */}
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isSelected ? 'bg-violet-500' : 'bg-zinc-600'
                      )}
                      style={{ width: `${moment.energy * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              {isHovered && !isSelected && (
                <div className="absolute inset-0 rounded-lg bg-violet-500/5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
