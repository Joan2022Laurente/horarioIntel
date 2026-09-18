/**
 * Gestor de cuota diaria de consultas para el Asistente IA en fase de pruebas.
 * Aplica un límite de 6 consultas por día para usuarios estándar y acceso ilimitado para el administrador.
 */

const DAILY_LIMIT = 6;
const STORAGE_PREFIX = 'utp_ai_usage_';
// Hash o identificador del usuario privilegiado
const UNLIMITED_USERS = new Set(['u23307609']);

// Registro en memoria para el servidor (API Routes)
const serverDailyUsageMap: Record<string, { date: string; count: number }> = {};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getTodayDateKey(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Verifica si un identificador de usuario cuenta con cuota ilimitada
 */
export function isWhitelistedUser(userIdOrEmail?: string): boolean {
  if (!userIdOrEmail) return false;
  const clean = userIdOrEmail.toLowerCase().trim();
  for (const privileged of UNLIMITED_USERS) {
    if (clean.includes(privileged)) {
      return true;
    }
  }
  return false;
}

export interface DailyLimitStatus {
  isUnlimited: boolean;
  limit: number;
  used: number;
  remaining: number;
  dateKey: string;
}

/**
 * Consulta el estado de la cuota diaria (Cliente)
 */
export function getClientDailyLimitStatus(userIdOrEmail?: string): DailyLimitStatus {
  const dateKey = getTodayDateKey();

  if (isWhitelistedUser(userIdOrEmail)) {
    return {
      isUnlimited: true,
      limit: 9999,
      used: 0,
      remaining: 9999,
      dateKey,
    };
  }

  if (typeof window === 'undefined') {
    return {
      isUnlimited: false,
      limit: DAILY_LIMIT,
      used: 0,
      remaining: DAILY_LIMIT,
      dateKey,
    };
  }

  try {
    const key = `${STORAGE_PREFIX}${dateKey}`;
    const raw = localStorage.getItem(key);
    const used = raw ? parseInt(raw, 10) : 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return {
      isUnlimited: false,
      limit: DAILY_LIMIT,
      used,
      remaining,
      dateKey,
    };
  } catch {
    return {
      isUnlimited: false,
      limit: DAILY_LIMIT,
      used: 0,
      remaining: DAILY_LIMIT,
      dateKey,
    };
  }
}

/**
 * Incrementa el uso diario en el cliente
 */
export function incrementClientDailyUsage(userIdOrEmail?: string): DailyLimitStatus {
  const status = getClientDailyLimitStatus(userIdOrEmail);
  if (status.isUnlimited || typeof window === 'undefined') return status;

  try {
    const key = `${STORAGE_PREFIX}${status.dateKey}`;
    const nextUsed = status.used + 1;
    localStorage.setItem(key, nextUsed.toString());

    return {
      ...status,
      used: nextUsed,
      remaining: Math.max(0, DAILY_LIMIT - nextUsed),
    };
  } catch {
    return status;
  }
}

/**
 * Verifica y actualiza la cuota en el Servidor (API Route)
 */
export function checkAndConsumeServerDailyQuota(identifier?: string): {
  allowed: boolean;
  status: DailyLimitStatus;
} {
  const dateKey = getTodayDateKey();
  const isPrivileged = isWhitelistedUser(identifier);

  if (isPrivileged) {
    return {
      allowed: true,
      status: {
        isUnlimited: true,
        limit: 9999,
        used: 0,
        remaining: 9999,
        dateKey,
      },
    };
  }

  const key = `${identifier || 'anonymous'}_${dateKey}`;
  const record = serverDailyUsageMap[key] || { date: dateKey, count: 0 };

  if (record.date !== dateKey) {
    record.date = dateKey;
    record.count = 0;
  }

  if (record.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      status: {
        isUnlimited: false,
        limit: DAILY_LIMIT,
        used: record.count,
        remaining: 0,
        dateKey,
      },
    };
  }

  record.count += 1;
  serverDailyUsageMap[key] = record;

  return {
    allowed: true,
    status: {
      isUnlimited: false,
      limit: DAILY_LIMIT,
      used: record.count,
      remaining: Math.max(0, DAILY_LIMIT - record.count),
      dateKey,
    },
  };
}
