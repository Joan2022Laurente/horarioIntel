'use client';

import React, { useState } from 'react';
import { UTPEvent, UTPCurrentInterval } from '@/types/utp';
import { formatTime, parseEventTitle, parseDate } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { ClassDetailModal } from '@/components/schedule/ClassDetailModal';
import { Calendar, Video, MapPin, Radio, ChevronRight } from 'lucide-react';

// ─── Sub-component: ClassCard (Limpio y estándar) ───────────────────────────

interface ClassCardProps {
  ev: UTPEvent;
  isActiveCard: boolean;
  isPresencial: boolean;
  isRemoteZoom: boolean;
  location: { aula: string; pabellon: string };
  parsed: { cleanTitle: string; sectionCode: string };
  now: Date;
  onSelect: (ev: UTPEvent) => void;
  getModalityBadge: (modality: string) => React.ReactNode;
}

const ClassCard: React.FC<ClassCardProps> = ({
  ev,
  isActiveCard,
  isPresencial,
  isRemoteZoom,
  location,
  parsed,
  onSelect,
  getModalityBadge,
}) => {
  return (
    <div
      onClick={() => onSelect(ev)}
      className={`group p-3.5 sm:p-5 rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 shadow-none cursor-pointer ${
        isActiveCard
          ? 'bg-[var(--surface-card-hover)] border border-white/20'
          : 'bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
      }`}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {getModalityBadge(ev.modality)}
          <span className="font-mono text-[11px] sm:text-xs text-neutral-400 font-bold whitespace-nowrap">
            {formatTime(ev.startAt)} – {formatTime(ev.finishAt)}
          </span>
          {isPresencial && (
            <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 truncate">
              • {location.aula} ({location.pabellon})
            </span>
          )}
          {isActiveCard && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/90 bg-white/[0.08] border border-white/[0.14] px-2 py-0.5 rounded-full backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)] animate-pulse" />
              Sesión Actual
            </span>
          )}
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--accent-lime)] transition-colors leading-snug truncate">
          {parsed.cleanTitle}
        </h4>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isRemoteZoom && ev.metadata?.zoomLink && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(ev.metadata?.zoomLink, '_blank');
            }}
            title="Unirse directo a Zoom"
            aria-label="Unirse a Zoom"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-none transition active:scale-95 shrink-0"
          >
            <Video className="h-3.5 w-3.5 text-white" />
          </button>
        )}
        <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

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
  onOpenSyllabus: _onOpenSyllabus,
  onAskAi,
}) => {
  const [selectedEventForModal, setSelectedEventForModal] = useState<UTPEvent | null>(null);
  const now = new Date();
  const nextOrLiveEvt = todayEvents.find(e => parseDate(e.finishAt) >= now) || todayEvents[0];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
        <h3 className="text-sm sm:text-base font-bold text-white">
          Horario del Día: <span className="capitalize text-neutral-300 font-normal">{todayDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </h3>
        <button
          onClick={onNavigateToWeekly}
          className="text-xs text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)] font-semibold transition-colors self-start sm:self-auto"
        >
          Ver horario semanal completo →
        </button>
      </div>

      {todayEvents.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-8 space-y-3 shadow-none">
          <Calendar className="h-10 w-10 mx-auto text-neutral-600" />
          <p className="text-base font-bold text-white">¡No tienes sesiones programadas para hoy!</p>
          <p className="text-xs text-neutral-400">Aprovecha para avanzar en tus entregables y proyectos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayEvents.map((ev, idx) => {
            const parsed = parseEventTitle(ev.title);
            const isRemoteZoom = ev.modality === 'R';
            const isPresencial = ev.modality === 'P';
            const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);

            const startDate = parseDate(ev.startAt);
            const finishDate = parseDate(ev.finishAt);
            const isLiveNow = now >= startDate && now <= finishDate;
            const isNextToday = !isLiveNow && ev.id === nextOrLiveEvt?.id && now < startDate;
            const isActiveCard = isLiveNow || isNextToday;

            return (
              <ClassCard
                key={ev.id}
                ev={ev}
                isActiveCard={isActiveCard}
                isPresencial={isPresencial}
                isRemoteZoom={isRemoteZoom}
                location={location}
                parsed={parsed}
                now={now}
                onSelect={setSelectedEventForModal}
                getModalityBadge={getModalityBadge}
              />
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
