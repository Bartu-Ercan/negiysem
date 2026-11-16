'use client';

import React from 'react';
import type { HourlyDataPoint } from '../types/weather';

export interface TimelineSlice {
  id: string;
  hour: string;
  periodName: string;
  temp: number;
  apparentTemp: number;
  precipitation: number;
  windSpeed: number;
  clothingBadge: string;
  weatherIcon: string;
}

interface FluidTimelineScrubberProps {
  slices: TimelineSlice[];
  selectedIndex: number;
  onSelectSlice: (index: number) => void;
}

export function FluidTimelineScrubber({
  slices,
  selectedIndex,
  onSelectSlice,
}: FluidTimelineScrubberProps) {
  return (
    <section
      aria-label="Gün İçi Zaman Çizelgesi"
      className="flex flex-col gap-3 rounded-2xl border border-border-hairline bg-bg-surface/70 p-3 sm:p-4 backdrop-blur-md shadow-xl"
    >
      {/* Top Scrubber Header */}
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
          Gün Zaman Çizelgesi
        </span>
        <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline">
          Saate tıkla: Atmosfer ve giysi durumunu anında gör
        </span>
      </div>

      {/* Horizontal Rail / Scrubber Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {slices.map((slice, index) => {
          const isSelected = selectedIndex === index;
          const hasRain = slice.precipitation >= 0.1;

          return (
            <button
              key={slice.id}
              type="button"
              onClick={() => onSelectSlice(index)}
              className={`group relative flex flex-col items-center justify-between rounded-xl p-2.5 sm:p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber ${
                isSelected
                  ? 'bg-zinc-800/95 border border-zinc-500 shadow-md scale-[1.02]'
                  : 'bg-bg-surfaceHover/30 border border-transparent hover:border-zinc-700 hover:bg-bg-surfaceHover/60'
              }`}
            >
              {/* Active Glow Accent */}
              {isSelected && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-accent-amber" />
              )}

              {/* Time & Period */}
              <div className="flex flex-col">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {slice.periodName}
                </span>
                <span className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {slice.hour}
                </span>
              </div>

              {/* Temperature & Icon */}
              <div className="my-1.5 flex flex-col items-center gap-0.5">
                <span className="text-base sm:text-lg select-none" aria-hidden="true">
                  {slice.weatherIcon}
                </span>
                <span className="font-display text-base sm:text-xl font-bold tabular-nums text-text-primary">
                  {Math.round(slice.apparentTemp)}°
                </span>
              </div>

              {/* Layer Clothing Chip */}
              <div className="w-full truncate rounded border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold transition-colors mt-1">
                <span
                  className={
                    hasRain
                      ? 'text-blue-400'
                      : isSelected
                        ? 'text-amber-400'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                  }
                >
                  {slice.clothingBadge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
