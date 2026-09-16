'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Lock, 
  CreditCard 
} from 'lucide-react';
import { AcademicServiceRow } from '@/types/economy';
import { ProcessedCourse } from '@/types/utp';

interface AcademicMarketplaceProps {
  courses: ProcessedCourse[];
  onAskAi: (prompt: string) => void;
}

const INITIAL_SERVICES: AcademicServiceRow[] = [
  {
    id: 'srv-1',
    mentor_id: 'usr-10',
    mentor: {
      id: 'usr-10',
      student_code: 'U18204910',
      full_name: 'David Zevallos',
      email: 'dzevallos@utp.edu.pe',
      career: 'Ing. de Software (10mo Ciclo)',
      campus: 'Campus Digital',
      cycle: 10,
      reputation_score: 210,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000ST61',
    title: 'Simulacro de Sustentación APF1 y Auditoría de Código React',
    description: 'Revisión exhaustiva de tu arquitectura de componentes, cumplimiento de rúbrica y simulación de preguntas típicas del docente.',
    service_type: 'MOCK_DEFENSE',
    price_cents: 2000, // S/ 20.00
    duration_minutes: 45,
    is_active: true,
    rating_avg: 4.95,
    total_reviews: 18,
    created_at: '',
  },
  {
    id: 'srv-2',
    mentor_id: 'usr-11',
    mentor: {
      id: 'usr-11',
      student_code: 'U19304812',
      full_name: 'Camila Salazar',
      email: 'csalazar@utp.edu.pe',
      career: 'Ing. de Sistemas (9no Ciclo)',
      campus: 'Torre Arequipa',
      cycle: 9,
      reputation_score: 195,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000SI12',
    title: 'Asesoría 1 a 1 para PC1 de Gestión del Servicio TI (ITIL 4)',
    description: 'Resolución de casos de estudio, formulación de SLAs, métricas de incidentes y problemas con garantía de comprensión.',
    service_type: 'TUTORING_1ON1',
    price_cents: 1500, // S/ 15.00
    duration_minutes: 40,
    is_active: true,
    rating_avg: 5.0,
    total_reviews: 24,
    created_at: '',
  },
  {
    id: 'srv-3',
    mentor_id: 'usr-12',
    mentor: {
      id: 'usr-12',
      student_code: 'U20104822',
      full_name: 'Jorge Huamán',
      email: 'jhuaman@utp.edu.pe',
      career: 'Ciencias de la Computación',
      campus: 'Campus Digital',
      cycle: 8,
      reputation_score: 170,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000ST62',
    title: 'Configuración de Laboratorios Cloud AWS & Docker',
    description: 'Te ayudo a levantar y configurar tu VPC, EC2, contenedores y pipelines sin errores para tus entregables de Servicios Cloud.',
    service_type: 'CODE_REVIEW',
    price_cents: 2500, // S/ 25.00
    duration_minutes: 50,
    is_active: true,
    rating_avg: 4.9,
    total_reviews: 12,
    created_at: '',
  }
];

export const AcademicMarketplace: React.FC<AcademicMarketplaceProps> = ({
  courses: _courses,
  onAskAi,
}) => {
  const [services] = useState<AcademicServiceRow[]>(INITIAL_SERVICES);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [walletBalance] = useState<number>(0); // En centavos
  const [lockedEscrow] = useState<number>(0);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<AcademicServiceRow | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrderService = (srv: AcademicServiceRow) => {
    setSelectedServiceForOrder(srv);
    setOrderSuccess(false);
  };

  const handleConfirmOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setSelectedServiceForOrder(null);
      setOrderSuccess(false);
    }, 2500);
  };

  const filteredServices = selectedType === 'ALL'
    ? services
    : services.filter(s => s.service_type === selectedType);

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Marketplace Académico & Mentorías
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Contrata asesorías 1 a 1, simulacros de sustentación y auditorías de código con garantía Escrow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAi('¿Cómo puedo ofrecer mis propios servicios de mentoría o asesoría académica en la plataforma?')}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] px-4 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Ofrecer Servicio</span>
          </button>
        </div>
      </div>

      {/* Wallet Card - Solid Matte Surfaces */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 shadow-none flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)]" />
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">Billetera Estudiantil (Escrow)</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">UTP Pay ID: #WAL-9021</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">S/ {(walletBalance / 100).toFixed(2)}</span>
            <span className="text-xs font-semibold text-neutral-400">PEN disponibles</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[var(--accent-yellow)]" />
              <span>En garantía (Escrow): S/ {(lockedEscrow / 100).toFixed(2)}</span>
            </span>
            <span className="text-[var(--badge-emerald-text)] font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Protección 100%
            </span>
          </div>
        </div>

        {/* Retiro Yape / Plin */}
        <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 shadow-none flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-[var(--accent-orange)]" />
              <span>Retiros Inmediatos</span>
            </p>
            <p className="text-[11px] text-neutral-400">Retira tus ganancias directamente a tu cuenta:</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] text-[var(--badge-purple-text)] font-bold text-xs">
              Yape
            </div>
            <div className="px-3 py-1 rounded-xl bg-[var(--badge-cyan-bg)] border border-[var(--badge-cyan-border)] text-[var(--badge-cyan-text)] font-bold text-xs">
              Plin
            </div>
          </div>

          <button 
            onClick={() => onAskAi('¿Cuáles son los pasos para vincular mi cuenta de Yape/Plin y retirar mis ganancias?')}
            className="w-full py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-xs font-bold text-neutral-300 hover:text-white transition shadow-none"
          >
            Configurar Cobro
          </button>
        </div>
      </div>

      {/* Filtros de Tipos de Servicio */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar text-xs">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedType === 'ALL' 
              ? 'bg-white text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Todos los Servicios
        </button>
        <button
          onClick={() => setSelectedType('MOCK_DEFENSE')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedType === 'MOCK_DEFENSE' 
              ? 'bg-[var(--accent-orange)] text-white' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Simulacros de Sustentación
        </button>
        <button
          onClick={() => setSelectedType('TUTORING_1ON1')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedType === 'TUTORING_1ON1' 
              ? 'bg-[var(--accent-yellow)] text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Asesorías 1 a 1
        </button>
        <button
          onClick={() => setSelectedType('CODE_REVIEW')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedType === 'CODE_REVIEW' 
              ? 'bg-[var(--accent-emerald)] text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Revisión de Código & Labs
        </button>
      </div>

      {/* Grid de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] p-5 space-y-4 shadow-none transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-yellow-text)] bg-[var(--badge-yellow-bg)] border border-[var(--badge-yellow-border)] px-2.5 py-0.5 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  {srv.rating_avg} ({srv.total_reviews} reviews)
                </span>

                <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {srv.duration_minutes} min
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-yellow)] transition-colors leading-snug">
                  {srv.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                  {srv.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{srv.mentor?.full_name}</p>
                  <p className="text-[10px] text-neutral-400">{srv.mentor?.career}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[var(--accent-lime)]">S/ {(srv.price_cents / 100).toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={() => handleOrderService(srv)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--badge-yellow-bg)] hover:bg-[#382b0d] border border-[var(--badge-yellow-border)] py-2.5 text-xs font-bold text-[var(--badge-yellow-text)] hover:text-white transition active:scale-95 shadow-none"
              >
                <span>Solicitar Asesoría</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación Escrow */}
      {selectedServiceForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[var(--surface-card)] border border-[var(--border-strong)] p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--accent-yellow)] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Garantía de Pago Escrow</span>
              </span>
              <button 
                onClick={() => setSelectedServiceForOrder(null)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="h-12 w-12 text-[var(--accent-emerald)] mx-auto" />
                <h3 className="text-base font-bold text-white">¡Sesión Solicitada con Éxito!</h3>
                <p className="text-xs text-neutral-400">
                  Los fondos están protegidos en Escrow. Se liberarán una vez finalices la sesión con tu mentor.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{selectedServiceForOrder.title}</h3>
                  <p className="text-xs text-neutral-400">Mentor: <strong className="text-white">{selectedServiceForOrder.mentor?.full_name}</strong> ({selectedServiceForOrder.mentor?.career})</p>
                </div>

                <div className="rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Monto del servicio:</span>
                    <span className="font-bold text-white">S/ {(selectedServiceForOrder.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Duración estimada:</span>
                    <span className="font-bold text-white">{selectedServiceForOrder.duration_minutes} minutos</span>
                  </div>
                  <div className="flex justify-between text-[var(--badge-emerald-text)] font-semibold pt-1 border-t border-[var(--border-subtle)]">
                    <span>Comisión de protección:</span>
                    <span>S/ 0.00 (Gratis)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedServiceForOrder(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-xs font-bold text-neutral-300 hover:text-white transition shadow-none"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] text-xs font-black text-black transition active:scale-95 shadow-none"
                  >
                    Confirmar con Yape
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
