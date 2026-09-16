'use client';

import React, { useState, useMemo } from 'react';
import { UTPCurrentInterval, UTPEvent, ProcessedCourse } from '@/types/utp';
import { 
  getEventsByWeek, 
  formatScheduleTimeRange, 
  parseEventTitle, 
  formatCourseName,
  DAYS_OF_WEEK, 
  parseDate,
  getProcessedCourses
} from '@/lib/schedule-parser';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { ClassDetailModal } from '@/components/schedule/ClassDetailModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  MapPin, 
  Radio, 
  Calendar,
  Clock,
  Sparkles,
  Award,
  FileText
} from 'lucide-react';

import { useAgent } from '@/context/AgentContext';

interface WeeklyScheduleProps {
  interval: UTPCurrentInterval;
  courses?: ProcessedCourse[];
  onAskAi?: (prompt: string) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  interval,
  courses,
  onAskAi,
}) => {
  const { askAgent, openSyllabus } = useAgent();
  const handleAsk = onAskAi || askAgent;
  const currentWeek = interval.week_number || 5;
  const totalWeeks = interval.total_weeks || 18;
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [selectedModality, setSelectedModality] = useState<string>('ALL');
  const [selectedEventForModal, setSelectedEventForModal] = useState<UTPEvent | null>(null);

  const events = interval.events || [];
  const weekEvents = getEventsByWeek(events, selectedWeek);

  const filteredEvents = selectedModality === 'ALL' 
    ? weekEvents 
    : weekEvents.filter(e => e.modality === selectedModality);

  const eventsByDay: Record<number, UTPEvent[]> = {
    1: [], // Lunes
    2: [], // Martes
    3: [], // Miércoles
    4: [], // Jueves
    5: [], // Viernes
    6: [], // Sábado
  };

  for (const evt of filteredEvents) {
    const d = parseDate(evt.startAt);
    const day = d.getDay();
    if (eventsByDay[day]) {
      eventsByDay[day].push(evt);
    }
  }

  const daysToDisplay = [1, 2, 3, 4, 5, 6];

  // Identificar asignaturas 100% Virtuales 24/7 (Asíncronas / Autoaprendizaje sin horario semanal fijo)
  const allCourses = useMemo(() => {
    if (courses && courses.length > 0) return courses;
    return getProcessedCourses(events);
  }, [courses, events]);

  const virtual247Courses = useMemo(() => {
    return allCourses.filter(c => 
      c.modalities.includes('VT') || 
      c.weeklySchedules.length === 0 ||
      c.name.toUpperCase().includes('COMUNICACIÓN EFECTIVA')
    );
  }, [allCourses]);

  return (
    <div className="space-y-6 text-white">
      
      {/* Barra de Control de Semana & Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        
        {/* Selector de Semana */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl p-1 shadow-none">
            <button
              onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
              disabled={selectedWeek <= 1}
              aria-label="Semana anterior"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-[var(--surface-subtle)] transition disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-[var(--accent-orange)]" />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                aria-label="Seleccionar semana académica"
                className="bg-transparent border-0 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w} className="bg-[var(--surface-card)] text-white">
                    Semana {w} {w === currentWeek ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedWeek(prev => Math.min(totalWeeks, prev + 1))}
              disabled={selectedWeek >= totalWeeks}
              aria-label="Semana siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-[var(--surface-subtle)] transition disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {selectedWeek === currentWeek && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-lime)] text-black font-extrabold px-3 py-1 text-[11px] shadow-none">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
              En curso
            </span>
          )}
        </div>

        {/* Filtros de Modalidad */}
        <div className="flex items-center gap-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] p-1 rounded-2xl text-xs font-semibold shadow-none">
          <button
            onClick={() => setSelectedModality('ALL')}
            className={`px-3 py-1 rounded-xl transition-all shadow-none ${
              selectedModality === 'ALL'
                ? 'bg-white text-black font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setSelectedModality('P')}
            className={`px-3 py-1 rounded-xl transition-all shadow-none ${
              selectedModality === 'P'
                ? 'bg-[var(--accent-emerald)] text-black font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Presenciales
          </button>

          <button
            onClick={() => setSelectedModality('R')}
            className={`px-3 py-1 rounded-xl transition-all shadow-none ${
              selectedModality === 'R'
                ? 'bg-[var(--accent-orange)] text-white font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Zoom
          </button>

          <button
            onClick={() => setSelectedModality('VT')}
            className={`px-3 py-1 rounded-xl transition-all shadow-none ${
              selectedModality === 'VT'
                ? 'bg-[var(--accent-purple)] text-white font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Virtuales
          </button>
        </div>

      </div>

      {/* Grid de 6 Días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {daysToDisplay.map((dayNum) => {
          const dayName = DAYS_OF_WEEK[dayNum];
          const dayEvents = eventsByDay[dayNum] || [];
          const isToday = new Date().getDay() === dayNum && selectedWeek === currentWeek;
          const now = new Date();

          return (
            <div
              key={dayNum}
              className="flex flex-col space-y-2.5"
            >
              {/* Header Minimalista del Día (Sin conteo redundante de clases) */}
              <div className="pb-2 flex items-center justify-between border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold tracking-tight ${
                    isToday ? 'text-white' : 'text-neutral-400'
                  }`}>
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white text-black leading-none">
                      Hoy
                    </span>
                  )}
                </div>
              </div>

              {/* Lista de Sesiones */}
              <div className="space-y-2.5 flex-1">
                {dayEvents.length === 0 ? (
                  <div className="h-28 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center text-center text-xs text-neutral-600 font-medium select-none">
                    Sin clases
                  </div>
                ) : (
                  (() => {
                    const nextOrLiveEvt = isToday ? (dayEvents.find(e => parseDate(e.finishAt) >= now) || dayEvents[0]) : null;

                    return dayEvents.map((evt) => {
                      const parsed = parseEventTitle(evt.title);
                      const isRemoteZoom = evt.modality === 'R';
                      const isPresencial = evt.modality === 'P';
                      const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);
                      
                      const startDate = parseDate(evt.startAt);
                      const finishDate = parseDate(evt.finishAt);
                      const isLiveNow = isToday && now >= startDate && now <= finishDate;
                      const isNextToday = isToday && !isLiveNow && evt.id === nextOrLiveEvt?.id && now < startDate;
                      const isActiveCard = isLiveNow || isNextToday;

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventForModal(evt)}
                          className={`group relative rounded-2xl border p-3.5 transition-all duration-300 space-y-2.5 shadow-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                            isActiveCard
                              ? 'aurora-ambient-card'
                              : 'bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border-[var(--border-subtle)] hover:border-neutral-500'
                          }`}
                        >
                          {/* Top: Modalidad y Botón Zoom / Ubicación */}
                          <div className="flex items-center justify-between gap-1">
                            {isPresencial ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-emerald-text)] bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)] px-2 py-0.5 rounded-full">
                                <MapPin className="h-2.5 w-2.5" />
                                Presencial
                              </span>
                            ) : isRemoteZoom ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-orange-text)] bg-[var(--badge-orange-bg)] border border-[var(--badge-orange-border)] px-2 py-0.5 rounded-full">
                                <Video className="h-2.5 w-2.5" />
                                Zoom
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-purple-text)] bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] px-2 py-0.5 rounded-full">
                                <Radio className="h-2.5 w-2.5" />
                                Virtual
                              </span>
                            )}

                            {isRemoteZoom && evt.metadata?.zoomLink ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(evt.metadata?.zoomLink, '_blank');
                                }}
                                title="Unirse directo a Zoom"
                                aria-label="Unirse a Zoom"
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--surface-subtle)] hover:bg-white text-neutral-300 hover:text-black border border-[var(--border-subtle)] transition shrink-0"
                              >
                                <Video className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 transition-colors truncate max-w-[80px]">
                                {isPresencial ? location.aula.replace('Aula ', '') : 'Digital'}
                              </span>
                            )}
                          </div>

                          {/* Nombre del Curso */}
                          <h4 className="text-xs font-bold text-white group-hover:text-neutral-100 leading-snug line-clamp-2 transition-colors">
                            {parsed.cleanTitle}
                          </h4>

                          {/* Horario Limpio y Ordenado en 1 sola línea */}
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 whitespace-nowrap">
                            <Clock className="h-3 w-3 text-neutral-500 shrink-0" />
                            <span className="truncate">{formatScheduleTimeRange(evt.startAt, evt.finishAt)}</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección Dedicada: Cursos Virtuales 24/7 (Acceso Permanente) */}
      {virtual247Courses.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                Asignaturas Virtuales 24/7 (Acceso Permanente)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cursos 100% asíncronos sin horario semanal fijo. Disponibles en cualquier momento en UTP Canvas.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {virtual247Courses.length} {virtual247Courses.length === 1 ? 'curso' : 'cursos'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {virtual247Courses.map((course) => (
              <div
                key={course.courseId}
                className="flex flex-col justify-between rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-neutral-500 transition-all p-4 space-y-3.5 shadow-none"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-purple-text)] bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] px-2 py-0.5 rounded-full">
                      <Radio className="h-2.5 w-2.5" />
                      Virtual 24/7
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {course.sectionCode ? `Sección ${course.sectionCode}` : 'Autoaprendizaje'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {formatCourseName(course.name)}
                  </h4>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Autoaprendizaje continuo • Entregas y evaluaciones por semana en Canvas
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => openSyllabus(course.name)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] py-2 px-3 text-xs font-bold text-black transition active:scale-95 shadow-none"
                  >
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>Sílabo & Rúbricas</span>
                  </button>

                  {course.syllabusUrl && (
                    <a
                      href={course.syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Descargar Sílabo Oficial PDF"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border-medium)] text-white transition active:scale-95 shrink-0 shadow-none"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleAsk(`Explícame la metodología, evaluaciones y rúbricas del curso ${course.name}`)}
                    title="Consultar al Agente sobre este curso"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white transition active:scale-95 shrink-0 shadow-none"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Detalle de Clase */}
      <ClassDetailModal
        isOpen={!!selectedEventForModal}
        event={selectedEventForModal}
        weekNumber={selectedWeek}
        interval={interval}
        onClose={() => setSelectedEventForModal(null)}
        onOpenGlobalAi={handleAsk}
      />

    </div>
  );
};

