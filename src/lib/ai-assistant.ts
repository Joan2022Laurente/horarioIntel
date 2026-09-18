import { ProcessedCourse, UTPCurrentInterval, UTPEvent } from '@/types/utp';
import { formatTime, getCurrentAndNextClass, getEventsByWeek } from './schedule-parser';
import { ParsedSyllabus } from './syllabus/types';
import { getCachedSyllabus } from './syllabus/client-storage';
import { getSyllabusForCourse } from './syllabus/official-registry';

export interface AIResponse {
  answer: string;
  suggestedActions: string[];
  contextInfo?: {
    courseName?: string;
    weekNumber?: number;
    zoomLink?: string;
  };
}

/**
 * Resuelve dinámicamente el sílabo para un curso dado a partir de los datos vivos sincronizados,
 * almacenamiento en cliente o registros disponibles.
 */
export function resolveCourseSyllabus(
  courseIdentifier: string,
  syllabiData?: Record<string, ParsedSyllabus>
): ParsedSyllabus | null {
  if (!courseIdentifier) return null;
  const normalized = courseIdentifier.toUpperCase().trim();

  // 1. Buscar en mapa de sílabos vivos proporcionados en la petición
  if (syllabiData) {
    if (syllabiData[normalized]) return syllabiData[normalized];
    if (syllabiData[courseIdentifier]) return syllabiData[courseIdentifier];

    for (const [key, s] of Object.entries(syllabiData)) {
      const code = s.generalInfo?.courseCode?.toUpperCase().trim();
      const name = s.generalInfo?.courseName?.toUpperCase().trim();
      if (
        key.toUpperCase().includes(normalized) ||
        normalized.includes(key.toUpperCase()) ||
        (code && (code === normalized || normalized.includes(code))) ||
        (name && (name.includes(normalized) || normalized.includes(name)))
      ) {
        return s;
      }
    }
  }

  // 2. Buscar en almacenamiento de cliente / LocalStorage
  const cached = getCachedSyllabus(courseIdentifier);
  if (cached) return cached;

  // 3. Fallback al registro oficial
  return getSyllabusForCourse(courseIdentifier);
}

/**
 * Obtiene el tema dinámico para una semana específica de un sílabo
 */
function getWeekTopicFromSyllabus(syllabus: ParsedSyllabus, week: number): {
  topic: string;
  unit?: number | string;
  evaluation?: string;
  activities?: string;
} {
  const session = syllabus.weeklySchedule?.find((s) => s.week === week);
  if (session) {
    const topic = session.topic || (session.topics ? session.topics.join(' • ') : '') || 'Desarrollo curricular y aplicación práctica de la unidad.';
    const activities = Array.isArray(session.activities) ? session.activities.join(', ') : session.activities;
    return {
      topic,
      unit: session.unit,
      evaluation: session.evaluation,
      activities: activities || undefined,
    };
  }

  const evalItem = syllabus.evaluations?.find((e) => e.week === week);
  if (evalItem) {
    return {
      topic: `Evaluación oficial programada: ${evalItem.description} (${evalItem.type} - ${evalItem.weightPercent}%)`,
      evaluation: evalItem.type,
    };
  }

  return {
    topic: 'Consolidación de temas de la unidad y avance de proyectos.',
  };
}

/**
 * Genera consejos pedagógicos contextuales basados en el contenido real del sílabo y la semana.
 */
function generateDynamicStudyTips(syllabus: ParsedSyllabus, currentWeek: number): string[] {
  const tips: string[] = [];
  const session = syllabus.weeklySchedule?.find((s) => s.week === currentWeek);
  const evalThisWeek = syllabus.evaluations?.find((e) => e.week === currentWeek);
  const evalNextWeek = syllabus.evaluations?.find((e) => e.week === currentWeek + 1);

  if (evalThisWeek) {
    tips.push(`Esta semana rindes **${evalThisWeek.type} (${evalThisWeek.weightPercent}%)**: Revisa la rúbrica oficial y valida que cumplas todos los criterios de evaluación.`);
  } else if (evalNextWeek) {
    tips.push(`La próxima semana tienes programada la **${evalNextWeek.type} (${evalNextWeek.weightPercent}%)**: Inicia tu preparación y simulaciones con anticipación.`);
  }

  if (syllabus.antiPlagiarismPolicy) {
    tips.push(`Recuerda mantener el índice de similitud bajo el **${syllabus.antiPlagiarismPolicy.maxSimilarityPercent}%** conforme a la normativa académica UTP.`);
  }

  if (session?.topic) {
    tips.push(`Enfócate en los conceptos centrales de la sesión: *${session.topic.slice(0, 100)}...*`);
  } else {
    tips.push('Asegúrate de participar activamente en la sesión y resolver las dudas con el docente durante la clase.');
  }

  return tips;
}

