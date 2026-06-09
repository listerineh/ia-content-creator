import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 24, text: 16 },
  md: { icon: 32, text: 20 },
  lg: { icon: 40, text: 24 },
};

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill="#7c3aed" />
        <path d="M16 6l2.5 5.5L24 14l-5.5 2.5L16 22l-2.5-5.5L8 14l5.5-2.5L16 6z" fill="white" />
        <circle cx="22" cy="10" r="2" fill="white" opacity="0.6" />
        <circle cx="10" cy="22" r="1.5" fill="white" opacity="0.4" />
      </svg>
      {showText && (
        <span className="font-bold tracking-tight" style={{ fontSize: text }}>
          <span className="text-white">Open</span>
          <span className="text-violet-400">Stage</span>
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#7c3aed" />
      <path d="M16 6l2.5 5.5L24 14l-5.5 2.5L16 22l-2.5-5.5L8 14l5.5-2.5L16 6z" fill="white" />
      <circle cx="22" cy="10" r="2" fill="white" opacity="0.6" />
      <circle cx="10" cy="22" r="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}
