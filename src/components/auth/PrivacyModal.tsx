'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Database, 
  Key, 
  FileText, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0c0c10] border border-white/10 shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 flex items-center justify-center text-[var(--accent-lime)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Política de Privacidad y Seguridad
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] border border-[var(--accent-lime)]/20">
                  Transparencia 100%
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Compromiso de seguridad, tratamiento de datos y arquitectura Zero-Knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-neutral-300 text-xs leading-relaxed">
          
          {/* Banner de Garantía */}
          <div className="p-4 rounded-2xl bg-[var(--accent-lime)]/5 border border-[var(--accent-lime)]/20 flex items-start gap-3.5">
            <CheckCircle2 className="h-5 w-5 text-[var(--accent-lime)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-xs">Principio Fundamental de Cero Almacenamiento de Contraseñas</h3>
              <p className="text-[11px] text-neutral-400">
                Tu contraseña institucional <strong>nunca se almacena en ninguna base de datos ni archivo de registro</strong>. Se transmite en tiempo real por un túnel cifrado SSL/TLS 1.3 exclusivamente hacia el servicio oficial de autenticación de UTP para obtener un token de sesión.
              </p>
            </div>
          </div>

          {/* Sección 1: Cómo Funciona la Autenticación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Server className="h-4 w-4 text-[var(--accent-lime)]" />
              <span>1. Mecanismo de Autenticación Oficial UTP SSO</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="text-neutral-200 font-medium flex items-center gap-1.5 text-xs">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  Túnel Seguro de Validación
                </div>
                <p className="text-[11px] text-neutral-400">
                  Las credenciales ingresadas son enviadas mediante protocolo HTTPS directamente al servidor de identidad Keycloak de la universidad (<code className="text-white/80 bg-black/40 px-1 py-0.5 rounded text-[10px]">sso.utp.edu.pe</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="text-neutral-200 font-medium flex items-center gap-1.5 text-xs">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  Tokens JWT Efímeros
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tras una autenticación exitosa, UTP emite un token de acceso temporal (Bearer JWT) que expira automáticamente. La contraseña es descartada de la memoria de inmediato.
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: Datos que SÍ se Almacenan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Database className="h-4 w-4 text-[var(--accent-lime)]" />
              <span>2. Datos que Sincronizamos y su Finalidad</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <p className="text-[11px] text-neutral-400">
                Para brindarte una experiencia fluida y persistir tu horario y avances académicos sin pedirte credenciales a cada instante, se registran los siguientes datos públicos del perfil:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]"></span>
                  <span><strong>Código de Alumno</strong> (ej. U23307609)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]"></span>
                  <span><strong>Nombre Completo</strong> y Correo Institucional</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]"></span>
                  <span><strong>Carrera y Campus</strong> asignado</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]"></span>
                  <span><strong>Horario de Clases</strong> y Entregables</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Cifrado en el Navegador & Almacenamiento Local */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cpu className="h-4 w-4 text-[var(--accent-lime)]" />
              <span>3. Cifrado Local en el Navegador</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-[11px] text-neutral-400">
                Tu sesión en el navegador se resguarda en <code className="text-white/80 bg-black/40 px-1 py-0.5 rounded text-[10px]">localStorage</code> mediante cifrado de tokens. Al presionar <strong>Cerrar Sesión</strong> en la aplicación:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400 pl-1">
                <li>Todos los tokens y datos de sesión son purgados inmediatamente del almacenamiento de tu dispositivo.</li>
                <li>No quedan rastros de autenticación persistentes en tu navegador.</li>
              </ul>
            </div>
          </div>

          {/* Sección 4: Telemetría de IA y Límites Responsables */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Layers className="h-4 w-4 text-[var(--accent-lime)]" />
              <span>4. Asistente IA y Consumo Ético</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400">
              Para garantizar la disponibilidad y sostenibilidad de la plataforma para toda la comunidad estudiantil, el asistente de inteligencia artificial opera con un control de cuota de <strong>6 consultas diarias por estudiante</strong> (reiniciado a las 00:00 hrs). Ninguna de tus conversaciones se utiliza para entrenar modelos públicos externos.
            </div>
          </div>

          {/* Sección 5: Naturaleza y Descargo */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
              <FileText className="h-3.5 w-3.5 text-neutral-400" />
              Descargo de Independencia y Responsabilidad
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal">
              Esta plataforma es un proyecto de software independiente y autónomo desarrollado por y para estudiantes universitarios con propósitos de estudio, organización académica y productividad personal. No es un canal oficial de administración de la UTP.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <span className="text-[11px] text-neutral-500">
            Última actualización: Septiembre 2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] text-[#0a0a0c] font-bold text-xs transition active:scale-95 shadow-lg shadow-[var(--accent-lime)]/20"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
