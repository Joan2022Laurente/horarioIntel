'use client';

import React from 'react';
import { CourseEvaluation } from '@/types/utp';
import { ALL_COURSE_EVALUATIONS } from '@/lib/schedule-parser';
import { Award, BookOpen, Sparkles } from 'lucide-react';

interface TodayEvaluationsSectionProps {
  currentWeek: number;
  onOpenSyllabus: (courseName: string) => void;
  onAskAi: (prompt: string) => void;
}

export const TodayEvaluationsSection: React.FC<TodayEvaluationsSectionProps> = ({
  currentWeek,
  onOpenSyllabus,
  onAskAi,
}) => {
  const sortedEvaluations = [...ALL_COURSE_EVALUATIONS].sort((a, b) => a.week - b.week);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-[#ffb703]" />
          <span>Evaluaciones Oficiales ({sortedEvaluations.length})</span>
        </h3>
      </div>

      <div className="space-y-2.5">
        {sortedEvaluations.map((ev) => {
          const weeksRemaining = ev.week - currentWeek;
          const isThisWeek = weeksRemaining === 0;
          const isNextWeek = weeksRemaining === 1;

          return (
            <div 
              key={ev.id} 
              className="p-4 sm:p-5 rounded-2xl bg-[#131317] hover:bg-[#18181e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-neutral-400">
                    {ev.courseName.split(' - ')[0]}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className={`font-semibold ${isThisWeek ? 'text-[#bbf451]' : isNextWeek ? 'text-[#ff7043]' : 'text-neutral-400'}`}>
                    Semana {ev.week} {isThisWeek ? '(Esta semana)' : ''}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="font-bold text-[#ff7043] bg-[#ff5722]/10 px-2 py-0.5 rounded-md text-[11px]">
                    {ev.code} ({ev.weightPercent}%)
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {ev.fullName}
                </h4>

                {ev.description && (
                  <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => onOpenSyllabus(ev.courseName)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#3a86ff]" />
                  <span>Sílabo</span>
                </button>
                <button
                  onClick={() => onAskAi(`¿Cómo prepararme para ${ev.code} (${ev.fullName}) de ${ev.courseName} y qué rúbrica evalúa la UTP para sacar 20?`)}
                  title="Consultar al Copiloto IA"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
