'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { User, Sparkles, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

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
  const NAV_TABS: { id: NavigationTab; num: string; label: string; dot?: boolean }[] = [
    { id: 'today',       num: '01', label: 'HOY' },
    { id: 'weekly',      num: '02', label: 'HORARIO' },
    { id: 'courses',     num: '03', label: 'CURSOS' },
    { id: 'networking',  num: '04', label: 'NETWORKING', dot: true },
    { id: 'community',   num: '05', label: 'COMUNIDAD' },
    { id: 'marketplace', num: '06', label: 'SERVICIOS' },
  ];

  const weekNum = interval?.week_number || 1;
  const periodName = interval?.period_name ? interval.period_name.replace('Periodo ', '') : '2026-2';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070709]/85 backdrop-blur-2xl transition-all">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left Section: Brand & Academic Context */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={onOpenSettings}
            title="Ajustes y perfil de estudiante"
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-[var(--accent-lime)] text-[#0a0a0c] font-black text-sm sm:text-base shadow-lg shadow-[var(--accent-lime)]/20 transition-transform group-hover:scale-105 select-none">
              <span>U</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070709]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white group-hover:text-[var(--accent-lime)] transition leading-tight">
                  HORARIO.UTP
                </span>
                <span className="hidden md:inline-flex text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                  {student.career ? student.career.split(' ')[0] : 'SISTEMAS'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono tracking-wider leading-none mt-0.5">
                SEM {weekNum} • {periodName}
              </span>
            </div>
          </button>
        </div>

        {/* Center Section: Editorial Distributed Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs">
          {NAV_TABS.map(({ id, num, label, dot }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`relative group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`font-mono text-[10px] transition-colors ${
                  isActive ? 'text-[var(--accent-lime)]' : 'text-neutral-600 group-hover:text-neutral-400'
                }`}>
                  {num}
                </span>

                <span className="relative">
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-lime)] rounded-full animate-in fade-in" />
                  )}
                </span>

                {dot && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Copilot Trigger & Profile Badge */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          
          {/* AI Copilot Button */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-white/5 hover:bg-[var(--accent-lime)]/10 border border-white/10 hover:border-[var(--accent-lime)]/30 text-xs font-bold text-white hover:text-[var(--accent-lime)] transition-all active:scale-95 group cursor-pointer shadow-sm"
          >
            <AsciiMatrixOrb size={16} state="idle" colorMode="monochrome" />
            <span className="hidden sm:inline font-mono tracking-wider text-[11px]">COPILOTO IA</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Account / Profile Badge */}
          {student.token ? (
            <button
              onClick={onOpenSettings}
              title="Cuenta oficial activa • Clic para ajustes"
              className="flex items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs text-white transition active:scale-95 cursor-pointer"
            >
              <div className="h-6 w-6 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center font-bold text-[11px] text-[var(--accent-lime)] border border-white/10">
                {student.name ? student.name.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-[11px] font-bold text-neutral-200 leading-tight truncate max-w-[120px]">
                  {student.name ? student.name.split(' ')[0] : 'Estudiante'}
                </span>
                <span className="font-mono text-[9px] text-neutral-400 leading-none">
                  {student.username || 'U23307609'}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] px-4 py-2 text-xs font-black text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-95 cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              <span>Conectar</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
