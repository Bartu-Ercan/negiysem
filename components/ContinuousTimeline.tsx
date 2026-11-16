'use client';

import React, { memo, useId, useMemo } from 'react';
import type { HourlyDataPoint } from '../types/weather';
import { effectiveTemperature, weatherClock } from '../lib/weather/presentation';

export interface ContinuousTimelineProps {
  hourlyPoints: HourlyDataPoint[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  temperatureOffset?: number;
}
// Clean Minimalist SVG Weather Glyphs (No clunky emojis!)
function WeatherGlyph({ code, precip, hour }: { code: number; precip: number; hour: number }) {
  const isNight = hour < 6 || hour >= 21;

  if (precip >= 0.1) {
    return (
      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 13a4 4 0 00-7.8-1.2A5 5 0 004 16h16a4 4 0 00-4-3z" />
        <path d="M8 19v2m4-2v2m4-2v2" />
      </svg>
    );
  }
  if (isNight && code <= 1) {
    return (
      <svg className="w-3.5 h-3.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    );
  }
  if (code === 0) {
    return (
      <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
      </svg>
    );
  }
  if (code <= 2 && !isNight) {
    return (
      <svg className="w-3.5 h-3.5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2" />
        <circle cx="10" cy="10" r="3" />
        <path d="M17 18H9a5 5 0 014.8-6.2A3.5 3.5 0 0117 18z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" />
    </svg>
  );
}

export const ContinuousTimeline = memo(function ContinuousTimeline({ hourlyPoints, selectedIndex, onSelectIndex, temperatureOffset = 0 }: ContinuousTimelineProps) {
  const gradientId = useId().replace(/:/g, '');
  const points = useMemo(() => hourlyPoints.slice(0, 24), [hourlyPoints]);
  const index = Math.max(0, Math.min(selectedIndex, points.length - 1));
  const active = points[index];
  const position = points.length > 1 ? index / (points.length - 1) : 0.5;
  const curve = useMemo(() => {
    const temps = points.map(point => effectiveTemperature(point, temperatureOffset));
    const min = Math.min(...temps) - 1, range = Math.max(2, Math.max(...temps) - min + 1);
    const coordinates = temps.map((temp, i) => ({ x: points.length > 1 ? i / (points.length - 1) * 800 : 400, y: 58 - (temp - min) / range * 48 }));
    let path = coordinates.length ? `M ${coordinates[0].x} ${coordinates[0].y}` : '';
    for (let i = 1; i < coordinates.length; i++) {
      const previous = coordinates[i - 1], current = coordinates[i], middle = (previous.x + current.x) / 2;
      path += ` C ${middle} ${previous.y}, ${middle} ${current.y}, ${current.x} ${current.y}`;
    }
    return { path, area: coordinates.length > 1 ? `${path} L 800 64 L 0 64 Z` : '' };
  }, [points, temperatureOffset]);

  if (!active) return <section className="surface-panel p-4" aria-label="Günün zaman çizelgesi"><p>Saatlik veri bulunamadı.</p></section>;
  const clock = weatherClock(active.time);
  const temperature = Math.round(effectiveTemperature(active, temperatureOffset));
  return (
    <section aria-label="Günün Kesintisiz Zaman Çizelgesi" className="surface-panel flex min-w-0 flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Günün saatlik akışı</h2>
        <p id={`${gradientId}-help`} className="text-xs leading-relaxed text-text-secondary">Saati seç, kıyafet kararlarını gör</p>
      </div>
      <div className="relative min-w-0 rounded-xl border border-border-hairline bg-bg-app pt-3">
        <div className="relative mx-10 h-20" aria-hidden="true">
          <svg viewBox="0 0 800 64" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-accent-text)" stopOpacity="0.25" /><stop offset="100%" stopColor="var(--color-accent-text)" stopOpacity="0" /></linearGradient></defs>
            <path d={curve.area} fill={`url(#${gradientId})`} />
            <path d={curve.path} fill="none" stroke="var(--color-accent-text)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          {points.map((point, i) => point.precipitation > 0 && <span key={point.time} className="absolute bottom-0 w-1 -translate-x-1/2 rounded-t bg-status-cobalt" style={{ left: `${points.length > 1 ? i / (points.length - 1) * 100 : 50}%`, height: `${Math.min(24, Math.max(3, point.precipitation * 5))}px` }} />)}
          <span className="absolute inset-y-0 w-px bg-accent-amber" style={{ left: `${position * 100}%` }} />
        </div>
        <div className="relative mx-10 mb-4 mt-3 h-10" aria-hidden="true">
          {points.map((point, i) => {
            const hour = Number(weatherClock(point.time).slice(0, 2));
            if (hour % 3 && i !== 0 && i !== points.length - 1) return null;
            return <div key={point.time} className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tabular-nums text-text-secondary" style={{ left: `${points.length > 1 ? i / (points.length - 1) * 100 : 50}%` }}>
              <WeatherGlyph code={point.weatherCode} precip={point.precipitation} hour={hour} />
              <span>{String(hour).padStart(2, '0')}</span>
            </div>;
          })}
        </div>
        <div className="relative pt-8">
          <output className="absolute top-0 flex w-24 -translate-x-1/2 items-center justify-center gap-1 rounded-md border border-border-hairline bg-bg-surface py-1 text-xs tabular-nums" style={{ left: `calc(40px + (100% - 80px) * ${position})` }}>
            <span className="text-accent-text">{clock}</span><span aria-hidden="true">·</span><span>{temperature}°C</span>
          </output>
          <div className="mx-[30px]">
            <input className="hour-range" type="range" min={0} max={Math.max(0, points.length - 1)} step={1} value={index} disabled={points.length < 2} aria-label="Saatlik zaman çizelgesi kaydırma çubuğu" aria-describedby={`${gradientId}-help`} aria-valuetext={`${clock}, hissedilen ${temperature} derece`} onChange={event => onSelectIndex(Number(event.target.value))} />
          </div>
        </div>
        <p className="flex flex-wrap justify-between gap-2 px-4 pb-3 text-xs tabular-nums text-text-secondary"><span>{weatherClock(points[0].time)}</span><span>Tut ve sürükle · Yön tuşlarıyla seç</span><span>{weatherClock(points[points.length - 1].time)}</span></p>
      </div>
    </section>
  );
});
