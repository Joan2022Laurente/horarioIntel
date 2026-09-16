'use client';

import React, { useState } from 'react';
import { UTPCurrentInterval, UTPEvent } from '@/types/utp';
import { 
  getEventsByWeek, 
  formatTime, 
  parseEventTitle, 
  DAYS_OF_WEEK, 
  parseDate 
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
  Sparkles
} from 'lucide-react';

import { useAgent } from '@/context/AgentContext';

interface WeeklyScheduleProps {
  interval: UTPCurrentInterval;
  onAskAi?: (prompt: string) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  interval,
  onAskAi,
}) => {
  const { askAgent } = useAgent();
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

  return (
    <div className="space-y-5 text-white">
      
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
              {/* Header Minimalista del Día */}
              <div className="pb-2 flex items-center justify-between border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isToday ? 'text-white' : 'text-neutral-400'
                  }`}>
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-white text-black leading-none">
                      Hoy
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-neutral-500">
                  {dayEvents.length} {dayEvents.length === 1 ? 'clase' : 'clases'}
                </span>
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
                          className={`group relative rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border p-3.5 transition-all duration-300 space-y-2.5 shadow-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                            isActiveCard
                              ? 'animate-card-loop border-[var(--border-medium)]'
                              : 'border-[var(--border-subtle)] hover:border-neutral-500'
                          }`}
                        >
                          {/* Left Accent indicator for active/next class */}
                          {isActiveCard && (
                            <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${
                              isLiveNow ? 'bg-[var(--accent-lime)]' : 'bg-[var(--accent-orange)]'
                            }`} />
                          )}

                          {/* Top: Modalidad & Estado */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
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

                              {isLiveNow ? (
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-black bg-[var(--accent-lime)] px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-live-pulse" />
                                  En vivo
                                </span>
                              ) : isNextToday ? (
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--badge-orange-text)] bg-[var(--badge-orange-bg)] border border-[var(--badge-orange-border)] px-2 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--badge-orange-text)] animate-live-pulse" />
                                  Próxima
                                </span>
                              ) : null}
                            </div>

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
                            <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 transition-colors">
                              {isPresencial ? location.aula.replace('Aula ', '') : 'Digital'}
                            </span>
                          )}
                        </div>

                        {/* Nombre del Curso */}
                        <h4 className="text-xs font-bold text-white group-hover:text-neutral-100 leading-snug line-clamp-2 transition-colors">
                          {parsed.cleanTitle}
                        </h4>

                        {/* Horario */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-neutral-500 shrink-0" />
                            <span>{formatTime(evt.startAt)} — {formatTime(evt.finishAt)}</span>
                          </div>

                          <Sparkles className="h-3 w-3 text-[var(--accent-orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
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
