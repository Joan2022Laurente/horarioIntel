import { ProcessedCourse, UTPEvent, CourseSessionSchedule, CourseEvaluation, AcademicMilestone } from '@/types/utp';
import { KNOWN_SYLLABUS_MAP } from './mock-data';
import { getAllEvaluationsFromRegistry } from './syllabus-parser';

export interface ParsedEventInfo {
  cleanTitle: string;
  sectionCode: string;
  weekInTitle?: number;
  dayInTitle?: string;
}

export function formatCourseName(rawName: string): string {
  if (!rawName) return '';
  const text = rawName.trim();

  // Acrónimos específicos que deben permanecer en mayúsculas
  const acronyms = new Set([
    'TI', 'TDD', 'API', 'AWS', 'IA', 'UTP', 'JWT', 'JPA', 'SQL', 
    'REST', 'VPC', 'EC2', 'S3', 'ALB', 'CI/CD', 'ITIL', 'RSL', 
    'PICO', 'PRISMA', 'CMDB', 'SLA', 'IAM', 'IT'
  ]);
  
  // Conectores y preposiciones en español en minúsculas
  const lowerWords = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'para', 'por', 'con', 'y', 'e', 'o', 'u', 'a', 'al']);

  const words = text.split(/\s+/);
  const formatted = words.map((word, index) => {
    const cleanWord = word.replace(/[^a-záéíóúüñ0-9/]/gi, '').toUpperCase();
    if (acronyms.has(cleanWord)) {
      return word.replace(new RegExp(`\\b${cleanWord}\\b`, 'i'), cleanWord);
    }
    const lowerWord = word.toLowerCase();
    if (index > 0 && lowerWords.has(lowerWord)) {
      return lowerWord;
    }
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  }).join(' ');

  return formatted.replace(/-\s*([a-záéíóúñ])/gi, (_, p1) => `- ${p1.toUpperCase()}`);
}

export function parseEventTitle(rawTitle: string): ParsedEventInfo {
  // Ejemplos:
  // "DESARROLLO WEB INTEGRADO (34374) (Semana 10) - Jueves"
  // "FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS (56357) (Semana 4) - Lunes"
  // "HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA"
  let cleanTitle = rawTitle.trim();
  let sectionCode = '';
  let weekInTitle: number | undefined;
  let dayInTitle: string | undefined;

  // Extraer dia
  const dayMatch = cleanTitle.match(/-\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)$/i);
  if (dayMatch) {
    dayInTitle = dayMatch[1].trim();
    cleanTitle = cleanTitle.replace(/-\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/i, '').trim();
  }

  // Extraer semana
  const weekMatch = cleanTitle.match(/\(\s*semana\s*(\d+)\s*\)/i);
  if (weekMatch) {
    weekInTitle = parseInt(weekMatch[1], 10);
    cleanTitle = cleanTitle.replace(/\(\s*semana\s*\d+\s*\)/i, '').trim();
  }

  // Extraer seccion
  const sectionMatch = cleanTitle.match(/\(\s*(\d+)\s*\)/);
  if (sectionMatch) {
    sectionCode = sectionMatch[1];
    cleanTitle = cleanTitle.replace(/\(\s*\d+\s*\)/, '').trim();
  }

  cleanTitle = formatCourseName(cleanTitle);

  return {
    cleanTitle,
    sectionCode,
    weekInTitle,
    dayInTitle,
  };
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function getDayName(dayIndex: number): string {
  return DAYS_OF_WEEK[dayIndex] || '';
}

export function parseDate(dateStr: string): Date {
  // Maneja formato "2026-08-27 16:00:00" o ISO
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  return new Date(normalized);
}

export function formatTime(dateStr: string): string {
  try {
    const d = parseDate(dateStr);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } catch {
    return dateStr;
  }
}