/**
 * Motor de Asistencia Académica Local 100% Dinámico.
 * Procesa consultas del estudiante y construye respuestas enriquecidas basadas en
 * los cursos matriculados y sus sílabos reales.
 */
export function queryAssistant(
  prompt: string,
  context: {
    interval: UTPCurrentInterval;
    courses: ProcessedCourse[];
    syllabiData?: Record<string, ParsedSyllabus>;
  }
): AIResponse {
  const cleanPrompt = prompt.toLowerCase().trim();
  const currentWeek = context.interval.week_number || 5;
  const totalWeeks = context.interval.total_weeks || 18;
  const events = context.interval.events || [];
  const { currentClass, nextClass, minutesToNext } = getCurrentAndNextClass(events);

  // 1. Preguntas sobre clase en vivo o próxima clase
  if (
    cleanPrompt.includes('siguiente clase') ||
    cleanPrompt.includes('proxima clase') ||
    cleanPrompt.includes('próxima clase') ||
    cleanPrompt.includes('clase toca') ||
    cleanPrompt.includes('tengo clase') ||
    cleanPrompt.includes('clase de hoy')
  ) {
    if (currentClass) {
      const zoom = currentClass.metadata?.zoomLink;
      return {
        answer: `### 🔴 Clase en curso en este momento:
**${currentClass.title}**
- **Modalidad:** ${currentClass.modality === 'P' ? '🏛️ Presencial' : currentClass.modality === 'R' ? '💻 Remoto síncrono' : '🌐 Virtual'}
- **Horario:** ${formatTime(currentClass.startAt)} – ${formatTime(currentClass.finishAt)}
${zoom ? `- **Enlace Zoom:** [Entrar a la sesión en vivo](${zoom})` : ''}

Te recomiendo unirte a la sala o tomar asiento de inmediato.`,
        suggestedActions: [
          zoom ? 'Abrir enlace de Zoom' : 'Ver horario completo',
          '¿Qué temas tocan hoy?',
          '¿Cuándo es mi siguiente examen?',
        ],
        contextInfo: {
          zoomLink: zoom,
          courseName: currentClass.title,
          weekNumber: currentWeek,
        },
      };
    }

    if (nextClass) {
      const zoom = nextClass.metadata?.zoomLink;
      const timeStr = formatTime(nextClass.startAt);
      const countdownStr = minutesToNext
        ? minutesToNext > 60
          ? `(en ${Math.floor(minutesToNext / 60)}h ${minutesToNext % 60}m)`
          : `(en ${minutesToNext} minutos)`
        : '';

      return {
        answer: `### ⏰ Tu próxima clase programada:
**${nextClass.title}**
- **Hora de inicio:** ${timeStr} ${countdownStr}
- **Modalidad:** ${nextClass.modality === 'P' ? '🏛️ Presencial' : nextClass.modality === 'R' ? '💻 Remoto por Zoom' : '🌐 Virtual'}
${zoom ? `- **Sala Zoom directa:** [Clic para ingresar](${zoom})` : ''}

> [!TIP]
> Te sugiero repasar los temas de la **Semana ${currentWeek}** antes de ingresar a la sesión.`,
        suggestedActions: [
          '¿Qué temas tocan en esta clase?',
          'Ver clases de toda la semana',
          'Generar resumen de estudio',
        ],
        contextInfo: {
          zoomLink: zoom,
          courseName: nextClass.title,
          weekNumber: currentWeek,
        },
      };
    }

    return {
      answer: `No tienes más clases programadas para el día de hoy. ¡Es un excelente momento para avanzar tareas o repasar los sílabos de la **Semana ${currentWeek}**!`,
      suggestedActions: [
        '¿Cuándo son mis exámenes parciales?',
        'Ver horario de la semana',
        'Plan de estudio recomendado',
      ],
    };
  }

  // 2. Preguntas sobre exámenes, parciales y evaluaciones de todos los cursos
  if (
    cleanPrompt.includes('examen') ||
    cleanPrompt.includes('examenes') ||
    cleanPrompt.includes('exámenes') ||
    cleanPrompt.includes('parcial') ||
    cleanPrompt.includes('evaluacion') ||
    cleanPrompt.includes('evaluación') ||
    cleanPrompt.includes('evaluaciones') ||
    cleanPrompt.includes('formula') ||
    cleanPrompt.includes('fórmula') ||
    cleanPrompt.includes('calificada')
  ) {
    const coursesWithEvals = context.courses.map((course) => {
      const syllabus = resolveCourseSyllabus(course.name, context.syllabiData);
      return {
        courseName: course.name,
        formula: syllabus?.formula || 'Evaluación Continua',
        evaluations: syllabus?.evaluations || [],
      };
    });

    const rows: string[] = [];
    coursesWithEvals.forEach((item) => {
      if (item.evaluations.length > 0) {
        item.evaluations.forEach((ev) => {
          const status =
            ev.week < currentWeek
              ? '✅ Rendida'
              : ev.week === currentWeek
              ? '🟡 **¡Esta semana!**'
              : `⏳ En ${ev.week - currentWeek} sem`;
          rows.push(`| **${item.courseName}** | \`${ev.type}\` (${ev.weightPercent}%) | Sem ${ev.week} | ${status} |`);
        });
      } else {
        rows.push(`| **${item.courseName}** | Evaluación Continua | Sem 1-18 | 📋 Sílabo en sincronización |`);
      }
    });

    return {
      answer: `### 📅 Calendario Oficial de Evaluaciones UTP (${context.interval.period_name || 'Ciclo 2026'})
Actualmente te encuentras en la **Semana ${currentWeek} de ${totalWeeks}**.

| Asignatura | Evaluación & Peso | Semana | Estado |
| :--- | :--- | :---: | :--- |
${rows.slice(0, 12).join('\n')}

> [!IMPORTANT]
> **Fórmulas Registradas:**
${coursesWithEvals.map((c) => `- **${c.courseName}:** \`${c.formula}\``).join('\n')}`,
      suggestedActions: [
        '¿Qué temas tocan esta semana?',
        '¿Cómo asegurar 20 en mis exámenes?',
        'Ver horario de clases completo',
      ],
    };
  }

  // 3. Pregunta específica sobre un curso matriculado o enfocado
  let targetCourse: ProcessedCourse | undefined = undefined;

  for (const c of context.courses) {
    const cName = c.name.toLowerCase();
    const words = cName.split(/\s+/).filter((w) => w.length > 3);
    if (
      cleanPrompt.includes(cName) ||
      words.some((word) => cleanPrompt.includes(word)) ||
      (c.courseId && cleanPrompt.includes(c.courseId.toLowerCase()))
    ) {
      targetCourse = c;
      break;
    }
  }

  // Si no se nombró un curso explícito pero preguntó por temas del próximo curso
  if (!targetCourse && (cleanPrompt.includes('este curso') || cleanPrompt.includes('esta materia') || cleanPrompt.includes('mi curso') || cleanPrompt.includes('esta clase'))) {
    const candidateName = currentClass?.title || nextClass?.title;
    if (candidateName) {
      targetCourse = context.courses.find((c) => candidateName.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(candidateName.toLowerCase()));
    }
  }

  if (targetCourse) {
    const syllabus = resolveCourseSyllabus(targetCourse.name, context.syllabiData);

    if (syllabus) {
      const thisWeekInfo = getWeekTopicFromSyllabus(syllabus, currentWeek);
      const nextWeekInfo = getWeekTopicFromSyllabus(syllabus, currentWeek + 1);
      const evalList = syllabus.evaluations?.map((e) => `${e.type} (Semana ${e.week} • ${e.weightPercent}% • ${e.modality})`).join(' • ') || 'Evaluación Continua';
      const tips = generateDynamicStudyTips(syllabus, currentWeek);

      return {
        answer: `### 📚 Sílabo Oficial: **${syllabus.generalInfo.courseName}** (\`${syllabus.generalInfo.courseCode}\`)
${syllabus.learningGoal ? `**Logro de Aprendizaje:** ${syllabus.learningGoal}` : ''}

#### 🎯 Temario de la Semana Actual (**Semana ${currentWeek}**):
👉 **${thisWeekInfo.topic}**
${thisWeekInfo.activities ? `*Actividades pedagógicas:* ${thisWeekInfo.activities}` : ''}

#### 🔜 Próxima Semana (**Semana ${currentWeek + 1}**):
👉 **${nextWeekInfo.topic}**

#### 🏆 Sistema de Calificación y Fórmulas:
- **Fórmula Oficial:** \`${syllabus.formula}\`
- **Evaluaciones:** ${evalList}

#### 💡 Recomendaciones del Copiloto IA:
${tips.map((t) => `- ${t}`).join('\n')}`,
        suggestedActions: [
          `Ver sílabo completo de ${targetCourse.name}`,
          '¿Qué evaluaciones tengo en otras materias?',
          '¿Qué clase me toca hoy?',
        ],
        contextInfo: {
          courseName: targetCourse.name,
          weekNumber: currentWeek,
        },
      };
    } else {
      return {
        answer: `### 📖 Asignatura: **${targetCourse.name}** (\`${targetCourse.courseId}\`)
El sílabo para este curso aún no ha sido sincronizado en tu perfil local.

Puedes hacer clic en el botón de sílabos en la barra superior para descargarlo automáticamente desde el repositorio Silbia UTP o importar el documento en texto.`,
        suggestedActions: [
          `Sincronizar sílabo de ${targetCourse.name}`,
          'Ver clases de la semana',
          'Consultar mis próximas evaluaciones',
        ],
        contextInfo: {
          courseName: targetCourse.name,
          weekNumber: currentWeek,
        },
      };
    }
  }

  // 4. Preguntas sobre qué temas tocan esta semana en general (Multi-Curso Dinámico)
  if (
    cleanPrompt.includes('esta semana') ||
    cleanPrompt.includes('temas tocan') ||
    cleanPrompt.includes('que temas') ||
    cleanPrompt.includes('qué temas') ||
    cleanPrompt.includes('semana actual')
  ) {
    const courseBreakdowns = context.courses.map((c) => {
      const syllabus = resolveCourseSyllabus(c.name, context.syllabiData);
      if (syllabus) {
        const weekInfo = getWeekTopicFromSyllabus(syllabus, currentWeek);
        const evalTag = weekInfo.evaluation ? ` 🚨 **[Evaluación: ${weekInfo.evaluation}]**` : '';
        return `**${c.name}:**\n- 📌 *Tema:* ${weekInfo.topic}${evalTag}\n${weekInfo.activities ? `- ⚡ *Actividad:* ${weekInfo.activities}` : ''}`;
      }
      return `**${c.name}:**\n- 📌 *Tema:* Sesión formativa de la Semana ${currentWeek} (Sílabo pendiente de sync)`;
    });

    return {
      answer: `### 🗺️ Hoja de Ruta Dinámica: **Semana ${currentWeek} de ${totalWeeks}** (${context.interval.period_name || 'Ciclo 2026'})

Aquí tienes el desglose oficial de temas y entregas para tus asignaturas matriculadas esta semana:

${courseBreakdowns.join('\n\n')}`,
      suggestedActions: [
        '¿Cuándo es mi próximo examen?',
        '¿Qué clase me toca hoy?',
        'Ver horario semanal completo',
      ],
    };
  }

  // 5. Plan de estudio personalizado o sugerencias
  if (
    cleanPrompt.includes('estudiar') ||
    cleanPrompt.includes('plan de estudio') ||
    cleanPrompt.includes('organizar') ||
    cleanPrompt.includes('consejo') ||
    cleanPrompt.includes('tips')
  ) {
    return {
      answer: `### 🚀 Plan de Estudio Sugerido para la **Semana ${currentWeek}**

He analizado tu horario semanal y las materias registradas para optimizar tus tiempos:

1. **Preparación Previa a Clase:** Revisa 15 minutos antes de cada sesión el tema semanal indicado en tu sílabo para llegar con dudas concretas.
2. **Priorización de Evaluaciones:** Si tienes entregas de avances o prácticas calificadas esta semana, dedícales bloques de 45 minutos diarios de concentración profunda.
3. **Validación de Integridad:** En entregables escritos, verifica siempre la citación de fuentes bibliográficas para asegurar el estándar antiplagio.

> [!TIP]
> Puedes abrir el sílabo de cualquier curso desde la navegación superior o consultarme directamente sobre temas específicos.`,
      suggestedActions: [
        '¿Qué temas tocan en mi próxima clase?',
        'Ver calendario de exámenes',
        '¿Cuándo tengo ventanas libres hoy?',
      ],
    };
  }

  // Respuesta general inteligente
  return {
    answer: `Hola. Como tu **Copiloto Académico Autónomo UTP**, estoy conectado a tu horario en vivo (**Semana ${currentWeek} de ${totalWeeks}**) y a los sílabos de tus ${context.courses.length} asignaturas matriculadas.

¿En qué puedo ayudarte hoy?
- 📖 **Temarios y Sílabos:** Consulta qué temas se enseñan en cualquier semana del ciclo.
- 🎯 **Rúbricas y Evaluaciones:** Revisa fórmulas de nota, porcentajes y entregables de cada curso.
- ⏰ **Horarios y Clases:** Información en vivo de tu próxima clase y accesos directos a Zoom.
- 🚀 **Estrategias de Aprendizaje:** Consejos para maximizar tu promedio y asegurar 20.`,
    suggestedActions: [
      '¿Qué temas tocan esta semana?',
      '¿Cuándo es mi siguiente examen?',
      '¿Qué clase me toca hoy?',
      'Ábreme el sílabo de mi próximo curso',
    ],
  };
}
