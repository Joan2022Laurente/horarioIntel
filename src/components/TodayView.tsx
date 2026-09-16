'use client';

import React, { useState, useEffect } from 'react';
import { UTPCurrentInterval, AssignmentRubric, CourseAssignment } from '@/types/utp';
import { 
  getCurrentAndNextClass, 
  getEventsForDay 
} from '@/lib/schedule-parser';
import { getSynchronizedStudentTasks } from '@/lib/activity-adapter';
import { RubricModal } from '@/components/tasks/RubricModal';
import { HomeworkInstructionsModal } from '@/components/tasks/HomeworkInstructionsModal';
import { SyllabusModal } from '@/components/SyllabusModal';
import { TodayBanner } from '@/components/today/TodayBanner';
import { TodayTabsNav, TodayTabSection } from '@/components/today/TodayTabsNav';
import { TodayTasksSection } from '@/components/today/TodayTasksSection';
import { TodayClassesSection } from '@/components/today/TodayClassesSection';
import { TodayEvaluationsSection } from '@/components/today/TodayEvaluationsSection';

interface TodayViewProps {
  interval: UTPCurrentInterval;
  onAskAi: (prompt: string) => void;
  onNavigateToWeekly: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  interval,
  onAskAi,
  onNavigateToWeekly,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const currentWeek = interval.week_number || 4;
  const events = interval.events || [];

  // Modals state
  const [activeRubric, setActiveRubric] = useState<{
    rubric: AssignmentRubric;
    taskTitle: string;
    courseName: string;
  } | null>(null);
  const [selectedTaskForInstructions, setSelectedTaskForInstructions] = useState<CourseAssignment | null>(null);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<string | null>(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  // Active view section
  const [activeSection, setActiveSection] = useState<TodayTabSection>('todayClasses');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { currentClass, nextClass, minutesToNext, minutesRemainingCurrent } = getCurrentAndNextClass(events, now);
  const todayEvents = getEventsForDay(events, now);
  const bannerClass = currentClass || nextClass;
  const isLiveNow = !!currentClass;

  // Synchronized tasks from official syllabus
  const synchronizedTasks = getSynchronizedStudentTasks();

  const handleOpenRubric = (rubric: AssignmentRubric, taskTitle: string, courseName: string) => {
    setActiveRubric({ rubric, taskTitle, courseName });
  };

  const handleOpenSyllabus = (courseName: string) => {
    setSelectedCourseForSyllabus(courseName);
    setIsSyllabusModalOpen(true);
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* 1. Hero Status Banner */}
      {bannerClass && (
        <TodayBanner
          bannerClass={bannerClass}
          isLiveNow={isLiveNow}
          minutesRemainingCurrent={minutesRemainingCurrent}
          minutesToNext={minutesToNext}
          currentWeek={currentWeek}
          totalWeeks={interval.total_weeks || 18}
          onAskAi={onAskAi}
        />
      )}

      {/* 2. Flat Navigation Tabs */}
      <TodayTabsNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        tasksCount={synchronizedTasks.length}
        todayClassesCount={todayEvents.length}
        currentWeek={currentWeek}
        totalWeeks={interval.total_weeks || 18}
        periodName={interval.period_name}
      />

      {/* 3. Section Content */}
      {activeSection === 'tasks' && (
        <TodayTasksSection
          tasks={synchronizedTasks}
          onOpenRubric={handleOpenRubric}
          onOpenInstructions={(task) => setSelectedTaskForInstructions(task)}
          onAskAi={onAskAi}
        />
      )}

      {activeSection === 'todayClasses' && (
        <TodayClassesSection
          todayEvents={todayEvents}
          todayDate={now}
          interval={interval}
          onNavigateToWeekly={onNavigateToWeekly}
          onOpenSyllabus={handleOpenSyllabus}
          onAskAi={onAskAi}
        />
      )}

      {activeSection === 'evaluations' && (
        <TodayEvaluationsSection
          currentWeek={currentWeek}
          onOpenSyllabus={handleOpenSyllabus}
          onAskAi={onAskAi}
        />
      )}

      {/* Rúbrica Modal */}
      <RubricModal
        isOpen={!!activeRubric}
        rubric={activeRubric?.rubric || null}
        assignmentTitle={activeRubric?.taskTitle}
        courseName={activeRubric?.courseName}
        onClose={() => setActiveRubric(null)}
        onAskAi={onAskAi}
      />

      {/* Indicaciones y Consigna Oficial de Tarea Modal */}
      <HomeworkInstructionsModal
        isOpen={!!selectedTaskForInstructions}
        task={selectedTaskForInstructions}
        onClose={() => setSelectedTaskForInstructions(null)}
        onAskAi={onAskAi}
      />

      {/* Sílabo Modal */}
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        courseIdentifier={selectedCourseForSyllabus}
        onClose={() => setIsSyllabusModalOpen(false)}
        onAskAi={onAskAi}
      />

    </div>
  );
};
