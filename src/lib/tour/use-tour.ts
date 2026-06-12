'use client';

import { useEffect, useCallback, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';

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

const TOUR_STORAGE_KEY = 'openstage_completed_tours';

function getCompletedTours(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markTourComplete(tourId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const completed = getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
    }
  } catch {
    // Ignore storage errors
  }
}

export function isTourCompleted(tourId: string): boolean {
  return getCompletedTours().includes(tourId);
}

export function resetTour(tourId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const completed = getCompletedTours().filter(id => id !== tourId);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
  } catch {
    // Ignore storage errors
  }
}

export function resetAllTours(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useTour({ tourId, steps, onComplete, onCancel }: UseTourOptions) {
  const tourRef = useRef<Tour | null>(null);

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
            markTourComplete(tourId);
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
                          markTourComplete(tourId);
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
    (force = false) => {
      if (!force && isTourCompleted(tourId)) {
        return;
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
    isCompleted: isTourCompleted(tourId),
    resetTour: () => resetTour(tourId),
  };
}
