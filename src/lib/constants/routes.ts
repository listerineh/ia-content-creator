export const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/auth/signout'];

export const ONBOARDING_ROUTE = '/onboarding';

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  BANDS: '/bands',
  TOOLS: '/tools',
} as const;
