'use client';

import React from 'react';
import type { DecisionItem } from '../types/decision';
import { OutfitIllustration } from './OutfitIllustration';

export interface CompactAtmosphereHeroProps {
  locationName: string;
  selectedHour: string; // e.g. "14:00"
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  clothingSummary: string;
  onLocationClick?: () => void;
  outerwear?: DecisionItem;
  dateLabel?: string;
}

// Bespoke SVG Hero Weather Glyphs (Zero Emojis!)
function WeatherHeroIcon({ code, precip, hourNum }: { code: number; precip: number; hourNum: number }) {
  const isNight = hourNum < 6 || hourNum >= 21;

  if (precip >= 1.5) {
    return (
      <svg className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 13a4 4 0 00-7.8-1.2A5 5 0 004 16h16a4 4 0 00-4-3z" />
        <path d="M8 19v3m4-3v3m4-3v3" strokeWidth="2" />
      </svg>
    );
  }
  if (precip >= 0.1) {
    return (
      <svg className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-300 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 14h1.5a3.5 3.5 0 000-7h-.5A5 5 0 008 10a4 4 0 00-2 7.5" />
        <path d="M10 19v2m4-2v2" />
      </svg>
    );
  }
  if (isNight && code <= 1) {
    return (
      <svg className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-300 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        <circle cx="17" cy="6" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (code === 0) {
    return (
      <svg className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
      </svg>
    );
  }
  if (code <= 2 && !isNight) {
    return (
      <svg className="w-12 h-12 sm:w-14 sm:h-14 text-amber-300 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="10" cy="9" r="4" fill="currentColor" fillOpacity="0.15" />
        <path d="M10 2v2M4.93 4.93l1.41 1.41M2 10h2" />
        <path d="M18 19H9a6 6 0 015.6-7.9A4.5 4.5 0 0118 19z" />
      </svg>
    );
  }
  return (
    <svg className="w-12 h-12 sm:w-14 sm:h-14 text-text-primary drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

function getWeatherLabel(code: number, precip: number, hourNum: number): string {
  if (code >= 95) return 'Fırtınalı';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Kar Yağışlı';
  if (precip >= 1.5) return 'Sağanak Yağışlı';
  if (precip >= 0.1) return 'Çisentili Yağmur';
  const isNight = hourNum < 6 || hourNum >= 21;
  if (isNight && code <= 1) return 'Açık Gece';
  if (code === 0) return 'Açık / Güneşli';
  if (code === 1 || code === 2) return 'Parçalı Bulutlu';
  if (code === 3) return 'Kapalı / Bulutlu';
  if (code >= 45 && code <= 48) return 'Sisli / Puslu';
  if (code >= 51 && code <= 67) return 'Yağmurlu';
  if (code >= 71 && code <= 77) return 'Kar Yağışlı';
  if (code >= 95) return 'Fırtınalı';
  return 'Sakin Hava';
}

function getWindName(degrees: number): string {
  const directions = [
    'Yıldız (K)', 'Poyraz (KD)', 'Gündoğusu (D)', 'Keşişleme (GD)',
    'Kıble (G)', 'Lodos (GB)', 'Batı (B)', 'Karayel (KB)',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index] ?? 'Poyraz';
}

export function CompactAtmosphereHero({
  locationName,
  selectedHour,
  temperature,
  apparentTemperature,
  weatherCode,
  precipitation,
  precipitationProbability,
  windSpeed,
  windDirection,
  clothingSummary,
  onLocationClick,
  outerwear,
  dateLabel,
}: CompactAtmosphereHeroProps) {
  const hourNum = parseInt(selectedHour.split(':')[0] || '12', 10);
  const weatherLabel = getWeatherLabel(weatherCode, precipitation, hourNum);
  const windLabel = getWindName(windDirection);

  const titles = { safe: 'Hafif giyin.', caution: 'Katmanını al.', warning: 'Katmanlı çık.', alert: 'Sıkı giyin.' };
  return (
    <section id="today" aria-label="Atmosferik Canlı Özet" className="forecast-hero">
      <div className="hero-copy">
        <div className="hero-eyebrow"><span className="status-dot" /> DIŞARI ÇIKMADAN ÖNCE</div>
        <button type="button" onClick={onLocationClick} aria-label={`Konumu değiştir: ${locationName}`} className="location-trigger">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13Z" /><circle cx="12" cy="9" r="3" /></svg>
          <span>{locationName}</span><svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 8 5 5 5-5" /></svg>
        </button>
        <h1 className="hero-title">{titles[outerwear?.severity ?? 'caution']}<br /><span>Güne hazır çık.</span></h1>
        <p className="hero-description">{outerwear?.verdict ?? clothingSummary}</p>
        <div className="hero-context"><span>{dateLabel}</span><span className="context-separator" />Seçili saat <strong>{selectedHour}</strong></div>
        <div className="hero-weather-strip">
          <div className="weather-reading"><WeatherHeroIcon code={weatherCode} precip={precipitation} hourNum={hourNum} /><strong>{Math.round(temperature)}°</strong><div><span>{weatherLabel}</span><small>Karar sıcaklığı {apparentTemperature.toFixed(1)}°C</small></div></div>
          <div className="weather-details"><span>{windLabel} · {Math.round(windSpeed)} km/sa</span><span>{precipitation > 0 ? `${precipitation} mm/sa yağış` : 'Yağış yok'} · %{precipitationProbability} olasılık</span></div>
        </div>
      </div>
      <div className="outfit-preview">
        <div className="outfit-caption"><span>BUGÜNÜN KATMANI</span><span className="tabular-nums">{selectedHour}</span></div>
        <OutfitIllustration severity={outerwear?.severity ?? 'caution'} />
        <div className="outfit-note"><span className="outfit-note-dot" /><div><strong>{outerwear?.badge ?? 'Katmanlı giyim'}</strong><span>Havaya göre, sana göre.</span></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg></div>
      </div>
    </section>
  );
}
