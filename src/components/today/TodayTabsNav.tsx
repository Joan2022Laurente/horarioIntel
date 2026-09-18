'use client';

import React from 'react';
import { ScrollablePillTabs, PillTabItem } from '@/components/ui/ScrollablePillTabs';

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
  const tabs: PillTabItem<TodayTabSection>[] = [
    { value: 'todayClasses', label: 'Clases de Hoy', count: todayClassesCount },
    { value: 'tasks',        label: 'Tareas',        count: tasksCount },
    { value: 'evaluations',  label: 'Evaluaciones' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <ScrollablePillTabs<TodayTabSection>
        tabs={tabs}
        activeValue={activeSection}
        onSelect={onSelectSection}
        variant="segmented"
      />

      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono self-end sm:self-auto">
        <span>Semana {currentWeek} de {totalWeeks}</span>
        <span>•</span>
        <span>{periodName}</span>
      </div>
    </div>
  );
};
