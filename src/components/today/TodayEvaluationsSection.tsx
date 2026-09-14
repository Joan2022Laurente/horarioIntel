'use client';

import React from 'react';
import { CourseEvaluation } from '@/types/utp';
import { ALL_COURSE_EVALUATIONS } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#ffb703]" />
            <span>Sistema Oficial de Evaluaciones y Fórmulas Ponderadas</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Desglose curso por curso con ponderaciones exactas y semanas programadas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedEvaluations.map((ev) => {
          const weeksRemaining = ev.week - currentWeek;
          const isThisWeek = weeksRemaining === 0;
          const isNextWeek = weeksRemaining === 1;

          return (
            <div key={ev.id} className="p-5 rounded-2xl bg-[#141417] hover:bg-[#1a1a20] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-black uppercase tracking-wider text-[11px] text-[#ffb703]">
                    {ev.courseName.split(' - ')[0]}
                  </span>
                  <Badge variant={isThisWeek ? 'lime' : isNextWeek ? 'orange' : 'neutral'}>
                    Semana {ev.week}
                  </Badge>
                  <span className="font-mono text-xs font-black text-[#00c853] bg-[#00c853]/15 px-2.5 py-0.5 rounded-full">
                    {ev.weightPercent}%
                  </span>
                </div>

                <h4 className="text-sm font-black text-white">
                  <span className="font-mono text-[#ff5722] mr-1.5">{ev.code}:</span>
                  <span>{ev.fullName}</span>
                </h4>

                <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                  {ev.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenSyllabus(ev.courseName)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#ffb703] hover:text-[#ffc107] font-bold"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Ver Sílabo</span>
                </button>
                <button
                  onClick={() => onAskAi(`¿Cómo prepararme para ${ev.code} (${ev.fullName}) de ${ev.courseName} y qué rúbrica evalúa la UTP para sacar 20?`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f1f24] hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                  <span>Rúbrica IA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
