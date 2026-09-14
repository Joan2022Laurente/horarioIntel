'use client';

import React from 'react';
import { BookOpen, UploadCloud, X, ShieldCheck } from 'lucide-react';
import { ParsedSyllabus } from '@/lib/syllabus-parser';

interface SyllabusModalHeaderProps {
  currentSyllabus: ParsedSyllabus | null;
  activeTab: 'official' | 'custom';
  onSelectTab: (tab: 'official' | 'custom') => void;
  onClose: () => void;
}

export const SyllabusModalHeader: React.FC<SyllabusModalHeaderProps> = ({
  currentSyllabus,
  activeTab,
  onSelectTab,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#19191e]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black shadow-md shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-white truncate leading-tight">
              {currentSyllabus ? currentSyllabus.generalInfo.courseName : 'Explorador de Sílabos Oficiales'}
            </h2>
            {currentSyllabus && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="h-3 w-3" />
                Oficial UTP
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 truncate">
            {currentSyllabus ? `Código ${currentSyllabus.generalInfo.courseCode} • ${currentSyllabus.generalInfo.semester}` : 'Estructura oficial de evaluación, ponderaciones y cronograma'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex bg-[#141417] rounded-full p-1 text-xs">
          <button
            onClick={() => onSelectTab('official')}
            className={`px-3 py-1 rounded-full font-bold transition text-xs ${
              activeTab === 'official' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Oficial Silbia
          </button>
          <button
            onClick={() => onSelectTab('custom')}
            className={`px-3 py-1 rounded-full font-bold transition text-xs flex items-center gap-1.5 ${
              activeTab === 'custom' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
