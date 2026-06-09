export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    secretKey: process.env.SUPABASE_SECRET_KEY ?? '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  features: {
    enableSpotify: process.env.NEXT_PUBLIC_ENABLE_SPOTIFY === 'true',
    enableYouTube: process.env.NEXT_PUBLIC_ENABLE_YOUTUBE === 'true',
  },
} as const;

export type Env = typeof env;
