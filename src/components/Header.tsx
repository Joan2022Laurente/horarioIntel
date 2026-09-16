'use client';

import React from 'react';
import { StudentProfile, UTPCurrentInterval } from '@/types/utp';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  student: StudentProfile;
  interval: UTPCurrentInterval;
  activeTab: 'today' | 'weekly' | 'courses' | 'ai';
  onTabChange: (tab: 'today' | 'weekly' | 'courses' | 'ai') => void;
  onOpenSettings: () => void;
  onOpenAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  interval,
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAi,
}) => {
  const currentWeek = interval.week_number || 4;
  const totalWeeks = interval.total_weeks || 18;
  const progressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));

  return (
    <header className="sticky top-0 z-30 w-full bg-[#140e0b]/90 backdrop-blur-xl transition-all text-[#f2e9e4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Student Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e89005] to-[#9b2915] text-[#140e0b] font-bold shadow-lg shadow-[#9b2915]/30">
              <GraduationCap className="h-5 w-5 text-[#140e0b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#f2e9e4]">
                  Horario UTP
                </span>
                <Badge variant="orange">Copilot IA</Badge>
              </div>
              <p className="text-xs text-[#8e7c74] font-mono">
                {student.name.split(' ')[0]} {student.name.split(' ')[2] || ''} • <span className="text-[#c7b8b0] font-semibold">{student.username}</span>
              </p>
            </div>
          </div>

          {/* Academic Period & Week progress */}
          <div className="hidden md:flex items-center gap-4 rounded-xl bg-[#1c1511] px-3.5 py-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8e7c74]">{interval.period_name || 'Ciclo 2 Agosto'}</span>
              <span className="text-zinc-600">•</span>
              <span className="font-semibold text-[#e89005]">Semana {currentWeek} de {totalWeeks}</span>
            </div>
            <div className="w-24 bg-[#140e0b] rounded-full h-1.5 overflow-hidden ring-1 ring-white/5">
              <div 
                className="bg-gradient-to-r from-[#9b2915] to-[#e89005] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#8e7c74]">{progressPercent}%</span>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2">
            
            {/* AI Assistant Quick Button */}
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98]"
            >
              <AsciiMatrixOrb size={18} state="idle" colorMode="monochrome" />
              <span className="hidden sm:inline">Preguntar a la IA</span>
              <span className="sm:hidden">IA</span>
            </button>

            {/* Token & Account Settings */}
            <button
              onClick={onOpenSettings}
              title="Configuración de Cuenta & Token UTP"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1511] text-[#8e7c74] transition hover:bg-[#261c17] hover:text-[#f2e9e4] active:scale-95 shadow-sm"
            >
              <KeyRound className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex pt-1 pb-1">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => onTabChange('today')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'today'
                  ? 'bg-[#1c1511] text-[#e89005] shadow-sm'
                  : 'text-[#8e7c74] hover:text-[#f2e9e4] hover:bg-[#1c1511]/50'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Hoy & En Vivo</span>
            </button>

            <button
              onClick={() => onTabChange('weekly')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'weekly'
                  ? 'bg-[#1c1511] text-[#e89005] shadow-sm'
                  : 'text-[#8e7c74] hover:text-[#f2e9e4] hover:bg-[#1c1511]/50'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Horario Semanal</span>
            </button>

            <button
              onClick={() => onTabChange('courses')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'courses'
                  ? 'bg-[#1c1511] text-[#e89005] shadow-sm'
                  : 'text-[#8e7c74] hover:text-[#f2e9e4] hover:bg-[#1c1511]/50'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Cursos & Sílabos</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
