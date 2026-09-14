'use client';

import React, { useState } from 'react';
import { 
  TaskWithSyllabusContext, 
  AssignmentRubric,
  CourseAssignment
} from '@/types/utp';
import { Badge } from '@/components/ui/Badge';
import { calculateActivityUrgency } from '@/lib/activity-adapter';
import { extractDeliverableItems, cleanInstructionsHtml } from '@/lib/tasks/instruction-cleaner';
import { DeliverableChipsList } from '@/components/tasks/DeliverableChipsList';
import { 
  BookOpen, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Clock,
  FileText,
  ExternalLink,
  Paperclip,
  Download
} from 'lucide-react';

interface TaskSyllabusSyncRowProps {
  item: TaskWithSyllabusContext;
  onOpenRubric?: (rubric: AssignmentRubric, taskTitle: string, courseName: string) => void;
  onOpenInstructions?: (task: CourseAssignment) => void;
  onAskAi: (prompt: string) => void;
}

export const TaskSyllabusSyncRow: React.FC<TaskSyllabusSyncRowProps> = ({
  item,
  onOpenRubric,
  onOpenInstructions,
  onAskAi,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { task, syllabusContext } = item;

  const hasEvaluation = !!syllabusContext.officialEvaluation;
  const hasRubric = !!task.rubric;
  const hasInstructions = !!task.instructionsHtml;
  const urgency = calculateActivityUrgency(task.dueDate);

  const deliverableItems = extractDeliverableItems(task.deliverablesHtml, task.instructionsHtml);
  const cleanedInstructions = cleanInstructionsHtml(task.instructionsHtml);

  return (
    <div className="rounded-2xl bg-[#141417] hover:bg-[#16161a] transition-all text-white overflow-hidden shadow-lg">
      
      {/* Primary Row Header */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Course & Task Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-black uppercase tracking-wider text-[#ff5722] text-[11px]">
              {task.courseName}
            </span>
            {task.sectionCode && (
              <span className="text-[10px] font-mono text-neutral-400 bg-[#1a1a20] px-2 py-0.5 rounded-full">
                Sec. {task.sectionCode}
              </span>
            )}
            <Badge variant="neutral">Semana {task.week}</Badge>
            
            {/* Si tiene evaluación oficial en sílabo */}
            {hasEvaluation && (
              <Badge variant="lime">
                {syllabusContext.officialEvaluation?.code} ({syllabusContext.formulaWeight}%)
              </Badge>
            )}

            {/* Plazo / Urgencia Oficial UTP */}
            {urgency && (
              <Badge variant={urgency.badgeVariant === 'orange' ? 'orange' : urgency.badgeVariant === 'iron' ? 'iron' : 'neutral'}>
                <Clock className="h-3 w-3 inline mr-1" />
                {urgency.label}
              </Badge>
            )}

            {/* Indicador de Indicaciones Oficiales si existen */}
            {hasInstructions && (
              <Badge variant="lime">
                <FileText className="h-3 w-3 inline mr-1" />
                Indicaciones Disponibles
              </Badge>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
            {task.title}
          </h3>

          {/* Sincronización con el Sílabo */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1 text-neutral-300">
              <BookOpen className="h-3.5 w-3.5 text-[#ffb703]" />
              <strong className="text-white font-semibold">Sílabo Sem. {task.week}:</strong>
            </span>
            <span className="truncate max-w-[340px] text-xs text-neutral-400 font-medium">
              {syllabusContext.sessionTopics[0] || syllabusContext.unitTitle}
            </span>
          </div>
        </div>

        {/* Right: Actions & Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Botón Ver Indicaciones Oficiales */}
          {hasInstructions && (
            <button
              onClick={() => onOpenInstructions ? onOpenInstructions(task) : setIsExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b047] px-3.5 py-2 text-xs font-black text-black shadow transition active:scale-95"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Ver Indicaciones</span>
            </button>
          )}

          {/* Botón Ver Rúbrica */}
          {hasRubric && task.rubric ? (
            <button
              onClick={() => onOpenRubric && onOpenRubric(task.rubric!, task.title, task.courseName)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ffb703] hover:bg-[#fab22f] px-3.5 py-2 text-xs font-black text-black shadow transition active:scale-95"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Ver Rúbrica (20p)</span>
            </button>
          ) : !hasInstructions ? (
            <span className="text-[11px] text-neutral-400 px-3 py-1 rounded-full bg-[#1a1a20] font-medium">
              {task.isGraded ? 'Evaluación flexible' : (task.type === 'practice' ? 'Foro / Repaso' : 'Actividad formativa')}
            </span>
          ) : null}

          {/* Botón Copilot IA sincronizado con indicaciones reales */}
          <button
            onClick={() => {
              if (task.instructionsHtml) {
                const temp = typeof document !== 'undefined' ? document.createElement('div') : null;
                if (temp) temp.innerHTML = task.instructionsHtml;
                const text = (temp?.innerText || temp?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600);
                onAskAi(
                  `Ayúdame a resolver "${task.title}" del curso "${task.courseName}".
Las indicaciones oficiales del docente son: "${text}".
¿Qué pasos debo seguir para asegurar la máxima calificación (20p)?`
                );
              } else {
                onAskAi(
                  `Ayúdame a preparar "${task.title}" del curso "${task.courseName}". En el sílabo oficial para la Semana ${task.week} de la ${syllabusContext.unitTitle} se tocan los temas acumulativos: ${syllabusContext.sessionTopics.join(', ')}. ¿Cómo abordo la entrega cumpliendo al 100% las indicaciones de la UTP?`
                );
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1a20] hover:bg-[#25252c] px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
            <span>Consultar IA</span>
          </button>

          {/* Toggle Desplegar Contexto del Sílabo e Indicaciones */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-xl p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition text-xs"
            title="Ver contexto completo del sílabo e indicaciones"
          >
            <span className="hidden sm:inline text-[11px] font-bold mr-0.5">
              {isExpanded ? 'Ocultar' : 'Detalles'}
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

        </div>

      </div>

      {/* Expanded Syllabus & Homework Instructions Panel */}
      {isExpanded && (
        <div className="bg-[#101014] p-5 space-y-5 text-xs animate-in fade-in duration-150">
          
          {/* Consigna e Indicaciones Oficiales del Docente */}
          {hasInstructions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00c853]/15 text-[#00c853] text-xs font-black uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Consigna Oficial del Docente</span>
                </span>
                {onOpenInstructions && (
                  <button
                    onClick={() => onOpenInstructions(task)}
                    className="text-[11px] font-bold text-neutral-300 hover:text-white transition flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <span>Ver en Pantalla Completa</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Entregables destacados como Chips Pop */}
              {deliverableItems.length > 0 && (
                <DeliverableChipsList items={deliverableItems} />
              )}

              {/* Contenido limpio de la consigna sin basura de Word ni saltos vacíos */}
              {cleanedInstructions && (
                <div className="bg-[#16161c] p-4 rounded-2xl shadow-inner space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                    Mensaje / Indicaciones de la Tarea:
                  </span>
                  <div
                    className="utp-instructions-content text-xs max-h-60 overflow-y-auto pr-2 text-neutral-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: cleanedInstructions }}
                  />
                </div>
              )}

              {/* Archivos Adjuntos */}
              {task.files && task.files.length > 0 && (
                <div className="pt-1 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Archivos y Plantillas Adjuntas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {task.files.map((file, fIdx) => (
                      <a
                        key={fIdx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition active:scale-95 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5 text-[#ff5722]" />
                        <span>{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <span className="font-black text-[#ff5722] uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>{syllabusContext.unitTitle}</span>
              </span>
              <p className="text-neutral-400 text-xs mt-0.5">
                Logro: {syllabusContext.learningOutcome}
              </p>
            </div>

            {syllabusContext.formulaWeight && (
              <Badge variant="orange">
                Impacto en Fórmula: {syllabusContext.formulaWeight}% del Promedio Final
              </Badge>
            )}
          </div>

          {/* Temas Oficiales del Sílabo */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-neutral-300 uppercase tracking-wider">
              Temas Oficiales Evaluados en esta Semana {task.week}:
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {syllabusContext.sessionTopics.map((topic, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00c853] shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actividades e Indicaciones Oficiales */}
          {syllabusContext.activities && syllabusContext.activities.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-black text-[#ffb703] uppercase tracking-wider">
                Pautas de Entrega / Indicaciones del Docente:
              </span>
              <ul className="space-y-1 text-xs text-neutral-400">
                {syllabusContext.activities.map((act, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2">
                    <span className="text-[#ffb703] font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Políticas o Requisitos si aplican */}
          {syllabusContext.antiPlagiarismThreshold && (
            <div className="flex items-center gap-2 text-xs text-[#ff5722] bg-[#ff5722]/10 rounded-xl p-3 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                Requisito estricto de integridad académica: Similitud antiplagio máxima permitida del {syllabusContext.antiPlagiarismThreshold}%.
              </span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
