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

  const selectedCourse = context?.liveContext?.selectedCourseName;
  const currentClassTitle = context?.liveContext?.currentClass?.title;
  const nextClassTitle = context?.liveContext?.nextClass?.title;
  const defaultTargetCourse = selectedCourse || currentClassTitle || nextClassTitle || (context?.courses?.[0]?.name ?? 'tu asignatura actual');

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

        const goal = official?.learningGoal ? `\n- Logro de Aprendizaje: ${official.learningGoal}` : '';
        return `### ${c.name} (${c.courseId})${zoom}${goal}\n- Fórmula: \`${formula}\`\n- Temario Oficial por Semanas:\n${weeklyTopics || '    • Temario del ciclo oficial'}`;
      })
      .join('\n\n');
  }

  return `Eres el AGENTE INTELIGENTE AUTÓNOMO de UTP Class (Asistente Académico Universitario en Vivo).
No eres un simple chatbot pasivo ni un buscador ciego; eres un copiloto académico inteligente y ejecutor de acciones que asiste al estudiante universitario.

## ESTADO EN TIEMPO REAL DEL ESTUDIANTE:
- Ciclo Actual: ${periodName}
- Semana Académica Actual: Semana ${weekNumber} de ${totalWeeks}
- Pestaña Activa en Pantalla: ${activeTab}
- Asignatura en Foco Actual: ${selectedCourse ? `"${selectedCourse}"` : 'Ninguna seleccionada'}
${currentClassTitle ? `- Clase En Vivo Ahora: "${currentClassTitle}" [${context?.liveContext?.currentClass?.modality || 'P'}]` : ''}
${nextClassTitle ? `- Próxima Clase: "${nextClassTitle}" (inicia en ${context?.liveContext?.nextClass?.minutesToStart || 0} min)` : ''}
- Asignatura Target por Defecto: "${defaultTargetCourse}"

## BASE DE CONOCIMIENTO DE SÍLABOS OFICIALES UTP:
${coursesSummary || 'Asignaturas matriculadas disponibles en el horario.'}

## PROTOCOLO ESTRICTO DE DECISIÓN (TEXTO VS HERRAMIENTAS):

1. PREGUNTAS DE CONTENIDO, TEMAS, APRENDIZAJE Y CONSEJOS (RESPONDE SIEMPRE CON TEXTO DETALLADO EN EL CHAT):
   - Si el estudiante pregunta: "¿qué debería aprender para esta clase?", "¿qué temas tocan?", "¿de qué trata la sesión?", "¿qué entra en la PC1?", "¿cómo asegurar 20?", "¿cuál es el temario?", etc.:
     * RESPONDE DIRECTAMENTE en markdown con una explicación completa, estructurada y pedagógica.
     * Identifica los temas de la Semana ${weekNumber} para "${defaultTargetCourse}" basándote en la base de conocimiento de sílabos oficial arriba.
     * Menciona los temas clave, arquitecturas/conceptos teóricos, laboratorios aplicables y un consejo práctico para dominar la sesión.
     * PROHIBIDO invocar la herramienta \`openSyllabus\` en este caso (el estudiante quiere leer la respuesta en el chat, no que se le abra el modal).

2. COMANDOS EXPLÍCITOS DE INTERFAZ Y NAVEGACIÓN (INVOCA HERRAMIENTAS):
   - Si el estudiante da una orden directa para interactuar con la pantalla:
     * "abre el sílabo", "ábreme el sílabo", "muéstrame el sílabo", "abre el sílabo de mi próximo curso", "ver documento":
       -> Invoca \`openSyllabus\` con \`{ "courseName": "${defaultTargetCourse}" }\`.
     * "ir al horario", "ve a networking", "abre cursos", "ir a comunidad":
       -> Invoca \`navigateToTab\` con la pestaña correspondiente.
   - NUNCA preguntes "¿De cuál curso deseas ver el sílabo?" si ya conoces el curso en foco o la próxima clase ("${defaultTargetCourse}").

3. TONO Y FORMATO:
   - Profesional, motivador, conciso y universitario. Usa viñetas claras y negritas.
   - Sugiere siempre 2 a 3 \`suggestedActions\` útiles al final.`;
}
