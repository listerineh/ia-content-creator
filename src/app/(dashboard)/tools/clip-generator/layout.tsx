import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Clips',
  description:
    'Crea clips virales automáticamente desde tus videos de conciertos. Múltiples formatos para TikTok, Instagram Reels y YouTube Shorts. Subtítulos automáticos incluidos.',
  openGraph: {
    title: 'Generador de Clips | OpenStage',
    description:
      'Crea clips virales desde tus videos de conciertos. TikTok, Reels, Shorts. Subtítulos automáticos. 100% en tu navegador.',
    images: [
      {
        url: '/og-clip-generator.png',
        width: 1200,
        height: 630,
        alt: 'OpenStage Generador de Clips - Crea clips virales para TikTok, Reels y Shorts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Clips | OpenStage',
    description: 'Crea clips virales desde tus videos de conciertos. TikTok, Reels, Shorts.',
    images: ['/og-clip-generator.png'],
  },
};

export default function ClipGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
