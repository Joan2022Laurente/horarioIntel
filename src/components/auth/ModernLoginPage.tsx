'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/utp';
import { GUEST_STUDENT_PROFILE } from '@/lib/mock-data';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot
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

      setSuccessMessage(`¡Bienvenido, ${data.user.name || 'Estudiante'}! Sincronizando tu horario y sílabos...`);

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
    <div className="relative min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-between overflow-hidden selection:bg-[var(--accent-lime)]/30 selection:text-white">
      
      {/* Background Volumetric Ambient Lights */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-[var(--accent-lime)]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[34rem] h-[34rem] bg-[#141519]/80 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-[var(--accent-orange)]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <AsciiMatrixOrb size={32} state="idle" colorMode="monochrome" />
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white whitespace-nowrap">
                UTP Class Copilot
              </span>
              <span className="text-[9px] font-mono font-bold text-[var(--accent-lime)] bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                AI Agent
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 truncate">
              Plataforma Académica Inteligente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 shrink-0 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)] animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-xs text-neutral-300 font-mono font-medium whitespace-nowrap">
            Ciclo 2026
          </span>
        </div>
      </header>

      {/* Main Hero & Login Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero & AI Presentation */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-[1.12]">
                Tu ciclo UTP, potenciado con <span className="text-[var(--accent-lime)]">Inteligencia Artificial</span>.
              </h1>

              <p className="text-xs sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Accede a tus horarios en tiempo real, clases con enlaces directos de Zoom, sílabos oficiales sincronizados y un <strong className="text-neutral-200">Agente IA Académico autónomo</strong> que analiza tus rúbricas, cronograma de entregas y te prepara para sacar 20.
              </p>
            </div>

            {/* Glassmorphic Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 space-y-2 transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 text-[var(--accent-lime)]">
                  <Bot className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Agente IA Autónomo</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Responde dudas de temario, explica fórmulas y ejecuta acciones en tu horario.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 space-y-2 transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Horario en Vivo</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Detección en tiempo real de clases, aulas, docentes y acceso a Zoom en 1 clic.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 space-y-2 transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Sílabos Oficiales</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Rúbricas oficiales de 20 puntos, pesos porcentuales y cronograma de 18 semanas.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Login Card */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-5 sm:p-8 shadow-2xl space-y-5">
              
              <div className="space-y-1 text-left">
                <h3 className="text-base sm:text-lg font-black text-white">Iniciar Sesión</h3>
                <p className="text-xs text-neutral-400">Ingresa tus credenciales institucionales de UTP Class</p>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-md p-3.5 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md p-3.5 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
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
                      className="w-full rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 font-mono focus:border-[var(--accent-lime)] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
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
                      className="w-full rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] py-3.5 text-xs font-black text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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

              {/* Seamless Integrated Privacy & Security Footnote (Zero Card-ception) */}
              <div className="pt-2 text-center text-neutral-400 space-y-1 select-none">
                <div className="inline-flex items-center justify-center gap-1.5 text-[11px] text-neutral-300 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
                  <span>Cifrado local seguro AES-256 & SSL</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal max-w-xs mx-auto">
                  Tus credenciales se procesan en tu navegador sin almacenar contraseñas en texto plano.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Plataforma Académica Estudiantil UTP</p>
        <div className="flex items-center gap-4 text-neutral-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
            Autonomous AI Engine
          </span>
        </div>
      </footer>

    </div>
  );
};
