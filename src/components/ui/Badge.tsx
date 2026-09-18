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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] sm:text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantClasses: Record<BadgeVariant, string> = {
    // Pop Orange
    orange: 'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border border-[var(--badge-orange-border)] font-semibold',
    // Iron / Coral
    iron: 'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border border-[var(--badge-orange-border)] font-semibold',
    // Pop Emerald Green
    emerald: 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)] font-semibold',
    // Pop Purple
    purple: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border border-[var(--badge-purple-border)] font-semibold',
    // Pop Yellow
    yellow: 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] border border-[var(--badge-yellow-border)] font-semibold',
    // Pop Lime
    lime: 'bg-[var(--badge-lime-bg)] text-[var(--badge-lime-text)] border border-[var(--badge-lime-border)] font-semibold',
    // Pop Blue
    blue: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border border-[var(--badge-blue-border)] font-semibold',
    // Neutral Dark Surface
    neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border border-[var(--badge-neutral-border)] font-medium',
    // Outline / Soft subtle
    outline: 'bg-white/5 text-neutral-300 border border-white/10 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-tight whitespace-nowrap shrink-0 backdrop-blur-md transition-colors ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

