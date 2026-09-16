'use client';

import React, { useState } from 'react';
import { 
  TaskWithSyllabusContext, 
  AssignmentRubric,
  CourseAssignment
} from '@/types/utp';
import { calculateActivityUrgency } from '@/lib/activity-adapter';
import { 
  BookOpen, 
  Award, 
  Sparkles, 
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface TaskSyllabusSyncRowProps {
  item: TaskWithSyllabusContext;
  onOpenRubric?: (rubric: AssignmentRubric, taskTitle: string, courseName: string) => void;
  onOpenInstructions?: (task: CourseAssignment) => void;
  onAskAi: (prompt: string) => void;
}

export const TaskSyllabusSyncRow: React.FC<TaskSyllabusSyncRowProps> = ({
  item,
  onOpenRubric,
  onOpenInstructions,
  onAskAi,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { task, syllabusContext } = item;

  const hasEvaluation = !!syllabusContext.officialEvaluation;
  const hasRubric = !!task.rubric;
  const hasInstructions = !!task.instructionsHtml;
  const urgency = calculateActivityUrgency(task.dueDate);

  return (
    <div className="rounded-2xl bg-[#131317] hover:bg-[#18181e] transition-colors p-4 sm:p-5 shadow-sm text-white">
      
      {/* Main Row Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Info Principal */}
        <div className="space-y-1 flex-1 min-w-0">
          
          {/* Top meta tags: Subdued & Clean */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-400">
              {task.courseName}
            </span>

            <span className="text-neutral-600">•</span>

            <span className="text-neutral-400">
              Semana {task.week}
            </span>

            {hasEvaluation && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ff5722]/15 text-[#ff7043] font-bold text-[11px]">
                  {syllabusContext.officialEvaluation?.code} ({syllabusContext.formulaWeight}%)
                </span>
              </>
            )}

            {urgency && (
              <>
                <span className="text-neutral-600">•</span>
                <span className={`text-[11px] font-medium ${
                  urgency.badgeVariant === 'orange' ? 'text-[#ff7043]' : 'text-neutral-400'
                }`}>
                  {urgency.label}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
            {task.title}
          </h4>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          
          {/* Ver Indicaciones */}
          {hasInstructions && (
            <button
              onClick={() => onOpenInstructions ? onOpenInstructions(task) : setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Indicaciones</span>
            </button>
          )}

          {/* Ver Rúbrica */}
          {hasRubric && task.rubric && (
            <button
              onClick={() => onOpenRubric && onOpenRubric(task.rubric!, task.title, task.courseName)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-sm"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Rúbrica</span>
            </button>
          )}

          {/* AI Helper */}
          <button
            onClick={() => onAskAi(`¿Cómo resuelvo la actividad "${task.title}" del curso "${task.courseName}" según el sílabo y rúbrica oficial?`)}
            title="Consultar al Copiloto IA"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
          </button>

          {/* Toggle Expand Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title="Ver detalles del sílabo"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

      </div>

      {/* Expanded Syllabus & Topic Details (Hidden by default to keep the screen calm) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 text-xs space-y-2 text-neutral-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-neutral-400">
            <BookOpen className="h-3.5 w-3.5 text-[#3a86ff]" />
            <span className="font-bold text-white">Contexto del Sílabo:</span>
            <span>{syllabusContext.unitTitle}</span>
          </div>

          {syllabusContext.sessionTopics.length > 0 && (
            <p className="text-neutral-400 pl-5">
              • Tema de la semana: {syllabusContext.sessionTopics[0]}
            </p>
          )}
        </div>
      )}

    </div>
  );
};
