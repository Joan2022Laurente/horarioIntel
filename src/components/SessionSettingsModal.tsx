'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/utp';
import { 
  X, 
  ShieldCheck, 
  Check, 
  GraduationCap, 
  MapPin, 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  KeyRound, 
  ChevronDown, 
  ChevronUp,
  LogOut,
  RefreshCw,
  Server
} from 'lucide-react';
import { GUEST_STUDENT_PROFILE } from '@/lib/mock-data';

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  onRefreshSchedule?: () => Promise<void> | void;
}

export const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSaveProfile,
  onRefreshSchedule,
}) => {
  // Estados para login (solo si no tiene sesión)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modo avanzado (Token manual)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [token, setToken] = useState(currentStudent.token || '');
  const [name, setName] = useState(currentStudent.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isCurrentLoggedIn = !!currentStudent.token;

  // Forzar sincronización en vivo con API oficial UTP
  const handleForceSync = async () => {
    setIsSyncingLive(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (onRefreshSchedule) {
        await onRefreshSchedule();
      } else {
        await new Promise(r => setTimeout(r, 800));
      }
      setSuccessMessage('Horario y asignaturas sincronizadas desde la UTP.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sincronizando con la API de UTP.';
      setErrorMessage(msg);
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Login directo para usuarios sin sesión
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Por favor ingresa tu código de alumno y contraseña.');
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
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenciales no válidas en UTP.');
      }

      onSaveProfile({
        ...currentStudent,
        ...data.user,
        career: data.user.career || currentStudent.career || 'Ingeniería de Sistemas e Informática',
        campus: data.user.campus || currentStudent.campus || 'Lima Centro',
      });

      setSuccessMessage(`¡Bienvenido, ${data.user.name}! Tu horario oficial se ha sincronizado.`);
      setPasswordInput('');
      
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con los servidores de UTP.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar token manual (Modo avanzado)
  const handleSaveAdvanced = () => {
    let updatedName = name;
    let updatedUsername = currentStudent.username;
    let updatedUserId = currentStudent.userId;

    if (token && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.name) updatedName = payload.name;
          if (payload.preferred_username) updatedUsername = payload.preferred_username.toUpperCase();
          if (payload.sub) updatedUserId = payload.sub;
        }
      } catch (e) {
        console.warn('Error parseando token:', e);
      }
    }

    onSaveProfile({
      ...currentStudent,
      name: updatedName,
      username: updatedUsername,
      email: `${updatedUsername}@utp.edu.pe`,
      userId: updatedUserId,
      token: token.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Cerrar sesión
  const handleLogout = () => {
    onSaveProfile(GUEST_STUDENT_PROFILE);
    setUsernameInput('');
    setPasswordInput('');
    setToken('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-150 text-white font-sans"
      onClick={onClose}
    >
      <div 
        className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl bg-[#09090c]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Sin líneas divisorias rígidas */}
        <div className="flex items-start justify-between px-7 pt-7 pb-2">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {isCurrentLoggedIn ? 'Perfil y Sincronización' : 'Iniciar Sesión'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isCurrentLoggedIn ? 'Gestión de cuenta y estado en vivo con la UTP' : 'Acceso oficial con tu cuenta institucional'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-4 space-y-5">

          {/* Tarjeta de perfil minimalista */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-lime)] text-[#0a0a0c] font-bold text-xl shadow-md shrink-0 select-none">
              {currentStudent.name.charAt(0) || 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--accent-lime)]">
                  {currentStudent.username.toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isCurrentLoggedIn ? '• Sesión Activa' : '• Demo'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-0.5 truncate">
                {currentStudent.name}
              </h4>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-neutral-400 mt-1">
                <span className="flex items-center gap-1 text-neutral-300">
                  <GraduationCap className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
                  {currentStudent.career || 'Ingeniería de Sistemas e Informática'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  {currentStudent.campus || 'Lima Centro'}
                </span>
              </div>
            </div>
          </div>

          {/* Mensajes de Alerta */}
          {errorMessage && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VISTA 1: USUARIO AUTENTICADO */}
          {isCurrentLoggedIn ? (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                    <Server className="h-3.5 w-3.5 text-[var(--accent-lime)]" />
                    <span>Sincronización en Vivo</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Tus horarios de clase, aulas, docentes y tareas se sincronizan de forma directa y segura con la UTP.
                </p>

                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isSyncingLive}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] py-3 text-xs font-bold text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isSyncingLive ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0c]" />
                      <span>Sincronizando tareas y horario...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 text-[#0a0a0c]" />
                      <span>Forzar Sincronización Ahora</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botón de Cerrar Sesión */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer uppercase"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

            </div>
          ) : (
            /* VISTA 2: FORMULARIO DE INICIO DE SESIÓN */
            <div className="space-y-4">
              <form onSubmit={handleDirectLogin} className="space-y-3.5">
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
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                      placeholder="u123456789"
                      disabled={isLoading}
                      required
                      className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:border-[var(--accent-lime)] focus:outline-none transition"
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
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Tu contraseña de UTP Class"
                      disabled={isLoading}
                      required
                      className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[var(--accent-lime)] focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] py-3 text-xs font-bold text-[#0a0a0c] shadow-lg shadow-[var(--accent-lime)]/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0c]" />
                      <span>Validando con UTP...</span>
                    </>
                  ) : (
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              </form>

              {/* Opciones Avanzadas */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs text-neutral-400 hover:text-white transition py-1 cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Token Manual (Avanzado)
                  </span>
                  {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-2 p-3 rounded-2xl bg-black/40 space-y-2 border border-white/5">
                    <textarea
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Bearer eyJhbGci..."
                      rows={2}
                      className="w-full rounded-xl bg-black/50 p-2 text-[10px] font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--accent-lime)] border border-white/5"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveAdvanced}
                        className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-bold text-white transition cursor-pointer uppercase"
                      >
                        {savedSuccess ? 'Guardado' : 'Guardar Token'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer simple integrado */}
        <div className="px-7 pb-6 pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
