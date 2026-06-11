'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Volume2, TrendingUp, CheckCircle2, Play, Pause, Loader2, Star } from 'lucide-react';
import { type AudioMoment, formatTimestamp, getMomentDescription } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface AudioMomentsMobileProps {
  moments: AudioMoment[];
  selectedMoments: number[];
  onToggleMoment: (index: number) => void;
  videoUrl: string;
  duration: number;
}

type Category = 'all' | 'peak' | 'silence' | 'transition';

export function AudioMomentsMobile({
  moments,
  selectedMoments,
  onToggleMoment,
  videoUrl,
  duration,
}: AudioMomentsMobileProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current && videoUrl) {
      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        const audio = new Audio(`/api/download-video?fileId=${fileId}`);
        audio.preload = 'auto';
        audioRef.current = audio;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [videoUrl]);

  const playPreview = async (moment: AudioMoment, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingIndex === index) {
      setPlayingIndex(null);
      setLoadingIndex(null);
      return;
    }

    try {
      setLoadingIndex(index);
      setPlayingIndex(null);

      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (!fileIdMatch) return;
      const fileId = fileIdMatch[1];

      const audio = new Audio(`/api/download-video?fileId=${fileId}`);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => {
          const startTime = Math.max(0, moment.timestamp - 1.5);
          audio.currentTime = startTime;
          resolve();
        };
        audio.onerror = () => reject(new Error('Failed to load audio'));
        audio.load();
      });

      await audio.play();
      setLoadingIndex(null);
      setPlayingIndex(index);

      const timeout = setTimeout(() => {
        audio.pause();
        setPlayingIndex(null);
      }, 4000);

      audio.onended = () => {
        clearTimeout(timeout);
        setPlayingIndex(null);
      };
    } catch (error) {
      console.error('Error playing audio preview:', error);
      setLoadingIndex(null);
      setPlayingIndex(null);
    }
  };

  const categories: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Todos', icon: Zap },
    { id: 'peak', label: 'Picos', icon: Zap },
    { id: 'silence', label: 'Silencios', icon: Volume2 },
    { id: 'transition', label: 'Transiciones', icon: TrendingUp },
  ];

  const filteredMoments = moments.filter(m =>
    activeCategory === 'all' ? true : m.type === activeCategory
  );

  const topMomentIndices = moments
    .map((moment, index) => ({ moment, index }))
    .sort((a, b) => b.moment.confidence - a.moment.confidence)
    .slice(0, 10)
    .map(item => item.index);

  const getMomentColor = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return 'bg-violet-500/10 border-violet-500/20';
      case 'silence':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'transition':
        return 'bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getMomentIcon = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return Zap;
      case 'silence':
        return Volume2;
      case 'transition':
        return TrendingUp;
      default:
        return Zap;
    }
  };

  if (moments.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <Volume2 className="mx-auto h-12 w-12 text-zinc-600" />
        <p className="mt-4 text-sm text-zinc-500">No se detectaron momentos interesantes</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Timeline - Más alto */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>0:00</span>
          <span>Timeline</span>
          <span>{formatTimestamp(duration)}</span>
        </div>

        <div className="relative h-16 rounded-lg border border-zinc-800 bg-zinc-900/50 sm:h-20">
          {/* Background grid */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-zinc-800/50 last:border-r-0" />
            ))}
          </div>

          {/* Moments */}
          {filteredMoments.map(moment => {
            const originalIndex = moments.indexOf(moment);
            const position = (moment.timestamp / duration) * 100;
            const isSelected = selectedMoments.includes(originalIndex);

            return (
              <button
                key={originalIndex}
                onClick={() => onToggleMoment(originalIndex)}
                className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${position}%` }}
                title={`${formatTimestamp(moment.timestamp)}`}
              >
                <div
                  className={cn(
                    'h-10 w-2 rounded-full border-2 transition-all group-hover:h-12 group-hover:w-2.5 sm:h-12 sm:w-2.5 sm:group-hover:h-14 sm:group-hover:w-3',
                    isSelected
                      ? 'border-violet-400 bg-violet-500'
                      : moment.type === 'peak'
                        ? 'border-violet-400/50 bg-violet-500/50'
                        : moment.type === 'silence'
                          ? 'border-blue-400/50 bg-blue-500/50'
                          : 'border-emerald-400/50 bg-emerald-500/50'
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="text-zinc-500">Picos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-zinc-500">Silencios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-500">Transiciones</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          const count =
            category.id === 'all'
              ? moments.length
              : moments.filter(m => m.type === category.id).length;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all sm:px-4',
                activeCategory === category.id
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
          <div className="min-w-0 text-xs text-zinc-400">
            <p className="font-medium text-zinc-300">Top 10 preseleccionados</p>
            <p className="mt-1">
              <span className="text-amber-400">⭐ Top</span> •
              <span className="ml-1 text-violet-400">Energía</span> •
              <span className="ml-1">▶️ Preview 3s</span>
            </p>
          </div>
        </div>
      </div>

      {/* Moments list */}
      <div className="w-full space-y-2">
        {filteredMoments.map(moment => {
          const originalIndex = moments.indexOf(moment);
          const Icon = getMomentIcon(moment.type);
          const isSelected = selectedMoments.includes(originalIndex);
          const isPlaying = playingIndex === originalIndex;
          const isLoading = loadingIndex === originalIndex;
          const isTopMoment = topMomentIndices.includes(originalIndex);

          return (
            <div
              key={originalIndex}
              className={cn(
                'w-full rounded-lg border p-3 transition-all sm:p-4',
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/10'
                  : 'border-zinc-800 bg-zinc-900/50'
              )}
            >
              <div className="flex w-full min-w-0 gap-2 sm:gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10',
                    isSelected
                      ? 'border-violet-500/50 bg-violet-500/20'
                      : getMomentColor(moment.type)
                  )}
                >
                  <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-xs font-medium text-white sm:text-sm">
                          {getMomentDescription(moment)}
                        </p>
                        {isTopMoment && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                            <Star className="h-2.5 w-2.5 fill-amber-400" />
                            Top
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatTimestamp(moment.timestamp)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {/* Preview */}
                      <button
                        onClick={() => playPreview(moment, originalIndex)}
                        disabled={isLoading}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg border transition-all sm:h-8 sm:w-8',
                          isLoading || isPlaying
                            ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                        ) : isPlaying ? (
                          <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </button>

                      {/* Select */}
                      <button
                        onClick={() => onToggleMoment(originalIndex)}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg border transition-all sm:h-8 sm:w-8',
                          isSelected
                            ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Energy bar */}
                  <div className="mt-3 w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-zinc-600">Energía</span>
                      <span className="text-xs text-zinc-500">
                        {Math.round(moment.energy * 100)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
