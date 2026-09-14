'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/utp';
import { 
  X, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  GraduationCap, 
  MapPin, 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  KeyRound, 
  ChevronDown, 
  ChevronUp,
  LogOut
} from 'lucide-react';
import { DEFAULT_STUDENT_PROFILE } from '@/lib/mock-data';

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSaveProfile,
}) => {
  // Credenciales directas
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modo avanzado (Token manual)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [token, setToken] = useState(currentStudent.token || '');
  const [name, setName] = useState(currentStudent.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Login directo con usuario y contraseña oficial de UTP
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

      // Guardar el perfil auténtico obtenido de Keycloak
      onSaveProfile({
        ...currentStudent,
        ...data.user,
        career: currentStudent.career || 'INGENIERÍA DE SISTEMAS',
        campus: currentStudent.campus || 'Lima Centro',
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
    onSaveProfile({
      ...DEFAULT_STUDENT_PROFILE,
      token: undefined,
      name: 'Estudiante UTP',
      username: 'INVITADO',
      email: 'estudiante@utp.edu.pe',
    });
    setUsernameInput('');
    setPasswordInput('');
    setToken('');
    setSuccessMessage('Sesión cerrada. Ahora puedes iniciar con otra cuenta.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const isCurrentLoggedIn = !!currentStudent.token;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 text-white">
      <div className="relative flex flex-col w-full max-w-lg max-h-[92vh] rounded-3xl bg-[#141417] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#19191e]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-sm shadow-md">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Iniciar Sesión UTP</h3>
              <p className="text-[11px] text-neutral-400">Acceso oficial con tu cuenta institucional</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Tarjeta de estado de cuenta actual */}
          <div className="rounded-2xl bg-[#1b1b22] p-4 flex items-center gap-4 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-2xl shadow-md shrink-0 select-none">
              {currentStudent.name.charAt(0) || 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isCurrentLoggedIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  <ShieldCheck className="h-3 w-3" />
                  {isCurrentLoggedIn ? 'Sesión Activa Oficial' : 'Modo Demostración'}
                </span>
                <span className="font-mono text-xs font-bold text-[#bbf451]">
                  {currentStudent.username.toUpperCase()}
                </span>
              </div>

              <h4 className="text-sm font-black text-white mt-1 truncate">
                {currentStudent.name}
              </h4>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-[#ff5722]" />
                  {currentStudent.career || 'INGENIERÍA'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-neutral-400" />
                  {currentStudent.campus || 'UTP'}
                </span>
              </div>
            </div>

            {isCurrentLoggedIn && (
              <button
                onClick={handleLogout}
                title="Cerrar sesión para que ingrese otro compañero"
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="rounded-2xl bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario de Login Directo */}
          <form onSubmit={handleDirectLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Código de Alumno o Correo UTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ej: u23307609 o tu correo @utp.edu.pe"
                  disabled={isLoading}
                  required
                  className="w-full rounded-xl bg-[#1b1b22] pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#bbf451] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Contraseña institucional UTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Tu contraseña de UTP Class / Portal"
                  disabled={isLoading}
                  required
                  className="w-full rounded-xl bg-[#1b1b22] pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#bbf451] focus:outline-none transition"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Autenticación directa contra Keycloak SSO oficial (sso.utp.edu.pe). No guardamos tu clave.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#bbf451] hover:bg-[#a3e635] py-3 text-xs font-black text-[#0a0a0c] shadow-lg transition active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0c]" />
                  <span>Conectando con servidores UTP...</span>
                </>
              ) : (
                <span>Ingresar y Sincronizar mis Cursos</span>
              )}
            </button>
          </form>

          {/* Acordeón Opciones Avanzadas (Token manual) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-[11px] text-neutral-400 hover:text-white transition py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="h-3.5 w-3.5" />
                Opciones avanzadas (Token manual)
              </span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-2xl bg-[#1b1b22] space-y-3 animate-in fade-in duration-100">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Bearer Token JWT Manual
                  </label>
                  <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJSUzI1NiIs..."
                    rows={2}
                    className="w-full rounded-xl bg-[#141417] p-2.5 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#bbf451]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSaveProfile(DEFAULT_STUDENT_PROFILE);
                      setName(DEFAULT_STUDENT_PROFILE.name);
                      setToken('');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurar demo
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAdvanced}
                    className="rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-[11px] font-bold text-white transition"
                  >
                    {savedSuccess ? '¡Guardado!' : 'Guardar Token'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-[#19191e]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/15 px-5 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
