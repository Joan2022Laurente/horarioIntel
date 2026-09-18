'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StudentProfile } from '@/types/utp';
import { GUEST_STUDENT_PROFILE } from '@/lib/mock-data';
import { PrivacyModal } from '@/components/auth/PrivacyModal';
import { 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink
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
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between overflow-x-hidden selection:bg-[var(--accent-lime)]/30 selection:text-white">
      
      {/* 1. Background Image with Subtle Vignette Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/hero-bg.png"
          alt="UTP Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60 sm:opacity-75 scale-[1.02] filter brightness-[0.82] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-radial-vignette opacity-50" />
      </div>

      {/* 2. Top Minimalist Editorial Header (Exact Oryzo Style) */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-5 sm:py-6 flex items-center justify-between gap-4 select-none">
        
        {/* Left: Minimal Dot & Tagline */}
        <div className="flex items-center gap-3.5">
          <span className="h-2 w-2 rounded-full bg-white shadow-sm shadow-white animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#eae6df] uppercase font-bold">
            MADE FOR STUDENTS. BUILT FOR UTP.
          </span>
        </div>

        {/* Right: Minimal Navigation Links & Model Tag */}
        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold tracking-widest uppercase">
            <span className="text-[#eae6df] border-b border-dashed border-white pb-0.5 cursor-default">
              ACCESO
            </span>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              PRIVACIDAD
            </button>
            <a
              href="/privacidad"
              className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              POLÍTICAS
            </a>
          </nav>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#eae6df] uppercase border-l border-white/20 pl-4 sm:pl-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-lime)]" />
            <span className="hidden xs:inline">ENGINE v2.4</span>
          </div>
        </div>

      </header>

      {/* 3. Hero & Login Body */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        
        {/* Giant Editorial Title */}
        <div className="w-full mb-6 sm:mb-10 text-left select-none">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black text-[#f5f2eb] tracking-tighter uppercase leading-[0.88] drop-shadow-2xl">
            HORARIO
          </h1>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Left / Center Column: Editorial Description & Bottom Badge */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-10 text-left">
            
            {/* Tagline Paragraph */}
            <p className="text-sm sm:text-base lg:text-lg text-[#eae6df] font-medium leading-relaxed max-w-lg drop-shadow-md">
              Diseñado para organizar, conectar y sincronizar tu ciclo universitario. Horario Inteligente hace que cada entrega, clase y rúbrica esté bajo tu control.
            </p>

            {/* Bottom-Left Editorial Studio Badge (Lusion Style) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121216]/80 backdrop-blur-2xl border border-white/15 max-w-xs shadow-2xl space-y-3">
              <div className="text-[11px] font-mono font-black tracking-widest text-neutral-200 uppercase leading-snug">
                PLATAFORMA ESTUDIANTIL<br />
                AUTÓNOMA & SEGURA
              </div>
              <div className="w-full h-[1px] border-b border-dotted border-white/20" />
              <p className="text-[10.5px] text-neutral-400 font-sans leading-normal">
                Sincronización oficial en tiempo real con servidores UTP Class sin almacenamiento de contraseñas.
              </p>
            </div>

          </div>

          {/* Right Column: High-End Glassmorphic Login Card */}
          <div className="lg:col-span-6 w-full flex justify-end">
            <div className="w-full max-w-md rounded-3xl bg-[#0c0c10]/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-5">
              
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase font-mono">
                    Acceso Institucional
                  </h2>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] border border-[var(--accent-lime)]/20">
                    UTP SSO
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Ingresa con tus credenciales oficiales de UTP Class
                </p>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 backdrop-blur-md p-3.5 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md p-3.5 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Form */}
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
                      className="w-full rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 font-mono focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
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
                      placeholder="Tu contraseña de Portal / UTP Class"
                      disabled={isLoading}
                      required
                      className="w-full rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:ring-1 focus:ring-[var(--accent-lime)] focus:outline-none transition"
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

              {/* Seamless Integrated Privacy Footnote */}
              <div className="pt-2 text-center text-neutral-400 space-y-1.5 select-none border-t border-white/5">
                <div className="inline-flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-200 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-lime)] shrink-0" />
                  <span>Autenticación Directa UTP SSO & TLS 1.3</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal max-w-xs mx-auto">
                  Tus credenciales se validan en tiempo real contra los servidores oficiales de UTP. Tu clave nunca se almacena.
                </p>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="inline-flex items-center gap-1 text-[10px] text-[var(--accent-lime)] hover:underline font-mono font-medium cursor-pointer transition"
                  >
                    <span>Conoce nuestras Políticas de Privacidad y Seguridad</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* 4. Minimalist Bottom Bar */}
      <footer className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 select-none border-t border-white/5 bg-[#070709]/60 backdrop-blur-md">
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>© 2026 UTP.HORARIO</span>
          <span className="text-neutral-600">/</span>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-white underline underline-offset-4 cursor-pointer transition"
          >
            Políticas de Privacidad
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
          <span>AUTONOMOUS ACADEMIC ENGINE</span>
        </div>
      </footer>

      {/* Privacy and Transparency Modal */}
      <PrivacyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />

    </div>
  );
};
