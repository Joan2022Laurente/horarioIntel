'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/types/utp';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Info, 
  Check, 
  RotateCcw,
  GraduationCap,
  MapPin,
  IdCard
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
  const [token, setToken] = useState(currentStudent.token || '');
  const [name, setName] = useState(currentStudent.name);
  const [username, setUsername] = useState(currentStudent.username);
  const [userId, setUserId] = useState(currentStudent.userId);
  const [tenantId, setTenantId] = useState(currentStudent.tenantId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    let updatedName = name;
    let updatedUsername = username;
    let updatedUserId = userId;

    if (token && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.name) updatedName = payload.name;
          if (payload.preferred_username) updatedUsername = payload.preferred_username;
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
      tenantId: tenantId || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
      role: 'STUDENT',
      token: token.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    onSaveProfile(DEFAULT_STUDENT_PROFILE);
    setName(DEFAULT_STUDENT_PROFILE.name);
    setUsername(DEFAULT_STUDENT_PROFILE.username);
    setUserId(DEFAULT_STUDENT_PROFILE.userId);
    setTenantId(DEFAULT_STUDENT_PROFILE.tenantId);
    setToken('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 text-white">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-[#141417] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#19191e]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-sm shadow-md">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Perfil y Sesión UTP</h3>
              <p className="text-[11px] text-neutral-400">Credenciales del portal y sincronización</p>
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
          
          {/* Official Student Card */}
          <div className="rounded-2xl bg-[#1b1b22] p-4 flex items-center gap-4 shadow-md">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-2xl sm:text-3xl shadow-md shrink-0 select-none">
              U
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  Conectado Oficial
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
                  {currentStudent.career || 'ING. DE SISTEMAS E INFORMÁTICA'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-neutral-400" />
                  {currentStudent.campus || 'Lima Centro'}
                </span>
                {currentStudent.dni && (
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <IdCard className="h-3 w-3 text-neutral-400" />
                    DNI: {currentStudent.dni}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Bearer Token JWT (UTP Class / Portal Expedition)
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega aquí tu Authorization Bearer eyJhbGciOiJSUzI1NiIs..."
                rows={2}
                className="w-full rounded-xl bg-[#1b1b22] p-3 text-xs font-mono text-white placeholder-neutral-500 focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nombre del Estudiante
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-[#1b1b22] px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Código de Alumno (uXXXXXXX)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl bg-[#1b1b22] px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  User ID (UUID PAO)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl bg-[#1b1b22] px-3 py-2 text-xs font-mono text-neutral-400 focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tenant ID (UTP)
                </label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full rounded-xl bg-[#1b1b22] px-3 py-2 text-xs font-mono text-neutral-400 focus:ring-1 focus:ring-[#bbf451] focus:outline-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Guide card */}
          <div className="rounded-2xl bg-[#1b1b22] p-4 space-y-2 text-xs text-neutral-400 shadow-md">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Info className="h-4 w-4 text-[#ff5722]" />
              <span>¿Cómo sincronizar el token con UTP Class o Portal?</span>
            </div>
            <ol className="list-decimal ml-4 space-y-1 text-neutral-300 text-[11px]">
              <li>Ingresa a <strong className="text-white">portal.utp.edu.pe</strong> o <strong className="text-white">class.utp.edu.pe</strong> con tu usuario institucional.</li>
              <li>Abre las herramientas de desarrollo (<code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">F12</code>) y ve a la pestaña <strong>Network (Red)</strong>.</li>
              <li>Filtra por <code className="bg-black/40 px-1 py-0.5 rounded text-[#bbf451] font-mono">graphql</code> o <code className="bg-black/40 px-1 py-0.5 rounded text-[#bbf451] font-mono">calendar</code> y copia el encabezado <code className="bg-black/40 px-1 py-0.5 rounded text-neutral-300 font-mono">authorization: Bearer ...</code></li>
              <li>Pégalo en el campo superior y pulsa <strong>Guardar y Conectar</strong>.</li>
            </ol>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#19191e]">
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar perfil oficial</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-[#bbf451] hover:bg-[#a3e635] px-5 py-2 text-xs font-black text-[#0a0a0c] shadow-lg transition active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <span>Guardar y Conectar</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
