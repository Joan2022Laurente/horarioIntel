'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { Sparkles, KeyRound } from 'lucide-react';

interface PillNavbarProps {
  student: StudentProfile;
  interval: UTPCurrentInterval;
  activeTab: 'today' | 'weekly' | 'courses' | 'ai';
  onTabChange: (tab: 'today' | 'weekly' | 'courses' | 'ai') => void;
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
      <div className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 bg-[#141417]/95 backdrop-blur-2xl rounded-full px-3 sm:px-5 py-2 shadow-2xl max-w-4xl w-full">
        
        {/* Brand Square Badge */}
        <button
          onClick={onOpenSettings}
          title="Ajustes de cuenta y perfil"
          className="flex items-center gap-2.5 text-left transition focus:outline-none group"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-lg shadow-md select-none transition-transform group-hover:scale-105">
            U
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black tracking-wider text-white uppercase group-hover:text-[#bbf451] transition">UTP Class</span>
            <span className="text-[10px] font-mono text-neutral-400">{student.username}</span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
          <button
            onClick={() => onTabChange('today')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'today'
                ? 'bg-white/15 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hoy
          </button>

          <button
            onClick={() => onTabChange('weekly')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'weekly'
                ? 'bg-white/15 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Horario
          </button>

          <button
            onClick={() => onTabChange('courses')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'courses'
                ? 'bg-white/15 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cursos
          </button>

          <button
            onClick={onOpenAi}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[#ff5722] hover:text-[#ff7043] font-bold transition"
          >
            <Sparkles className="h-3 w-3" />
            <span>Copiloto</span>
          </button>
        </nav>

        {/* Right CTA Action: Lime pill matching "Sign Up" from reference */}
        <div className="flex items-center gap-2">
          {student.token ? (
            <button
              onClick={onOpenSettings}
              title="Cuenta UTP activa. Clic para ver perfil o cambiar cuenta."
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 text-xs font-bold text-emerald-400 transition"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{student.username}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5722] hover:bg-[#ff7043] px-3.5 py-1.5 text-xs font-black text-[#0a0a0c] shadow-md transition active:scale-95"
            >
              <span>Conectar UTP</span>
            </button>
          )}

          <button
            onClick={onOpenAi}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#bbf451] hover:bg-[#a3e635] px-3.5 py-1.5 text-xs font-extrabold text-[#0a0a0c] shadow-md transition-all active:scale-95"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0c] animate-pulse" />
            <span>Sem. {currentWeek}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
