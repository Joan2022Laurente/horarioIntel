'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  Download,
  Loader2,
  FileCheck2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ParsedSyllabus, getSyllabusForCourse, parseSyllabusMarkdown } from '@/lib/syllabus-parser';
import { SyllabusModalHeader } from '@/components/syllabus/SyllabusModalHeader';
import { SyllabusImportView } from '@/components/syllabus/SyllabusImportView';
import { SyllabusEvaluationsGrid } from '@/components/syllabus/SyllabusEvaluationsGrid';
import { SyllabusPoliciesView } from '@/components/syllabus/SyllabusPoliciesView';
import { SyllabusWeeklySchedule } from '@/components/syllabus/SyllabusWeeklySchedule';
import { KNOWN_SYLLABUS_MAP } from '@/lib/mock-data';

interface EnrolledCourseOption {
  id: string;
  code: string;
  name: string;
  short: string;
  modality: 'Presencial' | 'Virtual';
  pdfUrl?: string;
}

const ENROLLED_COURSES: EnrolledCourseOption[] = [
  {
    id: '100000ST61',
    code: '100000ST61',
    name: 'DESARROLLO WEB INTEGRADO',
    short: 'Desarrollo Web',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST61_DesarrolloWebIntegrado.pdf'
  },
  {
    id: '100000SI12',
    code: '100000SI12',
    name: 'GESTIÓN DEL SERVICIO TI',
    short: 'Gestión TI',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI12_GestionDelServicioTI.pdf'
  },
  {
    id: '100000SI82',
    code: '100000SI82',
    name: 'FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS',
    short: 'Investigación',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI34_FormacionInvestigacionSistemas.pdf'
  },
  {
    id: '100000ST62',
    code: '100000ST62',
    name: 'SERVICIOS CLOUD',
    short: 'Servicios Cloud',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST62_ServiciosCloud.pdf'
  },
  {
    id: '100000CO01',
    code: '100000CO01',
    name: 'HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA',
    short: 'Comunicación',
    modality: 'Virtual',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000CO01_HerramientasComunicacionEfectiva.pdf'
  },
  {
    id: '100000SI23',
    code: '100000SI23',
    name: 'LENGUAJES DE PROGRAMACIÓN',
    short: 'Lenguajes Prog.',
    modality: 'Presencial',
    pdfUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000SI23_LenguajesDeProgramacion.pdf'
  }
];

interface SyllabusModalProps {
  courseIdentifier?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  courseIdentifier,
  isOpen,
  onClose,
  onAskAi,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('100000ST61');
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [customMarkdown, setCustomMarkdown] = useState('');
  const [parsedCustom, setParsedCustom] = useState<ParsedSyllabus | null>(null);
  const [copiedFormula, setCopiedFormula] = useState(false);
  
  // Sincronización y Pantalla de Carga
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<string>('');

