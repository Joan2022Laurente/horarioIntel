'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  Sparkles, 
  Clock, 
  Plus, 
  ChevronRight, 
  Check, 
  Send,
  Loader2,
  UserCheck,
  Search,
  BookOpen
} from 'lucide-react';
import { StudyBeaconRow, StudyBuddyMatch } from '@/types/matching';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';
import { 
  fetchActiveBeacons, 
  createBeaconInDb, 
  joinBeaconInDb 
} from '@/lib/supabase/networking-service';
import { INITIAL_STUDY_BUDDY_MATCHES } from '@/lib/networking/study-buddy-data';
import { StudyBuddyCard } from './StudyBuddyCard';
import { DirectConnectModal } from './DirectConnectModal';
import { PersonalBeaconCard } from './PersonalBeaconCard';
import { formatCourseName } from '@/lib/schedule-parser';
import { ScrollablePillTabs, PillTabItem } from '@/components/ui/ScrollablePillTabs';

interface CampusNetworkingViewProps {
  courses: ProcessedCourse[];
  interval: UTPCurrentInterval;
  student?: StudentProfile;
}

export const CampusNetworkingView: React.FC<CampusNetworkingViewProps> = ({
  courses,
  interval: _interval,
  student,
}) => {
  const { executeIntent, askAgent } = useAgent();
  const [activeTab, setActiveTab] = useState<'buddies' | 'beacons'>('buddies');
  
  // State for 1-on-1 Matches
  const [buddies] = useState<StudyBuddyMatch[]>(INITIAL_STUDY_BUDDY_MATCHES);
  
  // State for Group Beacons
  const [beacons, setBeacons] = useState<StudyBeaconRow[]>([]);
  const [isLoadingBeacons, setIsLoadingBeacons] = useState(true);
  const [isCreatingBeacon, setIsCreatingBeacon] = useState(false);
  const [isSubmittingBeacon, setIsSubmittingBeacon] = useState(false);
  
  // Beacon Form State
  const [beaconLocation, setBeaconLocation] = useState('');
  const [beaconObjective, setBeaconObjective] = useState('');
  const [beaconCourse, setBeaconCourse] = useState(courses[0]?.name || 'Desarrollo Web Integrado');
  const [joinedBeaconIds, setJoinedBeaconIds] = useState<string[]>([]);

  // Filter States
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedModalityFilter, setSelectedModalityFilter] = useState<'ALL' | 'Presencial' | 'Virtual'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Direct Handshake Modal State
  const [connectTarget, setConnectTarget] = useState<StudyBuddyMatch | StudyBeaconRow | null>(null);

  useEffect(() => {
    async function loadBeacons() {
      setIsLoadingBeacons(true);
      const data = await fetchActiveBeacons();
      setBeacons(data);
      setIsLoadingBeacons(false);
    }
    loadBeacons();
  }, []);

  const handleJoinBeacon = async (beacon: StudyBeaconRow) => {
    if (joinedBeaconIds.includes(beacon.id)) {
      setConnectTarget(beacon);
      return;
    }

    setJoinedBeaconIds(prev => [...prev, beacon.id]);
    setBeacons(prev => prev.map(b => {
      if (b.id === beacon.id && b.current_collaborators < b.max_collaborators) {
        return { ...b, current_collaborators: b.current_collaborators + 1 };
      }
      return b;
    }));

    setConnectTarget(beacon);
    await joinBeaconInDb(beacon.id);
  };

  const handleCreateBeacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beaconLocation.trim() || !beaconObjective.trim()) return;

    const studentName = student?.name || 'Estudiante UTP';
    const studentCode = student?.username || 'U23307609';
    const studentCareer = student?.career || 'Ingeniería de Sistemas e Informática';
    const studentCampus = student?.campus || 'Lima Centro';

    setIsSubmittingBeacon(true);
    const created = await createBeaconInDb({
      hostName: studentName,
      hostCode: studentCode,
      hostCareer: studentCareer,
      courseId: beaconCourse,
      courseName: beaconCourse,
      locationName: beaconLocation.trim(),
      objective: beaconObjective.trim(),
      maxCollaborators: 4,
    });

    if (created) {
      setBeacons(prev => [created, ...prev]);
    } else {
      const localBeacon: StudyBeaconRow = {
        id: `bcn-${Date.now()}`,
        host_id: 'me',
        host: {
          id: 'me',
          student_code: studentCode,
          full_name: `${studentName} (Tú)`,
          email: student?.email || 'yo@utp.edu.pe',
          career: studentCareer,
          campus: studentCampus,
          cycle: 7,
          reputation_score: 100,
          created_at: '',
          updated_at: '',
        },
        course_id: beaconCourse,
        location_name: beaconLocation,
        objective: beaconObjective,
        max_collaborators: 4,
        current_collaborators: 1,
        status: 'ACTIVE',
        expires_at: new Date(Date.now() + 60 * 60000).toISOString(),
        created_at: new Date().toISOString(),
      };
      setBeacons(prev => [localBeacon, ...prev]);
    }

    setIsSubmittingBeacon(false);
    setIsCreatingBeacon(false);
    setBeaconLocation('');
    setBeaconObjective('');
    setActiveTab('beacons');
  };

  // Filter 1-on-1 Matches
  const filteredBuddies = useMemo(() => {
    return buddies.filter(b => {
      const matchesCourse = selectedCourseFilter === 'ALL' || b.courseName.toLowerCase().includes(selectedCourseFilter.toLowerCase());
      const matchesModality = selectedModalityFilter === 'ALL' || b.modality === selectedModalityFilter;
      const matchesSearch = !searchQuery.trim() || 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.currentGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.locationPreference.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesModality && matchesSearch;
    });
  }, [buddies, selectedCourseFilter, selectedModalityFilter, searchQuery]);

  // Filter Group Beacons
  const filteredBeacons = useMemo(() => {
    return beacons.filter(b => {
      const course = b.course_id || '';
      const matchesCourse = selectedCourseFilter === 'ALL' || course.toLowerCase().includes(selectedCourseFilter.toLowerCase());
      const matchesSearch = !searchQuery.trim() || 
        b.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.host?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesSearch;
    });
  }, [beacons, selectedCourseFilter, searchQuery]);

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Networking & Compañeros de Estudio
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Emparejamiento 1 a 1 por huecos libres en común, asignaturas matriculadas y mesas de estudio en campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => executeIntent({ type: 'FIND_NETWORKING_BEACON' })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white transition active:scale-95 shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
            <span>Match con IA</span>
          </button>

          <button
            onClick={() => setIsCreatingBeacon(!isCreatingBeacon)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-emerald)] hover:bg-[var(--accent-emerald-hover)] px-4 py-2 text-xs font-bold text-black transition active:scale-95 shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreatingBeacon ? 'Cancelar' : 'Crear Mesa Grupal'}</span>
          </button>
        </div>
      </div>

      {/* Widget: Mi Radar y Disponibilidad Personal (Flat seamless strip) */}
      <PersonalBeaconCard 
        courses={courses} 
        onAskAi={askAgent} 
      />

      {/* Formulario para Crear Mesa de Estudio Grupal */}
      {isCreatingBeacon && (
        <form onSubmit={handleCreateBeacon} className="rounded-3xl bg-[var(--surface-card)] p-5 space-y-4 shadow-none animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--accent-emerald)] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Nueva Mesa de Estudio / Co-Working</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">Duración estimada: 60 - 90 min</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Ubicación / Sala física o Discord:</label>
              <input 
                type="text" 
                value={beaconLocation}
                onChange={e => setBeaconLocation(e.target.value)}
                placeholder="Ej: Biblioteca Torre A - Piso 3 o Discord Sala 2"
                required
                className="w-full bg-[var(--surface-input)] rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Asignatura:</label>
              <select 
                value={beaconCourse}
                onChange={e => setBeaconCourse(e.target.value)}
                className="w-full bg-[var(--surface-input)] rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.courseId} value={c.name}>{formatCourseName(c.name)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-400 font-semibold">Meta de la sesión grupal:</label>
            <input 
              type="text" 
              value={beaconObjective}
              onChange={e => setBeaconObjective(e.target.value)}
              placeholder="Ej: Avanzar entrega APF1 y resolver dudas de código"
              required
              className="w-full bg-[var(--surface-input)] rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmittingBeacon}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-emerald)] px-5 py-2 text-xs font-bold text-black hover:bg-[var(--accent-emerald-hover)] transition active:scale-95 shadow-none disabled:opacity-50"
            >
              {isSubmittingBeacon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>{isSubmittingBeacon ? 'Guardando...' : 'Publicar Mesa'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros & Selector de Modos (Flat seamlessly integrated) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--surface-card)]">
        
        {/* Toggle de Modos: Parejas 1 a 1 vs Mesas Grupales */}
        <ScrollablePillTabs<'buddies' | 'beacons'>
          tabs={[
            {
              value: 'buddies',
              label: 'Match 1 a 1',
              count: filteredBuddies.length,
              icon: <UserCheck className="h-3.5 w-3.5" />,
            },
            {
              value: 'beacons',
              label: 'Mesas Grupales',
              count: filteredBeacons.length,
              icon: <Users className="h-3.5 w-3.5" />,
              activeColor: 'var(--accent-emerald)',
              activeText: '#000',
            },
          ]}
          activeValue={activeTab}
          onSelect={setActiveTab}
          variant="segmented"
        />

        {/* Controles de Filtro: Asignatura + Modalidad + Búsqueda */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Selector de Asignatura */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            aria-label="Filtrar por curso"
            className="bg-[var(--surface-input)] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las asignaturas</option>
            {courses.map(c => (
              <option key={c.courseId} value={c.name}>{formatCourseName(c.name)}</option>
            ))}
          </select>

          {/* Selector de Entorno */}
          <select
            value={selectedModalityFilter}
            onChange={(e) => setSelectedModalityFilter(e.target.value as any)}
            aria-label="Filtrar por entorno"
            className="bg-[var(--surface-input)] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">Presencial & Virtual</option>
            <option value="Presencial">Solo Campus Físico</option>
            <option value="Virtual">Solo Discord / Virtual</option>
          </select>

          {/* Búsqueda rápida */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema o skill..."
              className="bg-[var(--surface-input)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none w-36 sm:w-44"
            />
          </div>

        </div>

      </div>

      {/* Contenido Principal: Tab 1 - Match 1 a 1 (Study Buddies) */}
      {activeTab === 'buddies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Compañeros compatibles con ventanas libres hoy y asignaturas compartidas:
            </p>
            <span className="text-xs font-mono text-neutral-500">
              {filteredBuddies.length} {filteredBuddies.length === 1 ? 'coincidencia' : 'coincidencias'}
            </span>
          </div>

          {filteredBuddies.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-card)] space-y-2">
              <UserCheck className="h-8 w-8 mx-auto text-neutral-600" />
              <p className="text-sm font-bold text-white">No se encontraron compañeros con los filtros seleccionados</p>
              <p className="text-xs text-neutral-400">Prueba cambiando la asignatura o el entorno para ver más opciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBuddies.map((buddy) => (
                <StudyBuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  onConnect={(target) => setConnectTarget(target)}
                  onAskAi={askAgent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido Principal: Tab 2 - Mesas de Estudio Grupales */}
      {activeTab === 'beacons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Mesas de co-working activas en biblioteca y salas virtuales de Discord:
            </p>
            <span className="text-xs font-mono text-neutral-500">
              {filteredBeacons.length} {filteredBeacons.length === 1 ? 'mesa activa' : 'mesas activas'}
            </span>
          </div>

          {isLoadingBeacons ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-emerald)]" />
              <p className="text-xs">Cargando mesas de estudio en vivo...</p>
            </div>
          ) : filteredBeacons.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-card)] space-y-2">
              <Users className="h-8 w-8 mx-auto text-neutral-600" />
              <p className="text-sm font-bold text-white">No hay mesas grupales abiertas con este filtro</p>
              <p className="text-xs text-neutral-400">¡Sé el primero en abrir una mesa con el botón &ldquo;Crear Mesa Grupal&rdquo;!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBeacons.map((b) => {
                const isJoined = joinedBeaconIds.includes(b.id);
                const isFull = b.current_collaborators >= b.max_collaborators;

                return (
                  <div 
                    key={b.id}
                    className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] p-5 space-y-4 shadow-none transition-colors group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--badge-emerald-text)] bg-[var(--badge-emerald-bg)] px-2.5 py-0.5 rounded-full">
                          <span>● En Vivo</span>
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          60m restantes
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-[var(--accent-emerald)] transition-colors">
                          {b.objective}
                        </h4>
                        
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                          <span className="flex items-center gap-1 text-white font-medium">
                            <BookOpen className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
                            {formatCourseName(b.course_id || 'Estudio General')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-neutral-300">
                            <MapPin className="h-3.5 w-3.5 text-[var(--accent-orange)] shrink-0" />
                            {b.location_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-xs font-bold text-white">
                          {b.host?.full_name.charAt(0) || 'U'}
                        </div>
                        <div className="text-[11px]">
                          <p className="font-bold text-white leading-tight">{b.host?.full_name || 'Compañero UTP'}</p>
                          <p className="text-neutral-500 font-mono">{b.current_collaborators}/{b.max_collaborators} alumnos</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinBeacon(b)}
                        disabled={isFull && !isJoined}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-none ${
                          isJoined
                            ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)]'
                            : isFull
                            ? 'bg-[var(--surface-muted)] text-neutral-500 cursor-not-allowed'
                            : 'bg-white hover:bg-neutral-200 text-black'
                        }`}
                      >
                        {isJoined ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Unido • Ver Contacto</span>
                          </>
                        ) : isFull ? (
                          <span>Mesa Llena</span>
                        ) : (
                          <>
                            <span>Unirme a la Mesa</span>
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
      )}

      {/* Modal de Conexión Directa y Handshake (WhatsApp / Meet / In-App) */}
      <DirectConnectModal
        isOpen={!!connectTarget}
        onClose={() => setConnectTarget(null)}
        matchTarget={connectTarget}
      />

    </div>
  );
};
