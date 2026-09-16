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

const GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'λ', 'π', 'Σ', 'Ω', 'Δ', '{', '}', '*', '+', '/', '~', '∞'];

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
  size = 40,
  state = 'idle',
  colorMode = 'monochrome',
  className = '',
  speedMultiplier = 1.0,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pointsRef = useRef<SpherePoint[]>([]);
  const rotationRef = useRef({ x: 0.2, y: 0.4, z: 0.1 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  const isVisibleRef = useRef<boolean>(true);

  // Inicializar puntos distribuidos con Fibonacci Sphere
  useEffect(() => {
    // Ajustar número de puntos según el tamaño para máxima nitidez y 0 lag
    const count = size <= 32 ? 80 : size <= 64 ? 130 : 200;
    const points: SpherePoint[] = [];

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // de 1 a -1
      const radiusAtY = Math.sqrt(1 - y * y);
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
        mutationSpeed: 0.02 + Math.random() * 0.08,
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

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(render);

      if (!isVisibleRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Velocidad según el estado reactivo
      let rotSpeedY = 0.6 * speedMultiplier;
      let rotSpeedX = 0.35 * speedMultiplier;
      let pulseScale = 1.0;

      if (state === 'thinking') {
        rotSpeedY = 2.4 * speedMultiplier;
        rotSpeedX = 1.6 * speedMultiplier;
        pulseScale = 1.0 + Math.sin(time * 0.008) * 0.08;
      } else if (state === 'streaming') {
        rotSpeedY = 1.2 * speedMultiplier;
        rotSpeedX = 0.8 * speedMultiplier;
        pulseScale = 1.0 + Math.sin(time * 0.015) * 0.04;
      }

      // Suavizado de mouse interactivo
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      rotationRef.current.y += (rotSpeedY + mouseRef.current.x * 2) * dt;
      rotationRef.current.x += (rotSpeedX + mouseRef.current.y * 2) * dt;

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sphereRadius = (size * dpr * 0.42) * pulseScale;
      const fov = 2.8;

      const points = pointsRef.current;
      const pointsToDraw: {
        x: number;
        y: number;
        z: number;
        depth: number;
        char: string;
        alpha: number;
        scale: number;
      }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Mutación cuántica aleatoria de caracteres
        if (Math.random() < p.mutationSpeed * (state === 'thinking' ? 4 : 1)) {
          p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        // Deformación de onda armónica si está en streaming
        let px = p.baseX;
        let py = p.baseY;
        let pz = p.baseZ;

        if (state === 'streaming') {
          const wave = Math.sin(py * 6 + time * 0.01) * 0.06;
          px += p.baseX * wave;
          pz += p.baseZ * wave;
        }

        // Rotación 3D (Y axis, then X axis)
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;

        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Proyección de perspectiva 3D
        const perspective = fov / (fov + z2);
        const screenX = centerX + x1 * sphereRadius * perspective;
        const screenY = centerY + y2 * sphereRadius * perspective;

        // Profundidad normalizada: -1 (fondo) a +1 (frente)
        const depthNorm = (z2 + 1) / 2;
        const alpha = Math.max(0.12, Math.min(1.0, 0.15 + 0.85 * Math.pow(depthNorm, 1.8)));

        pointsToDraw.push({
          x: screenX,
          y: screenY,
          z: z2,
          depth: depthNorm,
          char: p.char,
          alpha,
          scale: perspective,
        });
      }

      // Ordenar por eje Z (Painter's algorithm para oclusión)
      pointsToDraw.sort((a, b) => a.z - b.z);

      // Renderizar caracteres en Canvas
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const baseFontSize = (size * dpr * 0.13);
      const minFontSize = Math.max(7 * dpr, baseFontSize * 0.7);
      const maxFontSize = Math.max(10 * dpr, baseFontSize * 1.3);

      for (let i = 0; i < pointsToDraw.length; i++) {
        const pt = pointsToDraw[i];
        const fontSize = Math.round(minFontSize + (maxFontSize - minFontSize) * pt.depth);

        ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;

        // Coloración según paleta
        if (colorMode === 'lime') {
          if (pt.depth > 0.7) {
            ctx.fillStyle = `rgba(187, 244, 81, ${pt.alpha})`;
          } else {
            ctx.fillStyle = `rgba(163, 230, 53, ${pt.alpha * 0.8})`;
          }
        } else if (colorMode === 'orange') {
          if (pt.depth > 0.7) {
            ctx.fillStyle = `rgba(255, 87, 34, ${pt.alpha})`;
          } else {
            ctx.fillStyle = `rgba(255, 112, 67, ${pt.alpha * 0.8})`;
          }
        } else if (colorMode === 'cyan') {
          ctx.fillStyle = `rgba(56, 189, 248, ${pt.alpha})`;
        } else {
          // Monochrome Apple / Vercel style
          if (pt.depth > 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
          } else if (pt.depth > 0.4) {
            ctx.fillStyle = `rgba(200, 200, 210, ${pt.alpha})`;
          } else {
            ctx.fillStyle = `rgba(120, 120, 135, ${pt.alpha})`;
          }
        }

        ctx.fillText(pt.char, pt.x, pt.y);
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
