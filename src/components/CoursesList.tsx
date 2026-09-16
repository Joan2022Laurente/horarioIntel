'use client';

import React, { useState } from 'react';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { 
  BookOpen, 
  FileText, 
  Video, 
  MapPin, 
  Radio, 
  Sparkles, 
  Layers, 
  Award, 
  UploadCloud 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SyllabusModal } from './SyllabusModal';

interface CoursesListProps {
  courses: ProcessedCourse[];
  interval: UTPCurrentInterval;
  onAskAi: (prompt: string) => void;
}

export const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  interval,
  onAskAi,
}) => {
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
            Periodo {interval.period_name || '2026 - Ciclo 2 Agosto'} • Sílabos oficiales, fórmulas de notas y accesos directos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSyllabus(courses[0]?.name || '')}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-white transition active:scale-95 shadow-none"
          >
            <UploadCloud className="h-3.5 w-3.5 text-[var(--accent-yellow)]" />
            <span>Importar Sílabo</span>
          </button>

          <button
            onClick={() => onAskAi('Haz un resumen comparativo de todos mis cursos, sus exigencias y fechas de exámenes')}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-lime)] hover:bg-[var(--accent-lime-hover)] px-3.5 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumen IA</span>
          </button>
        </div>
      </div>

      {/* Grid de Cursos Limpio y Despejado con Colores Sólidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const isZoom = !!course.zoomLink || course.modalities.includes('R');
          const isPresential = course.modalities.includes('P');

          return (
            <div
              key={course.courseId}
              className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all p-5 sm:p-6 space-y-5 group"
            >
              {/* Parte Superior: Modalidad + Sesiones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {course.modalities.map((m, mIdx) => getModalityBadge(m, `${course.courseId}-${m}-${mIdx}`))}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-full">
                    <Layers className="h-3 w-3 text-neutral-500" />
                    {course.totalSessions} sesiones
                  </span>
                </div>

                {/* Nombre de la Asignatura */}
                <h3 className="text-base font-black text-white leading-snug tracking-tight group-hover:text-[var(--accent-yellow)] transition-colors">
                  {course.name}
                </h3>

                {/* Descripción contextual sutil */}
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {isZoom 
                    ? 'Clases remotas en vivo vía Zoom' 
                    : isPresential 
                    ? 'Clases presenciales en campus universitario' 
                    : 'Sesiones de autoaprendizaje virtual'}
                </p>
              </div>

              {/* Fila Única de Acciones (Colores Sólidos y Sin Neon) */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                
                {/* Botón Principal: Ver Sílabo (Solid Yellow Fill) */}
                <button
                  onClick={() => handleOpenSyllabus(course.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] py-2.5 px-3 text-xs font-black text-black transition active:scale-95 shadow-none"
                >
                  <Award className="h-4 w-4 shrink-0" />
                  <span>Ver Sílabo & Rúbricas</span>
                </button>

                {/* Botón Zoom directo si aplica (Solid Blue Fill) */}
                {course.zoomLink && (
                  <a
                    href={course.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Entrar a sala Zoom del curso"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white transition active:scale-95 shrink-0 shadow-none"
                  >
                    <Video className="h-4 w-4" />
                  </a>
                )}

                {/* Botón Descargar PDF Oficial si está disponible (Solid Dark Grey Surface) */}
                {course.syllabusUrl && (
                  <a
                    href={course.syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Descargar Sílabo Oficial PDF"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border-medium)] text-white transition active:scale-95 shrink-0 shadow-none"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                )}

                {/* Botón Consultar IA (Solid Orange Fill) */}
                <button
                  onClick={() => onAskAi(`¿Qué temas tocan en ${course.name}, qué viene en los exámenes y cómo aprobar con 20?`)}
                  title="Preguntar a la IA sobre este curso"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white transition active:scale-95 shrink-0 shadow-none"
                >
                  <Sparkles className="h-4 w-4" />
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
        onAskAi={onAskAi}
      />

    </div>
  );
};
