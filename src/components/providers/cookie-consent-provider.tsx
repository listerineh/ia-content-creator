'use client';

import dynamic from 'next/dynamic';

const CookieConsent = dynamic(
  () => import('@/components/ui/cookie-consent').then(mod => ({ default: mod.CookieConsent })),
  { ssr: false }
);

export function CookieConsentProvider() {
  return <CookieConsent />;
}
