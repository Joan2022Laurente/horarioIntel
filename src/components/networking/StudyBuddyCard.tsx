'use client';

import React from 'react';
import { StudyBuddyMatch } from '@/types/matching';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  UserPlus, 
  Zap, 
  Radio, 
  ShieldCheck,
  Code
} from 'lucide-react';
import { formatCourseName } from '@/lib/schedule-parser';

interface StudyBuddyCardProps {
  buddy: StudyBuddyMatch;
  onConnect: (buddy: StudyBuddyMatch) => void;
  onAskAi?: (prompt: string) => void;
}

export const StudyBuddyCard: React.FC<StudyBuddyCardProps> = ({
  buddy,
  onConnect,
  onAskAi,
}) => {
  const isOnlineNow = buddy.status === 'ONLINE_NOW';

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-neutral-500 p-5 space-y-4 shadow-none transition-all group">
      
      {/* Top Bar: Compatibility Gauge + Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          
          {/* Compatibility Pill */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black bg-[var(--accent-lime)] px-2.5 py-0.5 rounded-full shadow-none">
            <Zap className="h-3 w-3 fill-black" />
            <span>{buddy.compatibilityPercent}% Match</span>
          </span>

          {/* Time & Environment Status */}
          <div className="flex items-center gap-2">
            {isOnlineNow ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-emerald-text)] bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)] px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
                Libre ahora
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                {buddy.sharedWindow.start}
              </span>
            )}

            <span className="text-[10px] font-bold text-neutral-400">
              {buddy.modality === 'Presencial' ? 'Campus' : 'Virtual'}
            </span>
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="flex items-start gap-3 pt-1">
          <div className="h-11 w-11 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-medium)] text-white font-bold flex items-center justify-center text-sm shrink-0 group-hover:border-[var(--accent-lime)] transition-colors">
            {buddy.avatarLetter}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white group-hover:text-[var(--accent-lime)] transition-colors truncate">
                {buddy.name}
              </h3>
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-emerald)] shrink-0" title="Verificado UTP" />
            </div>

            <p className="text-[11px] text-neutral-400 truncate">
              {buddy.career} • Ciclo {buddy.cycle}
            </p>
          </div>
        </div>

        {/* Target Subject & Free Window */}
        <div className="rounded-2xl bg-[var(--surface-subtle)] p-3 space-y-1.5 border border-[var(--border-subtle)] text-xs">
          <div className="flex items-center justify-between text-neutral-300 font-bold">
            <span className="truncate">{formatCourseName(buddy.courseName)}</span>
            {buddy.sectionCode && (
              <span className="text-[10px] font-mono text-neutral-400 shrink-0 ml-1">
                Sec. {buddy.sectionCode}
              </span>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[var(--accent-orange)] shrink-0" />
            <span className="truncate">{buddy.locationPreference}</span>
          </p>

          <p className="text-[11px] text-white font-medium pt-1 border-t border-[var(--border-subtle)] line-clamp-2">
            &ldquo;{buddy.currentGoal}&rdquo;
          </p>
        </div>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {buddy.skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[10px] font-mono bg-[var(--surface-input)] border border-[var(--border-subtle)] text-neutral-300 px-2 py-0.5 rounded-lg"
            >
              <Code className="h-2.5 w-2.5 text-neutral-500" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
        <button
          onClick={() => onConnect(buddy)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition active:scale-95 shadow-none"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Conectar 1 a 1</span>
        </button>

        {onAskAi && (
          <button
            onClick={() => onAskAi(`Analiza qué temas o proyectos podemos estudiar juntos con ${buddy.name} para ${buddy.courseName}`)}
            title="Consultar al Agente sobre este match"
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white transition active:scale-95 shrink-0 shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
