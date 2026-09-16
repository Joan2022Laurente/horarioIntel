'use client';

import React, { useState } from 'react';
import { ProcessedCourse } from '@/types/utp';
import { 
  Radio, 
  MapPin, 
  Target, 
  Check, 
  Sparkles,
  Zap,
  Edit2
} from 'lucide-react';
import { formatCourseName } from '@/lib/schedule-parser';

interface PersonalBeaconCardProps {
  courses: ProcessedCourse[];
  onAskAi?: (prompt: string) => void;
}

export const PersonalBeaconCard: React.FC<PersonalBeaconCardProps> = ({
  courses,
  onAskAi,
}) => {
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.name || 'Desarrollo Web Integrado');
  const [location, setLocation] = useState('Biblioteca Torre A - Piso 3');
  const [goal, setGoal] = useState('Avanzando proyecto APF1 y resolviendo dudas de código');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 space-y-4 shadow-none">
      
      {/* Top row: Status Switch & Radar Beacon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-colors ${
            isActive ? 'bg-[var(--accent-emerald)] text-black' : 'bg-[var(--surface-subtle)] text-neutral-500'
          }`}>
            <Radio className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Mi Radar de Estudio</h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)]' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400'
              }`}>
                {isActive ? '● En Vivo / Disponible' : '○ Pausado'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isActive 
                ? 'Otros alumnos de tu carrera pueden encontrarte para armar parejas o grupos de estudio.'
                : 'Tu perfil está oculto para solicitudes de estudio en vivo.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-300 hover:text-white border border-[var(--border-subtle)] text-xs font-bold transition active:scale-95 shadow-none"
          >
            <Edit2 className="h-3 w-3" />
            <span>{isEditing ? 'Listo' : 'Editar Estado'}</span>
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-none ${
              isActive 
                ? 'bg-white text-black hover:bg-neutral-200' 
                : 'bg-[var(--accent-emerald)] text-black hover:bg-[var(--accent-emerald-hover)]'
            }`}
          >
            {isActive ? 'Pausar Radar' : 'Activar Radar'}
          </button>
        </div>
      </div>

      {/* Editing Form or Display Box */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 text-xs pt-1 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Asignatura que estás repasando:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
              >
                {courses.map((c) => (
                  <option key={c.courseId} value={c.name}>
                    {formatCourseName(c.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Ubicación física o canal virtual:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Biblioteca Torre A - Piso 3"
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-neutral-400 font-semibold">Meta de tu sesión de hoy:</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ej: Avanzar entregable APF1 de Desarrollo Web"
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--accent-emerald)] text-black font-bold text-xs hover:bg-[var(--accent-emerald-hover)] transition shadow-none"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Guardar Estado</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-neutral-400 text-[11px] block">Asignatura Activa:</span>
            <p className="font-bold text-white truncate">{formatCourseName(selectedCourse)}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-neutral-400 text-[11px] block">Mi Ubicación:</span>
            <p className="font-bold text-neutral-200 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 text-[var(--accent-orange)] shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-neutral-400 text-[11px] block">Meta Declarada:</span>
            <p className="font-bold text-white truncate">&ldquo;{goal}&rdquo;</p>
          </div>
        </div>
      )}

    </div>
  );
};
