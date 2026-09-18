'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { User, Sparkles } from 'lucide-react';

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
    { id: 'today',       label: 'Hoy' },
    { id: 'weekly',      label: 'Horario' },
    { id: 'courses',     label: 'Cursos' },
    { id: 'networking',  label: 'Networking', dot: true },
    { id: 'community',   label: 'Comunidad' },
    { id: 'marketplace', label: 'Servicios' },
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-50 w-full flex justify-center px-3 sm:px-4 pointer-events-none mb-3 sm:mb-6">
      <div className="pointer-events-auto flex items-center justify-between gap-3 bg-[#141417]/90 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full px-3.5 sm:px-4 py-2 shadow-2xl max-w-5xl w-full transition-all">
        
        {/* Brand & Context */}
        <button
          onClick={onOpenSettings}
          title="Ajustes y perfil de estudiante"
          className="flex items-center gap-2.5 text-left transition focus:outline-none group shrink-0"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-sm sm:text-base shadow-sm select-none transition-transform group-hover:scale-105">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black tracking-tight text-white group-hover:text-orange-400 transition leading-tight">
              UTP Class
            </span>
            <span className="text-[10px] text-neutral-400 font-mono leading-none hidden xs:inline">
              Semana {interval?.week_number || 1} • {interval?.period_name ? interval.period_name.replace('Periodo ', '') : '2026-2'}
            </span>
          </div>
        </button>

        {/* Desktop-only inline navigation (hidden on mobile — BottomNav handles it) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar py-0.5">
          {NAV_TABS.map(({ id, label, dot }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shadow-none ${
                activeTab === id
                  ? 'bg-white text-black font-extrabold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {label}
            </button>
          ))}

          {/* Copiloto always last on desktop */}
          <button
            onClick={onOpenAi}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white/90 hover:text-white font-bold hover:bg-white/5 transition group whitespace-nowrap shadow-none"
          >
            <AsciiMatrixOrb size={16} state="idle" colorMode="monochrome" />
            <span>Copiloto</span>
          </button>
        </nav>

        {/* Right side: Account & Quick Profile Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {student.token ? (
            <button
              onClick={onOpenSettings}
              title="Cuenta UTP activa • Clic para configurar"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 sm:px-3 py-1 text-xs font-bold text-white transition active:scale-95 shadow-none"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs text-neutral-200">
                {student.username || 'Estudiante'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-none transition active:scale-95"
            >
              <User className="h-3 w-3" />
              <span>Conectar</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
