/**
 * Selección dinámica de modelos gratuitos de OpenRouter con ordenamiento por baja latencia y caché en memoria.
 * Inspirado en la arquitectura de portfolio con resiliencia y fallback multicapa.
 */

const MODEL_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de caché en memoria

interface OpenRouterModel {
  id: string;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

interface ModelCache {
  models: string[];
  fetchedAt: number;
}

let cache: ModelCache | null = null;

// Lista de respaldo optimizada en caso de fallo de red o API no disponible
export const FALLBACK_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-3.1:free',
  'google/gemma-2-9b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'openrouter/free',
];

/**
 * Obtiene los mejores modelos gratuitos de texto en OpenRouter ordenados por menor latencia.
 */
export async function getTopFreeTextModels(limit = 10, apiKey?: string): Promise<string[]> {
  const ahora = Date.now();

  // Usar caché si está vigente
  if (cache && ahora - cache.fetchedAt < MODEL_CACHE_TTL_MS && cache.models.length > 0) {
    return cache.models.slice(0, limit);
  }

  const key =
    apiKey ??
    process.env.OPENROUTER_API_KEY_1 ??
    process.env.OPENROUTER_API_KEY ??
    process.env.OPENROUTER_API_KEYS?.split(',')[0] ??
    '';

  if (!key || key === 'your_openrouter_api_key_here') {
    return FALLBACK_FREE_MODELS.slice(0, limit);
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models?sort=latency-low-to-high', {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[model-selector] No se pudo obtener catálogo dinámico (HTTP', res.status, '), usando fallback');
      return cache?.models.slice(0, limit) ?? FALLBACK_FREE_MODELS.slice(0, limit);
    }

    const json = await res.json();
    const rawModels: OpenRouterModel[] = json.data ?? [];

    const filtrados = rawModels.filter((m) => {
      const prompt = parseFloat(m.pricing?.prompt ?? '1');
      const completion = parseFloat(m.pricing?.completion ?? '1');
      const outputMods = m.architecture?.output_modalities ?? [];

      const isFree = prompt === 0 && completion === 0;
      const isTextOut = outputMods.length === 1 && outputMods[0] === 'text';
      const isConversational = !/(safety|moderation|guard|rerank|embedding|embed|reward)/i.test(m.id);

      return isFree && isTextOut && isConversational;
    });

    const ids = filtrados.map((m) => m.id);

    if (ids.length > 0) {
      cache = { models: ids, fetchedAt: ahora };
      return ids.slice(0, limit);
    }

    return FALLBACK_FREE_MODELS.slice(0, limit);
  } catch (err) {
    console.error('[model-selector] Error al consultar /models:', err);
    return cache?.models.slice(0, limit) ?? FALLBACK_FREE_MODELS.slice(0, limit);
  }
}
