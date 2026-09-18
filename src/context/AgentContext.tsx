'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AgentAction, AgentIntent, AgentLiveContext, NavigationTab } from '@/types/agent';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { getAllCachedSyllabi } from '@/lib/syllabus/client-storage';
import { getCurrentAndNextClass, parseEventTitle, formatCourseName } from '@/lib/schedule-parser';

interface AgentContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isAiOpen: boolean;
  aiPrompt: string;
  openAi: (prompt?: string, courseFocus?: string) => void;
  closeAi: () => void;
  isSyllabusOpen: boolean;
  selectedCourseForSyllabus: string | null;
  lastCourseInFocus: string | null;
  setLastCourseInFocus: (courseName: string | null) => void;
  openSyllabus: (courseName: string) => void;
  closeSyllabus: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  executeIntent: (intent: AgentIntent) => void;
  executeAction: (action: AgentAction) => void;
  askAgent: (query: string, courseFocus?: string) => void;
  getLiveContext: () => AgentLiveContext;
}

const AgentContext = createContext<AgentContextType | null>(null);

interface AgentProviderProps {
  children: React.ReactNode;
  interval: UTPCurrentInterval;
  courses: ProcessedCourse[];
}

export const AgentProvider: React.FC<AgentProviderProps> = ({
  children,
  interval,
  courses,
}) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('weekly');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<string | null>(null);
  const [lastCourseInFocus, setLastCourseInFocus] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openAi = useCallback((prompt?: string, courseFocus?: string) => {
    setAiPrompt(prompt || '');
    if (courseFocus) {
      setLastCourseInFocus(formatCourseName(courseFocus));
    }
    setIsAiOpen(true);
  }, []);

  const closeAi = useCallback(() => {
    setIsAiOpen(false);
  }, []);

  const openSyllabus = useCallback((courseName: string) => {
    const formatted = formatCourseName(courseName);
    setSelectedCourseForSyllabus(formatted);
    setLastCourseInFocus(formatted);
    setIsSyllabusOpen(true);
  }, []);

  const closeSyllabus = useCallback(() => {
    setIsSyllabusOpen(false);
    setSelectedCourseForSyllabus(null);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const executeAction = useCallback((action: AgentAction) => {
    switch (action.type) {
      case 'NAVIGATE_TAB':
        setActiveTab(action.payload.tab);
        break;
      case 'OPEN_SYLLABUS':
        openSyllabus(action.payload.courseName);
        break;
      case 'OPEN_SETTINGS':
        openSettings();
        break;
    }
  }, [openSyllabus, openSettings]);

  const getLiveContext = useCallback((): AgentLiveContext => {
    const events = interval.events || [];
    const status = events.length > 0 ? getCurrentAndNextClass(events) : null;

    const currentClean = status?.currentClass
      ? parseEventTitle(status.currentClass.title).cleanTitle
      : null;

    const nextClean = status?.nextClass
      ? parseEventTitle(status.nextClass.title).cleanTitle
      : null;

    return {
      activeTab,
      currentWeek: interval.week_number || 5,
      totalWeeks: interval.total_weeks || 18,
      periodName: interval.period_name || 'Ciclo 2026',
      coursesCount: courses.length,
      currentClass: status?.currentClass
        ? {
            title: currentClean || status.currentClass.title,
            modality: status.currentClass.modality,
            zoomLink: status.currentClass.metadata?.zoomLink,
          }
        : null,
      nextClass: status?.nextClass
        ? {
            title: nextClean || status.nextClass.title,
            minutesToStart: status.minutesToNext,
            modality: status.nextClass.modality,
          }
        : null,
      pendingTasksCount: 0,
      selectedCourseName: selectedCourseForSyllabus || lastCourseInFocus || currentClean || nextClean || null,
    };
  }, [activeTab, interval, courses, selectedCourseForSyllabus, lastCourseInFocus]);

  const executeIntent = useCallback((intent: AgentIntent) => {
    let promptQuery = '';
    let focusCourse: string | undefined = undefined;

    switch (intent.type) {
      case 'ANALYZE_COURSE':
        focusCourse = intent.courseName;
        promptQuery = `Analiza la asignatura ${intent.courseName}, sus fórmulas de nota, fechas clave y qué necesito para sacar 20.`;
        break;
      case 'EXPLAIN_SYLLABUS':
        focusCourse = intent.courseName;
        promptQuery = `Explica los temas de la semana actual y rúbricas oficiales del curso ${intent.courseName}.`;
        break;
      case 'CHECK_EVALUATION':
        focusCourse = intent.courseName;
        promptQuery = `¿Qué rúbrica y criterios evalúa la UTP para ${intent.evaluationCode || 'la evaluación'} de ${intent.courseName}?`;
        break;
      case 'FIND_MENTOR':
        focusCourse = intent.courseName;
        promptQuery = `¿Qué mentores o asesorías 1 a 1 recomiendas para ${intent.courseName || 'mis cursos'}?`;
        break;
      case 'FIND_NETWORKING_BEACON':
        focusCourse = intent.courseName;
        promptQuery = `¿Hay compañeros con ventanas libres hoy para coordinar grupos de estudio en ${intent.courseName || 'mis cursos'}?`;
        break;
      case 'SUMMARIZE_WEEK':
        promptQuery = `Haz un resumen ejecutivo de las prioridades académicas para la semana ${intent.weekNumber || interval.week_number || 5}.`;
        break;
      case 'PREPARE_CLASS':
        focusCourse = intent.courseName;
        promptQuery = `¿Qué preguntas clave o temas debo llevar preparados para mi clase de ${intent.courseName}?`;
        break;
      case 'FREE_QUERY':
        promptQuery = intent.query;
        break;
    }

    if (focusCourse) {
      setLastCourseInFocus(formatCourseName(focusCourse));
    }
    openAi(promptQuery, focusCourse);
  }, [interval.week_number, openAi]);

  const askAgent = useCallback((query: string, courseFocus?: string) => {
    openAi(query, courseFocus);
  }, [openAi]);

  const value = useMemo(() => ({
    activeTab,
    setActiveTab,
    isAiOpen,
    aiPrompt,
    openAi,
    closeAi,
    isSyllabusOpen,
    selectedCourseForSyllabus,
    lastCourseInFocus,
    setLastCourseInFocus,
    openSyllabus,
    closeSyllabus,
    isSettingsOpen,
    openSettings,
    closeSettings,
    executeIntent,
    executeAction,
    askAgent,
    getLiveContext,
  }), [
    activeTab,
    isAiOpen,
    aiPrompt,
    openAi,
    closeAi,
    isSyllabusOpen,
    selectedCourseForSyllabus,
    lastCourseInFocus,
    openSyllabus,
    closeSyllabus,
    isSettingsOpen,
    openSettings,
    closeSettings,
    executeIntent,
    executeAction,
    askAgent,
    getLiveContext,
  ]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export function useAgent(): AgentContextType {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent debe utilizarse dentro de un <AgentProvider>');
  }
  return context;
}
