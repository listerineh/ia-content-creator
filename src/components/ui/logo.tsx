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
        <path
          d="M16 3a13 13 0 0 0-13 13"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M16 29a13 13 0 0 0 13-13"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M16 6a10 10 0 0 0-10 10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M16 26a10 10 0 0 0 10-10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2" fill="none" />
        <path d="M14 13v6l5-3-5-3z" fill="white" />
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
      <path
        d="M16 3a13 13 0 0 0-13 13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M16 29a13 13 0 0 0 13-13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M16 6a10 10 0 0 0-10 10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M16 26a10 10 0 0 0 10-10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2" fill="none" />
      <path d="M14 13v6l5-3-5-3z" fill="white" />
    </svg>
  );
}