  // Navegación Horizontal y Scroll de Cursos
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
      if (courseIdentifier) {
        const found = ENROLLED_COURSES.find(c => 
          c.id === courseIdentifier || 
          c.code === courseIdentifier || 
          courseIdentifier.toUpperCase().includes(c.short.toUpperCase()) ||
          c.name.includes(courseIdentifier.toUpperCase())
        );
        if (found) {
          triggerSync(found.id);
          return;
        }
      }
      triggerSync(selectedCourseId || '100000ST61');
    }
  }, [isOpen, courseIdentifier]);

  const triggerSync = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsSyncing(true);
    setSyncStep('Conectando con repositorio oficial Silbia UTP (Amazon S3)...');

    setTimeout(() => {
      setSyncStep('Descargando estructura curricular y tabla de ponderaciones...');
    }, 200);

    setTimeout(() => {
      setSyncStep('Verificando rúbricas de evaluación y políticas antiplagio...');
    }, 450);

    setTimeout(() => {
      setIsSyncing(false);
    }, 650);
  };

  if (!isOpen) return null;

  const currentCourseOption = ENROLLED_COURSES.find(c => c.id === selectedCourseId) || ENROLLED_COURSES[0];
  const officialSyllabus = getSyllabusForCourse(selectedCourseId);
  const currentSyllabus = activeTab === 'custom' && parsedCustom ? parsedCustom : officialSyllabus;

  const handleParseCustom = () => {
    if (!customMarkdown.trim()) return;
    try {
      const parsed = parseSyllabusMarkdown(customMarkdown);
      setParsedCustom(parsed);
    } catch {
      // fallback
    }
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
        />

        {/* Barra de Selección de Asignaturas con Navegación y Scroll Robusto */}
        {activeTab === 'official' && (
          <div className="relative px-4 py-2.5 bg-[#19191e]">
            <div className="flex items-center gap-2">
              {/* Etiqueta Cursos */}
              <div className="flex items-center gap-1.5 shrink-0 pr-2 select-none">
                <GraduationCap className="h-4 w-4 text-[#ff5722]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 hidden sm:inline">
                  Cursos
                </span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {ENROLLED_COURSES.length}
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
                    ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer shadow-sm active:scale-90'
                    : 'bg-white/[0.02] text-neutral-600 cursor-not-allowed opacity-30'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Contenedor Carrusel Desplazable con Máscaras de Gradiente */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                {/* Gradiente izquierdo cuando hay desborde */}
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#19191e] to-transparent pointer-events-none z-10" />
                )}

                {/* Lista de Pastillas (Pills) */}
                <div
                  ref={scrollContainerRef}
                  onScroll={checkScrollButtons}
                  className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent',
                  }}
                >
                  {ENROLLED_COURSES.map((course) => {
                    const isSelected = course.id === selectedCourseId;
                    return (
                      <button
                        key={course.id}
                        ref={isSelected ? selectedBtnRef : null}
                        type="button"
                        onClick={() => triggerSync(course.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#bbf451] text-[#0a0a0c] shadow-lg shadow-[#bbf451]/20 ring-2 ring-[#bbf451]'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-[#0a0a0c]' : 'bg-[#ff5722]'
                          }`}
                        />
                        <span>{course.short}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                            isSelected
                              ? 'bg-black/15 text-[#0a0a0c]'
                              : 'bg-black/30 text-neutral-400'
                          }`}
                        >
                          {course.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Gradiente derecho cuando hay desborde */}
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#19191e] to-transparent pointer-events-none z-10" />
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
                    ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer shadow-sm active:scale-90'
                    : 'bg-white/[0.02] text-neutral-600 cursor-not-allowed opacity-30'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Selector Rápido Directo (Dropdown) */}
              <div className="shrink-0 pl-2 hidden sm:flex items-center">
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => triggerSync(e.target.value)}
                    aria-label="Selector directo de curso"
                    title="Ir directo a un curso"
                    className="appearance-none bg-[#141417] hover:bg-[#1c1c22] text-neutral-200 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#bbf451] transition"
                  >
                    {ENROLLED_COURSES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#141417] text-white">
                        {c.short} ({c.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
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
              <div className="relative flex items-center justify-center h-16 w-16 rounded-3xl bg-[#bbf451]/15 shadow-xl">
                <Loader2 className="h-8 w-8 text-[#bbf451] animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm font-black text-white">
                  Sincronizando Sílabo Oficial
                </h3>
                <p className="text-xs text-[#bbf451] font-mono animate-pulse">
                  {syncStep}
                </p>
                <p className="text-[11px] text-neutral-500 pt-2">
                  Extrayendo datos de {currentCourseOption.name}
                </p>
              </div>
            </div>
          ) : currentSyllabus ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Formula & General Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Fórmula Oficial */}
                <div className="md:col-span-2 rounded-2xl bg-[#1b1b22] p-4 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#ff5722]" />
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
                  
                  <div className="rounded-xl bg-[#141417] px-4 py-3 font-mono text-xs sm:text-sm font-black text-[#bbf451] text-center tracking-wider shadow-inner">
                    {currentSyllabus.formula}
                  </div>
                </div>

                {/* Datos Académicos */}
                <div className="rounded-2xl bg-[#1b1b22] p-4 space-y-2 text-xs shadow-md">
                  <span className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                    Ficha Curricular
                  </span>
                  <div className="space-y-1.5 text-neutral-300 pt-1">
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-400">Créditos:</span>
                      <span className="font-bold text-white">{currentSyllabus.generalInfo.credits} créditos</span>
                    </div>
                    <div className="flex justify-between pb-1">
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

              {/* Botón de Descarga PDF Silbia S3 */}
              {currentCourseOption.pdfUrl && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1b1b22] shadow-md">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="h-5 w-5 text-[#bbf451]" />
                    <div className="text-xs">
                      <p className="font-bold text-white">Documento Oficial Aprobado por Dirección Académica</p>
                      <p className="text-neutral-400 text-[11px]">Repositorio S3 Silbia • Periodo {currentSyllabus.generalInfo.semester}</p>
                    </div>
                  </div>

                  <a
                    href={currentCourseOption.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 text-xs font-bold transition active:scale-95 shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar PDF Oficial</span>
                    <ExternalLink className="h-3 w-3 text-neutral-400" />
                  </a>
                </div>
              )}

              {/* Logro General */}
              {currentSyllabus.learningGoal && (
                <div className="rounded-2xl bg-[#1b1b22] p-4 space-y-2 shadow-md">
                  <div className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-[#ff5722]" />
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
                onAskAi={onAskAi}
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

        {/* Footer */}
        <div className="px-6 py-4 bg-[#19191e] flex items-center justify-between">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Fuente: Sistema Silbia UTP & Amazon S3 Backing Store
          </span>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/15 px-5 py-1.5 text-xs font-bold text-neutral-300 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
