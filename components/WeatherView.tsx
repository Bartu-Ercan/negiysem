'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { FullDecisionResult } from '../types/decision';
import type { HourlyDataPoint } from '../types/weather';
import { TIME_ZONE } from '../lib/engine/constants';
import { calculateDecisions } from '../lib/engine/decision-engine';
import { usePreferences } from '../hooks/usePreferences';
import { DEFAULT_LOCATION, isLocationPreset, type LocationPreset } from '../lib/weather/locations';
import { effectiveTemperature, groupForecastDays, isHourlyWeather, weatherClock, weatherDate } from '../lib/weather/presentation';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { CompactAtmosphereHero } from './CompactAtmosphereHero';
import { ContinuousTimeline } from './ContinuousTimeline';
import { GlanceableCards } from './GlanceableCards';
import { WeeklyWardrobePlan } from './WeeklyWardrobePlan';
import { AdaptiveFeedbackWidget } from './AdaptiveFeedbackWidget';
import { LocationSelector } from './LocationSelector';
import { PreferencesDrawer } from './PreferencesDrawer';
import { ShareDecisionButton } from './ShareDecisionButton';

interface WeatherViewProps {
  initialDecision: FullDecisionResult;
  rawHourly: HourlyDataPoint[];
  isLive: boolean;
  isDemo?: boolean;
}

