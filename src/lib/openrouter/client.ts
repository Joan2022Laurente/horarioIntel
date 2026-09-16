import { getTopFreeTextModels, FALLBACK_FREE_MODELS } from './model-selector';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { ParsedSyllabus } from '@/lib/syllabus/types';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';
import { getCurrentAndNextClass, parseEventTitle, formatTime } from '@/lib/schedule-parser';

export interface OpenRouterChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  answer: string;
  modelUsed: string;
  keyIndexUsed: number;
  suggestedActions: string[];
  contextInfo?: {
    courseName?: string;
    weekNumber?: number;
    zoomLink?: string;
  };
}

/**
 * Obtiene todas las claves disponibles en orden de prioridad
 */
export function getAvailableApiKeys(): string[] {
  const keys: string[] = [];

  // 1. OPENROUTER_API_KEYS (separadas por coma)
  if (process.env.OPENROUTER_API_KEYS) {
    const split = process.env.OPENROUTER_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean);
    keys.push(...split);
  }

  // 2. Claves individuales
  if (process.env.OPENROUTER_API_KEY_1 && !keys.includes(process.env.OPENROUTER_API_KEY_1.trim())) {
    keys.push(process.env.OPENROUTER_API_KEY_1.trim());
  }
  if (process.env.OPENROUTER_API_KEY_2 && !keys.includes(process.env.OPENROUTER_API_KEY_2.trim())) {
    keys.push(process.env.OPENROUTER_API_KEY_2.trim());
  }
  if (process.env.OPENROUTER_API_KEY && !keys.includes(process.env.OPENROUTER_API_KEY.trim())) {
    keys.push(process.env.OPENROUTER_API_KEY.trim());
  }

  return keys.filter((k) => k.startsWith('sk-or-v1-') || k.length > 20);
}

/**
 * Construye el prompt de sistema del Copiloto Académico UTP con contexto dinámico y sílabos de localStorage
 */
export function buildAcademicSystemPrompt(context?: {
  interval?: UTPCurrentInterval;
  courses?: ProcessedCourse[];
  syllabiData?: Record<string, ParsedSyllabus>;
}): string {
  const weekNumber = context?.interval?.week_number || 5;
  const totalWeeks = context?.interval?.total_weeks || 18;
  const periodName = context?.interval?.period_name || 'Ciclo 2026';
  const events = context?.interval?.events || [];

  // Calcular clase en curso y próxima clase
  const classStatus = events.length > 0 ? getCurrentAndNextClass(events) : null;
  let nextClassText = 'No hay clases programadas inmediatamente.';
  if (classStatus?.nextClass) {
    const parsed = parseEventTitle(classStatus.nextClass.title);
    const timeStr = `${formatTime(classStatus.nextClass.startAt)} - ${formatTime(classStatus.nextClass.finishAt)}`;
    const zoom = classStatus.nextClass.metadata?.zoomLink ? ` • Link Zoom: ${classStatus.nextClass.metadata.zoomLink}` : '';
    const minStr = classStatus.minutesToNext !== null ? ` (en ${classStatus.minutesToNext} minutos)` : '';
    nextClassText = `**${parsed.cleanTitle}** (${parsed.sectionCode || 'Sección'}) • ${classStatus.nextClass.startAt.split('T')[0]} de ${timeStr}${minStr} [Modalidad: ${classStatus.nextClass.modality}]${zoom}`;
  }

  let coursesSummary = '';
  if (context?.courses && context.courses.length > 0) {
    coursesSummary = context.courses
      .map((c) => {
        const normalizedName = c.name.toUpperCase().trim();
        // 1. Buscar en sílabos dinámicos enviados por el cliente desde LocalStorage
        const clientSyllabus = context?.syllabiData?.[normalizedName] ||
          context?.syllabiData?.[c.name] ||
          (c.courseId ? context?.syllabiData?.[c.courseId] : undefined);

        // 2. Fallback al registro oficial
        const official = clientSyllabus || getSyllabusForCourse(c.name);
        const formula = official?.formula || 'Evaluación continua';
        const zoom = c.zoomLink ? ` • Zoom: ${c.zoomLink}` : '';

        // Temario por semana oficial
        let weeklyTopics = '';
        if (official?.weeklySchedule && official.weeklySchedule.length > 0) {
          weeklyTopics = official.weeklySchedule
            .map((w) => `    • Sem ${w.week}${w.evaluation ? ` [Eval: ${w.evaluation}]` : ''}: ${w.topic || w.topics?.join(', ')}`)
            .join('\n');
        }

        return `### ${c.name} (Sección: ${c.sectionCode})${zoom}\n- Fórmula de notas: \`${formula}\`\n- Temario semanal oficial del sílabo:\n${weeklyTopics || '    • Temario por clases disponible en el ciclo'}`;
      })
      .join('\n\n');
  }

  return `Eres el "Copiloto Académico UTP", un asistente inteligente de élite para estudiantes de la Universidad Tecnológica del Perú (UTP).

CONTEXTO EN TIEMPO REAL:
- Ciclo: ${periodName} • Semana Actual: Semana ${weekNumber} de ${totalWeeks}
- PRÓXIMA CLASE PROGRAMADA: ${nextClassText}

CURSOS Y SÍLABOS DEL ESTUDIANTE:
${coursesSummary}

REGLAS DE RESPUESTA (CRÍTICO: SÉ CONCISO Y DIRECTO):
1. PROPORCIONALIDAD: Responde exactamente a lo que se pregunta, sin rodeos ni textos genéricos prefabricados.
   - Si preguntan "¿qué tocará en la clase?", "¿qué temas tocan esta semana?" o similar:
     • Identifica el curso y la semana correspondiente.
     • Responde en 2 a 4 líneas con el tema central exacto y 2 viñetas breves.
     • Utiliza el temario provisto en el contexto.
   - Si preguntan por recomendaciones de estudio, da consejos específicos sobre los temas de la semana, no un temario repetido.
   - Si preguntan por evaluaciones o tareas, menciona la semana, código y peso (ej. 20% PC1).
2. FORMATO: Markdown limpio y legible (negritas, viñetas simples). NUNCA uses etiquetas HTML como <br>.
3. TONO: Directo, ágil y útil, como un copiloto de alta precisión.`;
}

