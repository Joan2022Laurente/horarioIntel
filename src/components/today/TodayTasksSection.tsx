'use client';

import React, { useState } from 'react';
import { TaskWithSyllabusContext, AssignmentRubric, CourseAssignment } from '@/types/utp';
import { TaskSyllabusSyncRow } from '@/components/tasks/TaskSyllabusSyncRow';
import { FileCheck2, Sparkles } from 'lucide-react';

interface TodayTasksSectionProps {
  tasks: TaskWithSyllabusContext[];
  onOpenRubric: (rubric: AssignmentRubric, taskTitle: string, courseName: string) => void;
  onOpenInstructions?: (task: CourseAssignment) => void;
  onAskAi: (prompt: string) => void;
}

export const TodayTasksSection: React.FC<TodayTasksSectionProps> = ({
  tasks,
  onOpenRubric,
  onOpenInstructions,
  onAskAi,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'graded' | 'practice'>('all');

  const gradedCount = tasks.filter(item => item.task.isGraded || !!item.syllabusContext.officialEvaluation).length;
  const practiceCount = tasks.length - gradedCount;

  const filteredTasks = tasks.filter(item => {
    if (taskFilter === 'graded') return item.task.isGraded || !!item.syllabusContext.officialEvaluation;
    if (taskFilter === 'practice') return !item.task.isGraded && !item.syllabusContext.officialEvaluation;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-[#00c853]" />
            <span>Actividades Oficiales UTP (Sincronizadas con Sílabo)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Extraídas en vivo desde el PAO UTP. Vinculadas automáticamente a temas de semana y rúbricas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-[#141417] p-1 text-xs shadow-md">
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                taskFilter === 'all' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('graded')}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                taskFilter === 'graded' ? 'bg-[#ff5722] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Calificadas ({gradedCount})
            </button>
            <button
              onClick={() => setTaskFilter('practice')}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                taskFilter === 'practice' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Formativas y Foros ({practiceCount})
            </button>
          </div>

          <button
            onClick={() => onAskAi('Haz una matriz de estudio para mis tareas de las semanas 4 y 5 vinculadas al sílabo')}
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#ff5722] hover:text-[#ff7043] font-bold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Estrategia IA</span>
          </button>
        </div>
      </div>

      {/* List of Tasks */}
      <div className="space-y-3">
        {filteredTasks.map((item) => (
          <TaskSyllabusSyncRow
            key={item.task.id}
            item={item}
            onOpenRubric={onOpenRubric}
            onOpenInstructions={onOpenInstructions}
            onAskAi={onAskAi}
          />
        ))}
      </div>
    </div>
  );
};
