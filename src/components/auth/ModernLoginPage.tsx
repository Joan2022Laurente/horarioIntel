'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/utp';
import { GUEST_STUDENT_PROFILE } from '@/lib/mock-data';
import { PrivacyModal } from '@/components/auth/PrivacyModal';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
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
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
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
    <div className="relative min-h-screen lg:h-screen w-full bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden select-none selection:bg-[var(--accent-lime)] selection:text-black">
      
      {/* 1. Luces de Fondo Volumétricas Sutiles (Fondo Original Limpio) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[24rem] bg-[var(--accent-lime)]/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-10 w-[34rem] h-[34rem] bg-[var(--accent-lime)]/5 rounded-full blur-[140px]" />
      </div>

      {/* 2. Barra Superior Minimalista Editorial (100% en Español) */}
      <header className="relative z-10 w-full px-6 sm:px-10 lg:px-14 h-16 sm:h-20 flex items-center justify-between gap-4 border-b border-white/5 bg-[#070709]/60 backdrop-blur-xl shrink-0">
        
        {/* Izquierda: Punto & Lema */}
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white shadow-sm shadow-white animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-300 uppercase font-semibold">
            HECHO PARA ESTUDIANTES • CREADO PARA LA UTP
          </span>
        </div>

        {/* Derecha: Enlaces & Versión */}
        <div className="flex items-center gap-6 sm:gap-8">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold tracking-widest uppercase">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-white border-b border-dashed border-white pb-0.5 cursor-pointer"
            >
              ACCESO
            </button>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              PRIVACIDAD
            </button>
            <a
              href="/privacidad"
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              POLÍTICAS
            </a>
          </nav>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-300 uppercase border-l border-white/10 pl-4 sm:pl-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]" />
            <span>MOTOR v2.4</span>
          </div>
        </div>

      </header>

      {/* 3. Hero Central Compacto (Todo encaja en pantalla) */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8 flex-1 flex flex-col justify-center items-start text-left">
        
        {/* Titular Principal en Gran Escala */}
        <div className="w-full space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10.5px] font-mono tracking-wider text-[var(--accent-lime)] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plataforma Académica Inteligente</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#f5f2eb] tracking-tighter uppercase leading-[0.92]">
            HORARIO<span className="text-[var(--accent-lime)]">.UTP</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-medium leading-relaxed max-w-2xl pt-1">
            Diseñado para organizar, conectar y sincronizar tu ciclo universitario. Horarios oficiales en tiempo real, copiloto de IA académica y red de estudio entre compañeros.
          </p>
        </div>

        {/* Botón Principal de Acción "Empezar" */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] text-[#0a0a0c] font-black text-xs sm:text-sm font-mono tracking-wider uppercase shadow-xl shadow-[var(--accent-lime)]/20 transition-all active:scale-95 cursor-pointer group"
          >
            <span>Empezar Ahora</span>
            <ArrowRight className="h-4 w-4 text-[#0a0a0c] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-mono text-xs tracking-wider uppercase transition cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--accent-lime)]" />
            <span>Transparencia & Seguridad</span>
          </button>
        </div>

        {/* 3 Tarjetas Compactas de Características */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-8 sm:pt-10">
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
              <Bot className="h-4 w-4 text-[var(--accent-lime)]" />
              <span>Copiloto de IA</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Analiza rúbricas de 20 puntos, cronogramas y prepara tus evaluaciones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Sincronización en Vivo</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Horarios de clase, aulas, docentes y tareas actualizadas desde la UTP.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Red y Matchmaking</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Faros de estudio y salas con alumnos de tu misma carrera y campus.
            </p>
          </div>

        </div>

      </main>

      {/* 4. Pie de Página Minimalista */}
      <footer className="relative z-10 w-full px-6 sm:px-10 lg:px-14 h-14 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 border-t border-white/5 bg-[#070709]/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>© 2026 UTP.HORARIO</span>
          <span className="text-neutral-700">/</span>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-white underline underline-offset-4 cursor-pointer transition"
          >
            Políticas de Privacidad
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
          <span>MOTOR ACADÉMICO AUTÓNOMO</span>
        </div>
      </footer>

      {/* 5. MODAL DE LOGIN (Se abre únicamente al presionar "Empezar") */}
      {isLoginModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl bg-[#0c0c10] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-wide text-white uppercase font-mono">
                    Acceso Institucional
                  </h2>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] border border-[var(--accent-lime)]/20">
                    UTP SSO
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Ingresa con tu cuenta de UTP Class
                </p>
              </div>

              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mensajes de Estado */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-mono tracking-wider font-bold text-neutral-300 mb-1.5 uppercase">
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
                    className="w-full rounded-2xl bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 font-mono focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider font-bold text-neutral-300 mb-1.5 uppercase">
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
                    className="w-full rounded-2xl bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] py-3.5 text-xs font-black text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider font-mono"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0c]" />
                    <span>Conectando con servidores UTP...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar y Sincronizar Horario</span>
                    <ArrowRight className="h-4 w-4 text-[#0a0a0c]" />
                  </>
                )}
              </button>
            </form>

            {/* Pie de Privacidad dentro del modal */}
            <div className="pt-2 text-center text-neutral-400 space-y-1 select-none border-t border-white/5">
              <div className="inline-flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-300 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
                <span>Autenticación Directa UTP SSO & TLS 1.3</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal max-w-xs mx-auto">
                Validación oficial en tiempo real. Tu contraseña nunca se almacena en nuestros servidores.
              </p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsPrivacyOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--accent-lime)] hover:underline font-mono font-medium cursor-pointer transition"
                >
                  <span>Conoce nuestras Políticas de Privacidad y Seguridad</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. Modal de Políticas y Transparencia */}
      <PrivacyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />

    </div>
  );
};
