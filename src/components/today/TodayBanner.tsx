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
        return <Badge variant="purple"><Radio className="h-3 w-3" /> Virtual</Badge>;
      default:
        return <Badge variant="neutral">{modality}</Badge>;
    }
  };

  return (
    <div className={`rounded-2xl p-5 sm:p-6 transition-all shadow-md ${
      isLiveNow 
        ? 'bg-gradient-to-r from-emerald-950/40 via-[#141417] to-[#141417]' 
        : 'bg-[#141417]'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            {isLiveNow ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En vivo ahora • Quedan {minutesRemainingCurrent}m
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5722]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#ff7043]">
                <Flame className="h-3 w-3" />
                {minutesToNext !== null && minutesToNext <= 120 
                  ? `Próxima clase en ${minutesToNext} min` 
                  : `Siguiente sesión`}
              </span>
            )}
            {getModalityBadge(bannerClass.modality)}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
            {parsedBanner.cleanTitle}
          </h3>

          <p className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
            <span>Semana {parsedBanner.weekInTitle || currentWeek}</span>
            <span>•</span>
            <span className="text-neutral-300 font-bold">
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
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-200 px-4 py-2 text-xs font-black text-black shadow transition active:scale-95"
            >
              <Video className="h-3.5 w-3.5 text-black" />
              <span>Unirse a Zoom</span>
            </a>
          )}
          <button
            onClick={() => onAskAi(`¿Qué temas tocan hoy en ${parsedBanner.cleanTitle} y qué preguntas clave debería hacer en clase?`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
            <span>Consultar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
