'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AgentAction, AgentIntent, AgentLiveContext, NavigationTab } from '@/types/agent';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { getAllCachedSyllabi } from '@/lib/syllabus/client-storage';
import { getCurrentAndNextClass } from '@/lib/schedule-parser';

interface AgentContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isAiOpen: boolean;
  aiPrompt: string;
  openAi: (prompt?: string) => void;
  closeAi: () => void;
  isSyllabusOpen: boolean;
  selectedCourseForSyllabus: string | null;
  openSyllabus: (courseName: string) => void;
  closeSyllabus: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  executeIntent: (intent: AgentIntent) => void;
  executeAction: (action: AgentAction) => void;
  askAgent: (query: string) => void;
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openAi = useCallback((prompt?: string) => {
    setAiPrompt(prompt || '');
    setIsAiOpen(true);
  }, []);

  const closeAi = useCallback(() => {
    setIsAiOpen(false);
  }, []);

  const openSyllabus = useCallback((courseName: string) => {
    setSelectedCourseForSyllabus(courseName);
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

    return {
      activeTab,
      currentWeek: interval.week_number || 5,
      totalWeeks: interval.total_weeks || 18,
      periodName: interval.period_name || 'Ciclo 2026',
      coursesCount: courses.length,
      currentClass: status?.currentClass
        ? {
            title: status.currentClass.title,
            modality: status.currentClass.modality,
            zoomLink: status.currentClass.metadata?.zoomLink,
          }
        : null,
      nextClass: status?.nextClass
        ? {
            title: status.nextClass.title,
            minutesToStart: status.minutesToNext,
            modality: status.nextClass.modality,
          }
        : null,
      pendingTasksCount: 0,
      selectedCourseName: selectedCourseForSyllabus,
    };
  }, [activeTab, interval, courses, selectedCourseForSyllabus]);

  const executeIntent = useCallback((intent: AgentIntent) => {
    let promptQuery = '';
    switch (intent.type) {
      case 'ANALYZE_COURSE':
        promptQuery = `Analiza la asignatura ${intent.courseName}, sus fórmulas de nota, fechas clave y qué necesito para sacar 20.`;
        break;
      case 'EXPLAIN_SYLLABUS':
        promptQuery = `Explica los temas de la semana actual y rúbricas oficiales del curso ${intent.courseName}.`;
        break;
      case 'CHECK_EVALUATION':
        promptQuery = `¿Qué rúbrica y criterios evalúa la UTP para ${intent.evaluationCode || 'la evaluación'} de ${intent.courseName}?`;
        break;
      case 'FIND_MENTOR':
        promptQuery = `¿Qué mentores o asesorías 1 a 1 recomiendas para ${intent.courseName || 'mis cursos'}?`;
        break;
      case 'FIND_NETWORKING_BEACON':
        promptQuery = `¿Hay compañeros con ventanas libres hoy para coordinar grupos de estudio en ${intent.courseName || 'mis cursos'}?`;
        break;
      case 'SUMMARIZE_WEEK':
        promptQuery = `Haz un resumen ejecutivo de las prioridades académicas para la semana ${intent.weekNumber || interval.week_number || 5}.`;
        break;
      case 'PREPARE_CLASS':
        promptQuery = `¿Qué preguntas clave o temas debo llevar preparados para mi clase de ${intent.courseName}?`;
        break;
      case 'FREE_QUERY':
        promptQuery = intent.query;
        break;
    }

    openAi(promptQuery);
  }, [interval.week_number, openAi]);

  const askAgent = useCallback((query: string) => {
    openAi(query);
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
