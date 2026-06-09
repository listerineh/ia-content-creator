import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Clips',
  description:
    'Crea clips virales automáticamente desde tus videos de conciertos. Múltiples formatos para TikTok, Instagram Reels y YouTube Shorts.',
  openGraph: {
    title: 'Generador de Clips | OpenStage',
    description:
      'Crea clips virales automáticamente desde tus videos de conciertos. Múltiples formatos para TikTok, Reels y Shorts.',
  },
};

export default function ClipGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
