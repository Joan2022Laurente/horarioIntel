'use client';

import React from 'react';
import { BookOpen, UploadCloud, X, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { ParsedSyllabus } from '@/lib/syllabus-parser';

import { ScrollablePillTabs } from '@/components/ui/ScrollablePillTabs';

interface SyllabusModalHeaderProps {
  currentSyllabus: ParsedSyllabus | null;
  activeTab: 'official' | 'custom';
  onSelectTab: (tab: 'official' | 'custom') => void;
  onClose: () => void;
  pdfUrl?: string;
}

export const SyllabusModalHeader: React.FC<SyllabusModalHeaderProps> = ({
  currentSyllabus,
  activeTab,
  onSelectTab,
  onClose,
  pdfUrl,
}) => {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-[var(--accent-orange)] text-[#0a0a0c] font-black shrink-0">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-base font-black text-white truncate leading-tight">
              {currentSyllabus ? currentSyllabus.generalInfo.courseName : 'Explorador de Sílabos Oficiales'}
            </h2>
            {currentSyllabus && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent-lime)] bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 px-2 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="h-3 w-3" />
                Oficial UTP
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
            {currentSyllabus ? `Código ${currentSyllabus.generalInfo.courseCode} • ${currentSyllabus.generalInfo.semester}` : 'Estructura oficial de evaluación, ponderaciones y cronograma'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {pdfUrl && activeTab === 'official' && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Descargar documento oficial PDF"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-neutral-200 hover:text-white text-xs font-semibold transition active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
            <span>Descargar PDF</span>
            <ExternalLink className="h-3 w-3 text-neutral-400" />
          </a>
        )}

        <ScrollablePillTabs<'official' | 'custom'>
          tabs={[
            { value: 'official', label: 'Silbia' },
            { value: 'custom',   label: 'Importar', icon: <UploadCloud className="h-3 w-3" /> },
          ]}
          activeValue={activeTab}
          onSelect={onSelectTab}
          variant="segmented"
          size="sm"
        />

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-neutral-400 hover:bg-[var(--surface-subtle)] hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
