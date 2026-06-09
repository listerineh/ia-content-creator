'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBand } from '@/hooks/use-band';
import { ChevronDown, Music, Check, Plus, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BandSelector() {
  const { bands, currentBand, loading, switchBand } = useBand();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitch = async (bandId: string) => {
    if (switching || bandId === currentBand?.id) return;
    setSwitching(bandId);
    try {
      await switchBand(bandId);
    } finally {
      setSwitching(null);
      setIsOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/50">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!currentBand) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10">
          {currentBand.logo_url ? (
            <Image
              src={currentBand.logo_url}
              alt={currentBand.name}
              width={24}
              height={24}
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <Music className="h-3.5 w-3.5 text-violet-400" />
          )}
        </div>
        <span className="max-w-[120px] truncate text-sm font-medium text-white">
          {currentBand.name}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-zinc-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl">
            <div className="mb-2 px-2 text-xs font-medium text-zinc-500">Mis bandas</div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {bands.map(band => {
                const isCurrent = band.id === currentBand.id;
                const isLoading = switching === band.id;

                return (
                  <button
                    key={band.id}
                    onClick={() => handleSwitch(band.id)}
                    disabled={isLoading}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                      isCurrent
                        ? 'bg-violet-500/10 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                      {band.logo_url ? (
                        <Image
                          src={band.logo_url}
                          alt={band.name}
                          width={32}
                          height={32}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Music className="h-4 w-4 text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{band.name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{band.role}</p>
                    </div>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    ) : isCurrent ? (
                      <Check className="h-4 w-4 text-violet-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 border-t border-zinc-800 pt-2">
              <Link
                href="/bands"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Gestionar bandas
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Crear o unirse a banda
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
