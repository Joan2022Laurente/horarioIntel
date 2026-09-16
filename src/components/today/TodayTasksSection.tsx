'use client';

import React, { useState } from 'react';
import { TaskWithSyllabusContext, AssignmentRubric, CourseAssignment } from '@/types/utp';
import { TaskSyllabusSyncRow } from '@/components/tasks/TaskSyllabusSyncRow';
import { CheckCircle2, Sparkles } from 'lucide-react';

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
      {/* Clean Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#bbf451]" />
            <span>Entregables y Tareas</span>
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            ({filteredTasks.length} de {tasks.length})
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#141417] p-1 rounded-xl text-xs">
          <button
            onClick={() => setTaskFilter('all')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              taskFilter === 'all' 
                ? 'bg-white text-black font-bold shadow-sm' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setTaskFilter('graded')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              taskFilter === 'graded' 
                ? 'bg-[#ff5722] text-white font-bold shadow-sm' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Calificadas ({gradedCount})
          </button>
          <button
            onClick={() => setTaskFilter('practice')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              taskFilter === 'practice' 
                ? 'bg-white/15 text-white font-bold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Prácticas ({practiceCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#131317] text-xs text-neutral-400">
            No hay actividades en esta categoría.
          </div>
        ) : (
          filteredTasks.map((item) => (
            <TaskSyllabusSyncRow
              key={item.task.id}
              item={item}
              onOpenRubric={onOpenRubric}
              onOpenInstructions={onOpenInstructions}
              onAskAi={onAskAi}
            />
          ))
        )}
      </div>
    </div>
  );
};
