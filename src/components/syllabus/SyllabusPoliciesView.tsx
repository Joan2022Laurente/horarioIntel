'use client';

import React from 'react';
import { Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SyllabusPoliciesViewProps {
  rules: string[];
  antiPlagiarismPolicy?: {
    maxSimilarityPercent: number;
    aiPolicy: string;
    repositoryDelivery: string;
  };
}

export const SyllabusPoliciesView: React.FC<SyllabusPoliciesViewProps> = ({
  rules,
  antiPlagiarismPolicy,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Academic Rules */}
      <div className="rounded-2xl bg-[#181820] border border-white/10 p-4 space-y-2.5">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Info className="h-4 w-4 text-[var(--accent-orange)]" />
          <span>Indicaciones y Reglas del Curso</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-neutral-300">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Antiplagiarism Policy */}
      {antiPlagiarismPolicy && (
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/20 p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Política de Integridad y Antiplagio UTP</span>
          </h4>
          <div className="space-y-2 text-xs text-neutral-300">
            <p className="flex items-center gap-1.5 font-bold text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
              Similitud máxima permitida: {antiPlagiarismPolicy.maxSimilarityPercent}% (sin bibliografía).
            </p>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              {antiPlagiarismPolicy.aiPolicy}
            </p>
            {antiPlagiarismPolicy.repositoryDelivery && (
              <p className="text-[11px] text-neutral-400 font-mono pt-1">
                {antiPlagiarismPolicy.repositoryDelivery}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
