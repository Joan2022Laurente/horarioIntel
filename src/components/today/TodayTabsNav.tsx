'use client';

import React from 'react';

export type TodayTabSection = 'tasks' | 'todayClasses' | 'evaluations';

interface TodayTabsNavProps {
  activeSection: TodayTabSection;
  onSelectSection: (section: TodayTabSection) => void;
  tasksCount: number;
  todayClassesCount: number;
  currentWeek: number;
  totalWeeks: number;
  periodName: string;
}

export const TodayTabsNav: React.FC<TodayTabsNavProps> = ({
  activeSection,
  onSelectSection,
  tasksCount,
  todayClassesCount,
  currentWeek,
  totalWeeks,
  periodName,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div className="flex items-center gap-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] p-1 rounded-2xl text-xs shadow-none">
        <button
          onClick={() => onSelectSection('todayClasses')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition shadow-none ${
            activeSection === 'todayClasses' 
              ? 'bg-white text-black' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Clases de Hoy ({todayClassesCount})
        </button>

        <button
          onClick={() => onSelectSection('tasks')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition shadow-none ${
            activeSection === 'tasks' 
              ? 'bg-white text-black' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Tareas ({tasksCount})
        </button>

        <button
          onClick={() => onSelectSection('evaluations')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition shadow-none ${
            activeSection === 'evaluations' 
              ? 'bg-white text-black' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Evaluaciones
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
        <span>Semana {currentWeek} de {totalWeeks}</span>
        <span>•</span>
        <span>{periodName}</span>
      </div>
    </div>
  );
};
