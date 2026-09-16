'use client';

import React, { useState } from 'react';
import { TaskWithSyllabusContext, AssignmentRubric, CourseAssignment } from '@/types/utp';
import { TaskSyllabusSyncRow } from '@/components/tasks/TaskSyllabusSyncRow';

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
          <h3 className="text-base sm:text-lg font-bold text-white">
            Entregables y Tareas
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            ({filteredTasks.length} de {tasks.length})
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] p-1 rounded-xl text-xs">
          <button
            onClick={() => setTaskFilter('all')}
            className={`px-3 py-1 rounded-lg transition font-medium shadow-none ${
              taskFilter === 'all' 
                ? 'bg-white text-black font-bold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setTaskFilter('graded')}
            className={`px-3 py-1 rounded-lg transition font-medium shadow-none ${
              taskFilter === 'graded' 
                ? 'bg-[var(--accent-orange)] text-white font-bold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Calificadas ({gradedCount})
          </button>
          <button
            onClick={() => setTaskFilter('practice')}
            className={`px-3 py-1 rounded-lg transition font-medium shadow-none ${
              taskFilter === 'practice' 
                ? 'bg-[var(--surface-muted)] text-white font-bold' 
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
          <div className="p-8 text-center rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-neutral-400">
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
