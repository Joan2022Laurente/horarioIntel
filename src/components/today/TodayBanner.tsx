'use client';

import React from 'react';
import { UTPEvent } from '@/types/utp';
import { formatTime, parseEventTitle } from '@/lib/schedule-parser';
import { Badge } from '@/components/ui/Badge';
import { Video, MapPin, Radio, Flame, Sparkles } from 'lucide-react';

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
  currentWeek,
  totalWeeks,
  onAskAi,
}) => {
  const parsedBanner = parseEventTitle(bannerClass.title);

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
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all shadow-xl ${
      isLiveNow 
        ? 'bg-gradient-to-r from-emerald-950/60 via-[#141417] to-[#141417]' 
        : 'bg-[#141417]'
    }`}>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            {isLiveNow ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                En vivo ahora • Quedan {minutesRemainingCurrent}m
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5722]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#ff7043]">
                <Flame className="h-3.5 w-3.5" />
                {minutesToNext !== null && minutesToNext <= 120 
                  ? `Próxima clase en ${minutesToNext} minutos` 
                  : `Siguiente sesión programada`}
              </span>
            )}
            {getModalityBadge(bannerClass.modality)}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {parsedBanner.cleanTitle}
          </h2>

          <p className="text-xs text-neutral-400 flex flex-wrap items-center gap-2">
            {parsedBanner.sectionCode && (
              <span className="font-mono bg-[#1a1a20] px-2.5 py-0.5 rounded-full text-neutral-300">
                Sección {parsedBanner.sectionCode}
              </span>
            )}
            <span>•</span>
            <span>Semana {parsedBanner.weekInTitle || currentWeek} de {totalWeeks}</span>
            <span>•</span>
            <span className="text-white font-bold font-mono">
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
              className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-neutral-200 px-5 py-3 text-xs font-black text-black shadow-lg transition active:scale-95"
            >
              <Video className="h-4 w-4 text-black" />
              <span>Unirse a Zoom</span>
            </a>
          )}
          <button
            onClick={() => onAskAi(`¿Qué temas tocan hoy en ${parsedBanner.cleanTitle} y qué preguntas clave debería hacer en clase?`)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1a1a20] hover:bg-[#25252c] px-4 py-3 text-xs font-bold text-neutral-300 hover:text-white transition"
          >
            <Sparkles className="h-4 w-4 text-[#ff5722]" />
            <span>Preparar Clase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
