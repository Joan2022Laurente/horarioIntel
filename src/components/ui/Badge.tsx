import React from 'react';

export type BadgeVariant = 'orange' | 'iron' | 'neutral' | 'emerald' | 'purple' | 'yellow' | 'lime' | 'blue' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  const variantClasses: Record<BadgeVariant, string> = {
    // Pop Orange (#ff5722)
    orange: 'bg-[#ff5722]/20 text-[#ff7043] font-bold',
    // Iron / Coral
    iron: 'bg-[#ff5722]/15 text-[#ff8a65] font-semibold',
    // Pop Emerald Green (#00c853)
    emerald: 'bg-[#00c853]/20 text-[#00e676] font-bold',
    // Pop Purple (#7075ff)
    purple: 'bg-[#7075ff]/20 text-[#9195ff] font-bold',
    // Pop Yellow (#ffb703)
    yellow: 'bg-[#ffb703]/20 text-[#ffc107] font-bold',
    // Pop Lime (#bbf451)
    lime: 'bg-[#bbf451]/25 text-[#bbf451] font-black',
    // Pop Blue (#3a86ff)
    blue: 'bg-[#3a86ff]/20 text-[#60a5fa] font-bold',
    // Neutral Dark Surface
    neutral: 'bg-white/10 text-neutral-300 font-medium',
    // Outline / Soft subtle
    outline: 'bg-white/5 text-neutral-300 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-tight transition-colors ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
