import { AgentLiveContext } from '@/types/agent';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { ParsedSyllabus } from '@/lib/syllabus/types';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';

interface PromptBuildContext {
  interval?: UTPCurrentInterval;
  courses?: ProcessedCourse[];
  syllabiData?: Record<string, ParsedSyllabus>;
  liveContext?: AgentLiveContext;
}

export function buildCentralizedAgentSystemPrompt(context?: PromptBuildContext): string {
  const weekNumber = context?.liveContext?.currentWeek || context?.interval?.week_number || 5;
  const totalWeeks = context?.liveContext?.totalWeeks || context?.interval?.total_weeks || 18;
  const periodName = context?.liveContext?.periodName || context?.interval?.period_name || 'Ciclo 2026';
  const activeTab = context?.liveContext?.activeTab || 'hoy';

  let coursesSummary = '';
  if (context?.courses && context.courses.length > 0) {
    coursesSummary = context.courses
      .map((c) => {
        const normalizedName = c.name.toUpperCase().trim();
        const clientSyllabus =
          context?.syllabiData?.[normalizedName] ||
          context?.syllabiData?.[c.name] ||
          (c.courseId ? context?.syllabiData?.[c.courseId] : undefined);

        const official = clientSyllabus || getSyllabusForCourse(c.name);
        const formula = official?.formula || 'Evaluación continua';
        const zoom = c.zoomLink ? ` • Zoom: ${c.zoomLink}` : '';

        let weeklyTopics = '';
        if (official?.weeklySchedule && official.weeklySchedule.length > 0) {
          weeklyTopics = official.weeklySchedule
            .map((w) => `    • Sem ${w.week}${w.evaluation ? ` [Eval: ${w.evaluation}]` : ''}: ${w.topic || w.topics?.join(', ')}`)
            .join('\n');
        }

        return `### ${c.name} (${c.courseId})${zoom}\n- Fórmula: \`${formula}\`\n- Temario:\n${weeklyTopics || '    • Temario del ciclo oficial'}`;
      })
      .join('\n\n');
  }

  return `Eres el AGENTE INTELIGENTE AUTÓNOMO de UTP Class (Asistente Académico Universitario en Vivo).
No eres un simple chatbot pasivo; eres un agente que vive dentro de la plataforma web del estudiante y puedes ejecutar acciones en el navegador.

## ESTADO EN TIEMPO REAL DEL ESTUDIANTE:
- Ciclo Actual: ${periodName}
- Semana Académica: Semana ${weekNumber} de ${totalWeeks}
- Pestaña Activa en Pantalla: ${activeTab}
- Total Asignaturas Matriculadas: ${context?.courses?.length || 0}
${context?.liveContext?.currentClass ? `- Clase En Vivo Ahora: ${context.liveContext.currentClass.title} [${context.liveContext.currentClass.modality}]` : ''}
${context?.liveContext?.nextClass ? `- Próxima Clase: ${context.liveContext.nextClass.title} (inicia en ${context.liveContext.nextClass.minutesToStart} min)` : ''}

## BASE DE CONOCIMIENTO DE SÍLABOS OFICIALES:
${coursesSummary || 'Asignaturas matriculadas disponibles en el horario.'}

## CAPACIDADES Y REGLAS DE RESPUESTA:
1. Sé conciso, directo, empático y estructurado. Usa viñetas claras y negritas.
2. Si el usuario te pide abrir un sílabo, ver un curso o ir a una sección, o si responder a su consulta se beneficia de mostrarle la pantalla relevante, USA LAS HERRAMIENTAS (Function Calling) como \`navigateToTab\` o \`openSyllabus\`.
3. Ofrece siempre respuestas precisas con consejos prácticos para maximizar la nota (sacar 20) basados en la rúbrica y las 4 dimensiones de evaluación.
4. Genera siempre 3 a 4 \`suggestedActions\` breves al final para que el alumno pueda continuar con un solo clic.`;
}
