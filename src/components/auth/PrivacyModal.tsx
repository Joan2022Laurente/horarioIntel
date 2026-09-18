'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Database, 
  X,
  CheckCircle2
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#09090c]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Seamless, No Dividing Lines */}
        <div className="flex items-start justify-between px-7 pt-7 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-[var(--accent-lime)]">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                Privacidad & Seguridad
              </h2>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Arquitectura Zero-Knowledge y autenticación directa con la UTP.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-neutral-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content - Pure Minimal Typography */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6 text-neutral-300 text-xs leading-relaxed">
          
          {/* Key Principle Highlight */}
          <div className="p-4 rounded-2xl bg-[var(--accent-lime)]/[0.04] border border-[var(--accent-lime)]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent-lime)] shrink-0" />
              <span>Cero Almacenamiento de Contraseñas</span>
            </div>
            <p className="text-[11.5px] text-neutral-300 leading-normal pl-6">
              Tu contraseña institucional nunca se guarda en ninguna base de datos ni servidor intermedio. Se transmite de forma cifrada mediante HTTPS/TLS 1.3 directamente a los servidores de autenticación Keycloak de la UTP.
            </p>
          </div>

          {/* Points list */}
          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Lock className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
                <span>Autenticación Oficial UTP SSO</span>
              </div>
              <p className="text-[11.5px] text-neutral-400 leading-relaxed pl-5.5">
                La validación se realiza en tiempo real contra el proveedor de identidad institucional. El sistema únicamente recibe un token de acceso efímero (JWT) que caduca automáticamente.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span>Datos Sincronizados y Finalidad</span>
              </div>
              <p className="text-[11.5px] text-neutral-400 leading-relaxed pl-5.5">
                Para mostrarte tus horarios, asignaturas y compañeros de clase, se consultan exclusivamente tus datos académicos públicos (código de estudiante, nombre, carrera, campus y horarios inscritos).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Server className="h-3.5 w-3.5 text-purple-400" />
                <span>Control Total de tu Sesión</span>
              </div>
              <p className="text-[11.5px] text-neutral-400 leading-relaxed pl-5.5">
                Al presionar "Cerrar Sesión", todos los tokens de acceso temporales son eliminados inmediatamente de la memoria de tu navegador, garantizando que nadie más pueda acceder a tu información.
              </p>
            </div>

          </div>

        </div>

        {/* Bottom Action - Clean & Integrated without Heavy Footer Bar */}
        <div className="px-7 pb-7 pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold tracking-wide uppercase transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
