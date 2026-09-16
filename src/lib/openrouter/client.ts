import { getTopFreeTextModels, FALLBACK_FREE_MODELS } from './model-selector';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';

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
 * Obtiene todas las claves disponibles en orden de prioridad:
 * 1. OPENROUTER_API_KEYS (separadas por coma)
 * 2. OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc.
 * 3. OPENROUTER_API_KEY
 */
export function getAvailableApiKeys(): string[] {
  const keys: string[] = [];

  // 1. OPENROUTER_API_KEYS
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
 * Construye el prompt de sistema del Copiloto Académico UTP con contexto en vivo
 */
export function buildAcademicSystemPrompt(context?: {
  interval?: UTPCurrentInterval;
  courses?: ProcessedCourse[];
}): string {
  const weekNumber = context?.interval?.week_number || 5;
  const totalWeeks = context?.interval?.total_weeks || 18;
  const periodName = context?.interval?.period_name || 'Ciclo 2026';

  let coursesSummary = '';
  if (context?.courses && context.courses.length > 0) {
    coursesSummary = context.courses
      .map((c) => {
        const official = getSyllabusForCourse(c.name);
        const formula = official?.formula || 'Evaluación continua';
        const rules = official?.rules ? ` • Reglas clave: ${official.rules.slice(0, 2).join('; ')}` : '';
        const zoom = c.zoomLink ? ` • Enlace Zoom: ${c.zoomLink}` : '';
        const modalities = c.modalities?.join(', ') || 'Presencial/Virtual';
        return `- **${c.name}** (Sección: ${c.sectionCode} | Modalidad: ${modalities})${zoom}\n  Fórmula oficial: \`${formula}\`${rules}`;
      })
      .join('\n');
  }

  return `Eres el "Copiloto Académico UTP", un asistente inteligente de élite especializado en ayudar a estudiantes de la Universidad Tecnológica del Perú (UTP).

CONTEXTO ACADÉMICO DEL ESTUDIANTE:
- Ciclo / Periodo: ${periodName}
- Semana Actual: Semana ${weekNumber} de ${totalWeeks}
${coursesSummary ? `\nCURSOS MATRICULADOS DEL ESTUDIANTE:\n${coursesSummary}` : ''}

DIRECTIVAS DE RESPUESTA:
1. Responde de manera concisa, estructurada y en español.
2. Utiliza formato Markdown profesional: negritas, listas con viñetas, tablas limpias y bloques de alerta cuando sea relevante.
3. Al hablar de evaluaciones o tareas, menciona los pesos exactos (ej. 20% PC1, 20% APF1, 40% PROY) y la semana programada.
4. Si el estudiante pregunta por links de Zoom, aulas o docentes, proporciónalos directamente si están en el contexto.
5. Da consejos prácticos y de alta calidad para obtener 20 en las entregas y exámenes.
6. Mantén un tono motivador, profesional y directo al grano (cero saludos excesivos o rodeos innecesarios).`;
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
 * Ejecuta una consulta con OpenRouter con fallback automático de múltiples claves y modelos
 */
export async function queryOpenRouterWithFallback(
  userPrompt: string,
  context?: {
    interval?: UTPCurrentInterval;
    courses?: ProcessedCourse[];
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
            temperature: 0.4,
            max_tokens: 1500,
          }),
        });

        if (response.status === 429 || response.status === 402) {
          console.warn(`[OpenRouter] Clave ${keyIdx + 1} agotada o rate-limit (HTTP ${response.status}). Pasando a la siguiente clave.`);
          // Rompe el bucle de modelos para saltar a la siguiente clave API
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
          const suggestedActions = extractSuggestedActions(userPrompt, textContent);

          return {
            answer: textContent.trim(),
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
