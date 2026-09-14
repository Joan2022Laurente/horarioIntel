'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  Award, 
  Users, 
  User, 
  Download, 
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CourseAssignment } from '@/types/utp';
import { extractDeliverableItems, cleanInstructionsHtml } from '@/lib/tasks/instruction-cleaner';
import { DeliverableChipsList } from '@/components/tasks/DeliverableChipsList';

interface HomeworkInstructionsModalProps {
  isOpen: boolean;
  task: CourseAssignment | null;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const HomeworkInstructionsModal: React.FC<HomeworkInstructionsModalProps> = ({
  isOpen,
  task,
  onClose,
  onAskAi,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const deliverableItems = extractDeliverableItems(task.deliverablesHtml, task.instructionsHtml);
  const cleanedInstructions = cleanInstructionsHtml(task.instructionsHtml);

  const handleCopy = () => {
    // Extraer texto plano de las indicaciones
    const tempEl = document.createElement('div');
    tempEl.innerHTML = task.instructionsHtml || task.title;
    const text = tempEl.innerText || tempEl.textContent || '';
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiConsult = () => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = task.instructionsHtml || '';
    const cleanText = (tempEl.innerText || tempEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 800);

    const prompt = `Ayúdame a resolver y estructurar mi entrega para "${task.title}" del curso "${task.courseName}".
Las indicaciones oficiales del docente son:
"${cleanText}"
¿Cuáles son los pasos clave, recomendaciones y estructura recomendada para obtener la máxima nota (20p)?`;

    onAskAi(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 text-white">
      <div 
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[#141417] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#19191e]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00c853] text-[#0a0a0c] font-black shadow-md shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5722]">
                  {task.courseName}
                </span>
                {task.sectionCode && (
                  <span className="text-[10px] font-mono text-neutral-400 bg-[#141417] px-2 py-0.5 rounded-full">
                    Sec. {task.sectionCode}
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                  Semana {task.week}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate leading-tight mt-0.5">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Meta Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 bg-[#16161b] text-xs text-neutral-300">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-[#ffb703] shrink-0" />
            <span>Puntaje: <strong>20 pts</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            {task.isGroup ? (
              <>
                <Users className="h-4 w-4 text-[#3a86ff] shrink-0" />
                <span>Modalidad: <strong>Grupal</strong></span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-[#00c853] shrink-0" />
                <span>Modalidad: <strong>Individual</strong></span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#ff5722] shrink-0" />
            <span className="truncate">Límite: <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'Esta semana'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Oficial UTP Class</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Deliverables Section with Chunky Pop Chips */}
          {deliverableItems.length > 0 && (
            <div className="bg-[#1b1b22] p-5 rounded-2xl shadow-md">
              <DeliverableChipsList items={deliverableItems} title="Entregables Requeridos de la Tarea" />
            </div>
          )}

          {/* Full Instructions Content */}
          {cleanedInstructions ? (
            <div className="bg-[#1b1b22] p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#00c853] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Consigna e Indicaciones Oficiales del Docente</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  Fuente: api-pao.utpxpedition.com
                </span>
              </div>

              <div 
                className="utp-instructions-content space-y-2 pt-1 text-neutral-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanedInstructions }}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-[#1b1b22]/60 p-8 text-center space-y-2 text-neutral-400">
              <AlertCircle className="h-8 w-8 mx-auto text-neutral-500" />
              <p className="text-sm font-semibold text-white">Esta actividad no cuenta con indicaciones en texto registradas en la API.</p>
              <p className="text-xs text-neutral-400">Revisa las sesiones de clase en vivo o el foro de consultas con tu docente.</p>
            </div>
          )}

          {/* Attached Files if present */}
          {task.files && task.files.length > 0 && (
            <div className="rounded-2xl bg-[#1b1b22] p-4 space-y-2 shadow-md">
              <span className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-[#3a86ff]" />
                Archivos y Materiales Adjuntos ({task.files.length})
              </span>
              <div className="space-y-1.5">
                {task.files.map((file, fIdx) => (
                  <a
                    key={fIdx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white transition"
                  >
                    <span className="font-semibold truncate">{file.name}</span>
                    <Download className="h-3.5 w-3.5 text-neutral-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#19191e] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Texto'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiConsult}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5722] hover:bg-[#f44710] text-white px-4 py-2 text-xs font-black shadow-lg shadow-[#ff5722]/20 transition active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Analizar con Copiloto IA</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
