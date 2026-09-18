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
  interval,
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

  const weekNum = interval?.week_number || 1;
  const periodName = interval?.period_name ? interval.period_name.replace('Periodo ', '') : '2026-2';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/10 transition-all select-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-16 sm:h-20 flex items-center justify-between gap-6">
        
        {/* Left: Minimalist Dot & Brand */}
        <div className="flex items-center gap-3.5 shrink-0">
          <span className="h-2 w-2 rounded-full bg-white shadow-sm shadow-white/50 animate-pulse" />
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase group-hover:text-[var(--accent-lime)] transition">
              UTP.HORARIO
            </span>
            <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase hidden md:inline">
              [ SEMANA {weekNum} // {periodName} ]
            </span>
          </button>
        </div>

        {/* Right: Pure Minimalist Navigation (Exact Oryzo Editorial Style) */}
        <div className="flex items-center gap-8 sm:gap-10 lg:gap-12">
          
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 xl:gap-11 text-[11px] sm:text-xs font-bold tracking-widest uppercase">
            {NAV_TABS.map(({ id, label, dot }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`relative py-1 tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? 'text-white border-b border-dashed border-white font-black'
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
              className="inline-flex items-center gap-2 py-1 text-neutral-300 hover:text-[var(--accent-lime)] tracking-widest transition-colors cursor-pointer group"
            >
              <AsciiMatrixOrb size={13} state="idle" colorMode="monochrome" />
              <span>COPILOTO</span>
            </button>
          </nav>

          {/* Account Indicator */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-300 hover:text-white uppercase transition-colors cursor-pointer shrink-0 border-l border-white/10 pl-6"
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
