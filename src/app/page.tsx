'use client';

import React, { useState, useEffect } from 'react';
import { PillNavbar } from '@/components/navigation/PillNavbar';
import { TodayView } from '@/components/TodayView';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { CoursesList } from '@/components/CoursesList';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { SessionSettingsModal } from '@/components/SessionSettingsModal';
import { SyllabusModal } from '@/components/SyllabusModal';
import { ModernLoginPage } from '@/components/auth/ModernLoginPage';
import { 
  GUEST_STUDENT_PROFILE,
  EMPTY_CALENDAR_RESPONSE
} from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { StudentProfile, UTPCalendarResponse } from '@/types/utp';
import { RefreshCw } from 'lucide-react';

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

  // Cargar sesión guardada de localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('utp_student_profile');
      if (saved) {
        const parsed: StudentProfile = JSON.parse(saved);
        if (parsed.token) {
          setStudent(parsed);
          refreshCalendar(parsed);
          return;
        }
      }
      // Sin sesión activa
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
      // Cierre de sesión
      try {
        localStorage.removeItem('utp_student_profile');
      } catch (e) {}
      setCalendarResponse(EMPTY_CALENDAR_RESPONSE);
    }
  };

  const refreshCalendar = async (profileToUse = student) => {
    if (!profileToUse.token) return;
    setIsRefreshing(true);
    try {
      const headers: Record<string, string> = {
        'x-tenant-id': profileToUse.tenantId || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
        'Authorization': `Bearer ${profileToUse.token}`,
      };

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

  // Si el usuario no tiene sesión activa, redirigir directamente al Login
  if (!student.token) {
    return (
      <ModernLoginPage
        onLoginSuccess={handleSaveProfile}
      />
    );
  }

  const currentInterval = calendarResponse.data.current_interval;
  const processedCourses = getProcessedCourses(currentInterval.events || []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-[#ff5722]/30 selection:text-white">
      
      {/* Floating Pill Navbar */}
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
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12">
        
        {/* Banner de Sincronización en vivo */}
        {isRefreshing && (
          <div className="mb-6 rounded-2xl bg-[#141417] px-4 py-3 text-xs text-[#bbf451] flex items-center gap-2 shadow-lg">
            <RefreshCw className="h-4 w-4 animate-spin text-[#bbf451]" />
            <span>Sincronizando clases y horarios en vivo con UTP Class...</span>
          </div>
        )}

        {/* Active View Container */}
        <div className="pt-2">
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
            UTP Class Intelligence • Plataforma Académica Estudiantil
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <button 
              onClick={() => handleAskAi('¿Cuáles son las fechas clave y consejos para este ciclo?')}
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
