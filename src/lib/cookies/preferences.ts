import { createClient } from '@/lib/supabase/client';
import type { CookiePreferences } from '@/types/database';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

// LocalStorage helpers (fallback for non-logged users)
export function getLocalCookieConsent(): boolean | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent === null ? null : consent === 'true';
}

export function setLocalCookieConsent(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, String(value));
}

export function getLocalCookiePreferences(): CookiePreferences {
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

export function setLocalCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
}

// Supabase helpers (for logged-in users)
export async function getCookiePreferences(): Promise<CookiePreferences | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Fallback to localStorage for non-logged users
    const localConsent = getLocalCookieConsent();
    if (localConsent === null) {
      return null; // User hasn't accepted yet
    }
    return getLocalCookiePreferences();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cookie_preferences')
    .eq('id', user.id)
    .single();

  // If NULL in database, user hasn't accepted yet
  if (profile?.cookie_preferences === null || profile?.cookie_preferences === undefined) {
    return null;
  }

  return profile.cookie_preferences as CookiePreferences;
}

export async function saveCookiePreferences(prefs: CookiePreferences): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Always save to localStorage as backup
  setLocalCookiePreferences(prefs);
  setLocalCookieConsent(prefs.functional || prefs.analytics);

  if (!user) {
    return;
  }

  // Save to Supabase for logged-in users
  await supabase.from('profiles').update({ cookie_preferences: prefs }).eq('id', user.id);
}

// Check if user has given consent for a specific cookie type
export async function hasConsentFor(type: keyof CookiePreferences): Promise<boolean> {
  const prefs = await getCookiePreferences();
  if (!prefs) return false; // No consent given yet
  return prefs[type];
}

// Helper to conditionally load analytics/tracking scripts
export async function shouldLoadAnalytics(): Promise<boolean> {
  return await hasConsentFor('analytics');
}

export async function shouldLoadFunctional(): Promise<boolean> {
  return await hasConsentFor('functional');
}
