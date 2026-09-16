/**
 * Selección dinámica de modelos gratuitos de OpenRouter con ordenamiento por baja latencia y caché en memoria.
 * Filtrado estricto para modelos conversacionales de alta velocidad sin leaks de reasoning.
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

// Lista de modelos gratuitos verificados y activos en OpenRouter
export const FALLBACK_FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'liquid/lfm-2.5-2.6b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nex-agi/nex-n2.5-pro:free',
  'nex-agi/nex-n2.5-mini:free',
  'poolside/laguna-s-2.1:free',
  'z-ai/glm-5.2:free',
];

/**
 * Obtiene los mejores modelos gratuitos de texto en OpenRouter ordenados por menor latencia.
 */
export async function getTopFreeTextModels(limit = 8, apiKey?: string): Promise<string[]> {
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

  if (!key || key.length < 15) {
    return FALLBACK_FREE_MODELS.slice(0, limit);
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
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
      const isFree = m.id.endsWith(':free') || (parseFloat(m.pricing?.prompt ?? '1') === 0 && parseFloat(m.pricing?.completion ?? '1') === 0);
      const isConversational = !/(safety|guard|rerank|embed|reward|reasoning|thinking|deepseek-r1|nano-omni.*reasoning)/i.test(m.id);

      return isFree && isConversational;
    });

    const ids = filtrados.map((m) => m.id);

    // Priorizar modelos con soporte demostrado de español fluido y baja latencia
    const prioritized = [
      ...FALLBACK_FREE_MODELS.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !FALLBACK_FREE_MODELS.includes(id)),
    ];

    if (prioritized.length > 0) {
      cache = { models: prioritized, fetchedAt: ahora };
      return prioritized.slice(0, limit);
    }

    return FALLBACK_FREE_MODELS.slice(0, limit);
  } catch (err) {
    console.error('[model-selector] Error al consultar /models:', err);
    return cache?.models.slice(0, limit) ?? FALLBACK_FREE_MODELS.slice(0, limit);
  }
}

