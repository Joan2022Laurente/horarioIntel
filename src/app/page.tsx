'use client';

import React, { useState, useEffect } from 'react';
import { PillNavbar } from '@/components/navigation/PillNavbar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { TodayView } from '@/components/TodayView';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { CoursesList } from '@/components/CoursesList';
import { CampusNetworkingView } from '@/components/networking/CampusNetworkingView';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { AcademicMarketplace } from '@/components/economy/AcademicMarketplace';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { SessionSettingsModal } from '@/components/SessionSettingsModal';
import { SyllabusModal } from '@/components/SyllabusModal';
import { ModernLoginPage } from '@/components/auth/ModernLoginPage';
import { 
  GUEST_STUDENT_PROFILE, 
  EMPTY_CALENDAR_RESPONSE 
} from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { 
  getCachedStudentProfile, 
  saveCachedStudentProfile, 
  getCachedCalendarData, 
  saveCachedCalendarData, 
  clearAllLocalUserData 
} from '@/lib/syllabus/client-storage';
import { StudentProfile, UTPCalendarResponse, ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { AgentProvider, useAgent } from '@/context/AgentContext';
import { RefreshCw } from 'lucide-react';

interface MainAppDashboardProps {
  student: StudentProfile;
  currentInterval: UTPCurrentInterval;
  processedCourses: ProcessedCourse[];
  isRefreshing: boolean;
  onSaveProfile: (newProfile: StudentProfile) => void;
  onRefreshSchedule: () => Promise<void> | void;
}

function MainAppDashboard({
  student,
  currentInterval,
  processedCourses,
  isRefreshing,
  onSaveProfile,
  onRefreshSchedule,
}: MainAppDashboardProps) {
  const {
    activeTab,
    setActiveTab,
    isAiOpen,
    aiPrompt,
    openAi,
    closeAi,
    isSyllabusOpen,
    selectedCourseForSyllabus,
    closeSyllabus,
    isSettingsOpen,
    openSettings,
    closeSettings,
    executeIntent,
  } = useAgent();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-[#ff5722]/30 selection:text-white">
      
      {/* Top Full-Width Editorial Navbar */}
      <PillNavbar
        student={student}
        interval={currentInterval}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'ai') openAi();
          else setActiveTab(tab);
        }}
        onOpenSettings={openSettings}
        onOpenAi={() => openAi()}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 py-6 pb-24 md:pb-16">
        
        {/* Banner de Sincronización en vivo */}
        {isRefreshing && (
          <div className="mb-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] px-4 py-3 text-xs text-[var(--accent-emerald)] flex items-center gap-2 shadow-none">
            <RefreshCw className="h-4 w-4 animate-spin text-[var(--accent-emerald)]" />
            <span>Sincronizando clases y horarios en vivo con UTP Class...</span>
          </div>
        )}

        {/* Active View Container */}
        <div className="pt-4 sm:pt-6">
          {activeTab === 'today' && (
            <TodayView
              interval={currentInterval}
              onNavigateToWeekly={() => setActiveTab('weekly')}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklySchedule
              interval={currentInterval}
              courses={processedCourses}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesList
              courses={processedCourses}
              interval={currentInterval}
            />
          )}

          {activeTab === 'networking' && (
            <CampusNetworkingView
              courses={processedCourses}
              interval={currentInterval}
              student={student}
            />
          )}

          {activeTab === 'community' && (
            <CommunityFeed
              courses={processedCourses}
            />
          )}

          {activeTab === 'marketplace' && (
            <AcademicMarketplace
              courses={processedCourses}
            />
          )}
        </div>

      </main>

      {/* Persistent Bottom Nav Bar (Mobile only) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'ai') openAi();
          else setActiveTab(tab);
        }}
        onOpenAi={() => openAi()}
      />

      {/* Minimal Sleek Footer */}
      <footer className="bg-[#0a0a0c] py-8 text-center text-xs text-neutral-500 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            UTP Class Intelligence • Plataforma Académica Estudiantil
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <button 
              onClick={() => executeIntent({ type: 'SUMMARIZE_WEEK', weekNumber: currentInterval.week_number })}
              className="hover:text-white transition"
            >
              Consejos del Ciclo
            </button>
            <span>•</span>
            <button 
              onClick={openSettings}
              className="hover:text-white transition"
            >
              Configurar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* Autonomous In-App Agent Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={closeAi}
        interval={currentInterval}
        initialPrompt={aiPrompt}
      />

      {/* Account Settings Modal */}
      <SessionSettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        currentStudent={student}
        onSaveProfile={onSaveProfile}
        onRefreshSchedule={onRefreshSchedule}
      />

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={isSyllabusOpen}
        onClose={closeSyllabus}
        courseIdentifier={selectedCourseForSyllabus}
        courses={processedCourses}
        interval={currentInterval}
      />

    </div>
  );
}

export default function HomePage() {
  const [student, setStudent] = useState<StudentProfile>(GUEST_STUDENT_PROFILE);
  const [calendarResponse, setCalendarResponse] = useState<UTPCalendarResponse>(EMPTY_CALENDAR_RESPONSE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar sesión y calendario guardados de localStorage al iniciar
  useEffect(() => {
    try {
      const savedProfile = getCachedStudentProfile();
      const savedCalendar = getCachedCalendarData();

      if (savedCalendar) {
        setCalendarResponse(savedCalendar);
      }

      if (savedProfile && savedProfile.token) {
        setStudent(savedProfile);
        refreshCalendar(savedProfile);
        return;
      }

      // Sin sesión activa
      setStudent(GUEST_STUDENT_PROFILE);
      if (!savedCalendar) {
        setCalendarResponse(EMPTY_CALENDAR_RESPONSE);
      }
    } catch (e) {
      console.warn('Error leyendo localStorage:', e);
    }
  }, []);

  const handleSaveProfile = (newProfile: StudentProfile) => {
    setStudent(newProfile);
    if (newProfile.token) {
      saveCachedStudentProfile(newProfile);
      refreshCalendar(newProfile);
    } else {
      // Cierre de sesión
      clearAllLocalUserData();
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
          saveCachedCalendarData(data);
        }
      }
    } catch (err) {
      console.warn('Fallo al refrescar calendario:', err);
    } finally {
      setIsRefreshing(false);
    }
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
    <AgentProvider interval={currentInterval} courses={processedCourses}>
      <MainAppDashboard
        student={student}
        currentInterval={currentInterval}
        processedCourses={processedCourses}
        isRefreshing={isRefreshing}
        onSaveProfile={handleSaveProfile}
        onRefreshSchedule={() => refreshCalendar(student)}
      />
    </AgentProvider>
  );
}
