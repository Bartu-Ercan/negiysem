'use client';

import React, { useEffect, useRef } from 'react';

interface RainCanvasProps {
  precipitation: number; // mm/h
  windSpeed: number; // km/h
  windDirection?: number; // 0-360 degrees (0: North, 90: East, etc.)
  className?: string;
}

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

export function RainCanvas({
  precipitation,
  windSpeed,
  windDirection = 45, // Default Poyraz (North-East)
  className = '',
}: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Calculate particle density and physics from telemetry
    const isRaining = precipitation >= 0.1;
    if (!isRaining) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    // Number of drops scales with mm/h (min 45 for drizzle, up to 320 for heavy storm)
    const dropCount = Math.min(
      Math.max(Math.round(precipitation * 45), 45),
      320
    );

    // Wind influence on horizontal slant
    // If wind is from NE (45 deg), rain falls towards SW (x moves negative/left)
    const windRad = (windDirection * Math.PI) / 180;
    const windFactor = -Math.sin(windRad); // Negative = drifts left
    const slant = (windSpeed / 15) * 2.2 * (windFactor !== 0 ? windFactor : -1);

    // Pre-allocated object pool to avoid GC allocations in the 60fps loop
    const drops: Drop[] = new Array(dropCount);
    for (let i = 0; i < dropCount; i++) {
      drops[i] = {
        x: Math.random() * (width + Math.abs(slant) * 200) - Math.abs(slant) * 100,
        y: Math.random() * height,
        speed: 12 + Math.random() * 8 + Math.min(precipitation * 1.5, 12),
        length: 14 + Math.random() * 12 + Math.min(precipitation * 2, 16),
        opacity: 0.15 + Math.random() * 0.25,
      };
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1.25;
      ctx.lineCap = 'round';

      for (let i = 0; i < dropCount; i++) {
        const drop = drops[i];

        // Draw drop as delicate technical velocity line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 197, 253, ${drop.opacity})`;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + slant * (drop.length / 10), drop.y + drop.length);
        ctx.stroke();

        // Update position
        drop.y += drop.speed;
        drop.x += slant;

        // Wrap around viewport edges
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + Math.abs(slant) * 200) - Math.abs(slant) * 100;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [precipitation, windSpeed, windDirection]);

  // If no rain, render an empty transparent element with 0 performance overhead
  if (precipitation < 0.1) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 transition-opacity duration-1000 ${className}`}
    />
  );
}
