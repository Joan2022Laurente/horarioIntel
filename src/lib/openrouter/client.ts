import { getTopFreeTextModels, FALLBACK_FREE_MODELS } from './model-selector';
import { ProcessedCourse, UTPCurrentInterval } from '@/types/utp';
import { ParsedSyllabus } from '@/lib/syllabus/types';
import { AgentAction, AgentLiveContext } from '@/types/agent';
import { AGENT_TOOLS, parseToolCallToAction } from '@/lib/agent/tools';
import { buildCentralizedAgentSystemPrompt } from '@/lib/agent/prompt-builder';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';

export interface OpenRouterChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface OpenRouterResponse {
  answer: string;
  modelUsed: string;
  keyIndexUsed: number;
  suggestedActions: string[];
  action?: AgentAction;
  contextInfo?: {
    courseName?: string;
    weekNumber?: number;
    zoomLink?: string;
  };
}

export function getAvailableApiKeys(): string[] {
  const keys: string[] = [];

  if (process.env.OPENROUTER_API_KEYS) {
    const split = process.env.OPENROUTER_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean);
    keys.push(...split);
  }

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

function extractSuggestedActions(userQuery: string, _answer: string): string[] {
  const actions: string[] = [];
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('semana') || queryLower.includes('hoy') || queryLower.includes('horario')) {
    actions.push('¿Qué evaluaciones tengo en las próximas semanas?');
    actions.push('Ver resumen de temas del sílabo');
  } else if (queryLower.includes('apf') || queryLower.includes('pc') || queryLower.includes('examen') || queryLower.includes('proyecto')) {
    actions.push('¿Cómo obtener la máxima nota en esta rúbrica?');
    actions.push('Consejos de preparación para el examen');
  } else {
    actions.push('¿Cuál es el temario de mi siguiente clase?');
    actions.push('Consejos del Copiloto para sacar 20');
  }

  return actions.slice(0, 3);
}

function cleanAiResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/<(?:thought|think)>[\s\S]*?<\/(?:thought|think)>/gi, '').trim();
  
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

