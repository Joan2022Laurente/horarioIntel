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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      <div className="flex items-center gap-1.5 bg-[#141417] p-1.5 rounded-2xl text-xs shadow-md">
        
        <button
          onClick={() => onSelectSection('tasks')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeSection === 'tasks' 
              ? 'bg-white text-black shadow-md' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Tareas & Sílabo ({tasksCount})</span>
        </button>

        <button
          onClick={() => onSelectSection('todayClasses')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeSection === 'todayClasses' 
              ? 'bg-white text-black shadow-md' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Clases de Hoy ({todayClassesCount})</span>
        </button>

        <button
          onClick={() => onSelectSection('evaluations')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeSection === 'evaluations' 
              ? 'bg-white text-black shadow-md' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Evaluaciones Oficiales</span>
        </button>

      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold">
        <span className="font-mono text-[#bbf451] font-black">Semana {currentWeek} de {totalWeeks}</span>
        <span>•</span>
        <span>{periodName}</span>
      </div>
    </div>
  );
};
