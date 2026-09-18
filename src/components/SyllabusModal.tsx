'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ParsedSyllabus, parseSyllabusMarkdown } from '@/lib/syllabus-parser';
import { getCachedSyllabus, saveCachedSyllabus } from '@/lib/syllabus/client-storage';
import { SyllabusModalHeader } from '@/components/syllabus/SyllabusModalHeader';
import { SyllabusImportView } from '@/components/syllabus/SyllabusImportView';
import { SyllabusEvaluationsGrid } from '@/components/syllabus/SyllabusEvaluationsGrid';
import { SyllabusPoliciesView } from '@/components/syllabus/SyllabusPoliciesView';
import { SyllabusWeeklySchedule } from '@/components/syllabus/SyllabusWeeklySchedule';
import { KNOWN_SYLLABUS_MAP } from '@/lib/mock-data';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';

interface EnrolledCourseOption {
  id: string;
  code: string;
  name: string;
  short: string;
  modality: 'Presencial' | 'Virtual';
  pdfUrl?: string;
}

const DEFAULT_ENROLLED_COURSES: EnrolledCourseOption[] = [
  {
    id: '100000ST61',
    code: '100000ST61',
    name: 'Desarrollo Web Integrado',
    short: 'Desarrollo Web',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST61_DesarrolloWebIntegrado.pdf'
  },
  {
    id: '100000SI12',
    code: '100000SI12',
    name: 'Gestión del Servicio TI',
    short: 'Gestión TI',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI12_GestionDelServicioTI.pdf'
  },
  {
    id: '100000SI82',
    code: '100000SI82',
    name: 'Formación para la Investigación - Sistemas',
    short: 'Investigación',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI34_FormacionInvestigacionSistemas.pdf'
  },
  {
    id: '100000SI97',
    code: '100000SI97',
    name: 'Servicios Cloud',
    short: 'Servicios Cloud',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST62_ServiciosCloud.pdf'
  },
  {
    id: '100000CO01',
    code: '100000CO01',
    name: 'Herramientas para la Comunicación Efectiva',
    short: 'Comunicación',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000CO01_HerramientasComunicacionEfectiva.pdf'
  },
  {
    id: '100000SI23',
    code: '100000SI23',
    name: 'Lenguajes de Programación',
    short: 'Lenguajes Prog.',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000SI23_LenguajesDeProgramacion.pdf'
  }
];

