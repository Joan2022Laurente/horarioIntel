'use client';

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SyllabusEvaluationItem } from '@/lib/syllabus-parser';

interface SyllabusEvaluationsGridProps {
  evaluations: SyllabusEvaluationItem[];
  courseName: string;
  onAskAi: (prompt: string) => void;
  onClose: () => void;
}

export const SyllabusEvaluationsGrid: React.FC<SyllabusEvaluationsGridProps> = ({
  evaluations,
  courseName,
  onAskAi,
  onClose,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
          <Layers className="h-4 w-4 text-[#ff5722]" />
          <span>Desglose Oficial de Evaluaciones ({evaluations.length})</span>
        </h3>
        <button
          onClick={() => {
            onAskAi(`Explícame a detalle las evaluaciones de ${courseName} y cómo asegurar la nota máxima en cada una.`);
            onClose();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#bbf451] hover:text-white font-bold transition"
        >
          <Sparkles className="h-3 w-3 text-[#ff5722]" />
          <span>Consultar rúbricas con IA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {evaluations.map((ev) => (
          <div
            key={ev.id}
            className="rounded-2xl bg-[#1b1b22] hover:bg-[#202028] p-4 space-y-2.5 transition-all shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-white bg-white/10 px-2.5 py-1 rounded-lg">
                {ev.type}
              </span>
              <span className="font-mono text-xs font-black text-[#bbf451] bg-[#bbf451]/15 px-2.5 py-0.5 rounded-full">
                {ev.weightPercent}% del Promedio
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white">
                {ev.description}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                {ev.observation || 'Evaluación curricular del sílabo.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400 font-mono">
              <span>Semana {ev.week}</span>
              <span className="text-neutral-500">•</span>
              <span>{ev.modality}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
