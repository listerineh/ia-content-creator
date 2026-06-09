'use client';

import { cn } from '@/lib/utils';

export interface OutputFormat {
  id: string;
  name: string;
  platform: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  maxDuration: number; // seconds
  resolution: { width: number; height: number };
  icon: string;
  description: string;
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    aspectRatio: '9:16',
    maxDuration: 180,
    resolution: { width: 1080, height: 1920 },
    icon: '🎵',
    description: 'Vertical, hasta 3 min',
  },
  {
    id: 'reels',
    name: 'Instagram Reels',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: 90,
    resolution: { width: 1080, height: 1920 },
    icon: '📸',
    description: 'Vertical, hasta 90 seg',
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    platform: 'YouTube',
    aspectRatio: '9:16',
    maxDuration: 60,
    resolution: { width: 1080, height: 1920 },
    icon: '▶️',
    description: 'Vertical, hasta 60 seg',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'YouTube',
    aspectRatio: '16:9',
    maxDuration: 600,
    resolution: { width: 1920, height: 1080 },
    icon: '📺',
    description: 'Horizontal, hasta 10 min',
  },
  {
    id: 'instagram-feed',
    name: 'Instagram Feed',
    platform: 'Instagram',
    aspectRatio: '1:1',
    maxDuration: 60,
    resolution: { width: 1080, height: 1080 },
    icon: '🖼️',
    description: 'Cuadrado, hasta 60 seg',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: 15,
    resolution: { width: 1080, height: 1920 },
    icon: '⭕',
    description: 'Vertical, hasta 15 seg',
  },
];

interface FormatSelectorProps {
  selectedFormats: string[];
  onSelectionChange: (formats: string[]) => void;
  multiple?: boolean;
}

export function FormatSelector({
  selectedFormats,
  onSelectionChange,
  multiple = true,
}: FormatSelectorProps) {
  const handleFormatClick = (formatId: string) => {
    if (multiple) {
      if (selectedFormats.includes(formatId)) {
        onSelectionChange(selectedFormats.filter(id => id !== formatId));
      } else {
        onSelectionChange([...selectedFormats, formatId]);
      }
    } else {
      onSelectionChange([formatId]);
    }
  };

  const verticalFormats = OUTPUT_FORMATS.filter(f => f.aspectRatio === '9:16');
  const otherFormats = OUTPUT_FORMATS.filter(f => f.aspectRatio !== '9:16');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Formatos Verticales (9:16)</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {verticalFormats.map(format => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormats.includes(format.id)}
              onClick={() => handleFormatClick(format.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Otros Formatos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherFormats.map(format => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormats.includes(format.id)}
              onClick={() => handleFormatClick(format.id)}
            />
          ))}
        </div>
      </div>

      {selectedFormats.length > 0 && (
        <div className="rounded-md bg-zinc-800/50 p-3 text-sm text-zinc-400">
          <span className="font-medium text-white">{selectedFormats.length}</span> formato
          {selectedFormats.length !== 1 ? 's' : ''} seleccionado
          {selectedFormats.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

interface FormatCardProps {
  format: OutputFormat;
  isSelected: boolean;
  onClick: () => void;
}

function FormatCard({ format, isSelected, onClick }: FormatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
        isSelected
          ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500'
          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
      )}
    >
      <span className="text-2xl">{format.icon}</span>
      <div className="flex-1">
        <p className="font-medium text-white">{format.name}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{format.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
            {format.aspectRatio}
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
            {format.resolution.width}x{format.resolution.height}
          </span>
        </div>
      </div>
      {isSelected && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