interface SyllabusModalProps {
  courseIdentifier?: string | null;
  courses?: ProcessedCourse[];
  interval?: UTPCurrentInterval;
  isOpen: boolean;
  onClose: () => void;
  onAskAi?: (prompt: string) => void;
}

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  courseIdentifier,
  courses,
  interval,
  isOpen,
  onClose,
  onAskAi,
}) => {
  const { askAgent } = useAgent();
  const handleAsk = onAskAi || askAgent;
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [customMarkdown, setCustomMarkdown] = useState('');
  const [parsedCustom, setParsedCustom] = useState<ParsedSyllabus | null>(null);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [dynamicSyllabusMap, setDynamicSyllabusMap] = useState<Record<string, ParsedSyllabus>>({});
  
  // Sincronización y Pantalla de Carga
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<string>('');

  // Navegación Horizontal y Scroll de Cursos
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Lista dinámica de cursos enrolled
  const enrolledCourses: EnrolledCourseOption[] = (courses && courses.length > 0)
    ? courses.map((c) => {
        const words = c.name.split(' ');
        const short = words.length <= 2 ? c.name : `${words[0]} ${words[1]}`;
        const known = KNOWN_SYLLABUS_MAP[c.courseId] || KNOWN_SYLLABUS_MAP[c.name];
        return {
          id: c.courseId || c.name,
          code: c.sectionCode ? `Sec. ${c.sectionCode}` : (c.courseId || 'UTP'),
          name: c.name,
          short,
          modality: c.modalities.includes('P') ? 'Presencial' : 'Virtual',
          pdfUrl: c.syllabusUrl || known?.syllabusUrl,
        };
      })
    : DEFAULT_ENROLLED_COURSES;

  const checkScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollButtons();

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScrollButtons();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [isOpen, activeTab]);

  // Centrar curso seleccionado automáticamente
  useEffect(() => {
    if (selectedBtnRef.current) {
      selectedBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    const timer = setTimeout(checkScrollButtons, 300);
    return () => clearTimeout(timer);
  }, [selectedCourseId, isOpen, activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = 240;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
    setTimeout(checkScrollButtons, 250);
  };

  // Resolver curso inicial al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const defaultId = enrolledCourses[0]?.id || '100000ST61';
      if (courseIdentifier) {
        const found = enrolledCourses.find(c => 
          c.id === courseIdentifier || 
          c.code === courseIdentifier || 
          courseIdentifier.toUpperCase().includes(c.short.toUpperCase()) ||
          c.name.toUpperCase().includes(courseIdentifier.toUpperCase()) ||
          courseIdentifier.toUpperCase().includes(c.name.toUpperCase())
        );
        if (found) {
          triggerSync(found.id);
          return;
        }
      }
      triggerSync(selectedCourseId || defaultId);
    }
  }, [isOpen, courseIdentifier, courses?.length]);

  const triggerSync = async (courseId: string) => {
    setSelectedCourseId(courseId);

    // Si ya está en memoria viva reactiva, no es necesario re-descargar
    if (dynamicSyllabusMap[courseId]) {
      return;
    }

    // Verificar en LocalStorage
    const cached = getCachedSyllabus(courseId);
    if (cached) {
      setDynamicSyllabusMap(prev => ({ ...prev, [courseId]: cached }));
      return;
    }

    const courseOpt = enrolledCourses.find(c => c.id === courseId || c.code === courseId || c.name === courseId);
    if (!courseOpt) return;

    setIsSyncing(true);
    setSyncStep('Conectando con repositorio oficial Silbia UTP...');

    try {
      let headers: Record<string, string> = {};
      try {
        const studentRaw = localStorage.getItem('utp_student_profile');
        if (studentRaw) {
          const profile = JSON.parse(studentRaw);
          if (profile.token) {
            headers = {
              'Authorization': `Bearer ${profile.token}`,
              'x-tenant-id': profile.tenantId || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40'
            };
          }
        }
      } catch {}

      setSyncStep('Descargando y extrayendo binario PDF del sílabo oficial...');

      const res = await fetch('/api/syllabus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl: courseOpt.pdfUrl,
          courseCode: courseOpt.code,
          courseName: courseOpt.name,
          headers
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.parsedSyllabus) {
          setSyncStep('Analizando ponderaciones, rúbricas y cronograma...');
          setDynamicSyllabusMap(prev => ({ ...prev, [courseId]: data.parsedSyllabus }));
          saveCachedSyllabus(courseId, data.parsedSyllabus);
          if (courseOpt.name) {
            saveCachedSyllabus(courseOpt.name, data.parsedSyllabus);
          }
        }
      }
    } catch (err) {
      console.warn('Error en sincronización viva de sílabo:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const currentCourseOption = enrolledCourses.find(c => c.id === selectedCourseId || c.name === selectedCourseId) || enrolledCourses[0];
  const officialSyllabus = dynamicSyllabusMap[selectedCourseId] || (currentCourseOption ? getCachedSyllabus(currentCourseOption.name) : null);
  const currentSyllabus = activeTab === 'custom' && parsedCustom ? parsedCustom : officialSyllabus;

  const handleParseCustom = () => {
    if (!customMarkdown.trim()) return;
    try {
      const parsed = parseSyllabusMarkdown(customMarkdown);
      setParsedCustom(parsed);
      if (selectedCourseId || parsed.generalInfo?.courseName) {
        const saveKey = selectedCourseId || parsed.generalInfo?.courseName || 'CUSTOM';
        saveCachedSyllabus(saveKey, parsed);
        setDynamicSyllabusMap(prev => ({ ...prev, [saveKey]: parsed }));
      }
    } catch {}
  };

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 text-white">
      <div 
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#141417] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <SyllabusModalHeader
          currentSyllabus={currentSyllabus}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onClose={onClose}
          pdfUrl={currentCourseOption?.pdfUrl}
        />

        {/* Barra de Selección de Asignaturas con Navegación Limpia */}
        {activeTab === 'official' && (
          <div className="relative px-4 sm:px-6 py-2 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              {/* Etiqueta Cursos */}
              <div className="flex items-center gap-1.5 shrink-0 pr-1 select-none">
                <GraduationCap className="h-4 w-4 text-[var(--accent-orange)]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 hidden sm:inline">
                  Cursos
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--surface-card)] text-neutral-400 border border-[var(--border-subtle)]">
                  {enrolledCourses.length}
                </span>
              </div>

              {/* Botón Flecha Izquierda */}
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Ver cursos anteriores"
                title="Desplazar a la izquierda"
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  canScrollLeft
                    ? 'bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] text-white cursor-pointer active:scale-90'
                    : 'bg-transparent text-neutral-600 cursor-not-allowed opacity-30'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Contenedor Carrusel Desplazable con Máscaras de Gradiente */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--surface-subtle)] to-transparent pointer-events-none z-10" />
                )}

                {/* Lista de Pastillas (Pills) */}
                <div
                  ref={scrollContainerRef}
                  onScroll={checkScrollButtons}
                  className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
                  style={{
                    scrollbarWidth: 'none',
                  }}
                >
                  {enrolledCourses.map((course) => {
                    const isSelected = course.id === selectedCourseId;
                    return (
                      <button
                        key={course.id}
                        ref={isSelected ? selectedBtnRef : null}
                        type="button"
                        onClick={() => triggerSync(course.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[var(--accent-lime)] text-[#0a0a0c]'
                            : 'bg-[var(--surface-card)] border border-[var(--border-subtle)] text-neutral-300 hover:text-white hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-[#0a0a0c]' : 'bg-[var(--accent-orange)]'
                          }`}
                        />
                        <span>{course.short}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                            isSelected
                              ? 'bg-[var(--surface-subtle)] text-[#0a0a0c]'
                              : 'bg-[var(--surface-subtle)] text-neutral-400'
                          }`}
                        >
                          {course.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--surface-subtle)] to-transparent pointer-events-none z-10" />
                )}
              </div>

              {/* Botón Flecha Derecha */}
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Ver siguientes cursos"
                title="Desplazar a la derecha"
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  canScrollRight
                    ? 'bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] text-white cursor-pointer active:scale-90'
                    : 'bg-transparent text-neutral-600 cursor-not-allowed opacity-30'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* Custom Parser Tab */}
          {activeTab === 'custom' && (
            <SyllabusImportView
              customMarkdown={customMarkdown}
              onMarkdownChange={setCustomMarkdown}
              onParse={handleParseCustom}
            />
          )}

          {/* Pantalla de Carga y Sincronización Automática */}
          {activeTab === 'official' && isSyncing ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-100">
              <div className="relative flex items-center justify-center h-16 w-16 rounded-3xl bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 shadow-none">
                <Loader2 className="h-8 w-8 text-[var(--accent-lime)] animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm font-black text-white">
                  Sincronizando Sílabo Oficial
                </h3>
                <p className="text-xs text-[var(--accent-lime)] font-mono animate-pulse">
                  {syncStep}
                </p>
                <p className="text-[11px] text-neutral-400 pt-1">
                  Extrayendo rúbricas de {currentCourseOption.name}
                </p>
              </div>
            </div>
          ) : currentSyllabus ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Formula & General Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Fórmula Oficial */}
                <div className="md:col-span-2 rounded-2xl bg-[#181820] border border-white/10 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[var(--accent-orange)]" />
                      <span>Fórmula Oficial de Evaluación</span>
                    </span>
                    <button
                      onClick={() => handleCopyFormula(currentSyllabus.formula)}
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition"
                    >
                      {copiedFormula ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedFormula ? 'Copiada' : 'Copiar'}</span>
                    </button>
                  </div>
                  
                  <div className="rounded-xl bg-[#0f0f14] border border-white/10 px-4 py-3 font-mono text-xs sm:text-sm font-bold text-[var(--accent-lime)] text-center tracking-wider">
                    {currentSyllabus.formula}
                  </div>
                </div>

                {/* Datos Académicos */}
                <div className="rounded-2xl bg-[#181820] border border-white/10 p-4 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Ficha Curricular
                  </span>
                  <div className="space-y-1.5 text-neutral-300 pt-1">
                    <div className="flex justify-between pb-1 border-b border-white/10">
                      <span className="text-neutral-400">Créditos:</span>
                      <span className="font-bold text-white">{currentSyllabus.generalInfo.credits} créditos</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-white/10">
                      <span className="text-neutral-400">Modalidad:</span>
                      <span className="font-bold text-emerald-400">{currentSyllabus.generalInfo.modality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Horas:</span>
                      <span className="font-bold text-white">{currentSyllabus.generalInfo.weeklyHours} hrs/sem</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logro General */}
              {currentSyllabus.learningGoal && (
                <div className="rounded-2xl bg-[#181820] border border-white/10 p-4 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[var(--accent-orange)]" />
                    <span>Logro General de Aprendizaje</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {currentSyllabus.learningGoal}
                  </p>
                </div>
              )}

              {/* Evaluation Breakdown Grid */}
              <SyllabusEvaluationsGrid
                evaluations={currentSyllabus.evaluations}
                courseName={currentSyllabus.generalInfo.courseName}
                onAskAi={handleAsk}
                onClose={onClose}
              />

              {/* Policies & Rules */}
              <SyllabusPoliciesView
                rules={currentSyllabus.rules}
                antiPlagiarismPolicy={currentSyllabus.antiPlagiarismPolicy}
              />

              {/* Weekly Schedule */}
              <SyllabusWeeklySchedule schedule={currentSyllabus.weeklySchedule} />

            </div>
          ) : (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <p className="text-sm font-semibold text-white">No se encontró el sílabo para este curso.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
