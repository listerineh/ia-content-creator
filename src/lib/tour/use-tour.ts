'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { createClient } from '@/lib/supabase/client';

export interface TourStep {
  id: string;
  title: string;
  text: string;
  attachTo?: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  };
  buttons?: Array<{
    text: string;
    action: 'next' | 'back' | 'complete' | 'cancel';
    primary?: boolean;
  }>;
  beforeShowPromise?: () => Promise<void>;
}

interface UseTourOptions {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  onCancel?: () => void;
}

// Cache for completed tours to avoid repeated DB calls
let completedToursCache: string[] | null = null;

async function fetchCompletedTours(): Promise<string[]> {
  if (completedToursCache !== null) return completedToursCache;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('profiles')
      .select('completed_tours')
      .eq('id', user.id)
      .single();

    completedToursCache = data?.completed_tours ?? [];
    return completedToursCache ?? [];
  } catch {
    return [];
  }
}

async function markTourComplete(tourId: string): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const completed = await fetchCompletedTours();
    if (completed.includes(tourId)) return;

    const newCompleted = [...completed, tourId];

    await supabase.from('profiles').update({ completed_tours: newCompleted }).eq('id', user.id);

    completedToursCache = newCompleted;
  } catch {
    // Ignore errors
  }
}

export async function resetAllTours(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ completed_tours: [] }).eq('id', user.id);

    completedToursCache = [];
  } catch {
    // Ignore errors
  }
}

// Clear cache on logout or when needed
export function clearTourCache(): void {
  completedToursCache = null;
}

export function useTour({ tourId, steps, onComplete, onCancel }: UseTourOptions) {
  const tourRef = useRef<Tour | null>(null);
  const [isCompleted, setIsCompleted] = useState(true); // Default to true to prevent flash
  const [isLoading, setIsLoading] = useState(true);

  // Check if tour is completed on mount
  useEffect(() => {
    fetchCompletedTours().then(completed => {
      setIsCompleted(completed.includes(tourId));
      setIsLoading(false);
    });
  }, [tourId]);

  const createTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.complete();
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    });

    // Add/remove body class for blur effect
    tour.on('start', () => {
      document.body.classList.add('shepherd-active');
    });

    tour.on('complete', () => {
      document.body.classList.remove('shepherd-active');
    });

    tour.on('cancel', () => {
      document.body.classList.remove('shepherd-active');
    });

    // Add steps
    steps.forEach((step, index) => {
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      const defaultButtons = [];

      if (!isFirst) {
        defaultButtons.push({
          text: 'Anterior',
          action: tour.back,
          classes: 'shepherd-button-secondary',
        });
      }

      if (isLast) {
        defaultButtons.push({
          text: 'Finalizar',
          action: () => {
            markTourComplete(tourId).then(() => setIsCompleted(true));
            tour.complete();
            onComplete?.();
          },
          classes: 'shepherd-button-primary',
        });
      } else {
        if (isFirst) {
          defaultButtons.push({
            text: 'Saltar tour',
            action: () => {
              tour.cancel();
              onCancel?.();
            },
            classes: 'shepherd-button-secondary',
          });
        }
        defaultButtons.push({
          text: 'Siguiente',
          action: tour.next,
          classes: 'shepherd-button-primary',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepConfig: any = {
        id: step.id,
        title: step.title,
        text: `
          <p>${step.text}</p>
          <div class="shepherd-progress">
            ${steps.map((_, i) => `<div class="shepherd-progress-dot ${i === index ? 'active' : ''}"></div>`).join('')}
          </div>
        `,
        buttons: step.buttons
          ? step.buttons.map(btn => ({
              text: btn.text,
              action:
                btn.action === 'next'
                  ? tour.next
                  : btn.action === 'back'
                    ? tour.back
                    : btn.action === 'complete'
                      ? () => {
                          markTourComplete(tourId).then(() => setIsCompleted(true));
                          tour.complete();
                          onComplete?.();
                        }
                      : () => {
                          tour.cancel();
                          onCancel?.();
                        },
              classes: btn.primary ? 'shepherd-button-primary' : 'shepherd-button-secondary',
            }))
          : defaultButtons,
        beforeShowPromise: step.beforeShowPromise,
      };

      if (step.attachTo) {
        stepConfig.attachTo = step.attachTo;
      }

      tour.addStep(stepConfig);
    });

    tourRef.current = tour;
    return tour;
  }, [tourId, steps, onComplete, onCancel]);

  const startTour = useCallback(
    async (force = false) => {
      if (!force) {
        const completed = await fetchCompletedTours();
        if (completed.includes(tourId)) {
          return;
        }
      }

      const tour = createTour();

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        tour.start();
      }, 300);
    },
    [tourId, createTour]
  );

  const stopTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.cancel();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tourRef.current) {
        tourRef.current.complete();
      }
    };
  }, []);

  return {
    startTour,
    stopTour,
    isCompleted,
    isLoading,
  };
}
