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
    // Pop Orange
    orange: 'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border border-[var(--badge-orange-border)] font-bold',
    // Iron / Coral
    iron: 'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border border-[var(--badge-orange-border)] font-semibold',
    // Pop Emerald Green
    emerald: 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)] font-bold',
    // Pop Purple
    purple: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border border-[var(--badge-purple-border)] font-bold',
    // Pop Yellow
    yellow: 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] border border-[var(--badge-yellow-border)] font-bold',
    // Pop Lime
    lime: 'bg-[var(--badge-lime-bg)] text-[var(--badge-lime-text)] border border-[var(--badge-lime-border)] font-black',
    // Pop Blue
    blue: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border border-[var(--badge-blue-border)] font-bold',
    // Neutral Dark Surface
    neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border border-[var(--badge-neutral-border)] font-medium',
    // Outline / Soft subtle
    outline: 'bg-[var(--surface-subtle)] text-neutral-300 border border-[var(--border-subtle)] font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-tight transition-colors ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

