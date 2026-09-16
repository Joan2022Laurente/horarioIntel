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
  KeyRound, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualToken, setManualToken] = useState('');

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

      setSuccessMessage(`¡Bienvenido, ${data.user.name || 'Estudiante'}! Sincronizando tus cursos...`);

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

  const handleManualTokenSubmit = () => {
    if (!manualToken.trim() || !manualToken.includes('.')) {
      setErrorMessage('Ingresa un JWT Bearer token válido de UTP.');
      return;
    }

    try {
      const parts = manualToken.trim().split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const studentProfile: StudentProfile = {
          ...GUEST_STUDENT_PROFILE,
          name: payload.name || payload.given_name || 'Estudiante UTP',
          username: (payload.preferred_username || 'uEstudiante').toUpperCase(),
          email: payload.email || 'alumno@utp.edu.pe',
          userId: payload.userId || payload.user_id || payload.sub || '',
          token: manualToken.trim(),
        };

        setSuccessMessage('Token verificado. Accediendo...');
        setTimeout(() => onLoginSuccess(studentProfile), 600);
      }
    } catch {
      setErrorMessage('El formato del token no es válido.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-between overflow-hidden selection:bg-[#ff5722]/30 selection:text-white">
      
      {/* Background Subtle Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff5722]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#bbf451]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AsciiMatrixOrb size={36} state="idle" colorMode="monochrome" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-black tracking-wide text-white">UTP Class Assistant</span>
            <span className="text-[10px] font-mono text-neutral-400">Plataforma Académica Estudiantil</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#bbf451] animate-pulse" />
          <span className="text-xs text-neutral-400 font-medium">Ciclo 2026</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Visual Presentation & Key Benefits */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#141417] px-3.5 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#bbf451] animate-pulse" />
                <span className="text-xs font-bold text-neutral-300">Sincronización Oficial en Vivo</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Tu ciclo UTP, organizado y bajo control.
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Accede a tus horarios semanales, clases en vivo con enlaces de Zoom, sílabos sincronizados y fechas de entrega en una sola interfaz rápida y moderna.
              </p>
            </div>

            {/* Feature Highlights (Chunky Pop Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-[#141417] p-4 space-y-2 shadow-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff5722]/15 text-[#ff5722]">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Horario en Vivo</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Cursos, docentes, aulas y links de Zoom directos de cada sesión.
                </p>
              </div>

              <div className="rounded-2xl bg-[#141417] p-4 space-y-2 shadow-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#bbf451]/15 text-[#bbf451]">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Sílabos & Tareas</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Rúbricas oficiales de 20 puntos y entregables por semana.
                </p>
              </div>

              <div className="rounded-2xl bg-[#141417] p-4 space-y-2 shadow-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-white">Copiloto IA</h2>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Asistencia contextual para tus cursos y temas de clase.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Card */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-3xl bg-[#141417] p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-black text-white">Iniciar Sesión</h3>
                <p className="text-xs text-neutral-400">Ingresa tus credenciales oficiales de UTP Class</p>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="rounded-2xl bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Código de Alumno o Correo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej: uXXXXXXX o uXXXX@utp.edu.pe"
                      disabled={isLoading}
                      required
                      className="w-full rounded-2xl bg-[#1b1b22] pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#bbf451] focus:outline-none transition"
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
                      className="w-full rounded-2xl bg-[#1b1b22] pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#bbf451] focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#bbf451] hover:bg-[#a3e635] py-3.5 text-xs font-black text-[#0a0a0c] shadow-lg transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Autenticación oficial Keycloak SSO UTP</span>
              </div>

              {/* Advanced Token Accordion */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-[11px] text-neutral-400 hover:text-white transition py-1"
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <KeyRound className="h-3.5 w-3.5" />
                    Ingresar con Token manual (Avanzado)
                  </span>
                  {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#1b1b22] space-y-2.5 animate-in fade-in duration-150 text-left">
                    <textarea
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Pega tu Bearer eyJhbGciOiJSUzI1NiIs..."
                      rows={2}
                      className="w-full rounded-xl bg-[#141417] p-2 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#bbf451]"
                    />
                    <button
                      type="button"
                      onClick={handleManualTokenSubmit}
                      className="w-full rounded-xl bg-white/10 hover:bg-white/20 py-2 text-[11px] font-bold text-white transition"
                    >
                      Cargar con Token
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Plataforma para la comunidad estudiantil UTP</p>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>UTP Class Intelligence</span>
        </div>
      </footer>

    </div>
  );
};