export async function queryOpenRouterWithFallback(
  userPrompt: string,
  context?: {
    interval?: UTPCurrentInterval;
    courses?: ProcessedCourse[];
    syllabiData?: Record<string, ParsedSyllabus>;
    liveContext?: AgentLiveContext;
    conversationHistory?: OpenRouterChatMessage[];
  }
): Promise<OpenRouterResponse> {
  const apiKeys = getAvailableApiKeys();

  if (apiKeys.length === 0) {
    throw new Error('No se encontraron claves válidas de OpenRouter configuradas.');
  }

  const dynamicModels = await getTopFreeTextModels(8, apiKeys[0]);
  const candidateModels = Array.from(new Set([...dynamicModels, ...FALLBACK_FREE_MODELS]));

  const systemPrompt = buildCentralizedAgentSystemPrompt({
    interval: context?.interval,
    courses: context?.courses,
    syllabiData: context?.syllabiData,
    liveContext: context?.liveContext,
  });

  const messages: OpenRouterChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(context?.conversationHistory || []),
    { role: 'user', content: userPrompt },
  ];

  let lastError: Error | null = null;

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
            'X-Title': 'UTP Class Agent',
          },
          body: JSON.stringify({
            model: currentModel,
            messages,
            tools: AGENT_TOOLS,
            tool_choice: 'auto',
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
          continue;
        }

        const data = await response.json();
        const choice = data.choices?.[0]?.message;

        let detectedAction: AgentAction | undefined = undefined;

        // 1. Extraer tool calls formales del modelo
        if (choice?.tool_calls && Array.isArray(choice.tool_calls) && choice.tool_calls.length > 0) {
          const toolCall = choice.tool_calls[0];
          detectedAction = parseToolCallToAction(toolCall.function.name, toolCall.function.arguments);
        }

        const textContent = choice?.content;

        // Identificar curso relevante para contextInfo y carryover
        let relevantCourseName: string | undefined = undefined;
        if (detectedAction?.type === 'OPEN_SYLLABUS' && detectedAction.payload?.courseName) {
          relevantCourseName = detectedAction.payload.courseName;
        } else if (context?.courses && context.courses.length > 0) {
          const lowerText = `${userPrompt} ${textContent || ''}`.toLowerCase();
          const matched = context.courses.find(c => lowerText.includes(c.name.toLowerCase()));
          if (matched) {
            relevantCourseName = matched.name;
          } else if (context?.liveContext?.selectedCourseName) {
            relevantCourseName = context.liveContext.selectedCourseName;
          }
        }

        if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
          const cleanedAnswer = cleanAiResponse(textContent);
          const suggestedActions = extractSuggestedActions(userPrompt, cleanedAnswer);

          return {
            answer: cleanedAnswer,
            modelUsed: currentModel,
            keyIndexUsed: keyIdx + 1,
            suggestedActions,
            action: detectedAction,
            contextInfo: relevantCourseName ? { courseName: relevantCourseName } : undefined,
          };
        } else if (detectedAction) {
          // Si el modelo solo llamó a la herramienta sin texto
          const isQueryAcademicQuestion = /^(qu[eé]|cu[aá]l|c[oó]mo|d[oó]nde|por\s*qu[eé]|temario|aprender|estudiar|temas|de\s+qu[eé]\s+trata|resumen|qu[eé]\s+entra)/i.test(userPrompt.trim());
          
          if (detectedAction.type === 'OPEN_SYLLABUS' && isQueryAcademicQuestion) {
            const courseTarget = detectedAction.payload.courseName || relevantCourseName;
            const syllabus = courseTarget ? (context?.syllabiData?.[courseTarget] || getSyllabusForCourse(courseTarget)) : null;
            const currentWeek = context?.liveContext?.currentWeek || context?.interval?.week_number || 5;

            if (syllabus) {
              const weekSession = syllabus.weeklySchedule?.find(s => s.week === currentWeek) || syllabus.weeklySchedule?.[0];
              const topicText = weekSession ? (weekSession.topic || (weekSession.topics ? weekSession.topics.join(', ') : '')) : 'Temas del ciclo';
              const evalNotice = weekSession?.evaluation ? ` (Semana de evaluación: **${weekSession.evaluation}**)` : '';

              const enrichedAnswer = `Para tu clase de **${syllabus.generalInfo.courseName}** (Semana ${currentWeek}), los puntos clave del sílabo son:\n\n` +
                `- 📚 **Temario de la sesión:** ${topicText}${evalNotice}\n` +
                `- 🎯 **Logro de aprendizaje:** ${syllabus.learningGoal || 'Dominio de las competencias del curso'}\n` +
                `- ⚖️ **Fórmula de evaluación:** \`${syllabus.formula}\`\n\n` +
                `💡 **Consejo del Copiloto:** Repasa los conceptos teóricos y laboratorios prácticos para asegurar la máxima calificación.`;

              return {
                answer: enrichedAnswer,
                modelUsed: currentModel,
                keyIndexUsed: keyIdx + 1,
                suggestedActions: ['Ver cronograma completo', 'Fórmulas y reglas', 'Consejos para sacar 20'],
                action: detectedAction,
                contextInfo: relevantCourseName ? { courseName: relevantCourseName } : undefined,
              };
            }
          }

          const toolDesc = detectedAction.type === 'NAVIGATE_TAB'
            ? `Te estoy llevando a la pestaña de ${detectedAction.payload.tab}.`
            : detectedAction.type === 'OPEN_SYLLABUS'
            ? `Abriendo el sílabo oficial de ${detectedAction.payload.courseName}.`
            : 'Ejecutando acción solicitada...';

          return {
            answer: toolDesc,
            modelUsed: currentModel,
            keyIndexUsed: keyIdx + 1,
            suggestedActions: ['Ver detalles', 'Consejos del Copiloto'],
            action: detectedAction,
            contextInfo: relevantCourseName ? { courseName: relevantCourseName } : undefined,
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
