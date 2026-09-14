'use client';

import React, { useState, useEffect } from 'react';
import { PillNavbar } from '@/components/navigation/PillNavbar';
import { ChunkyHeroDock } from '@/components/hero/ChunkyHeroDock';
import { TodayView } from '@/components/TodayView';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { CoursesList } from '@/components/CoursesList';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { SessionSettingsModal } from '@/components/SessionSettingsModal';
import { SyllabusModal } from '@/components/SyllabusModal';
import { 
  DEFAULT_STUDENT_PROFILE, 
  GUEST_STUDENT_PROFILE,
  EMPTY_CALENDAR_RESPONSE,
  INITIAL_CALENDAR_RESPONSE 
} from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { StudentProfile, UTPCalendarResponse } from '@/types/utp';
import { RefreshCw, KeyRound, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [student, setStudent] = useState<StudentProfile>(GUEST_STUDENT_PROFILE);
  const [calendarResponse, setCalendarResponse] = useState<UTPCalendarResponse>(EMPTY_CALENDAR_RESPONSE);
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'courses' | 'ai'>('weekly');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar perfil de localStorage solo si existe sesión guardada
  useEffect(() => {
    try {
      const saved = localStorage.getItem('utp_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.token) {
          setStudent(parsed);
          refreshCalendar(parsed);
          return;
        }
      }
      // Si no hay sesión, iniciar en estado de invitado
      setStudent(GUEST_STUDENT_PROFILE);
      setCalendarResponse(EMPTY_CALENDAR_RESPONSE);
    } catch (e) {
      console.warn('Error leyendo localStorage:', e);
    }
  }, []);

  const handleSaveProfile = (newProfile: StudentProfile) => {
    setStudent(newProfile);
    if (newProfile.token) {
      try {
        localStorage.setItem('utp_student_profile', JSON.stringify(newProfile));
      } catch (e) {
        console.warn('Error guardando en localStorage:', e);
      }
      refreshCalendar(newProfile);
    } else {
      // Logout o modo invitado
      try {
        localStorage.removeItem('utp_student_profile');
      } catch (e) {}
      setCalendarResponse(EMPTY_CALENDAR_RESPONSE);
    }
  };

  const refreshCalendar = async (profileToUse = student) => {
    setIsRefreshing(true);
    try {
      const headers: Record<string, string> = {
        'x-tenant-id': profileToUse.tenantId,
      };
      if (profileToUse.token) {
        headers['Authorization'] = `Bearer ${profileToUse.token}`;
      }

      const res = await fetch(`/api/calendar?userId=${profileToUse.userId}`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.current_interval) {
          setCalendarResponse(data);
        }
      }
    } catch (err) {
      console.warn('Fallo al refrescar calendario:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAskAi = (prompt?: string) => {
    setAiPrompt(prompt || '');
    setIsAiOpen(true);
  };

  const currentInterval = calendarResponse.data.current_interval;
  const processedCourses = getProcessedCourses(currentInterval.events || []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-[#ff5722]/30 selection:text-white">
      
      {/* Floating Pill Navbar (from reference) */}
      <PillNavbar
        student={student}
        interval={currentInterval}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'ai') handleAskAi();
          else setActiveTab(tab);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAi={() => handleAskAi()}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Banner de Sincronización si está refrescando */}
        {isRefreshing && (
          <div className="mb-6 rounded-2xl bg-[#141417] px-4 py-3 text-xs text-[#bbf451] flex items-center gap-2 shadow-lg">
            <RefreshCw className="h-4 w-4 animate-spin text-[#bbf451]" />
            <span>Sincronizando clases y horarios en vivo con los servidores de UTP Class...</span>
          </div>
        )}

        {/* Banner de Invitado / Conectar Cuenta */}
        {!student.token && (
          <div className="mb-6 rounded-3xl bg-[#141417] p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff5722] text-[#0a0a0c] font-black text-xl shadow-lg shrink-0">
                U
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Conecta tu cuenta institucional UTP</h3>
                <p className="text-xs text-neutral-400">Inicia sesión con tu código para sincronizar automáticamente tu horario, cursos y enlaces de Zoom en vivo.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  setStudent(DEFAULT_STUDENT_PROFILE);
                  setCalendarResponse(INITIAL_CALENDAR_RESPONSE);
                }}
                className="flex-1 sm:flex-none rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white transition"
              >
                Ver Demo
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 sm:flex-none rounded-full bg-[#bbf451] hover:bg-[#a3e635] px-5 py-2 text-xs font-black text-[#0a0a0c] shadow-lg transition active:scale-95"
              >
                Iniciar Sesión UTP
              </button>
            </div>
          </div>
        )}

        {/* Hero Showcase with Chunky 5 Shapes Dock */}
        <ChunkyHeroDock
          interval={currentInterval}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'ai') handleAskAi();
            else setActiveTab(tab);
          }}
          onOpenAi={handleAskAi}
          onOpenSyllabusModal={() => setIsSyllabusOpen(true)}
        />

        {/* Active View Container */}
        <div className="pt-6">
          {activeTab === 'today' && (
            <TodayView
              interval={currentInterval}
              onAskAi={handleAskAi}
              onNavigateToWeekly={() => setActiveTab('weekly')}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklySchedule
              interval={currentInterval}
              onAskAi={handleAskAi}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesList
              courses={processedCourses}
              interval={currentInterval}
              onAskAi={handleAskAi}
            />
          )}
        </div>

      </main>

      {/* Minimal Sleek Footer */}
      <footer className="bg-[#0a0a0c] py-8 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            UTP Class Intelligence • Plataforma Académica y Copilot Sincronizado
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <button 
              onClick={() => handleAskAi('¿Cuáles son los 5 mejores consejos para tener éxito este ciclo?')}
              className="hover:text-white transition"
            >
              Consejos del Ciclo
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition"
            >
              Configurar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* Copilot IA Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        interval={currentInterval}
        initialPrompt={aiPrompt}
      />

      {/* Account Settings Modal */}
      <SessionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentStudent={student}
        onSaveProfile={handleSaveProfile}
      />

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={isSyllabusOpen}
        onClose={() => {
          setIsSyllabusOpen(false);
          setSelectedCourseForSyllabus(null);
        }}
        onAskAi={handleAskAi}
        courseIdentifier={selectedCourseForSyllabus}
      />

    </div>
  );
}
