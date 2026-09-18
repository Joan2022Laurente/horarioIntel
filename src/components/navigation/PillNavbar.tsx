'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';

export type NavigationTab = 'today' | 'weekly' | 'courses' | 'networking' | 'community' | 'marketplace' | 'ai';

interface PillNavbarProps {
  student: StudentProfile;
  interval: UTPCurrentInterval;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenAi: () => void;
}

export const PillNavbar: React.FC<PillNavbarProps> = ({
  student,
  interval: _interval,
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAi,
}) => {
  const NAV_TABS: { id: NavigationTab; label: string; dot?: boolean }[] = [
    { id: 'today',       label: 'HOY' },
    { id: 'weekly',      label: 'HORARIO' },
    { id: 'courses',     label: 'CURSOS' },
    { id: 'networking',  label: 'NETWORKING', dot: true },
    { id: 'community',   label: 'COMUNIDAD' },
    { id: 'marketplace', label: 'SERVICIOS' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/90 backdrop-blur-xl border-b border-white/10 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        
        {/* Left: Minimalist Dot & Brand Logo Only */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <button
            onClick={onOpenSettings}
            className="flex items-center focus:outline-none cursor-pointer group"
          >
            <span className="text-xs font-black tracking-widest text-white uppercase group-hover:text-[var(--accent-lime)] transition">
              UTP
            </span>
          </button>
        </div>

        {/* Right: Pure Minimalist Editorial Navigation (Compact & Non-overflowing) */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-7 text-[10.5px] font-semibold tracking-widest uppercase">
            {NAV_TABS.map(({ id, label, dot }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`relative py-0.5 tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? 'text-white border-b border-dashed border-white font-bold'
                      : 'text-neutral-400 hover:text-white border-b border-transparent'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {label}
                    {dot && <span className="h-1 w-1 rounded-full bg-[var(--accent-lime)] animate-ping" />}
                  </span>
                </button>
              );
            })}

            {/* Copilot Link */}
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-1.5 py-0.5 text-neutral-300 hover:text-[var(--accent-lime)] tracking-widest transition-colors cursor-pointer group"
            >
              <AsciiMatrixOrb size={12} state="idle" colorMode="monochrome" />
              <span>COPILOTO</span>
            </button>
          </nav>

          {/* Account Code Indicator */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-[10.5px] font-mono tracking-widest text-neutral-300 hover:text-white uppercase transition-colors cursor-pointer shrink-0 border-l border-white/10 pl-3.5 sm:pl-4"
            title="Ajustes de cuenta"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]" />
            <span>{student.username || 'U23307609'}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