export function formatScheduleTimeRange(startStr: string, finishStr: string): string {
  try {
    const s = parseDate(startStr);
    const f = parseDate(finishStr);

    const sHours = s.getHours();
    const sMinutes = s.getMinutes().toString().padStart(2, '0');
    const sAmpm = sHours >= 12 ? 'PM' : 'AM';
    const sH12 = (sHours % 12 || 12).toString().padStart(2, '0');

    const fHours = f.getHours();
    const fMinutes = f.getMinutes().toString().padStart(2, '0');
    const fAmpm = fHours >= 12 ? 'PM' : 'AM';
    const fH12 = (fHours % 12 || 12).toString().padStart(2, '0');

    if (sAmpm === fAmpm) {
      return `${sH12}:${sMinutes} – ${fH12}:${fMinutes} ${fAmpm}`;
    }
    return `${sH12}:${sMinutes} ${sAmpm} – ${fH12}:${fMinutes} ${fAmpm}`;
  } catch {
    return `${formatTime(startStr)} – ${formatTime(finishStr)}`;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = parseDate(dateStr);
    return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function getProcessedCourses(events: UTPEvent[]): ProcessedCourse[] {
  const courseMap = new Map<string, {
    courseId: string;
    name: string;
    sectionCode: string;
    sectionId?: string;
    modalities: Set<string>;
    zoomLink?: string;
    sessions: UTPEvent[];
  }>();

  for (const event of events) {
    const parsed = parseEventTitle(event.title);
    const courseId = event.metadata?.courseId || parsed.cleanTitle;

    let existing = courseMap.get(courseId);
    if (!existing) {
      existing = {
        courseId,
        name: parsed.cleanTitle,
        sectionCode: parsed.sectionCode,
        sectionId: event.metadata?.sectionId,
        modalities: new Set(),
        zoomLink: event.metadata?.zoomLink,
        sessions: [],
      };
      courseMap.set(courseId, existing);
    }

    if (event.modality) existing.modalities.add(event.modality);
    if (event.metadata?.zoomLink && !existing.zoomLink) {
      existing.zoomLink = event.metadata.zoomLink;
    }
    if (parsed.sectionCode && !existing.sectionCode) {
      existing.sectionCode = parsed.sectionCode;
    }
    if (event.metadata?.sectionId && !existing.sectionId) {
      existing.sectionId = event.metadata.sectionId;
    }
    existing.sessions.push(event);
  }

  // Incorporar asignaturas virtuales 24/7 registradas que no generan slots en el calendario semanal
  for (const [knownId, knownData] of Object.entries(KNOWN_SYLLABUS_MAP)) {
    const isAlreadyPresent = Array.from(courseMap.values()).some(
      (c) => c.name.toLowerCase().trim() === knownData.name.toLowerCase().trim()
    );

    if (!isAlreadyPresent) {
      courseMap.set(knownId, {
        courseId: knownId,
        name: formatCourseName(knownData.name),
        sectionCode: '54262',
        modalities: new Set(['VT']),
        sessions: [],
      });
    }
  }

  const result: ProcessedCourse[] = [];

  for (const [courseId, data] of courseMap.entries()) {
    // Ordenar sesiones por fecha
    data.sessions.sort((a, b) => parseDate(a.startAt).getTime() - parseDate(b.startAt).getTime());

    const now = new Date();
    const upcomingSessions = data.sessions.filter(s => parseDate(s.finishAt).getTime() >= now.getTime());
    const pastSessions = data.sessions.filter(s => parseDate(s.finishAt).getTime() < now.getTime());

    // Deduce horario semanal recurrente
    const scheduleKeys = new Set<string>();
    const weeklySchedules: CourseSessionSchedule[] = [];

    for (const session of data.sessions) {
      if (session.isLongLasting) continue; // no recurrente por horario especifico
      const d = parseDate(session.startAt);
      const dayNumber = d.getDay(); // 0 = Domingo
      const startH = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
      const finishD = parseDate(session.finishAt);
      const finishH = finishD.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
      const key = `${dayNumber}_${startH}_${finishH}`;

      if (!scheduleKeys.has(key) && dayNumber > 0) {
        scheduleKeys.add(key);
        weeklySchedules.push({
          dayNumber,
          dayName: DAYS_OF_WEEK[dayNumber],
          startTime: startH,
          endTime: finishH,
          modality: session.modality,
          zoomLink: session.metadata?.zoomLink || data.zoomLink,
        });
      }
    }

    // Ordenar horario semanal de Lunes a Sabado
    weeklySchedules.sort((a, b) => a.dayNumber - b.dayNumber);

    const knownSyllabus = KNOWN_SYLLABUS_MAP[courseId];

    result.push({
      courseId,
      name: data.name,
      sectionCode: data.sectionCode,
      sectionId: data.sectionId,
      modalities: Array.from(data.modalities),
      zoomLink: data.zoomLink,
      syllabusUrl: knownSyllabus?.syllabusUrl,
      totalSessions: data.sessions.length,
      upcomingSessions,
      pastSessions,
      weeklySchedules,
    });
  }

  // Ordenar por nombre de curso
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCurrentAndNextClass(
  events: UTPEvent[],
  refDate: Date = new Date()
): {
  currentClass: UTPEvent | null;
  nextClass: UTPEvent | null;
  minutesToNext: number | null;
  minutesRemainingCurrent: number | null;
} {
  const refTime = refDate.getTime();
  let currentClass: UTPEvent | null = null;
  let nextClass: UTPEvent | null = null;
  let minDiff = Infinity;
  let minutesRemainingCurrent: number | null = null;

  // Filtrar eventos con horas validas y no 'isLongLasting'
  const regularEvents = events.filter(e => !e.isLongLasting);

  for (const event of regularEvents) {
    const startTime = parseDate(event.startAt).getTime();
    const finishTime = parseDate(event.finishAt).getTime();

    // En curso
    if (refTime >= startTime && refTime <= finishTime) {
      currentClass = event;
      minutesRemainingCurrent = Math.max(0, Math.floor((finishTime - refTime) / (1000 * 60)));
    }

    // Proxima clase
    if (startTime > refTime) {
      const diff = startTime - refTime;
      if (diff < minDiff) {
        minDiff = diff;
        nextClass = event;
      }
    }
  }

  const minutesToNext = minDiff !== Infinity ? Math.floor(minDiff / (1000 * 60)) : null;

  return {
    currentClass,
    nextClass,
    minutesToNext,
    minutesRemainingCurrent,
  };
}

export function getEventsForDay(events: UTPEvent[], targetDate: Date): UTPEvent[] {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  return events
    .filter(event => {
      if (event.isLongLasting) return false;
      const d = parseDate(event.startAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    })
    .sort((a, b) => parseDate(a.startAt).getTime() - parseDate(b.startAt).getTime());
}

export function getEventsByWeek(events: UTPEvent[], weekNum: number): UTPEvent[] {
  return events
    .filter(event => {
      if (event.isLongLasting) return false;
      const parsed = parseEventTitle(event.title);
      return parsed.weekInTitle === weekNum;
    })
    .sort((a, b) => parseDate(a.startAt).getTime() - parseDate(b.startAt).getTime());
}

export const ALL_COURSE_EVALUATIONS: CourseEvaluation[] = getAllEvaluationsFromRegistry();

export function getAcademicMilestones(currentWeek: number): AcademicMilestone[] {
  const milestoneWeeks = [
    { week: 4, title: 'Semana 4: Inicio de Evaluaciones Continuas (EC1 / TA1)', type: 'evaluation' as const, desc: 'Primeras entregas de rúbricas y videos individuales.' },
    { week: 5, title: 'Semana 5: Primeros Avances de Proyectos & PCs (APF1 / PC1)', type: 'evaluation' as const, desc: 'Avance de Desarrollo Web Integrado (20%), PC1 Cloud (15%) y Matriz de Tesis (20%).' },
    { week: 8, title: 'Semana 8: Exámenes Parciales Oficiales (EP)', type: 'exam' as const, desc: 'Semana de evaluaciones de medio ciclo en todas las asignaturas.' },
    { week: 10, title: 'Semana 10: Segundo Avance de Proyecto (APF2)', type: 'evaluation' as const, desc: 'Avance de Desarrollo Web Integrado (20%): integración frontend-backend.' },
    { week: 12, title: 'Semana 12: Evaluaciones Continuas 2 (EC2 / PC2 / TA2)', type: 'evaluation' as const, desc: 'Segunda ronda de prácticas calificadas y avances metodológicos.' },
    { week: 15, title: 'Semana 15: Tercer Avance & Cierre de Continuas (APF3 / PC3)', type: 'evaluation' as const, desc: 'Últimas evaluaciones antes de la sustentación final.' },
    { week: 18, title: 'Semana 18: Exámenes Finales & Sustentaciones (EF / PROY)', type: 'exam' as const, desc: 'Sustentaciones públicas (30-40% del promedio final).' },
  ];

  return milestoneWeeks.map((m) => {
    const evaluationsInWeek = ALL_COURSE_EVALUATIONS.filter((e) => e.week === m.week);
    return {
      title: m.title,
      type: m.type,
      weekNumber: m.week,
      description: m.desc,
      isCurrentOrUpcoming: currentWeek <= m.week,
      courseEvaluations: evaluationsInWeek,
    };
  });
}

export function getUpcomingEvaluations(currentWeek: number, limit = 6): (CourseEvaluation & { weeksRemaining: number; isCurrentWeek: boolean })[] {
  return ALL_COURSE_EVALUATIONS
    .filter((e) => e.week >= currentWeek)
    .sort((a, b) => a.week - b.week)
    .slice(0, limit)
    .map((e) => ({
      ...e,
      weeksRemaining: e.week - currentWeek,
      isCurrentWeek: e.week === currentWeek,
    }));
}

