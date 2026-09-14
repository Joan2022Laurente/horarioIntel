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
  ExternalLink, 
  Clock, 
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
  const currentWeek = interval.week_number || 5;
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
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#ffb703]" />
            <span>Asignaturas Matriculadas ({courses.length})</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Periodo {interval.period_name} • Sílabos oficiales verificados, fórmulas de notas y salas Zoom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSyllabus(courses[0]?.name || '')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f1f24] hover:bg-[#282830] px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white transition active:scale-95 shadow"
          >
            <UploadCloud className="h-3.5 w-3.5 text-[#ffb703]" />
            <span>Importar Sílabo</span>
          </button>

          <button
            onClick={() => onAskAi('Haz un resumen comparativo de todos mis cursos, sus exigencias y fechas de exámenes')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#bbf451] hover:bg-[#a3e635] px-4 py-2 text-xs font-black text-black shadow transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumen General IA</span>
          </button>
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          return (
            <div
              key={course.courseId}
              className="flex flex-col rounded-3xl bg-[#141417] hover:bg-[#17171c] transition-all p-6 space-y-4 shadow-xl"
            >
              
              {/* Header de la tarjeta */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {course.modalities.map((m, mIdx) => getModalityBadge(m, `${course.courseId}-${m}-${mIdx}`))}
                  {course.sectionCode && (
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-neutral-400">
                      Sección {course.sectionCode}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white leading-snug">
                  {course.name}
                </h3>
              </div>

              {/* Horario Semanal Fijo */}
              <div className="space-y-1.5 text-xs bg-[#1a1a20] p-3.5 rounded-2xl shadow-inner">
                <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 mb-1.5">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  <span>Horario Semanal:</span>
                </div>
                {course.weeklySchedules.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Asignatura con sesiones asíncronas / autónomas</p>
                ) : (
                  course.weeklySchedules.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-neutral-300">
                      <span className="font-bold text-white">{s.dayName}:</span>
                      <span className="font-mono text-neutral-400">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Sesiones y métricas */}
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="h-3.5 w-3.5 text-neutral-500" />
                  {course.totalSessions} sesiones
                </span>
                <span className="text-[#bbf451] font-bold">
                  Semana {currentWeek} de {interval.total_weeks || 18}
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col gap-2">
                
                {/* Botón Ver Sílabo */}
                <button
                  onClick={() => handleOpenSyllabus(course.name)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb703]/15 hover:bg-[#ffb703]/25 py-2.5 px-3 text-xs font-bold text-[#ffb703] transition"
                >
                  <Award className="h-4 w-4" />
                  <span>Ver Sílabo (Fórmula & Rúbricas)</span>
                </button>

                {/* Enlace al Sílabo PDF */}
                {course.syllabusUrl && (
                  <a
                    href={course.syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a20] hover:bg-[#22222a] py-2 px-3 text-xs font-semibold text-neutral-300 hover:text-white transition"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#ff5722]" />
                    <span>Descargar PDF Oficial</span>
                    <ExternalLink className="h-3 w-3 text-neutral-500 ml-auto" />
                  </a>
                )}

                {/* Enlace a Zoom si aplica */}
                {course.zoomLink && (
                  <a
                    href={course.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-200 py-2.5 px-3 text-xs font-black text-black shadow transition active:scale-95"
                  >
                    <Video className="h-4 w-4 text-black" />
                    <span>Sala de Zoom del Curso</span>
                  </a>
                )}

                {/* Preguntar al Asistente IA */}
                <button
                  onClick={() => onAskAi(`¿Qué temas tocan en ${course.name}, qué viene en los exámenes y cómo aprobar con 20?`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a20] hover:bg-[#22222a] py-2 px-3 text-xs font-semibold text-neutral-400 hover:text-white transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                  <span>Consultar Temario a la IA</span>
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
