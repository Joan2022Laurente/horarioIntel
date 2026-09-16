'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { KeyRound } from 'lucide-react';

export type NavigationTab = 'today' | 'weekly' | 'courses' | 'radar' | 'community' | 'marketplace' | 'ai';

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
  const currentWeek = interval.week_number || 5;

  return (
    <header className="sticky top-4 z-50 w-full flex justify-center px-4 pointer-events-none mb-6">
      <div className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 bg-[var(--surface-card)] rounded-full px-3 sm:px-5 py-2 shadow-none max-w-5xl w-full border border-[var(--border-subtle)]">
        
        {/* Brand Square Badge */}
        <button
          onClick={onOpenSettings}
          title="Ajustes de cuenta y perfil"
          className="flex items-center gap-2.5 text-left transition focus:outline-none group shrink-0"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-[var(--accent-orange)] text-[#0a0a0c] font-black text-lg shadow-none select-none transition-transform group-hover:scale-105">
            U
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-black tracking-wider text-white uppercase group-hover:text-[var(--accent-lime)] transition">UTP Class</span>
            <span className="text-[10px] font-mono text-neutral-400">{student.username}</span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onTabChange('today')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
              activeTab === 'today'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hoy
          </button>

          <button
            onClick={() => onTabChange('weekly')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
              activeTab === 'weekly'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Horario
          </button>

          <button
            onClick={() => onTabChange('courses')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
              activeTab === 'courses'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cursos
          </button>

          <button
            onClick={() => onTabChange('radar')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 shadow-none ${
              activeTab === 'radar'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-emerald)]" />
            <span>Radar</span>
          </button>

          <button
            onClick={() => onTabChange('community')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
              activeTab === 'community'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Comunidad
          </button>

          <button
            onClick={() => onTabChange('marketplace')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
              activeTab === 'marketplace'
                ? 'bg-[var(--surface-muted)] text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Servicios
          </button>

          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/90 hover:text-white font-bold hover:bg-[var(--surface-subtle)] transition group whitespace-nowrap shadow-none"
          >
            <AsciiMatrixOrb size={18} state="idle" colorMode="monochrome" />
            <span className="hidden sm:inline">Copiloto</span>
          </button>
        </nav>


        {/* Right CTA Action */}
        <div className="flex items-center gap-2">
          {student.token ? (
            <button
              onClick={onOpenSettings}
              title="Cuenta UTP activa. Clic para ver perfil o cambiar cuenta."
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border-medium)] px-3 py-1.5 text-xs font-bold text-white transition shadow-none"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--accent-emerald)] shrink-0" />
              <span className="font-mono text-neutral-200">{student.username}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] px-3.5 py-1.5 text-xs font-black text-[#0a0a0c] shadow-none transition active:scale-95"
            >
              <span>Conectar UTP</span>
            </button>
          )}

          <button
            onClick={onOpenAi}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-lime)] hover:bg-[var(--accent-lime-hover)] px-3.5 py-1.5 text-xs font-extrabold text-[#0a0a0c] shadow-none transition-all active:scale-95"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0c] animate-pulse" />
            <span>Sem. {currentWeek}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
