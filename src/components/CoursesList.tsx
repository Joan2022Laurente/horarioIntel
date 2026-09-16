'use client';

import React, { useState } from 'react';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { 
  Video, 
  MapPin, 
  Radio, 
  Sparkles, 
  Layers, 
  Award, 
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SyllabusModal } from './SyllabusModal';
import { useAgent } from '@/context/AgentContext';

interface CoursesListProps {
  courses: ProcessedCourse[];
  interval: UTPCurrentInterval;
  onAskAi?: (prompt: string) => void;
}

export const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  interval,
}) => {
  const { executeIntent } = useAgent();
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<string | null>(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  const handleOpenSyllabus = (courseNameOrId: string) => {
    setSelectedCourseForSyllabus(courseNameOrId);
    setIsSyllabusModalOpen(true);
  };

  const getModalityBadge = (modality: string, key?: string | number) => {
    switch (modality) {
      case 'P':
        return <Badge key={key} variant="emerald"><MapPin className="h-3 w-3" /> Presencial</Badge>;
      case 'R':
        return <Badge key={key} variant="orange"><Video className="h-3 w-3" /> Remoto Zoom</Badge>;
      case 'VT':
        return <Badge key={key} variant="purple"><Radio className="h-3 w-3" /> Virtual</Badge>;
      default:
        return <Badge key={key} variant="neutral">{modality}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Header Info - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Asignaturas Matriculadas ({courses.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Periodo {interval.period_name || '2026 - Ciclo 2 Agosto'} • Sílabos oficiales, rúbricas y fórmulas de evaluación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => executeIntent({ type: 'FREE_QUERY', query: 'Haz un resumen comparativo de todos mis cursos, sus exigencias y fechas de exámenes clave' })}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-lime)] hover:bg-[var(--accent-lime-hover)] px-4 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumen IA</span>
          </button>
        </div>
      </div>

      {/* Grid de Cursos - Limpio, directo y sin texto de relleno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          return (
            <div
              key={course.courseId}
              className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all p-5 space-y-4 group shadow-none"
            >
              {/* Parte Superior: Modalidades + Cantidad de Sesiones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {course.modalities.map((m, mIdx) => getModalityBadge(m, `${course.courseId}-${m}-${mIdx}`))}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-[var(--surface-subtle)] px-2.5 py-1 rounded-full">
                    <Layers className="h-3 w-3 text-neutral-500" />
                    {course.totalSessions} {course.totalSessions === 1 ? 'sesión' : 'sesiones'}
                  </span>
                </div>

                {/* Nombre de la Asignatura */}
                <h3 className="text-base font-black text-white leading-snug tracking-tight group-hover:text-[var(--accent-yellow)] transition-colors">
                  {course.name}
                </h3>
              </div>

              {/* Fila Unificada de Acciones */}
              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                
                {/* Botón Principal: Ver Sílabo & Rúbricas */}
                <button
                  onClick={() => handleOpenSyllabus(course.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] py-2.5 px-3 text-xs font-black text-black transition active:scale-95 shadow-none"
                >
                  <Award className="h-4 w-4 shrink-0" />
                  <span>Sílabo & Rúbricas</span>
                </button>

                {/* Botón Zoom directo si aplica */}
                {course.zoomLink && (
                  <a
                    href={course.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Entrar a sala Zoom de la clase"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white transition active:scale-95 shrink-0 shadow-none"
                  >
                    <Video className="h-4 w-4" />
                  </a>
                )}

                {/* Botón Consultar IA */}
                <button
                  onClick={() => executeIntent({ type: 'ANALYZE_COURSE', courseName: course.name })}
                  title="Consultar al Agente sobre este curso"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-300 hover:text-white transition active:scale-95 shrink-0 shadow-none"
                >
                  <Sparkles className="h-4 w-4 text-[var(--accent-orange)]" />
                </button>

              </div>

            </div>
          );
        })}
      </div>

      {/* Modal de Sílabo */}
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        courseIdentifier={selectedCourseForSyllabus}
        onClose={() => setIsSyllabusModalOpen(false)}
      />

    </div>
  );
};
