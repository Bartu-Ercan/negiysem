'use client';

import { memo, useEffect, useRef } from 'react';

export interface AtmosphereCanvasProps {
  hour: number;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  className?: string;
}
type RGB = [number, number, number];
function hexToRgb(hex: string): RGB {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
type SkyPalette = { top: RGB; mid: RGB; bottom: RGB; horizonHaze: RGB };
const PALETTES = {
  night: {
    top: hexToRgb('#03050A'),
    mid: hexToRgb('#060C18'),
    bottom: hexToRgb('#0A1224'),
    horizonHaze: hexToRgb('#0E1830'),
  },
  dawn: {
    top: hexToRgb('#090E1E'),
    mid: hexToRgb('#261522'),
    bottom: hexToRgb('#4A2518'),
    horizonHaze: hexToRgb('#6E3A20'),
  },
  dayClear: {
    top: hexToRgb('#061426'),
    mid: hexToRgb('#0F2648'),
    bottom: hexToRgb('#19375E'),
    horizonHaze: hexToRgb('#254D80'),
  },
  dayCloudy: {
    top: hexToRgb('#0B0F15'),
    mid: hexToRgb('#131B24'),
    bottom: hexToRgb('#1C2632'),
    horizonHaze: hexToRgb('#243140'),
  },
  storm: {
    top: hexToRgb('#080A0E'),
    mid: hexToRgb('#0F131A'),
    bottom: hexToRgb('#151B22'),
    horizonHaze: hexToRgb('#1B222B'),
  },
  dusk: {
    top: hexToRgb('#080D1D'),
    mid: hexToRgb('#241424'),
    bottom: hexToRgb('#3D1D1B'),
    horizonHaze: hexToRgb('#582924'),
  },
};

export const AtmosphereCanvas = memo(function AtmosphereCanvas({ hour, precipitation, windSpeed, windDirection, weatherCode, className = '' }: AtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targets = useRef({ hour, precipitation, windSpeed, windDirection, weatherCode });
  const redraw = useRef<(() => void) | null>(null);
  useEffect(() => {
    targets.current = { hour, precipitation, windSpeed, windDirection, weatherCode };
    redraw.current?.();
  }, [hour, precipitation, windSpeed, windDirection, weatherCode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, lastTick = 0, frameBudget = 0, width = 0, height = 0, dpr = 1, elapsed = 0;
    let sHour = targets.current.hour, sRain = targets.current.precipitation, sWind = targets.current.windSpeed, sDirection = targets.current.windDirection;
    let disposed = false, skyDirty = true;
    const palette: SkyPalette = { top: [0, 0, 0], mid: [0, 0, 0], bottom: [0, 0, 0], horizonHaze: [0, 0, 0] };
    const keys = ['top', 'mid', 'bottom', 'horizonHaze'] as const;
    const sky = document.createElement('canvas');
    const skyContext = sky.getContext('2d', { alpha: false })!;
    // Fixed particle pools: no push/splice, object construction or gradients in the hot loops.
    const stars = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random() * 0.65, size: 0.7 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2, alpha: 0.3 + Math.random() * 0.5 }));
    const clouds = Array.from({ length: 14 }, (_, i) => ({ x: i / 14, y: 0.08 + (i % 3) * 0.055, radius: 90 + Math.random() * 80, speed: 0.4 + (i % 2) * 0.5, alpha: 0.04 + Math.random() * 0.05 }));
    const drops = Array.from({ length: 380 }, () => ({ x: Math.random(), y: Math.random(), length: 14 + Math.random() * 18, speed: 19 + Math.random() * 15 }));
    const streaks = Array.from({ length: 28 }, () => ({ x: Math.random(), y: Math.random(), length: 50 + Math.random() * 90, speed: 5 + Math.random() * 7 }));
    const splashes = Array.from({ length: 75 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: -1, maxLife: 20 }));
    let splashCursor = 0;

    // Rasterize the twelve rays, corona and cloud haze once, then composite sprites.
    const sun = document.createElement('canvas'); sun.width = sun.height = 400;
    const sunCtx = sun.getContext('2d')!;
    const corona = sunCtx.createRadialGradient(200, 200, 14, 200, 200, 180);
    corona.addColorStop(0, 'rgba(255,230,150,0.38)'); corona.addColorStop(1, 'rgba(255,180,80,0)');
    sunCtx.fillStyle = corona; sunCtx.fillRect(0, 0, 400, 400);
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6, length = i % 2 ? 130 : 160;
      const gradient = sunCtx.createRadialGradient(200, 200, 28, 200, 200, length);
      gradient.addColorStop(0, 'rgba(255,235,170,0.13)'); gradient.addColorStop(1, 'rgba(255,235,170,0)');
      sunCtx.fillStyle = gradient; sunCtx.beginPath(); sunCtx.moveTo(200, 200);
      sunCtx.arc(200, 200, length, angle - 0.1, angle + 0.1); sunCtx.closePath(); sunCtx.fill();
    }
    const cloud = document.createElement('canvas'); cloud.width = cloud.height = 320;
    const cloudCtx = cloud.getContext('2d')!;
    const haze = cloudCtx.createRadialGradient(160, 160, 16, 160, 160, 160);
    haze.addColorStop(0, 'rgba(200,215,235,1)'); haze.addColorStop(0.7, 'rgba(180,195,215,0.5)'); haze.addColorStop(1, 'rgba(160,180,200,0)');
    cloudCtx.fillStyle = haze; cloudCtx.fillRect(0, 0, 320, 320);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4000000 / (width * height)));
      canvas.width = sky.width = Math.round(width * dpr);
      canvas.height = sky.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      skyContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      skyDirty = true;
      if (motion.matches && !document.hidden) render(performance.now());
    };

    const render = (now: number) => {
      if (disposed || document.hidden) return;
      if (!motion.matches) {
        frameBudget += lastTick ? Math.min((now - lastTick) / 1000, 0.05) : 1 / 60;
        lastTick = now;
        if (frameBudget < 1 / 60 - 0.0005) { frame = requestAnimationFrame(render); return; }
        frameBudget = Math.max(0, frameBudget - 1 / 60);
      }
      const dt = motion.matches ? 0 : previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
      previous = now; elapsed += dt;
      const step = dt * 60, blend = motion.matches ? 1 : 1 - Math.exp(-4.35 * dt);
      sHour += (targets.current.hour - sHour) * blend;
      sRain += (targets.current.precipitation - sRain) * blend;
      sWind += (targets.current.windSpeed - sWind) * blend;
      sDirection += (((targets.current.windDirection - sDirection + 540) % 360) - 180) * blend;
      const storm = sRain >= 1 || targets.current.weatherCode >= 61;
      const cloudy = targets.current.weatherCode >= 2 && !storm;
      const day = storm ? PALETTES.storm : cloudy ? PALETTES.dayCloudy : PALETTES.dayClear;
      let from: SkyPalette = PALETTES.night, to: SkyPalette = from, mix = 0;
      if (sHour >= 5 && sHour < 7.5) { from = PALETTES.dawn; to = day; mix = (sHour - 5) / 2.5; }
      else if (sHour >= 7.5 && sHour < 17.5) { from = to = day; }
      else if (sHour >= 17.5 && sHour < 20) { from = day; to = PALETTES.dusk; mix = (sHour - 17.5) / 2.5; }
      else if (sHour >= 20 && sHour < 22) { from = PALETTES.dusk; to = PALETTES.night; mix = (sHour - 20) / 2; }
      for (const key of keys) for (let channel = 0; channel < 3; channel++) {
        const value = Math.round(from[key][channel] + (to[key][channel] - from[key][channel]) * mix);
        if (palette[key][channel] !== value) { palette[key][channel] = value; skyDirty = true; }
      }
      if (skyDirty) {
        const gradient = skyContext.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgb(${palette.top.join(',')})`); gradient.addColorStop(0.5, `rgb(${palette.mid.join(',')})`); gradient.addColorStop(1, `rgb(${palette.bottom.join(',')})`);
        skyContext.fillStyle = gradient; skyContext.fillRect(0, 0, width, height);
        const horizon = skyContext.createLinearGradient(0, height * 0.45, 0, height);
        horizon.addColorStop(0, 'rgba(0,0,0,0)'); horizon.addColorStop(1, `rgba(${palette.horizonHaze.join(',')},0.45)`);
        skyContext.fillStyle = horizon; skyContext.fillRect(0, height * 0.45, width, height * 0.55); skyDirty = false;
      }
      ctx.globalAlpha = 1; ctx.drawImage(sky, 0, 0, width, height);
      const night = Math.max(0, Math.min(1, sHour < 6 ? 1 : sHour > 19.5 ? (sHour - 19.5) / 1.5 : 0));
      if (night > 0.05 && sRain < 1) {
        ctx.fillStyle = '#e1ebff';
        for (const star of stars) {
          ctx.globalAlpha = Math.max(0.05, star.alpha + Math.sin(elapsed * 1.5 + star.phase) * 0.2) * night * (1 - sRain);
          ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = night * 0.88; ctx.fillStyle = '#f0f6ff';
        ctx.beginPath(); ctx.arc(width * 0.82, height * 0.18, 24, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = `rgb(${palette.top.join(',')})`;
        ctx.beginPath(); ctx.arc(width * 0.82 + 10, height * 0.18 - 4, 21, 0, Math.PI * 2); ctx.fill();
      }
      const sunProgress = (sHour - 6.5) / 12;
      const intensity = sHour >= 6.5 && sHour <= 18.5 ? Math.sin(sunProgress * Math.PI) * Math.max(0, 1 - (cloudy ? 0.4 : 0) - Math.min(1, sRain * 0.8)) : 0;
      if (intensity > 0.05) {
        ctx.save(); ctx.translate(width * (0.15 + sunProgress * 0.7), height * (0.35 - Math.sin(sunProgress * Math.PI) * 0.22));
        ctx.globalAlpha = intensity; ctx.rotate(elapsed * 0.06); ctx.drawImage(sun, -200, -200);
        ctx.fillStyle = '#fff4c4'; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      for (const puff of clouds) {
        puff.x += Math.max(0.4, sWind / 20) * puff.speed * step / width;
        if (puff.x > 1 + puff.radius / width) puff.x = -puff.radius / width;
        ctx.globalAlpha = puff.alpha * (storm ? 1.6 : cloudy ? 1.2 : 0.4);
        ctx.drawImage(cloud, puff.x * width - puff.radius, puff.y * height - puff.radius, puff.radius * 2, puff.radius * 2);
      }
      ctx.globalAlpha = 1;
      if (sWind > 8) {
        const angle = (sDirection - 90) * Math.PI / 180, x = Math.cos(angle), y = Math.sin(angle) * 0.3, speed = Math.min(2.5, sWind / 18);
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const streak of streaks) {
          streak.x += x * streak.speed * speed * step / width; streak.y += y * streak.speed * speed * step / height;
          if (streak.x > 1.1) streak.x = -0.1; if (streak.x < -0.1) streak.x = 1.1;
          if (streak.y > 1.1) streak.y = -0.1; if (streak.y < -0.1) streak.y = 1.1;
          ctx.moveTo(streak.x * width, streak.y * height); ctx.lineTo(streak.x * width + x * streak.length, streak.y * height + y * streak.length);
        }
        ctx.stroke();
      }
      const count = Math.min(drops.length, Math.floor(sRain * 65 * Math.min(1, width / 1000)));
      const rainX = Math.sin(sDirection * Math.PI / 180) * Math.min(12, sWind / 3);
      ctx.strokeStyle = 'rgba(185,220,255,0.5)'; ctx.lineWidth = 1.25; ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const drop = drops[i]; drop.x += rainX * step / width; drop.y += drop.speed * step / height;
        if (drop.y > 1) {
          const splash = splashes[splashCursor];
          if (splash.life < 0 && !motion.matches) {
            splash.x = drop.x * width; splash.y = height - 8; splash.vx = (Math.random() - 0.5) * 3.5 + rainX * 0.3; splash.vy = -2; splash.life = 0;
            splashCursor = (splashCursor + 1) % splashes.length;
          }
          drop.y = -drop.length / height; drop.x = Math.random();
        }
        if (drop.x < -0.1) drop.x = 1.1; if (drop.x > 1.1) drop.x = -0.1;
        ctx.moveTo(drop.x * width, drop.y * height); ctx.lineTo(drop.x * width + rainX * drop.length / 15, drop.y * height + drop.length);
      }
      ctx.stroke(); ctx.fillStyle = '#c8e6ff';
      for (const splash of splashes) {
        if (splash.life < 0) continue;
        splash.x += splash.vx * step; splash.y += splash.vy * step; splash.vy += 0.2 * step; splash.life += step;
        if (splash.life >= splash.maxLife) { splash.life = -1; continue; }
        ctx.globalAlpha = (1 - splash.life / splash.maxLife) * 0.45;
        ctx.beginPath(); ctx.arc(splash.x, splash.y, 1.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!motion.matches) frame = requestAnimationFrame(render);
    };
    const restart = () => {
      cancelAnimationFrame(frame); previous = 0; lastTick = 0; frameBudget = 0;
      if (!document.hidden) { if (motion.matches) render(performance.now()); else frame = requestAnimationFrame(render); }
    };
    redraw.current = () => { if (motion.matches) restart(); };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    resize(); restart();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); redraw.current = null;
      window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', restart); motion.removeEventListener('change', restart);
      sky.width = sky.height = sun.width = sun.height = cloud.width = cloud.height = 0;
    };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full ${className}`} />;
});