export function WeatherView({ initialDecision, rawHourly: serverRawHourly, isLive, isDemo = false }: WeatherViewProps) {
  const { preferences, updatePreferences, resetPreferences, isLoaded } = usePreferences();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  // Location, source and telemetry commit together; an unsuccessful request keeps the previous snapshot.
  const [forecast, setForecast] = useState({ location: DEFAULT_LOCATION, hourly: serverRawHourly, isLive });
  const [pendingLocation, setPendingLocation] = useState<LocationPreset | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);

  const handleSelectLocation = useCallback(async (location: LocationPreset) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setPendingLocation(location);
    setWeatherError(null);
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    try {
      const response = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('hourly' in data) || !isHourlyWeather(data.hourly)) throw new Error('Geçersiz saatlik hava verisi');
      if (controller.signal.aborted || requestRef.current !== controller) return;
      setForecast({ location, hourly: data.hourly, isLive: true });
      setSelectedDayIndex(0);
      const hours = groupForecastDays(data.hourly)[0];
      const nextIndex = hours.findIndex(point => weatherDate(point.time).getTime() >= Date.now());
      setSelectedHourIndex(nextIndex < 0 ? hours.length - 1 : nextIndex);
      try { localStorage.setItem('negiysem_user_location', JSON.stringify(location)); } catch { /* Storage can be unavailable. */ }
    } catch {
      if ((!controller.signal.aborted || timedOut) && requestRef.current === controller) {
        setWeatherError(`${location.name} için veri alınamadı. Önceki konum gösteriliyor; yeniden konum seçerek deneyebilirsin.`);
      }
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) setPendingLocation(null);
    }
  }, []);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('negiysem_user_location') ?? 'null');
      if (!isDemo && isLocationPreset(saved)) void handleSelectLocation(saved);
    } catch { /* Invalid saved locations are ignored. */ }
    // Match actual data timestamps rather than assuming index === clock hour.
    const now = Date.now();
    const hours = groupForecastDays(serverRawHourly)[0] ?? [];
    if (hours.length) {
      const nextIndex = hours.findIndex(point => weatherDate(point.time).getTime() >= now);
      setSelectedHourIndex(nextIndex < 0 ? hours.length - 1 : nextIndex);
    }
    return () => requestRef.current?.abort();
  }, [handleSelectLocation, serverRawHourly, isDemo]);

  const dayGroups = useMemo(() => groupForecastDays(forecast.hourly), [forecast.hourly]);
  const activeDayHours = dayGroups[selectedDayIndex] ?? dayGroups[0] ?? [];
  const safeIndex = Math.max(0, Math.min(selectedHourIndex, activeDayHours.length - 1));
  const activePoint = activeDayHours[safeIndex];
  const activeHourClock = activePoint ? weatherClock(activePoint.time) : '00:00';
  const activeHourNum = Number(activeHourClock.slice(0, 2));
  const selectedDecision = useMemo(() => {
    if (!isLoaded || !activePoint) return initialDecision;
    return calculateDecisions(forecast.hourly, preferences, activePoint.time);
  }, [isLoaded, forecast.hourly, preferences, activePoint, initialDecision]);
  const summary = selectedDecision.heroSummary;
  const outerwear = selectedDecision.items.find(item => item.category === 'outerwear');
  const dateLabel = activePoint ? weatherDate(activePoint.time).toLocaleDateString('tr-TR', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const handleDaySelection = useCallback((index: number) => {
    setSelectedDayIndex(index);
    setSelectedHourIndex(0);
  }, []);
  const openLocation = useCallback(() => setIsLocationModalOpen(true), []);
  const closeLocation = useCallback(() => setIsLocationModalOpen(false), []);
  const closePreferences = useCallback(() => setIsDrawerOpen(false), []);

  if (!activePoint) return <main className="mx-auto max-w-xl p-6"><p role="alert">Hava verisi bulunamadı. Sayfayı yenileyerek tekrar deneyebilirsin.</p></main>;

  return (
    <div className="app-shell relative min-h-screen bg-bg-app text-text-primary">
      <AtmosphereCanvas hour={activeHourNum} temperature={activePoint.temperature} precipitation={activePoint.precipitation} windSpeed={activePoint.windSpeed} windDirection={activePoint.windDirection} weatherCode={activePoint.weatherCode} className="atmosphere-backdrop" />
      <a className="skip-link" href="#main-content">İçeriğe geç</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#today" aria-label="Negiysem ana sayfa"><span className="brand-mark"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 8a4 4 0 0 1 8 0c0 2-4 2-4 4l9 5v3H3v-3l9-5" /></svg></span><span>negiysem<span className="brand-period">.</span></span></a>
          <nav className="header-nav" aria-label="Ana menü"><a href="#today">Günün kararı</a><a href="#week">Haftalık plan</a><a href="#about">Nasıl çalışır?</a></nav>
          <div className="header-actions"><ShareDecisionButton locationName={forecast.location.name} decision={selectedDecision} selectedHour={activeHourClock} /><button type="button" onClick={() => setIsDrawerOpen(true)} aria-label="Kişisel tercihleri aç" className="preferences-button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16" /><circle cx="9" cy="5" r="2" fill="var(--color-surface)" /><circle cx="15" cy="12" r="2" fill="var(--color-surface)" /><circle cx="9" cy="19" r="2" fill="var(--color-surface)" /></svg><span>Tercihler</span>{preferences.temperatureSensitivity !== 0 && <span className="preference-value">{preferences.temperatureSensitivity > 0 ? '+' : ''}{preferences.temperatureSensitivity}°</span>}</button></div>
        </div>
      </header>
      <main id="main-content" className="dashboard-main" aria-busy={Boolean(pendingLocation)}>
        <div role="status" aria-live="polite" className="forecast-status">
          {pendingLocation ? `${pendingLocation.name} için hava verisi yükleniyor` : forecast.isLive ? 'Open-Meteo ile güncel tahmin' : isDemo ? 'Demo görünümü · Örnek hava verisi' : 'Çevrimdışı görünüm · Örnek hava verisi'}
        </div>
        {weatherError && <div role="alert" className="rounded-xl border border-status-rose bg-bg-surface p-4 text-sm leading-relaxed"><p>{weatherError}</p><button type="button" onClick={openLocation} className="mt-2 underline">Konum seç ve yeniden dene</button></div>}
        <CompactAtmosphereHero locationName={forecast.location.name} selectedHour={activeHourClock} temperature={activePoint.temperature} apparentTemperature={effectiveTemperature(activePoint, preferences.temperatureSensitivity)} weatherCode={activePoint.weatherCode} precipitation={activePoint.precipitation} precipitationProbability={activePoint.precipitationProbability} windSpeed={activePoint.windSpeed} windDirection={activePoint.windDirection} clothingSummary={summary} onLocationClick={openLocation} outerwear={outerwear} dateLabel={dateLabel} />
        <ContinuousTimeline hourlyPoints={activeDayHours} selectedIndex={safeIndex} onSelectIndex={setSelectedHourIndex} temperatureOffset={preferences.temperatureSensitivity} />
        <GlanceableCards items={selectedDecision.items} />
        <div id="week" className="weekly-section"><WeeklyWardrobePlan rawHourly={forecast.hourly} selectedDayIndex={selectedDayIndex} onSelectDayIndex={handleDaySelection} preferences={preferences} /></div>
        <AdaptiveFeedbackWidget key={`${forecast.location.id}:${forecast.location.latitude}:${forecast.location.longitude}:${activePoint.time}`} preferences={preferences} onUpdatePreferences={updatePreferences} />
        <section id="about" className="about-section" aria-labelledby="about-title"><div><span className="section-eyebrow">AZ VERİ, NET KARAR.</span><h2 id="about-title">Dereceyi değil,<br />ne giyeceğini düşün.</h2></div><div className="about-steps"><article><span>01</span><h3>Konumunu seç.</h3><p>Bulunduğun yerin saatlik yağış, sıcaklık ve rüzgâr tahminini alırız.</p></article><article><span>02</span><h3>Gününü gör.</h3><p>Akşam serinliğini ve öğleden sonraki yağmuru giyim kararına çeviririz.</p></article><article><span>03</span><h3>Kendine uyarla.</h3><p>Üşüyor veya çabuk terliyorsan tercihlerini bu cihazda hatırlarız.</p></article></div></section>
        <footer className="site-footer"><div className="footer-brand">negiysem.</div><p>Hava değişir. Sen hazır çık.</p><div><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Hava verisi: Open-Meteo</a><span>{forecast.isLive ? 'Güncel tahmin' : 'Örnek veri'} · {activeHourClock}</span></div></footer>
      </main>
      <LocationSelector isOpen={isLocationModalOpen} onClose={closeLocation} selectedLocation={forecast.location} onSelectLocation={handleSelectLocation} />
      <PreferencesDrawer isOpen={isDrawerOpen} onClose={closePreferences} preferences={preferences} onUpdate={updatePreferences} onReset={resetPreferences} />
    </div>
  );
}
