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

    // Soporte Hi-DPI nítido
    const dpr = Math.max(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(render);

      if (!isVisibleRef.current) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Velocidad según el estado reactivo
      let rotSpeedY = 0.45 * speedMultiplier;
      let rotSpeedX = 0.28 * speedMultiplier;
      let pulseScale = 1.0;

      if (state === 'thinking') {
        rotSpeedY = 1.8 * speedMultiplier;
        rotSpeedX = 1.1 * speedMultiplier;
        pulseScale = 1.0 + Math.sin(time * 0.007) * 0.06;
      } else if (state === 'streaming') {
        rotSpeedY = 0.9 * speedMultiplier;
        rotSpeedX = 0.5 * speedMultiplier;
        pulseScale = 1.0 + Math.sin(time * 0.012) * 0.03;
      }

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

        // Mutación procedural de números
        if (Math.random() < p.mutationSpeed * (state === 'thinking' ? 3 : 0.6)) {
          p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        let px = p.baseX;
        let py = p.baseY;
        let pz = p.baseZ;

        // Ondas / olas 3D orgánicas en estado de pensamiento
        let waveFactor = 1.0;
        if (state === 'thinking') {
          // Olas armónicas viajeras en 3D (ondulación transversal y radial)
          const lat = Math.asin(Math.max(-1, Math.min(1, py))); // latitud (-PI/2 a PI/2)
          const lon = Math.atan2(pz, px); // longitud (-PI a PI)
          
          const wave1 = Math.sin(lat * 5.5 - time * 0.008) * 0.20;
          const wave2 = Math.cos(lon * 3.0 + time * 0.010) * 0.14;
          const wave3 = Math.sin((px * 2.5 + pz * 2.5) - time * 0.014) * 0.10;
          
          waveFactor = 1.0 + wave1 + wave2 + wave3;
          px *= waveFactor;
          py *= waveFactor;
          pz *= waveFactor;
        } else if (state === 'streaming') {
          const wave = Math.sin(py * 4.5 + time * 0.012) * 0.10;
          waveFactor = 1.0 + wave;
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
        let alpha = Math.max(0.12, Math.min(1.0, Math.pow(depthNorm, 1.9)));
        
        if (state === 'thinking' && waveFactor > 1.06) {
          alpha = Math.min(1.0, alpha * 1.3);
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

      // Renderizar números en Canvas con nitidez
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Micro-dígitos reducidos un 50% para máxima finura y elegancia
      const minFont = Math.max(1.8 * dpr, size * dpr * 0.028);
      const maxFont = Math.max(3.0 * dpr, size * dpr * 0.052);

      for (let i = 0; i < pointsToDraw.length; i++) {
        const pt = pointsToDraw[i];
        const fontSize = Math.round(minFont + (maxFont - minFont) * pt.depth);

        ctx.font = `500 ${fontSize}px "JetBrains Mono", "Courier New", monospace`;

        // Colores nítidos de alto contraste estilo Matrix / Referencia
        if (colorMode === 'lime') {
          if (pt.depth > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
          } else if (pt.depth > 0.35) {
            ctx.fillStyle = `rgba(187, 244, 81, ${pt.alpha * 0.9})`;
          } else {
            ctx.fillStyle = `rgba(100, 140, 50, ${pt.alpha * 0.5})`;
          }
        } else if (colorMode === 'orange') {
          if (pt.depth > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
          } else if (pt.depth > 0.35) {
            ctx.fillStyle = `rgba(255, 112, 67, ${pt.alpha * 0.9})`;
          } else {
            ctx.fillStyle = `rgba(160, 60, 30, ${pt.alpha * 0.5})`;
          }
        } else {
          // Monocromo de alta fidelidad (exacto al render blanco/gris de referencia)
          if (pt.depth > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
          } else if (pt.depth > 0.4) {
            ctx.fillStyle = `rgba(210, 215, 225, ${pt.alpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(110, 115, 130, ${pt.alpha * 0.45})`;
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
