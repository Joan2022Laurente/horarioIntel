'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StudentProfile } from '@/types/utp';
import { GUEST_STUDENT_PROFILE } from '@/lib/mock-data';
import { 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Bot,
  Calendar,
  Layers,
  X
} from 'lucide-react';

interface ModernLoginPageProps {
  onLoginSuccess: (profile: StudentProfile) => void;
}

export const ModernLoginPage: React.FC<ModernLoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Ingresa tu código de alumno y contraseña institucional.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/utp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo iniciar sesión con las credenciales de UTP.');
      }

      setSuccessMessage(`¡Bienvenido, ${data.user.name || 'Estudiante'}! Sincronizando tu horario y asignaturas...`);

      setTimeout(() => {
        onLoginSuccess({
          ...GUEST_STUDENT_PROFILE,
          ...data.user,
        });
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con los servidores de UTP.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden select-none selection:bg-[var(--accent-lime)] selection:text-black font-sans">
      
      {/* 1. Luces de Fondo Volumétricas Sutiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-[var(--accent-lime)]/[0.04] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[24rem] h-[24rem] bg-blue-500/[0.03] rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-10 w-[28rem] h-[28rem] bg-[var(--accent-lime)]/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* 2. Barra Superior Minimalista y Responsive */}
      <header className="relative z-10 w-full px-4 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-md border-none shrink-0">
        
        {/* Izquierda: Indicador & Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] sm:text-[11px] tracking-wider text-neutral-300 uppercase font-semibold">
            ESTUDIANTES UTP
          </span>
        </div>

        {/* Derecha: Enlaces Adaptados */}
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8 text-[11px] sm:text-xs font-semibold tracking-wider uppercase shrink-0">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="text-white border-b border-dashed border-white pb-0.5 cursor-pointer hover:text-[var(--accent-lime)] transition"
          >
            ACCESO
          </button>
          
          <Link
            href="/privacidad"
            className="hidden sm:inline-block text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            POLÍTICAS & SEGURIDAD
          </Link>
        </nav>

      </header>

      {/* 3. Hero Central Proporcionado y Ordenado */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6 flex-1 flex flex-col justify-center items-start text-left">
        
        <div className="w-full space-y-3 sm:space-y-4">
          
          {/* Titular Principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#f5f2eb] tracking-tight uppercase leading-[1.05]">
            HORARIO<span className="text-[var(--accent-lime)]">.UTP</span>
          </h1>

          {/* Subtítulo Conciso */}
          <p className="text-xs sm:text-sm lg:text-base text-neutral-400 font-normal leading-relaxed max-w-2xl">
            Organiza, conecta y sincroniza tu ciclo universitario. Horarios oficiales en tiempo real, copiloto de IA académica y red de estudio entre compañeros de la universidad.
          </p>

          {/* Botones de Acción */}
          <div className="pt-2 sm:pt-4 flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] text-[#0a0a0c] font-bold text-xs sm:text-sm tracking-wide uppercase shadow-xl shadow-[var(--accent-lime)]/20 transition-all active:scale-95 cursor-pointer group shrink-0"
            >
              <span>Empezar</span>
              <ArrowRight className="h-4 w-4 text-[#0a0a0c] group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/privacidad"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-medium text-xs tracking-wide uppercase transition cursor-pointer shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
              <span>Seguridad</span>
            </Link>
          </div>

        </div>

        {/* 3 Tarjetas de Características (Completas, con título y descripción visibles en móvil y PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full pt-6 sm:pt-8">
          
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Bot className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
              <span>Copiloto de IA</span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 leading-normal">
              Analiza rúbricas, cronogramas y prepara tus evaluaciones.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Sincronización en Vivo</span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 leading-normal">
              Horarios de clase, aulas, docentes y tareas desde la UTP.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Red de Estudio</span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 leading-normal">
              Faros de estudio con alumnos de tu carrera y campus.
            </p>
          </div>

        </div>

      </main>

      {/* 4. Pie de Página Minimalista Transparente */}
      <footer className="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-3 sm:h-14 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-md border-none shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-normal">
          <span>© 2026 UTP.HORARIO</span>
          <span className="text-neutral-700">/</span>
          <Link
            href="/privacidad"
            className="hover:text-white underline underline-offset-4 cursor-pointer transition"
          >
            Políticas de Privacidad & Seguridad
          </Link>
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wider font-medium">
          ESTUDIANTES UTP
        </div>
      </footer>

      {/* 5. MODAL DE LOGIN MODERNO (Sans-Serif Limpia) */}
      {isLoginModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-150 font-sans"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl bg-[#09090c]/95 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 text-left">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Acceso Institucional
                </h2>
                <p className="text-xs text-neutral-400">
                  Ingresa con tus credenciales oficiales de UTP Class
                </p>
              </div>

              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mensajes de Estado */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Código de Alumno
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="u123456789"
                    disabled={isLoading}
                    required
                    className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 sm:py-3 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Contraseña Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña de UTP Class"
                    disabled={isLoading}
                    required
                    className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 sm:py-3 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] py-3 sm:py-3.5 text-xs font-bold text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0c]" />
                    <span>Validando con UTP...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <ArrowRight className="h-4 w-4 text-[#0a0a0c]" />
                  </>
                )}
              </button>
            </form>

            {/* Pie de Privacidad con Enlace Directo a /privacidad */}
            <div className="pt-1.5 text-center text-neutral-400 space-y-1 select-none">
              <p className="text-[10px] text-neutral-400 leading-normal max-w-xs mx-auto">
                Validación oficial en tiempo real. Tu contraseña no se almacena en ninguna base de datos.
              </p>
              <div className="pt-0.5">
                <Link
                  href="/privacidad"
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--accent-lime)] hover:underline font-medium cursor-pointer transition"
                >
                  <span>Conoce nuestras Políticas de Privacidad y Seguridad</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
