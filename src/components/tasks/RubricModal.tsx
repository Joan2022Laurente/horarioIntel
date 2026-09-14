'use client';

import React from 'react';
import { X, Award, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { AssignmentRubric } from '@/types/utp';
import { Badge } from '@/components/ui/Badge';

interface RubricModalProps {
  rubric: AssignmentRubric | null;
  assignmentTitle?: string;
  courseName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({
  rubric,
  assignmentTitle,
  courseName,
  isOpen,
  onClose,
  onAskAi,
}) => {
  if (!isOpen || !rubric) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        className="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl bg-[#140e0b] shadow-2xl overflow-hidden text-[#f2e9e4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 bg-[#1c1511]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="orange">Rúbrica Oficial Canvas</Badge>
              {courseName && <span className="text-xs text-[#8e7c74] font-medium">{courseName}</span>}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#f2e9e4]">
              {rubric.title || assignmentTitle}
            </h3>
            <p className="text-xs text-[#c7b8b0]">
              Puntuación máxima: <strong className="text-[#e89005] font-mono">{rubric.totalPoints} puntos</strong> • Escala vigesimal oficial UTP.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8e7c74] hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Criterios list - Clean, un-nested row list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {rubric.criteria.map((crit, idx) => (
            <div key={crit.id || idx} className="space-y-3 bg-[#19120f]/50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#f2e9e4] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e89005]/20 text-[11px] font-mono font-bold text-[#e89005]">
                    {idx + 1}
                  </span>
                  <span>{crit.title}</span>
                </h4>
                <Badge variant="orange">{crit.maxPoints} pts máx</Badge>
              </div>

              {crit.description && (
                <p className="text-xs text-[#c7b8b0] leading-relaxed">
                  {crit.description}
                </p>
              )}

              {/* Niveles de Dominio (Columnas compactas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                {crit.levels.map((lvl, lIdx) => {
                  const isTop = lIdx === 0;
                  return (
                    <div
                      key={lIdx}
                      className={`rounded-xl p-2.5 text-xs transition ${
                        isTop 
                          ? 'bg-[#261d17] text-white shadow-sm' 
                          : 'bg-[#17100d]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold mb-1">
                        <span className={isTop ? 'text-[#e89005]' : 'text-[#c7b8b0]'}>
                          {lvl.name}
                        </span>
                        <span className={isTop ? 'text-[#e89005]' : 'text-[#8e7c74]'}>
                          {lvl.points}p
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e7c74] leading-snug">
                        {lvl.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#1c1511] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#8e7c74] flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Sincronizada con el sistema Canvas UTP</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onAskAi(`Dame un checklist exhaustivo paso a paso para cumplir con la rúbrica de "${assignmentTitle || rubric.title}" en ${courseName || ''} y asegurar los ${rubric.totalPoints} puntos.`);
                onClose();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#e89005] hover:bg-[#c97b04] px-4 py-2 text-xs font-bold text-[#140e0b] shadow-md transition active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Preparar Entrega 20/20 con IA</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-[#c7b8b0] hover:text-white transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
