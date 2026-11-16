import React from 'react';
import type { DayTimeline, HourlyDataPoint } from '../types/weather';

interface LayerTimelineGaugeProps {
  timeline: DayTimeline;
}

interface SlotMeta {
  key: keyof DayTimeline;
  title: string;
  hourLabel: string;
}

const SLOTS: SlotMeta[] = [
  { key: 'morning', title: 'Sabah', hourLabel: '08:00' },
  { key: 'noon', title: 'Öğle', hourLabel: '13:00' },
  { key: 'evening', title: 'Akşam', hourLabel: '18:00' },
  { key: 'night', title: 'Gece', hourLabel: '22:00' },
];

function getSlotClothingTag(point: HourlyDataPoint): string {
  const temp = point.apparentTemperature;
  if (point.precipitation >= 1.5) return 'Yağmurluk / Şemsiye';
  if (temp >= 22) return 'Tişört';
  if (temp >= 17) return 'Kısa Kol + Hırka';
  if (temp >= 12) return 'Ceket Şart';
  if (temp >= 7) return 'Kazak + Mont';
  return 'Termal + Kalın Mont';
}

export function LayerTimelineGauge({ timeline }: LayerTimelineGaugeProps) {
  return (
    <section aria-label="Günün Katman Çizelgesi" className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <span>Günün Katman Çizelgesi</span>
        <span className="text-zinc-400">4 Dilimli Telemetri</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOTS.map(({ key, title, hourLabel }) => {
          const point = timeline[key];
          const hasRain = point.precipitation >= 0.1;
          const hasHighRain = point.precipitation >= 1.5;
          const isCold = point.apparentTemperature < 12;
          const clothing = getSlotClothingTag(point);

          const isAlert = hasHighRain;
          const isCaution = !hasHighRain && (hasRain || isCold);

          return (
            <div
              key={key}
              className={`flex flex-col justify-between rounded-lg border p-2.5 sm:p-3 transition-colors ${
                isAlert
                  ? 'border-status-cobalt/40 bg-status-cobalt/10'
                  : isCaution
                    ? 'border-accent-amber/30 bg-accent-amber/5'
                    : 'border-border-hairline bg-bg-surfaceHover/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[11px] font-medium text-text-secondary">
                  {title}
                </span>
                <span className="font-sans text-[10px] font-semibold text-zinc-500">
                  {hourLabel}
                </span>
              </div>

              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-display text-lg font-bold tabular-nums text-text-primary sm:text-xl">
                  {Math.round(point.apparentTemperature)}°
                </span>
                <span className="text-[10px] text-zinc-500">hissedilen</span>
              </div>

              <div className="flex flex-col gap-0.5 border-t border-border-hairline/60 pt-1.5">
                <span className="truncate text-xs font-medium text-zinc-200">
                  {clothing}
                </span>
                {hasRain ? (
                  <span className="text-[10px] font-semibold text-blue-400 tabular-nums">
                    {point.precipitation} mm/h (%{point.precipitationProbability})
                  </span>
                ) : point.windSpeed >= 20 ? (
                  <span className="text-[10px] font-medium text-amber-400 tabular-nums">
                    {Math.round(point.windSpeed)} km/s rüzgâr
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500">
                    Kuru hava
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
