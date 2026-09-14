'use client';

import React from 'react';
import { UTPCurrentInterval } from '@/types/utp';

interface ChunkyHeroDockProps {
  interval: UTPCurrentInterval;
  activeTab: 'today' | 'weekly' | 'courses' | 'ai';
  onSelectTab: (tab: 'today' | 'weekly' | 'courses' | 'ai') => void;
  onOpenAi: (prompt?: string) => void;
  onOpenSyllabusModal: () => void;
}

export const ChunkyHeroDock: React.FC<ChunkyHeroDockProps> = ({
  interval,
  activeTab,
  onSelectTab,
  onOpenAi,
  onOpenSyllabusModal,
}) => {
  const currentWeek = interval.week_number || 5;

  return (
    <section className="relative w-full pt-6 pb-12 sm:pb-16 flex flex-col items-center justify-center text-center select-none overflow-hidden">
      
      {/* 1. Ultra-Bold Hero Title */}
      <div className="max-w-4xl px-4 space-y-4">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white leading-[0.92]">
          Tu ciclo UTP,<br />
          bajo control.
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium tracking-normal max-w-lg mx-auto">
          Horarios en vivo, entregables con consigna oficial y cálculo de notas en tiempo real
        </p>
      </div>

      {/* 2. The 5 Iconic Chunky Geometric Shapes (Adapted for academic and UTP functionality) */}
      <div className="w-full max-w-4xl px-4 mt-10 sm:mt-14">
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 flex-wrap md:flex-nowrap">
          
          {/* Shape 1: Periwinkle Purple Circle -> HORARIO SEMANAL */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onSelectTab('weekly')}
              title="Ver Horario Semanal Completo"
              className={`group relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-[#7678ed] hover:bg-[#6c6fe6] shadow-xl transition-all duration-200 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shrink-0 ${
                activeTab === 'weekly' ? 'ring-4 ring-white/30' : ''
              }`}
            >
              {/* Bold Black Icon: Chunky Calendar Schedule Grid */}
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current group-hover:rotate-6 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M19 4h-1V2h-3v2H9V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h3v3H7zm5 0h5v3h-5zm-5 4h3v3H7zm5 0h5v3h-5z" />
              </svg>
              <span className="sr-only">Horario Semanal</span>
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Horario
            </span>
          </div>

          {/* Shape 2: Emerald Green Squircle -> TAREAS & RÚBRICAS */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onSelectTab('today')}
              title="Ver Tareas y Entregables de Semana 5"
              className={`group relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-[28px] sm:rounded-[36px] md:rounded-[42px] bg-[#00c853] hover:bg-[#00b047] shadow-xl transition-all duration-200 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shrink-0 ${
                activeTab === 'today' ? 'ring-4 ring-white/30' : ''
              }`}
            >
              {/* Bold Black Icon: Task Checklist / Checkmark Shield */}
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.3 13.7L6.3 12.3l1.4-1.4 3 3 7-7 1.4 1.4-8.4 8.4z" />
              </svg>
              <span className="sr-only">Tareas & Rúbricas</span>
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Entregables
            </span>
          </div>

          {/* Shape 3: Coral-Orange Arrow/Tag -> COPILOTO IA ACADÉMICO */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onOpenAi(`¿Qué temas y entregables tengo programados para la Semana ${currentWeek} en mis cursos?`)}
              title="Consultar Copiloto Académico IA"
              className="group relative flex items-center justify-center w-28 h-24 sm:w-36 sm:h-32 md:w-44 md:h-36 rounded-[28px] sm:rounded-[36px] md:rounded-[42px] rounded-r-[52px] sm:rounded-r-[68px] md:rounded-r-[80px] bg-[#ff5722] hover:bg-[#f44710] shadow-2xl transition-all duration-200 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shrink-0 z-10"
            >
              {/* Bold Black Icon: Neo-Brutalist AI Bot Assistant */}
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a2 2 0 0 1 2 2c0 .7-.4 1.4-1 1.7V7h4a3 3 0 0 1 3 3v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7a3 3 0 0 1 3-3h4V5.7A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-4.5 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7.5 7h6a1 1 0 1 0 0-2H9a1 1 0 1 0 0 2z" />
              </svg>
              <span className="sr-only">Copiloto IA</span>
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#ff5722]">
              Copiloto IA
            </span>
          </div>

          {/* Shape 4: Vibrant Yellow Squircle -> SÍLABOS & FÓRMULAS */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onOpenSyllabusModal}
              title="Abrir Sílabos Oficiales y Fórmulas Ponderadas"
              className="group relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-[28px] sm:rounded-[36px] md:rounded-[42px] bg-[#ffb703] hover:bg-[#f0a800] shadow-xl transition-all duration-200 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shrink-0"
            >
              {/* Bold Black Icon: Academic Graduation Cap / Mortarboard */}
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5.5 13v4.2c0 2.2 2.9 4 6.5 4s6.5-1.8 6.5-4V13L12 16.5z" />
              </svg>
              <span className="sr-only">Sílabos & Fórmulas</span>
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Sílabos
            </span>
          </div>

          {/* Shape 5: Royal Blue Circle -> CLASES ZOOM & EN VIVO */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onSelectTab('courses')}
              title="Ver Cursos y Enlaces de Sesiones en Vivo"
              className={`group relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-[#3a86ff] hover:bg-[#2873eb] shadow-xl transition-all duration-200 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shrink-0 ${
                activeTab === 'courses' ? 'ring-4 ring-white/30' : ''
              }`}
            >
              {/* Bold Black Icon: Live Zoom Video Camera */}
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current group-hover:-rotate-6 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M16 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2.5l5 4v-11l-5 4V8c0-1.1-.9-2-2-2zm-3 7H7v-2h6v2z" />
              </svg>
              <span className="sr-only">Cursos y Sesiones</span>
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Cursos
            </span>
          </div>

        </div>
      </div>

    </section>
  );
};
