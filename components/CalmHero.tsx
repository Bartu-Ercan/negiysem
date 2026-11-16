import React from 'react';

interface CalmHeroProps {
  summary: string;
  subtext: string;
  locationName?: string;
  minTemp?: number;
  maxTemp?: number;
  windSpeed?: number;
}

export function CalmHero({
  summary,
  subtext,
  locationName = 'İstanbul / Boğaz Hattı',
  minTemp,
  maxTemp,
  windSpeed,
}: CalmHeroProps) {
  return (
    <div className="flex flex-col gap-4 text-center sm:text-left">
      {/* Live Badge */}
      <div className="inline-flex items-center gap-2 self-center sm:self-start">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-emerald opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-status-emerald" />
        </span>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          {locationName} · Canlı Karar
        </span>
      </div>

      {/* Hero Headline */}
      <h1 className="font-display text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[42px] text-balance">
        {summary}
      </h1>

      {/* Subtitle / Metrics Strip */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-text-secondary">
        {minTemp !== undefined && maxTemp !== undefined && (
          <span className="font-mono tabular-nums text-zinc-300">
            {Math.round(minTemp)}° — {Math.round(maxTemp)}°
          </span>
        )}
        {windSpeed !== undefined && (
          <>
            <span className="text-zinc-600 hidden sm:inline">·</span>
            <span className="font-mono tabular-nums text-zinc-300">
              Poyraz {Math.round(windSpeed)} km/s
            </span>
          </>
        )}
        <span className="text-zinc-600 hidden sm:inline">·</span>
        <span className="text-zinc-400">{subtext}</span>
      </div>
    </div>
  );
}
