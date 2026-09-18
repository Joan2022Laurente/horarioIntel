'use client';

import React from 'react';
import { UTPEvent } from '@/types/utp';
import { formatTime, parseEventTitle } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
import { Video, MapPin, Radio, Flame, Sparkles } from 'lucide-react';
import { useAuroraStyle } from '@/hooks/useAuroraStyle';

interface TodayBannerProps {
  bannerClass: UTPEvent;
  isLiveNow: boolean;
  minutesRemainingCurrent: number | null;
  minutesToNext: number | null;
  currentWeek: number;
  totalWeeks: number;
  onAskAi: (prompt: string) => void;
}

export const TodayBanner: React.FC<TodayBannerProps> = ({
  bannerClass,
  isLiveNow,
  minutesRemainingCurrent,
  minutesToNext,
  currentWeek: _currentWeek,
  totalWeeks: _totalWeeks,
  onAskAi,
}) => {
  const auroraStyle = useAuroraStyle(42);
  const parsedBanner = parseEventTitle(bannerClass.title);

  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'P':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.14] backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-white/90 shrink-0">
            <MapPin className="h-3 w-3 text-white/80" /> Presencial
          </span>
        );
      case 'R':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.14] backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-white/90 shrink-0">
            <Video className="h-3 w-3 text-white/80" /> Remoto Zoom
          </span>
        );
      case 'VT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.14] backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-white/90 shrink-0">
            <Radio className="h-3 w-3 text-white/80" /> Virtual
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.14] backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-white/90 shrink-0">
            {modality}
          </span>
        );
    }
  };

  return (
    <div 
      className="aurora-ambient-card rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-none"
      style={auroraStyle}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isLiveNow ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/[0.16] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)] animate-pulse" />
                En vivo • Quedan {minutesRemainingCurrent}m
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/[0.16] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shrink-0">
                <Flame className="h-3 w-3 text-white/80" />
                {minutesToNext !== null && minutesToNext <= 120 
                  ? `Próxima clase en ${minutesToNext} min` 
                  : `Siguiente sesión`}
              </span>
            )}
            {getModalityBadge(bannerClass.modality)}
          </div>

          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            {parsedBanner.cleanTitle}
          </h3>

          <p className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
            <span className="text-neutral-300 font-medium">
              {formatTime(bannerClass.startAt)} – {formatTime(bannerClass.finishAt)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {bannerClass.metadata?.zoomLink && (
            <a
              href={bannerClass.metadata.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/[0.16] backdrop-blur-md px-3.5 py-2 text-xs font-semibold shadow-none transition active:scale-95"
            >
              <Video className="h-3.5 w-3.5 text-white/90" />
              <span>Unirse a Zoom</span>
            </a>
          )}
          <button
            onClick={() => onAskAi(`¿Qué temas tocan hoy en ${parsedBanner.cleanTitle} y qué preguntas clave debería hacer en clase?`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/[0.16] backdrop-blur-md px-3.5 py-2 text-xs font-semibold transition shadow-none active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-white/90" />
            <span>Consultar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
