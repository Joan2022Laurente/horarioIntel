'use client';

import React, { useEffect, useRef } from 'react';

export type OrbState = 'idle' | 'thinking' | 'streaming';
export type OrbColorMode = 'monochrome' | 'lime' | 'orange' | 'cyan';

interface AsciiMatrixOrbProps {
  size?: number;
  state?: OrbState;
  colorMode?: OrbColorMode;
  className?: string;
  speedMultiplier?: number;
  interactive?: boolean;
}

const GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '7', '4', '0', '9', '5', '8', '2', '3', '6', '1'];

interface SpherePoint {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  char: string;
  mutationSpeed: number;
}

export const AsciiMatrixOrb: React.FC<AsciiMatrixOrbProps> = ({
  size = 32,
  state = 'idle',
  colorMode = 'monochrome',
  className = '',
  speedMultiplier = 1.0,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pointsRef = useRef<SpherePoint[]>([]);
  const rotationRef = useRef({ x: 0.25, y: 0.35, z: 0.1 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  const isVisibleRef = useRef<boolean>(true);
  const currentIntensityRef = useRef<number>(state === 'thinking' ? 1.0 : state === 'streaming' ? 0.5 : 0.0);

  // Inicializar puntos distribuidos con Fibonacci Sphere con espaciado fino de alta resolución
  useEffect(() => {
    // Densidad aumentada en +20% con micro-fuentes finas
    const count = size <= 28 ? 90 : size <= 44 ? 140 : size <= 72 ? 200 : 290;
    const points: SpherePoint[] = [];

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // de 1 a -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * 2.399963229728653; // Golden angle en radianes

      const x = Math.cos(phi) * radiusAtY;
      const z = Math.sin(phi) * radiusAtY;

      points.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        mutationSpeed: 0.015 + Math.random() * 0.04,
      });
    }

    pointsRef.current = points;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Observador para detener el loop a 0 FPS cuando no es visible en pantalla
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Soporte Hi-DPI ultra nítido con super-sampling calibrado
    const dpr = Math.max(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(render);

      if (!isVisibleRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Interpolación suave y orgánica de intensidad (LERP continua sin saltos)
      const targetIntensity = state === 'thinking' ? 1.0 : state === 'streaming' ? 0.5 : 0.0;
      const easeSpeed = 3.2; // Transición fluida (~350ms)
      currentIntensityRef.current += (targetIntensity - currentIntensityRef.current) * Math.min(1, dt * easeSpeed);
      const intensity = currentIntensityRef.current;

      // Velocidad y pulsación según intensidad suavemente interpolada
      const idleRotY = 0.45 * speedMultiplier;
      const thinkRotY = 1.75 * speedMultiplier;
      const rotSpeedY = idleRotY + (thinkRotY - idleRotY) * intensity;

      const idleRotX = 0.28 * speedMultiplier;
      const thinkRotX = 1.05 * speedMultiplier;
      const rotSpeedX = idleRotX + (thinkRotX - idleRotX) * intensity;

      const pulseScale = 1.0 + Math.sin(time * 0.007) * (0.06 * intensity);

      // Suavizado de mouse interactivo
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      rotationRef.current.y += (rotSpeedY + mouseRef.current.x * 1.5) * dt;
      rotationRef.current.x += (rotSpeedX + mouseRef.current.y * 1.5) * dt;

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sphereRadius = (size * dpr * 0.44) * pulseScale;
      const fov = 2.7;

      const points = pointsRef.current;
      const pointsToDraw: {
        x: number;
        y: number;
        z: number;
        depth: number;
        char: string;
        alpha: number;
      }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Mutación procedural de números proporcional a la intensidad de pensamiento
        const mutationChance = p.mutationSpeed * (0.6 + 2.4 * intensity);
        if (Math.random() < mutationChance) {
          p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        let px = p.baseX;
        let py = p.baseY;
        let pz = p.baseZ;

        // Ondas / olas 3D orgánicas con interpolación suave de amplitud
        let waveFactor = 1.0;
        if (intensity > 0.005) {
          const lat = Math.asin(Math.max(-1, Math.min(1, py))); // latitud (-PI/2 a PI/2)
          const lon = Math.atan2(pz, px); // longitud (-PI a PI)
          
          const wave1 = Math.sin(lat * 5.5 - time * 0.008) * 0.20;
          const wave2 = Math.cos(lon * 3.0 + time * 0.010) * 0.14;
          const wave3 = Math.sin((px * 2.5 + pz * 2.5) - time * 0.014) * 0.10;
          
          const combinedWave = (wave1 + wave2 + wave3) * intensity;
          waveFactor = 1.0 + combinedWave;
          px *= waveFactor;
          py *= waveFactor;
          pz *= waveFactor;
        }

        // Rotación 3D (Y axis, then X axis)
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;

        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Descartar polos ocultos muy profundos
        if (z2 < -0.55) continue;

        // Proyección de perspectiva 3D
        const perspective = fov / (fov + z2);
        const screenX = centerX + x1 * sphereRadius * perspective;
        const screenY = centerY + y2 * sphereRadius * perspective;

        // Profundidad normalizada: 0 a 1 con realce en crestas de olas
        const depthNorm = Math.max(0, Math.min(1, (z2 + 1) / 2));
        let alpha = Math.max(0.18, Math.min(1.0, Math.pow(depthNorm, 1.6)));
        
        if (intensity > 0.1 && waveFactor > 1.04) {
          alpha = Math.min(1.0, alpha * (1.0 + 0.3 * intensity));
        }

        pointsToDraw.push({
          x: screenX,
          y: screenY,
          z: z2,
          depth: depthNorm,
          char: p.char,
          alpha,
        });
      }

      // Ordenar por eje Z (Painter's algorithm para oclusión nítida)
      pointsToDraw.sort((a, b) => a.z - b.z);

      // Renderizar números en Canvas con máxima nitidez tipográfica
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Micro-dígitos calibrados para nitidez óptima
      const baseCssFont = Math.max(4.5, Math.min(8.0, size * 0.165));
      const minFont = Math.round(baseCssFont * 0.85 * dpr);
      const maxFont = Math.round(baseCssFont * 1.30 * dpr);

      for (let i = 0; i < pointsToDraw.length; i++) {
        const pt = pointsToDraw[i];
        const fontSize = Math.round(minFont + (maxFont - minFont) * pt.depth);

        ctx.font = `700 ${fontSize}px "JetBrains Mono", "SF Mono", Monaco, Consolas, "Courier New", monospace`;

        // Colores nítidos de alto contraste estilo Matrix / Referencia
        if (colorMode === 'lime') {
          if (pt.depth > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, pt.alpha * 1.15)})`;
          } else if (pt.depth > 0.35) {
            ctx.fillStyle = `rgba(187, 244, 81, ${Math.min(1, pt.alpha * 1.05)})`;
          } else {
            ctx.fillStyle = `rgba(100, 155, 55, ${pt.alpha * 0.65})`;
          }
        } else if (colorMode === 'orange') {
          if (pt.depth > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, pt.alpha * 1.15)})`;
          } else if (pt.depth > 0.35) {
            ctx.fillStyle = `rgba(255, 112, 67, ${Math.min(1, pt.alpha * 1.05)})`;
          } else {
            ctx.fillStyle = `rgba(175, 75, 45, ${pt.alpha * 0.65})`;
          }
        } else {
          // Monocromo de ultra-alta fidelidad (blanco nítido y plata)
          if (pt.depth > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, pt.alpha * 1.2)})`;
          } else if (pt.depth > 0.35) {
            ctx.fillStyle = `rgba(225, 230, 240, ${Math.min(1, pt.alpha * 1.0)})`;
          } else {
            ctx.fillStyle = `rgba(135, 145, 160, ${pt.alpha * 0.6})`;
          }
        }

        ctx.fillText(pt.char, Math.round(pt.x), Math.round(pt.y));
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [size, state, colorMode, speedMultiplier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseRef.current.targetX = nx;
    mouseRef.current.targetY = ny;
    mouseRef.current.isHovered = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    mouseRef.current.isHovered = false;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center select-none overflow-visible ${className}`}
      style={{ width: size, height: size }}
      title="UTP Core AI"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none drop-shadow-sm"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
