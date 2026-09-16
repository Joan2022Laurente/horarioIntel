'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Users, 
  MapPin, 
  Sparkles, 
  Clock, 
  Plus, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Send 
} from 'lucide-react';
import { StudyBeaconRow, MatchIntent } from '@/types/matching';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';

interface CampusRadarViewProps {
  courses: ProcessedCourse[];
  interval: UTPCurrentInterval;
  onAskAi: (prompt: string) => void;
}

const INITIAL_BEACONS: StudyBeaconRow[] = [
  {
    id: 'bcn-1',
    host_id: 'usr-1',
    host: {
      id: 'usr-1',
      student_code: 'U21204891',
      full_name: 'Mateo Quispe',
      email: 'mquispe@utp.edu.pe',
      career: 'Ing. de Software',
      campus: 'Torre Arequipa - Piso 4',
      cycle: 7,
      reputation_score: 120,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000ST61',
    location_name: 'Biblioteca Central Piso 4 - Mesa 12',
    objective: 'Repaso y armado de arquitectura para entregable APF1 (React + Tailwind)',
    max_collaborators: 4,
    current_collaborators: 2,
    status: 'ACTIVE',
    expires_at: new Date(Date.now() + 50 * 60000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'bcn-2',
    host_id: 'usr-2',
    host: {
      id: 'usr-2',
      student_code: 'U20309912',
      full_name: 'Valeria Mendoza',
      email: 'vmendoza@utp.edu.pe',
      career: 'Ing. de Sistemas',
      campus: 'Campus Digital',
      cycle: 8,
      reputation_score: 140,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000SI12',
    location_name: 'Sala Discord UTP Voice #3',
    objective: 'Simulacro de preguntas teóricas para la PC1 de Gestión del Servicio TI',
    max_collaborators: 5,
    current_collaborators: 3,
    status: 'ACTIVE',
    expires_at: new Date(Date.now() + 85 * 60000).toISOString(),
    created_at: new Date().toISOString(),
  }
];

export const CampusRadarView: React.FC<CampusRadarViewProps> = ({
  courses,
  interval,
  onAskAi,
}) => {
  const [beacons, setBeacons] = useState<StudyBeaconRow[]>(INITIAL_BEACONS);
  const [isCreatingBeacon, setIsCreatingBeacon] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.name || 'General');
  const [joinedBeaconIds, setJoinedBeaconIds] = useState<string[]>([]);

  const handleJoinBeacon = (beaconId: string) => {
    if (joinedBeaconIds.includes(beaconId)) return;
    setJoinedBeaconIds(prev => [...prev, beaconId]);
    setBeacons(prev => prev.map(b => {
      if (b.id === beaconId && b.current_collaborators < b.max_collaborators) {
        return { ...b, current_collaborators: b.current_collaborators + 1 };
      }
      return b;
    }));
  };

  const handleCreateBeacon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !objective.trim()) return;

    const newBeacon: StudyBeaconRow = {
      id: `bcn-${Date.now()}`,
      host_id: 'me',
      host: {
        id: 'me',
        student_code: 'MI_CODIGO',
        full_name: 'Tú (Host)',
        email: 'yo@utp.edu.pe',
        career: 'Ingeniería',
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

    setBeacons(prev => [newBeacon, ...prev]);
    setIsCreatingBeacon(false);
    setLocationName('');
    setObjective('');
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00e676] animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Radio className="h-6 w-6 text-[#00e676]" />
              <span>Campus Radar & Huecos en Común</span>
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Encuentra compañeros con ventanas libres en tu mismo campus o salas virtuales de estudio grupal sin fricción.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingBeacon(!isCreatingBeacon)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00e676] hover:bg-[#00c853] px-4 py-2 text-xs font-black text-black shadow-lg shadow-[#00e676]/20 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreatingBeacon ? 'Cancelar' : 'Encender Faro de Estudio'}</span>
        </button>
      </div>

      {/* Formulario rápido para emitir Faro */}
      {isCreatingBeacon && (
        <form onSubmit={handleCreateBeacon} className="rounded-3xl bg-[#141418] border border-[#00e676]/30 p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#00e676] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Nuevo Faro de Estudio en Tiempo Real</span>
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
                placeholder="Ej: Biblioteca Torre A - Piso 3 o Zoom Sala 2"
                required
                className="w-full bg-[#1b1b22] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Asignatura</label>
              <select 
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full bg-[#1b1b22] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
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
              className="w-full bg-[#1b1b22] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00e676] px-5 py-2 text-xs font-black text-black hover:bg-[#00c853] transition active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Emitir Faro en Vivo</span>
            </button>
          </div>
        </form>
      )}

      {/* Banner de Sincronía Inteligente de Huecos */}
      <div className="rounded-3xl bg-gradient-to-r from-[#181822] to-[#121216] border border-white/5 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#ff5722]/15 text-[#ff7043] flex items-center justify-center font-black shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Hueco en Común Detectado Hoy</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tienes una ventana libre de 2h con 6 compañeros de tu sección antes de tu clase de las 6:30 PM.
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskAi('¿Qué compañeros tienen hueco libre hoy conmigo y qué temas de estudio podemos coordinar?')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#bbf451]" />
          <span>Ver con Copiloto</span>
        </button>
      </div>

      {/* Grid de Faros Activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {beacons.map((b) => {
          const isJoined = joinedBeaconIds.includes(b.id);
          const isFull = b.current_collaborators >= b.max_collaborators;

          return (
            <div 
              key={b.id}
              className="flex flex-col justify-between rounded-3xl bg-[#141417] border border-white/5 hover:border-white/10 p-5 space-y-4 shadow-xl transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00e676] bg-[#00c853]/15 px-2.5 py-0.5 rounded-full">
                    <Radio className="h-3 w-3 animate-pulse" />
                    En Vivo
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expira en 45m
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#00e676] transition-colors">
                    {b.objective}
                  </h4>
                  <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#ff7043] shrink-0" />
                    <span>{b.location_name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                    isJoined
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                      : isFull
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                      : 'bg-white hover:bg-neutral-200 text-black shadow'
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

    </div>
  );
};
