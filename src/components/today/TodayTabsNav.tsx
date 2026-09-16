'use client';

import React from 'react';
import { FileCheck2, Clock, Award } from 'lucide-react';

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
      <div className="flex items-center gap-1 bg-[#141417] p-1 rounded-2xl text-xs">
        <button
          onClick={() => onSelectSection('todayClasses')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition ${
            activeSection === 'todayClasses' 
              ? 'bg-white text-black shadow-sm' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Clases de Hoy ({todayClassesCount})</span>
        </button>

        <button
          onClick={() => onSelectSection('tasks')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition ${
            activeSection === 'tasks' 
              ? 'bg-white text-black shadow-sm' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Tareas ({tasksCount})</span>
        </button>

        <button
          onClick={() => onSelectSection('evaluations')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition ${
            activeSection === 'evaluations' 
              ? 'bg-white text-black shadow-sm' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Evaluaciones</span>
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
