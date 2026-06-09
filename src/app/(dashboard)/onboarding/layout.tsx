import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurar tu banda',
  description: 'Crea o únete a una banda para comenzar a usar OpenStage.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
