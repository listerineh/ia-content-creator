function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ?? '';
}

export const env = {
  // Supabase
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('SUPABASE_SECRET_KEY', false),
  },

  // App
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000',
    nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
  },

  // Feature flags (futuro)
  features: {
    enableSpotify: getEnvVar('NEXT_PUBLIC_ENABLE_SPOTIFY', false) === 'true',
    enableYouTube: getEnvVar('NEXT_PUBLIC_ENABLE_YOUTUBE', false) === 'true',
  },
} as const;

export type Env = typeof env;
