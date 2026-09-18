import { useMemo } from 'react';

/**
 * Genera CSS custom properties para la aurora-ambient-card de forma
 * aleatoria pero estable (calculado una sola vez al montar).
 *
 * Matemática usada:
 *  - Duraciones: valor base ± jitter aleatorio  →  dos orbitadores siempre
 *    incommensurate (ratio irracional), lo que da un periodo de repetición
 *    extremadamente largo (producto de ambos), haciendo imposible la
 *    sincronización visual entre cards.
 *  - Delays negativos: arrancan mid-animation en puntos distintos del ciclo,
 *    dando inmediatamente la impresión de movimiento orgánico único.
 *  - No hay keyframe extra, solo se reutilizan las dos animaciones base del
 *    CSS; toda la variación es puramente matemática a través de variables.
 */
export function useAuroraStyle(seed?: number): React.CSSProperties {
  return useMemo(() => {
    // Usa un seed estable si se provee (útil para listas donde el índice sirve
    // de seed), de lo contrario Math.random() da un valor único por instancia.
    const r = seed !== undefined
      ? pseudoRandom(seed)
      : Math.random;

    // Duraciones base de cada orbitador  (rango 9 – 28 s)
    const dur1 = lerp(9, 28, r());
    const dur2 = lerp(9, 28, r());

    // Delays negativos para arrancar mid-cycle  (entre −dur y 0)
    const delay1 = -lerp(0, dur1, r());
    const delay2 = -lerp(0, dur2, r());

    // Alterna las keyframes alt de forma probabilística (50 %)
    // para aumentar la diversidad de trayectorias sin múltiples clases.
    const useAlt = r() > 0.5;
    const anim1 = useAlt ? 'aurora-harmonic-orbit-alt-1' : 'aurora-harmonic-orbit-1';
    const anim2 = useAlt ? 'aurora-harmonic-orbit-alt-2' : 'aurora-harmonic-orbit-2';

    return {
      '--aurora-dur-1': `${dur1.toFixed(2)}s`,
      '--aurora-dur-2': `${dur2.toFixed(2)}s`,
      '--aurora-delay-1': `${delay1.toFixed(2)}s`,
      '--aurora-delay-2': `${delay2.toFixed(2)}s`,
      '--aurora-anim-1': anim1,
      '--aurora-anim-2': anim2,
    } as React.CSSProperties;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = calculado UNA VEZ al montar; sin re-renders innecesarios
}

// ─── helpers ────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generador pseudo-aleatorio basado en un entero seed (Mulberry32).
 * Devuelve una función () => number ∈ [0, 1) igual que Math.random.
 */
function pseudoRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
