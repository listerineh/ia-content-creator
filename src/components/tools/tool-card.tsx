'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Video,
  Scissors,
  BarChart3,
  Share2,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tool, ToolIconName } from '@/lib/tools';

const ICON_MAP: Record<ToolIconName, typeof Video> = {
  video: Video,
  scissors: Scissors,
  'bar-chart': BarChart3,
  share: Share2,
  calendar: Calendar,
  folder: FolderOpen,
};

interface ToolCardProps {
  tool: Tool;
  variant?: 'default' | 'compact';
}

export function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  const isAvailable = tool.status === 'available';
  const isBeta = tool.status === 'beta';
  const Icon = ICON_MAP[tool.iconName];

  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300',
        isAvailable
          ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer'
          : 'border-zinc-800/50 bg-zinc-900/30 cursor-default',
        variant === 'compact' ? 'p-4' : 'p-6'
      )}
    >
      {/* Status badge */}
      {!isAvailable && (
        <div className="absolute right-4 top-4">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isBeta ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'
            )}
          >
            <Clock className="h-3 w-3" />
            {isBeta ? 'Beta' : 'Próximamente'}
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl transition-transform duration-300',
          tool.bgColor,
          isAvailable && 'group-hover:scale-110',
          variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'
        )}
      >
        <Icon className={cn(tool.color, variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6')} />
      </div>

      {/* Content */}
      <div className={variant === 'compact' ? 'mt-3' : 'mt-4'}>
        <h3
          className={cn(
            'font-semibold',
            isAvailable ? 'text-white' : 'text-zinc-400',
            variant === 'compact' ? 'text-sm' : 'text-lg'
          )}
        >
          {tool.name}
        </h3>
        <p
          className={cn(
            'mt-1 line-clamp-2',
            isAvailable ? 'text-zinc-400' : 'text-zinc-600',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}
        >
          {variant === 'compact' ? tool.shortDescription : tool.description}
        </p>
      </div>

      {/* Arrow for available tools */}
      {isAvailable && variant === 'default' && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
          Abrir herramienta
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  if (isAvailable) {
    return <Link href={tool.href}>{content}</Link>;
  }

  return content;
}
