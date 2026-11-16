'use client';

import React, { useMemo } from 'react';
import type { HourlyDataPoint } from '../types/weather';
import type { UserPreferences } from '../types/decision';
import { calculateDecisions } from '../lib/engine/decision-engine';
import { TIME_ZONE } from '../lib/engine/constants';
import { groupForecastDays, weatherDate, weatherDay, weatherClock } from '../lib/weather/presentation';
import { DEFAULT_PREFERENCES } from '../hooks/usePreferences';

export interface DayForecastSummary {
  dayIndex: number;
  dateStr: string;
  dayName: string;
  minTemp: number;
  maxTemp: number;
  maxPrecip: number;
  weatherCode: number;
  outfitAdvice: string;
}

export interface WeeklyWardrobePlanProps {
  rawHourly: HourlyDataPoint[];
  selectedDayIndex: number;
  onSelectDayIndex: (index: number) => void;
  preferences?: UserPreferences;
}

function WeatherPlanGlyph({ code, precip }: { code: number; precip: number }) {
  if (precip >= 1.5) {
    return (
      <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 13a4 4 0 00-7.8-1.2A5 5 0 004 16h16a4 4 0 00-4-3z" />
        <path d="M8 19v2m4-2v2m4-2v2" />
      </svg>
    );
  }
  if (precip >= 0.1) {
    return (
      <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 14h1.5a3.5 3.5 0 000-7h-.5A5 5 0 008 10a4 4 0 00-2 7.5" />
        <path d="M10 19v2m4-2v2" />
      </svg>
    );
  }
  if (code === 0) {
    return (
      <svg className="w-5 h-5 text-accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
      </svg>
    );
  }
  if (code <= 2) {
    return (
      <svg className="w-5 h-5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2" />
        <circle cx="10" cy="10" r="3" />
        <path d="M17 18H9a5 5 0 014.8-6.2A3.5 3.5 0 0117 18z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" />
    </svg>
  );
}

export function WeeklyWardrobePlan({
  rawHourly,
  selectedDayIndex,
  onSelectDayIndex,
  preferences = DEFAULT_PREFERENCES,
}: WeeklyWardrobePlanProps) {
  const daySummaries: DayForecastSummary[] = useMemo(() => {
    const today = weatherDay(new Date().toISOString());
    const tomorrow = weatherDay(new Date(Date.now() + 86400000).toISOString());
    return groupForecastDays(rawHourly).map((points, index) => {
      const date = weatherDate(points[0].time);
      const key = weatherDay(points[0].time);
      const decision = calculateDecisions(points, preferences, points[0].time);
      const outerwear = decision.items.find(item => item.category === 'outerwear')!;
      const advice = decision.items.find(item => item.category === (outerwear.severity === 'safe' ? 'top' : 'outerwear'))!;
      const representative = points.find(point => Number(weatherClock(point.time).slice(0, 2)) === 13) ?? points[Math.floor(points.length / 2)];
      return {
        dayIndex: index,
        dateStr: date.toLocaleDateString('tr-TR', { timeZone: TIME_ZONE, day: 'numeric', month: 'short' }),
        dayName: key === today ? 'Bugün' : key === tomorrow ? 'Yarın' : date.toLocaleDateString('tr-TR', { timeZone: TIME_ZONE, weekday: 'long' }),
        minTemp: Math.round(Math.min(...points.map(point => point.temperature))),
        maxTemp: Math.round(Math.max(...points.map(point => point.temperature))),
        maxPrecip: Math.max(...points.map(point => point.precipitation)),
        weatherCode: representative.weatherCode,
        outfitAdvice: advice.verdict,
      };
    });
  }, [rawHourly, preferences]);

  if (daySummaries.length === 0) return null;

  return (
    <section aria-label="7 Günlük Gardırop Planı" className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
        <span className="font-semibold text-zinc-300 tracking-tight flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
          <h2>{daySummaries.length} günlük gardırop planı</h2>
        </span>
        <span className="text-text-secondary font-mono text-xs tabular-nums hidden sm:inline">
          Güne tıkla: zaman rayı ve atmosfer o güne evrilir
        </span>
      </div>

      {/* Horizontal Scrollable Day Cards */}
      <div className="grid min-w-0 grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
        {daySummaries.map((day) => {
          const isSelected = day.dayIndex === selectedDayIndex;

          return (
            <button
              key={day.dayIndex}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectDayIndex(day.dayIndex)}
              className={`week-day group flex min-w-0 flex-col justify-between gap-2.5 rounded-xl border p-3 text-left transition-colors duration-150 cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Day Name & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-accent-text' : 'text-zinc-200 group-hover:text-white'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-xs font-mono text-text-secondary">
                  {day.dateStr}
                </span>
              </div>

              {/* Icon & Temp Range */}
              <div className="flex flex-wrap items-center justify-between gap-2 my-0.5">
                <WeatherPlanGlyph code={day.weatherCode} precip={day.maxPrecip} />
                <div className="flex items-baseline gap-1 font-mono text-xs tabular-nums">
                  <span className="font-bold text-white">{day.maxTemp}°</span>
                  <span className="text-text-secondary">/</span>
                  <span className="text-text-secondary">{day.minTemp}°</span>
                </div>
              </div>

              {/* Outfit Advice Badge */}
              <div className="pt-1 border-t border-zinc-800/60">
                <span
                  className={`text-xs font-medium leading-relaxed block [overflow-wrap:anywhere] ${
                    isSelected ? 'text-accent-text font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {day.outfitAdvice}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
