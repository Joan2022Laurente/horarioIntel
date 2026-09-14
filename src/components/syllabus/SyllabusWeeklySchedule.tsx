'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { SyllabusWeeklySession } from '@/lib/syllabus-parser';

interface SyllabusWeeklyScheduleProps {
  schedule: SyllabusWeeklySession[];
}

export const SyllabusWeeklySchedule: React.FC<SyllabusWeeklyScheduleProps> = ({
  schedule,
}) => {
  if (schedule.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
        <Calendar className="h-4 w-4 text-[#ff5722]" />
        <span>Cronograma Curricular Oficial ({schedule.length} Sesiones)</span>
      </h3>

      <div className="max-h-64 overflow-y-auto rounded-2xl bg-[#151519] p-1.5 space-y-1.5">
        {schedule.map((s, idx) => {
          const displayTopic = s.topic || (s.topics ? s.topics.join(' • ') : '');
          const displayActivities = Array.isArray(s.activities) ? s.activities.join(' • ') : s.activities;

          return (
            <div key={idx} className="p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs bg-[#1a1a20] hover:bg-[#22222a] transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#bbf451]">
                    Semana {s.week} {s.session ? `• Sesión ${s.session}` : ''}
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
                    {s.unit}
                  </span>
                  {s.evaluation && (
                    <span className="text-[10px] font-black uppercase bg-[#ff5722]/20 text-[#ff7043] px-2 py-0.5 rounded-full">
                      Entrega {s.evaluation}
                    </span>
                  )}
                  {s.isDeliverableForClassScore && (
                    <span className="text-[10px] font-bold bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
                      Nota PA
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold leading-snug">{displayTopic}</p>
                {displayActivities && (
                  <p className="text-neutral-400 text-[11px]">{displayActivities}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
