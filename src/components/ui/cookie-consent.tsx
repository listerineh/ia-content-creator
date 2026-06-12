'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Settings, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type CookiePreferences = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
};

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

function getCookieConsent(): boolean | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent === null ? null : consent === 'true';
}

function setCookieConsent(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, String(value));
}

function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return { essential: true, functional: false, analytics: false };
  }
  try {
    const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (prefs) {
      return JSON.parse(prefs);
    }
  } catch {
    // Ignore
  }
  return { essential: true, functional: false, analytics: false };
}

function setCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => getCookiePreferences());

  useEffect(() => {
    const consent = getCookieConsent();

    if (consent === null) {
      // Small delay to avoid flash
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, functional: true, analytics: true };
    setCookieConsent(true);
    setCookiePreferences(allAccepted);
    setPreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = { essential: true, functional: false, analytics: false };
    setCookieConsent(false);
    setCookiePreferences(onlyEssential);
    setPreferences(onlyEssential);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(preferences.functional || preferences.analytics);
    setCookiePreferences(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          {!showSettings ? (
            <>
              {/* Main banner */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                  <Cookie className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">Usamos cookies 🍪</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y
                    personalizar el contenido. Puedes aceptar todas, rechazarlas o configurar tus
                    preferencias.
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Más información en nuestra{' '}
                    <Link href="/cookies" className="text-violet-400 hover:text-violet-300">
                      Política de Cookies
                    </Link>{' '}
                    y{' '}
                    <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
                      Política de Privacidad
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-violet-600 hover:bg-violet-500"
                >
                  Aceptar todas
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Settings panel */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-white">Configurar cookies</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {/* Essential */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">Esenciales</p>
                    <p className="text-xs text-zinc-500">
                      Necesarias para el funcionamiento básico
                    </p>
                  </div>
                  <div className="flex h-6 w-11 items-center rounded-full bg-violet-600 px-1">
                    <div className="h-4 w-4 translate-x-5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Functional */}
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 p-3 transition-colors hover:bg-zinc-800/50">
                  <div>
                    <p className="text-sm font-medium text-white">Funcionales</p>
                    <p className="text-xs text-zinc-500">Recordar preferencias y personalización</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                    className={cn(
                      'flex h-6 w-11 items-center rounded-full px-1 transition-colors',
                      preferences.functional ? 'bg-violet-600' : 'bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full bg-white transition-transform',
                        preferences.functional ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </label>

                {/* Analytics */}
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 p-3 transition-colors hover:bg-zinc-800/50">
                  <div>
                    <p className="text-sm font-medium text-white">Análisis</p>
                    <p className="text-xs text-zinc-500">Ayudarnos a mejorar la plataforma</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={cn(
                      'flex h-6 w-11 items-center rounded-full px-1 transition-colors',
                      preferences.analytics ? 'bg-violet-600' : 'bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full bg-white transition-transform',
                        preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  className="bg-violet-600 hover:bg-violet-500"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
