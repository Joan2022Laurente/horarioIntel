'use client';

import React, { useState } from 'react';
import { UTPEvent, UTPCurrentInterval } from '@/types/utp';
import { formatTime, parseEventTitle } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { ClassDetailModal } from '@/components/schedule/ClassDetailModal';
import { Clock, Calendar, Video, MapPin, Radio, Sparkles, ChevronRight } from 'lucide-react';

interface TodayClassesSectionProps {
  todayEvents: UTPEvent[];
  todayDate: Date;
  interval?: UTPCurrentInterval;
  onNavigateToWeekly: () => void;
  onOpenSyllabus: (courseName: string) => void;
  onAskAi?: (prompt: string) => void;
}

export const TodayClassesSection: React.FC<TodayClassesSectionProps> = ({
  todayEvents,
  todayDate,
  interval,
  onNavigateToWeekly,
  onOpenSyllabus,
  onAskAi,
}) => {
  const [selectedEventForModal, setSelectedEventForModal] = useState<UTPEvent | null>(null);

  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'P':
        return <Badge variant="emerald"><MapPin className="h-3 w-3" /> Presencial</Badge>;
      case 'R':
        return <Badge variant="orange"><Video className="h-3 w-3" /> Remoto Zoom</Badge>;
      case 'VT':
        return <Badge variant="purple"><Radio className="h-3 w-3" /> Virtual</Badge>;
      default:
        return <Badge variant="neutral">{modality}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#3a86ff]" />
          <span>Horario del Día: {todayDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </h3>
        <button
          onClick={onNavigateToWeekly}
          className="text-xs text-[#3a86ff] hover:text-[#60a5fa] font-bold"
        >
          Ver horario semanal completo →
        </button>
      </div>

      {todayEvents.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#141417] p-8 space-y-3 shadow-xl">
          <Calendar className="h-10 w-10 mx-auto text-neutral-600" />
          <p className="text-base font-bold text-white">¡No tienes sesiones programadas para hoy!</p>
          <p className="text-xs text-neutral-400">Aprovecha para avanzar en tus entregables y proyectos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayEvents.map((ev) => {
            const parsed = parseEventTitle(ev.title);
            const isRemoteZoom = ev.modality === 'R';
            const isPresencial = ev.modality === 'P';
            const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);

            return (
              <div 
                key={ev.id} 
                onClick={() => setSelectedEventForModal(ev)}
                className="group p-4 sm:p-5 rounded-2xl bg-[#141417] hover:bg-[#1a1a20] flex items-center justify-between gap-4 transition shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {getModalityBadge(ev.modality)}
                    <span className="font-mono text-xs text-neutral-400 font-bold">
                      {formatTime(ev.startAt)} – {formatTime(ev.finishAt)}
                    </span>
                    {isPresencial && (
                      <span className="text-[11px] font-mono text-neutral-500">
                        • {location.aula} ({location.pabellon})
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-[#bbf451] transition-colors">
                    {parsed.cleanTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {isRemoteZoom && ev.metadata?.zoomLink && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(ev.metadata?.zoomLink, '_blank');
                      }}
                      title="Unirse directo a Zoom"
                      aria-label="Unirse a Zoom"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white hover:bg-neutral-200 text-black shadow transition active:scale-95 shrink-0"
                    >
                      <Video className="h-4 w-4 text-black" />
                    </button>
                  )}

                  <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-white font-bold pl-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                    <span className="hidden sm:inline">Detalles & IA</span>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle de Clase */}
      <ClassDetailModal
        isOpen={!!selectedEventForModal}
        event={selectedEventForModal}
        weekNumber={interval?.week_number || 5}
        interval={interval}
        onClose={() => setSelectedEventForModal(null)}
        onOpenGlobalAi={onAskAi}
      />
    </div>
  );
};