/**
 * Genera sugerencias de acciones rápidas para el usuario basadas en la respuesta
 */
function extractSuggestedActions(userQuery: string, _answer: string): string[] {
  const actions: string[] = [];
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('semana') || queryLower.includes('hoy') || queryLower.includes('horario')) {
    actions.push('¿Qué evaluaciones tengo en las próximas 2 semanas?');
    actions.push('Ver resumen de temas del sílabo');
  } else if (queryLower.includes('apf') || queryLower.includes('pc') || queryLower.includes('examen') || queryLower.includes('proyecto')) {
    actions.push('¿Cómo obtener la máxima nota en esta rúbrica?');
    actions.push('Consejos de preparación para el examen');
  } else {
    actions.push('¿Cuál es el temario de mi siguiente clase?');
    actions.push('Calcular mi promedio proyectado');
  }

  return actions.slice(0, 2);
}

/**
 * Limpia cualquier rastro de meta-razonamiento o bloques <thought> de modelos de razonamiento
 */
function cleanAiResponse(text: string): string {
  let cleaned = text.trim();
  // Eliminar bloques <thought>...</thought> o <think>...</think>
  cleaned = cleaned.replace(/<(?:thought|think)>[\s\S]*?<\/(?:thought|think)>/gi, '').trim();
  
  // Eliminar preámbulos de pensamiento en inglés como "Here's a thinking process:..."
  if (cleaned.includes("Here's a thinking process:") || cleaned.includes("Thinking Process:")) {
    const split = cleaned.split(/\n\s*\n/);
    const nonThinking = split.filter(p => 
      !p.includes("Here's a thinking process:") && 
      !p.includes("Thinking Process:") &&
      !p.startsWith("1.  **Analyze") &&
      !p.startsWith("2.  **Identify") &&
      !p.startsWith("3.  **Determine")
    );
    if (nonThinking.length > 0) {
      cleaned = nonThinking.join('\n\n').trim();
    }
  }

  // Eliminar prefijos de meta-razonamiento en inglés
  if (cleaned.startsWith('We need to answer:') || cleaned.startsWith('The user is asking:') || cleaned.startsWith('Analysis:')) {
    const lines = cleaned.split('\n');
    const validLines = lines.filter(l => 
      !l.startsWith('We need to answer:') && 
      !l.startsWith('The user is') && 
      !l.startsWith('In the context,') &&
      !l.startsWith('So we must') &&
      !l.startsWith('We have context:')
    );
    cleaned = validLines.join('\n').trim();
  }
  return cleaned;
}

/**
 * Ejecuta una consulta con OpenRouter con fallback automático de múltiples claves y modelos
 */
export async function queryOpenRouterWithFallback(
  userPrompt: string,
  context?: {
    interval?: UTPCurrentInterval;
    courses?: ProcessedCourse[];
    syllabiData?: Record<string, ParsedSyllabus>;
    conversationHistory?: OpenRouterChatMessage[];
  }
): Promise<OpenRouterResponse> {
  const apiKeys = getAvailableApiKeys();

  if (apiKeys.length === 0) {
    throw new Error('No se encontraron claves válidas de OpenRouter configuradas.');
  }

  // Obtener modelos candidatos ordenados por latencia
  const dynamicModels = await getTopFreeTextModels(8, apiKeys[0]);
  const candidateModels = Array.from(new Set([...dynamicModels, ...FALLBACK_FREE_MODELS]));

  const systemPrompt = buildAcademicSystemPrompt(context);

  const messages: OpenRouterChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(context?.conversationHistory || []),
    { role: 'user', content: userPrompt },
  ];

  let lastError: Error | null = null;

  // Intento de cascada: Por cada clave -> Por cada modelo
  for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
    const currentKey = apiKeys[keyIdx];

    for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
      const currentModel = candidateModels[modelIdx];

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://horario-inteligente.utp.edu.pe',
            'X-Title': 'UTP Class Copilot',
          },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature: 0.35,
            max_tokens: 1500,
          }),
        });

        if (response.status === 429 || response.status === 402) {
          console.warn(`[OpenRouter] Clave ${keyIdx + 1} agotada o rate-limit (HTTP ${response.status}). Pasando a la siguiente clave.`);
          break;
        }

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          console.warn(`[OpenRouter] Falló modelo ${currentModel} con clave ${keyIdx + 1} (HTTP ${response.status}): ${errText}`);
          continue; // Probar siguiente modelo
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
          const cleanedAnswer = cleanAiResponse(textContent);
          const suggestedActions = extractSuggestedActions(userPrompt, cleanedAnswer);

          return {
            answer: cleanedAnswer,
            modelUsed: currentModel,
            keyIndexUsed: keyIdx + 1,
            suggestedActions,
          };
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[OpenRouter] Error de conexión con modelo ${currentModel} (clave ${keyIdx + 1}):`, lastError.message);
      }
    }
  }

  throw lastError || new Error('Todos los modelos y claves de OpenRouter fallaron.');
}

