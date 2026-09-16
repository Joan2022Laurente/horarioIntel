'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Sparkles, 
  Clock, 
  Plus, 
  ChevronRight, 
  Check, 
  Send,
  Loader2
} from 'lucide-react';
import { StudyBeaconRow } from '@/types/matching';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';
import { 
  fetchActiveBeacons, 
  createBeaconInDb, 
  joinBeaconInDb 
} from '@/lib/supabase/networking-service';

interface CampusNetworkingViewProps {
  courses: ProcessedCourse[];
  interval: UTPCurrentInterval;
}

export const CampusNetworkingView: React.FC<CampusNetworkingViewProps> = ({
  courses,
  interval: _interval,
}) => {
  const { executeIntent } = useAgent();
  const [beacons, setBeacons] = useState<StudyBeaconRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBeacon, setIsCreatingBeacon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.name || 'General');
  const [joinedBeaconIds, setJoinedBeaconIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadBeacons() {
      setIsLoading(true);
      const data = await fetchActiveBeacons();
      setBeacons(data);
      setIsLoading(false);
    }
    loadBeacons();
  }, []);

  const handleJoinBeacon = async (beaconId: string) => {
    if (joinedBeaconIds.includes(beaconId)) return;
    setJoinedBeaconIds(prev => [...prev, beaconId]);
    setBeacons(prev => prev.map(b => {
      if (b.id === beaconId && b.current_collaborators < b.max_collaborators) {
        return { ...b, current_collaborators: b.current_collaborators + 1 };
      }
      return b;
    }));

    await joinBeaconInDb(beaconId);
  };

  const handleCreateBeacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !objective.trim()) return;

    setIsSubmitting(true);
    const created = await createBeaconInDb({
      hostName: 'Joan Laurente',
      hostCode: 'U20202020',
      hostCareer: 'Ingeniería de Software',
      courseId: selectedCourse,
      courseName: selectedCourse,
      locationName: locationName.trim(),
      objective: objective.trim(),
      maxCollaborators: 4,
    });

    if (created) {
      setBeacons(prev => [created, ...prev]);
    } else {
      // Fallback local
      const localBeacon: StudyBeaconRow = {
        id: `bcn-${Date.now()}`,
        host_id: 'me',
        host: {
          id: 'me',
          student_code: 'U20202020',
          full_name: 'Joan Laurente (Tú)',
          email: 'yo@utp.edu.pe',
          career: 'Ingeniería de Software',
          campus: 'Campus Digital',
          cycle: 7,
          reputation_score: 100,
          created_at: '',
          updated_at: '',
        },
        course_id: selectedCourse,
        location_name: locationName,
        objective: objective,
        max_collaborators: 4,
        current_collaborators: 1,
        status: 'ACTIVE',
        expires_at: new Date(Date.now() + 60 * 60000).toISOString(),
        created_at: new Date().toISOString(),
      };
      setBeacons(prev => [localBeacon, ...prev]);
    }

    setIsSubmitting(false);
    setIsCreatingBeacon(false);
    setLocationName('');
    setObjective('');
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Networking & Huecos en Común
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Encuentra compañeros con ventanas libres en tu mismo campus o salas virtuales de estudio grupal sin fricción.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingBeacon(!isCreatingBeacon)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-emerald)] hover:bg-[var(--accent-emerald-hover)] px-4 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreatingBeacon ? 'Cancelar' : 'Crear Faro de Estudio'}</span>
        </button>
      </div>

      {/* Formulario rápido para emitir Faro */}
      {isCreatingBeacon && (
        <form onSubmit={handleCreateBeacon} className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-medium)] p-5 space-y-4 shadow-none animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--accent-emerald)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Nuevo Faro de Networking y Estudio</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">Duración: 60 minutos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Ubicación / Sala</label>
              <input 
                type="text" 
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Ej: Biblioteca Torre A - Piso 3 o Discord Sala 2"
                required
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Asignatura</label>
              <select 
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
              >
                {courses.map(c => (
                  <option key={c.courseId} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-400 font-semibold">Meta de la Sesión</label>
            <input 
              type="text" 
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="Ej: Avanzar entrega APF1 y resolver dudas de código"
              required
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-emerald)]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-emerald)] px-5 py-2 text-xs font-black text-black hover:bg-[var(--accent-emerald-hover)] transition active:scale-95 shadow-none disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>{isSubmitting ? 'Guardando...' : 'Publicar Faro'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Banner de Sincronía Inteligente de Huecos con Colores Sólidos */}
      <div className="rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] p-5 shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[var(--badge-orange-bg)] border border-[var(--badge-orange-border)] text-[var(--badge-orange-text)] flex items-center justify-center font-black shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Hueco en Común Detectado Hoy</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tienes una ventana libre de 2h con compañeros de tu sección antes de tu clase de las 6:30 PM.
            </p>
          </div>
        </div>

        <button
          onClick={() => executeIntent({ type: 'FIND_NETWORKING_BEACON' })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 whitespace-nowrap shrink-0 shadow-none"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
          <span>Coordinar con Agente</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-emerald)]" />
          <p className="text-xs">Cargando faros activos desde Supabase...</p>
        </div>
      ) : (
        /* Grid de Faros Activos con Colores Sólidos */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beacons.map((b) => {
            const isJoined = joinedBeaconIds.includes(b.id);
            const isFull = b.current_collaborators >= b.max_collaborators;

            return (
              <div 
                key={b.id}
                className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] p-5 space-y-4 shadow-none transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-[var(--badge-emerald-text)] bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)] px-2.5 py-0.5 rounded-full">
                      <span>En Vivo</span>
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expira pronto
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[var(--accent-emerald)] transition-colors">
                      {b.objective}
                    </h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--accent-orange)] shrink-0" />
                      <span>{b.location_name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-black text-white">
                      {b.host?.full_name.charAt(0)}
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-white leading-tight">{b.host?.full_name}</p>
                      <p className="text-neutral-500 font-mono">{b.current_collaborators}/{b.max_collaborators} alumnos</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinBeacon(b.id)}
                    disabled={isJoined || isFull}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-none ${
                      isJoined
                        ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)] cursor-default'
                        : isFull
                        ? 'bg-[var(--surface-muted)] text-neutral-500 cursor-not-allowed'
                        : 'bg-white hover:bg-neutral-200 text-black'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Unido</span>
                      </>
                    ) : isFull ? (
                      <span>Lleno</span>
                    ) : (
                      <>
                        <span>Unirme</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
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
