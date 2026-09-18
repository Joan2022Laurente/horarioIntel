'use client';

import React from 'react';

export interface PillTabItem<T extends string = string> {
  /** The unique value for this tab, compared against `activeValue` */
  value: T;
  /** Text shown in the pill */
  label: string;
  /** Optional icon (ReactNode, Lucide icon, or emoji string) */
  icon?: React.ReactNode;
  /** Optional dot color (CSS color string) to show a live indicator */
  dotColor?: string;
  /** CSS color for the active background */
  activeColor?: string;
  /** CSS color for the active text */
  activeText?: string;
  /** Badge count shown alongside the label */
  count?: number;
}

interface ScrollablePillTabsProps<T extends string = string> {
  tabs: PillTabItem<T>[];
  activeValue: T;
  onSelect: (value: T) => void;
  /** Extra classes to override the outer wrapper */
  className?: string;
  /** Visual variant: 'pills' (individual floating pills) | 'segmented' (grouped container) */
  variant?: 'pills' | 'segmented';
  /** Size variant: 'sm' | 'md' (default: 'md') */
  size?: 'sm' | 'md';
}

/**
 * ScrollablePillTabs — Mobile-first horizontal pill/tab selector.
 *
 * - Responsive: Scrolls smoothly horizontally with touch/swipe on mobile, zero layout break.
 * - Dynamic & Modular: Adding/modifying tabs requires zero JSX rewriting.
 * - Accessible: Standard role="tablist" & role="tab" with aria-selected.
 */
export function ScrollablePillTabs<T extends string = string>({
  tabs,
  activeValue,
  onSelect,
  className = '',
  variant = 'pills',
  size = 'md',
}: ScrollablePillTabsProps<T>) {
  const isSegmented = variant === 'segmented';
  const padX = size === 'sm' ? 'px-3 py-1' : 'px-3.5 py-1.5';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  const containerClasses = isSegmented
    ? `inline-flex items-center gap-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full ${textSize} shadow-none ${className}`
    : `flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full ${textSize} font-bold ${className}`;

  return (
    <div
      role="tablist"
      aria-label="Filtros de navegación"
      className={containerClasses}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;

        const activeStyle = isActive && tab.activeColor
          ? { backgroundColor: tab.activeColor, color: tab.activeText ?? '#000' }
          : undefined;

        let itemClasses = `inline-flex items-center gap-1.5 whitespace-nowrap transition-all shadow-none shrink-0 cursor-pointer ${padX} `;

        if (isSegmented) {
          itemClasses += 'rounded-xl font-bold ';
          if (isActive) {
            itemClasses += tab.activeColor ? '' : 'bg-white text-black font-extrabold';
          } else {
            itemClasses += 'text-neutral-400 hover:text-white hover:bg-[var(--surface-subtle)]';
          }
        } else {
          itemClasses += 'rounded-full active:scale-95 ';
          if (isActive) {
            itemClasses += tab.activeColor ? '' : 'bg-white text-black font-extrabold';
          } else {
            itemClasses += 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white border border-[var(--border-subtle)]';
          }
        }

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.value)}
            style={activeStyle}
            className={itemClasses}
          >
            {tab.dotColor && (
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: tab.dotColor }}
              />
            )}
            {tab.icon && <span className="inline-flex items-center shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-0.5 text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
