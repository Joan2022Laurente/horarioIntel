'use client';

import React, { useState } from 'react';
import { StudyBuddyMatch, StudyBeaconRow } from '@/types/matching';
import { 
  X, 
  MessageSquare, 
  Video, 
  MapPin, 
  Clock, 
  Check, 
  ExternalLink,
  Send,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { formatCourseName } from '@/lib/schedule-parser';

interface DirectConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTarget: StudyBuddyMatch | StudyBeaconRow | null;
  currentUserLocation?: string;
}

export const DirectConnectModal: React.FC<DirectConnectModalProps> = ({
  isOpen,
  onClose,
  matchTarget,
  currentUserLocation = 'Campus UTP / Biblioteca',
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !matchTarget) return null;

  const isBuddy = 'compatibilityPercent' in matchTarget;
  const buddy = isBuddy ? (matchTarget as StudyBuddyMatch) : null;
  const beacon = !isBuddy ? (matchTarget as StudyBeaconRow) : null;

  const targetName = buddy ? buddy.name : (beacon?.host?.full_name || 'Compañero UTP');
  const targetCourse = buddy ? buddy.courseName : (beacon?.course_id || 'Estudio General');
  const targetLocation = buddy ? buddy.locationPreference : (beacon?.location_name || 'Campus UTP');
  const targetGoal = buddy ? buddy.currentGoal : (beacon?.objective || 'Sesión de estudio');
  const targetPhone = buddy?.whatsappPhone || '51987654321';

  const defaultWhatsappMessage = encodeURIComponent(
    `¡Hola ${targetName.split(' ')[0]}! Te vi en UTP Intel con ventana libre para ${formatCourseName(targetCourse)}. Estoy en ${currentUserLocation} con la meta de: "${targetGoal}". ¿Nos juntamos a estudiar?`
  );

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${defaultWhatsappMessage}`;
  const virtualRoomUrl = `https://meet.google.com/new`;

  const handleSendInApp = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[var(--surface-card)] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent-lime)] text-black font-black flex items-center justify-center text-lg shrink-0">
              {targetName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{targetName}</h3>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--badge-emerald-text)] bg-[var(--badge-emerald-bg)] px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  Verificado UTP
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {buddy?.career || beacon?.host?.career || 'Ingeniería'} • Ciclo {buddy?.cycle || 7}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-neutral-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ficha Resumen Plana (Zero Nested Boxes) */}
        <div className="space-y-2.5 text-xs">
          {buddy && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Compatibilidad Académica:</span>
              <span className="font-bold text-[var(--accent-lime)] flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 fill-[var(--accent-lime)]" />
                {buddy.compatibilityPercent}% Match
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Asignatura:</span>
            <span className="font-bold text-white text-right flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
              {formatCourseName(targetCourse)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Ubicación / Entorno:</span>
            <span className="font-bold text-neutral-200 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[var(--accent-orange)] shrink-0" />
              {targetLocation}
            </span>
          </div>

          {buddy?.sharedWindow && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Ventana Libre Compartida:</span>
              <span className="font-mono text-neutral-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                {buddy.sharedWindow.start} – {buddy.sharedWindow.end} ({Math.round(buddy.sharedWindow.durationMinutes / 60 * 10) / 10}h)
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-neutral-400 block mb-1">Meta del Estudio:</span>
            <p className="text-white italic leading-relaxed">
              &ldquo;{targetGoal}&rdquo;
            </p>
          </div>
        </div>

        {/* Canales de Contacto Directo */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-xs font-bold text-white block">
            Elegir Canal de Contacto Directo
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp Directo */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs transition active:scale-95 shadow-none"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Abrir WhatsApp</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            {/* Sala Virtual Instantánea */}
            <a
              href={virtualRoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-white font-bold text-xs transition active:scale-95 shadow-none"
            >
              <Video className="h-4 w-4 text-[var(--accent-blue)]" />
              <span>Sala Meet / Discord</span>
            </a>
          </div>
        </div>

        {/* Mensaje Rápido en App */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
          <label className="text-xs text-neutral-400 font-medium block">
            O enviar saludo en plataforma con notificación:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Hola ${targetName.split(' ')[0]}, ¿estudias conmigo ${targetCourse.split(' ')[0]}?`}
              className="flex-1 bg-[var(--surface-input)] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleSendInApp}
              disabled={isSent}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-none ${
                isSent
                  ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)]'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isSent ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>¡Enviado!</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Invitar</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
