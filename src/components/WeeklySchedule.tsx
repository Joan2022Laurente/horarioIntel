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

interface WeeklyScheduleProps {
  interval: UTPCurrentInterval;
  onAskAi: (prompt: string) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  interval,
  onAskAi,
}) => {
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
      
      {/* Barra de Control de Semana & Filtros (Flat & Sleek, sin bordes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        
        {/* Selector de Semana */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#151519] rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
              disabled={selectedWeek <= 1}
              aria-label="Semana anterior"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-[#ff5722]" />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                aria-label="Seleccionar semana académica"
                className="bg-transparent border-0 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w} className="bg-[#141417] text-white">
                    Semana {w} {w === currentWeek ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedWeek(prev => Math.min(totalWeeks, prev + 1))}
              disabled={selectedWeek >= totalWeeks}
              aria-label="Semana siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {selectedWeek === currentWeek && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bbf451] text-black font-extrabold px-3 py-1 text-[11px] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
              En curso
            </span>
          )}
        </div>

        {/* Filtros de Modalidad (Pill Tabs Planas) */}
        <div className="flex items-center gap-1 bg-[#151519] p-1 rounded-2xl text-xs font-semibold shadow-sm">
          <button
            onClick={() => setSelectedModality('ALL')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedModality === 'ALL'
                ? 'bg-white text-black font-extrabold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setSelectedModality('P')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedModality === 'P'
                ? 'bg-[#00c853] text-black font-extrabold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Presenciales
          </button>

          <button
            onClick={() => setSelectedModality('R')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedModality === 'R'
                ? 'bg-[#ff5722] text-white font-extrabold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Zoom
          </button>

          <button
            onClick={() => setSelectedModality('VT')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedModality === 'VT'
                ? 'bg-[#7075ff] text-white font-extrabold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Virtuales
          </button>
        </div>

      </div>

      {/* Grid de 6 Días (Lanes abiertas sin cajas anidadas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {daysToDisplay.map((dayNum) => {
          const dayName = DAYS_OF_WEEK[dayNum];
          const dayEvents = eventsByDay[dayNum] || [];
          const isToday = new Date().getDay() === dayNum && selectedWeek === currentWeek;

          return (
            <div
              key={dayNum}
              className={`flex flex-col rounded-2xl transition-all ${
                isToday
                  ? 'bg-white/[0.02] p-2 -m-2 rounded-2xl ring-1 ring-[#bbf451]/30'
                  : ''
              }`}
            >
              {/* Header Plano del Día */}
              <div className="pb-2 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    isToday ? 'text-[#bbf451]' : 'text-neutral-300'
                  }`}>
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-[#bbf451] px-1.5 py-0.5 text-[9px] font-black uppercase text-black leading-none">
                      Hoy
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-neutral-500">
                  {dayEvents.length} {dayEvents.length === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              {/* Lista de Sesiones - Tarjeta de capa única interactiva */}
              <div className="space-y-3 flex-1">
                {dayEvents.length === 0 ? (
                  <div className="h-28 rounded-2xl bg-[#151519]/40 flex items-center justify-center text-center text-xs text-neutral-600 font-medium select-none">
                    Sin clases
                  </div>
                ) : (
                  dayEvents.map((evt) => {
                    const parsed = parseEventTitle(evt.title);
                    const isRemoteZoom = evt.modality === 'R';
                    const isPresencial = evt.modality === 'P';
                    const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventForModal(evt)}
                        className="group relative rounded-2xl bg-[#151519] hover:bg-[#1b1b22] p-3.5 transition-all duration-200 space-y-2.5 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                      >
                        {/* Top: Modalidad + Acción rápida (Cámara compacta o Ubicación) */}
                        <div className="flex items-center justify-between gap-1">
                          {isPresencial ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <MapPin className="h-2.5 w-2.5" />
                              Presencial
                            </span>
                          ) : isRemoteZoom ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[#ff7043] bg-[#ff5722]/10 px-2 py-0.5 rounded-full">
                              <Video className="h-2.5 w-2.5" />
                              Zoom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
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
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 hover:bg-white text-neutral-300 hover:text-black transition shrink-0"
                            >
                              <Video className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">
                              {isPresencial ? location.aula.replace('Aula ', '') : 'Digital'}
                            </span>
                          )}
                        </div>

                        {/* Nombre del Curso */}
                        <h4 className="text-xs font-black text-white group-hover:text-[#bbf451] leading-snug line-clamp-2 transition-colors">
                          {parsed.cleanTitle}
                        </h4>

                        {/* Horario */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-neutral-500 shrink-0" />
                            <span>{formatTime(evt.startAt)} — {formatTime(evt.finishAt)}</span>
                          </div>

                          <Sparkles className="h-3 w-3 text-[#ff5722] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle de Clase con Aula, Piso, Campus, Sílabo & Chat IA */}
      <ClassDetailModal
        isOpen={!!selectedEventForModal}
        event={selectedEventForModal}
        weekNumber={selectedWeek}
        interval={interval}
        onClose={() => setSelectedEventForModal(null)}
        onOpenGlobalAi={onAskAi}
      />

    </div>
  );
};

