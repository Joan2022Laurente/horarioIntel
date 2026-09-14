'use client';

import React from 'react';
import { UTPEvent } from '@/types/utp';
import { formatTime, parseEventTitle } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
import { Clock, Calendar, Video, MapPin, Radio } from 'lucide-react';

interface TodayClassesSectionProps {
  todayEvents: UTPEvent[];
  todayDate: Date;
  onNavigateToWeekly: () => void;
  onOpenSyllabus: (courseName: string) => void;
}

export const TodayClassesSection: React.FC<TodayClassesSectionProps> = ({
  todayEvents,
  todayDate,
  onNavigateToWeekly,
  onOpenSyllabus,
}) => {
  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'P':
        return <Badge variant="emerald"><MapPin className="h-3 w-3" /> Presencial</Badge>;
      case 'R':
        return <Badge variant="orange"><Video className="h-3 w-3" /> Remoto Zoom</Badge>;
      case 'VT':
        return <Badge variant="purple"><Radio className="h-3 w-3" /> Virtual Asíncrono</Badge>;
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
          <p className="text-xs text-neutral-400">Aprovecha para avanzar en tus entregables de la semana 5.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayEvents.map((ev) => {
            const parsed = parseEventTitle(ev.title);
            return (
              <div key={ev.id} className="p-5 rounded-2xl bg-[#141417] hover:bg-[#1a1a20] flex items-center justify-between gap-4 transition shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getModalityBadge(ev.modality)}
                    <span className="font-mono text-xs text-neutral-400 font-bold">
                      {formatTime(ev.startAt)} – {formatTime(ev.finishAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{parsed.cleanTitle}</h4>
                  {parsed.sectionCode && (
                    <span className="text-[11px] font-mono text-neutral-500">Sección {parsed.sectionCode}</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {ev.metadata?.zoomLink && (
                    <a
                      href={ev.metadata.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-neutral-200 px-4 py-2 text-xs font-black text-black shadow transition active:scale-95"
                    >
                      <Video className="h-3.5 w-3.5 text-black" />
                      <span>Zoom</span>
                    </a>
                  )}
                  <button
                    onClick={() => onOpenSyllabus(parsed.cleanTitle)}
                    className="rounded-xl bg-[#1f1f24] hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
                  >
                    Sílabo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
