'use client';

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface SyllabusImportViewProps {
  customMarkdown: string;
  onMarkdownChange: (value: string) => void;
  onParse: () => void;
}

export const SyllabusImportView: React.FC<SyllabusImportViewProps> = ({
  customMarkdown,
  onMarkdownChange,
  onParse,
}) => {
  return (
    <div className="space-y-4 rounded-2xl bg-[#1b1b22] p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#ff5722]" />
            <span>Pegar Sílabo en formato Markdown (.md) o Texto</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            El motor extraerá fórmulas, ponderaciones, semanas y temario oficial automáticamente.
          </p>
        </div>
        <button
          onClick={onParse}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#bbf451] hover:bg-[#a3e635] px-4 py-2 text-xs font-black text-[#0a0a0c] shadow-md transition active:scale-95 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Analizar Sílabo</span>
        </button>
      </div>

      <textarea
        value={customMarkdown}
        onChange={(e) => onMarkdownChange(e.target.value)}
        placeholder="Pega aquí el contenido del archivo .md o texto del sílabo descargado..."
        rows={5}
        className="w-full rounded-xl bg-[#141417] p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
      />
    </div>
  );
};
