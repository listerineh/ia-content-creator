'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBand } from '@/hooks/use-band';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Users,
  Music,
  Settings,
  Check,
  Loader2,
  Crown,
  Edit,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BandRole } from '@/types/database';
import { CreateBandModal } from '@/components/features/bands/create-band-modal';
import { useTour } from '@/lib/tour';
import { BANDS_TOUR } from '@/lib/tour/tours';

const ROLE_CONFIG: Record<BandRole, { label: string; icon: typeof Crown; color: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-400' },
  editor: { label: 'Editor', icon: Edit, color: 'text-blue-400' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-zinc-400' },
};

export default function BandsPage() {
  const { bands, loading, switchBand } = useBand();
  const [switching, setSwitching] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { startTour, isCompleted } = useTour({
    tourId: 'bands-page',
    steps: BANDS_TOUR,
  });

  // Auto-start tour on first visit
  useEffect(() => {
    if (!loading && bands.length > 0 && !isCompleted) {
      startTour();
    }
  }, [loading, bands.length, isCompleted, startTour]);

  const handleSwitchBand = async (bandId: string) => {
    if (switching) return;
    setSwitching(bandId);
    try {
      await switchBand(bandId);
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-16 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Mis Bandas</h1>
            <p className="mt-1 text-sm text-zinc-500">Gestiona tus bandas y cambia entre ellas</p>
          </div>
          <button
            onClick={() => startTour(true)}
            className="mt-1 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            title="Ver tutorial"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-500"
          data-tour="create-band-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Nueva banda</span>
        </Button>
      </div>

      {/* Create Band Modal */}
      <CreateBandModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Bands grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {bands.map((band, index) => {
          const roleConfig = ROLE_CONFIG[band.role];
          const RoleIcon = roleConfig.icon;
          const isCurrent = band.is_current;
          const isSwitching = switching === band.id;

          return (
            <div
              key={band.id}
              data-tour={index === 0 ? 'band-card' : undefined}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-zinc-900/50 p-6 transition-all',
                isCurrent
                  ? 'border-violet-500/50 ring-1 ring-violet-500/20'
                  : 'border-zinc-800 hover:border-zinc-700'
              )}
            >
              {/* Current badge */}
              {isCurrent && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400">
                  <Check className="h-3 w-3" />
                  Activa
                </div>
              )}

              {/* Band info */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10">
                  {band.logo_url ? (
                    <Image
                      src={band.logo_url}
                      alt={band.name}
                      width={56}
                      height={56}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <Music className="h-7 w-7 text-violet-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{band.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <RoleIcon className={cn('h-3.5 w-3.5', roleConfig.color)} />
                    <span className={cn('text-xs', roleConfig.color)}>{roleConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-2">
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSwitchBand(band.id)}
                    disabled={isSwitching}
                    className="flex-1 border-zinc-700 bg-transparent hover:bg-zinc-800"
                  >
                    {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activar'}
                  </Button>
                )}
                <Link href={`/bands/${band.slug}`} className={cn(!isCurrent && 'flex-1')}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'w-full border-zinc-700 bg-transparent hover:bg-zinc-800',
                      isCurrent && 'flex-1'
                    )}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver banda
                  </Button>
                </Link>
                {band.role === 'admin' && (
                  <Link href={`/bands/${band.slug}/settings`}>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {bands.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <Music className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-medium text-white">No tienes bandas</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Crea tu primera banda para empezar a usar OpenStage
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 bg-violet-600 hover:bg-violet-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Crear banda</span>
          </Button>
        </div>
      )}
    </div>
  );
}
