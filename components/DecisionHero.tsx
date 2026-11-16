import React from 'react';

interface DecisionHeroProps {
  summary: string;
  subtext: string;
  locationName?: string;
  alertBadge?: string;
}

export function DecisionHero({
  summary,
  subtext,
  locationName = 'İstanbul / Beşiktaş',
  alertBadge,
}: DecisionHeroProps) {
  return (
    <header className="flex flex-col gap-3 sm:gap-4">
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-emerald opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-emerald" />
          </span>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {locationName} · Canlı
          </span>
        </div>

        {alertBadge && (
          <span className="inline-flex items-center rounded border border-accent-amber/30 bg-accent-amber/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-400">
            {alertBadge}
          </span>
        )}
      </div>

      {/* Hero Headline */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Günün Kararı
        </span>
        <h1 className="font-display text-2xl font-bold leading-[1.15] tracking-tight text-text-primary sm:text-3xl lg:text-4xl text-balance">
          {summary}
        </h1>
        <p className="max-w-prose font-sans text-xs sm:text-sm leading-relaxed text-text-secondary text-pretty">
          {subtext}
        </p>
      </div>
    </header>
  );
}
