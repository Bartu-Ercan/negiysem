'use client';

import React from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import type { UserPreferences } from '../types/decision';

interface PreferencesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  onReset: () => void;
}

const SENSITIVITY_LABELS: Record<number, { title: string; desc: string }> = {
  '-2': { title: 'Çok Çabuk Üşürüm', desc: 'Hissedileni 2°C daha soğuk hesaplar, katmanları erken önerir.' },
  '-1': { title: 'Hafif Serin Sevmem', desc: 'Hissedileni 1°C daha soğuk hesaplar.' },
  '0': { title: 'Standart / Normal', desc: 'Resmi hissedilen sıcaklık eşiklerini kullanır.' },
  '1': { title: 'Sıcağa Alışkınım', desc: 'Hissedileni 1°C daha ılık hesaplar.' },
  '2': { title: 'Hiç Üşümem / Sıcak Sever', desc: 'Hissedileni 2°C daha ılık hesaplar, ince giydirir.' },
};

export function PreferencesDrawer({
  isOpen,
  onClose,
  preferences,
  onUpdate,
  onReset,
}: PreferencesDrawerProps) {
  const dialog = useModalDialog(isOpen);
  if (!isOpen) return null;

  const currentSensitivity = SENSITIVITY_LABELS[preferences.temperatureSensitivity] ?? SENSITIVITY_LABELS[0];

  return (
    <dialog
      ref={dialog}
      onCancel={event => { event.preventDefault(); onClose(); }}
      aria-labelledby="preferences-title"
      className="fixed inset-y-0 left-auto right-0 m-0 h-[100dvh] max-h-none w-full max-w-md border-0 bg-transparent p-0 text-text-primary"
    >
      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between gap-6 overflow-y-auto overscroll-contain border-l border-border-hairline bg-bg-surface p-6 shadow-2xl transition-transform">
        
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-4">
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Kişiselleştirme
              </span>
              <h2 id="preferences-title" className="font-display text-xl font-bold text-text-primary">
                Gardırop Ayarları
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Ayarları kapat"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-hairline bg-bg-surfaceHover text-text-secondary hover:text-white transition-colors  focus-visible:ring-2 focus-visible:ring-accent-amber"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Setting 1: Temperature Sensitivity */}
          <div className="flex flex-col gap-2.5 rounded-lg border border-border-hairline bg-bg-app p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="temp-slider" className="text-xs font-semibold text-text-primary">
                Soğuk / Sıcak Hassasiyeti
              </label>
              <span className="font-mono text-xs font-bold text-accent-text">
                {preferences.temperatureSensitivity > 0 ? `+${preferences.temperatureSensitivity}` : preferences.temperatureSensitivity}°C
              </span>
            </div>

            <input
              id="temp-slider"
              type="range"
              min="-2"
              max="2"
              step="1"
              value={preferences.temperatureSensitivity}
              onChange={(e) => onUpdate({ temperatureSensitivity: Number(e.target.value) as UserPreferences['temperatureSensitivity'] })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-accent-amber "
            />

            <div className="flex flex-col gap-0.5 pt-1">
              <span className="text-xs font-medium text-text-primary">
                {currentSensitivity.title}
              </span>
              <span className="text-xs text-text-secondary leading-relaxed">
                {currentSensitivity.desc}
              </span>
            </div>
          </div>

          {/* Setting 2: Shoe Preference (Suede Protection) */}
          <div className="flex flex-col gap-2 rounded-lg border border-border-hairline bg-bg-app p-4">
            <span className="text-xs font-semibold text-text-primary">
              Ayakkabı Tercihi (Süet Koruma)
            </span>
            <p className="text-xs text-text-secondary leading-relaxed mb-1">
              Süet seçildiğinde, en ufak yağmur olasılığında (%30+) süet giymeme uyarısı tetiklenir.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={preferences.shoePreference === 'default'}
                onClick={() => onUpdate({ shoePreference: 'default' })}
                className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  preferences.shoePreference === 'default'
                    ? 'border-status-emerald bg-status-emerald/10 font-semibold text-emerald-400'
                    : 'border-border-hairline bg-bg-surface text-text-secondary hover:text-white'
                }`}
              >
                Standart
                <span className="block text-xs text-text-secondary font-normal mt-0.5">Koyu sneaker yeterli</span>
              </button>

              <button
                type="button"
                aria-pressed={preferences.shoePreference === 'suede_sensitive'}
                onClick={() => onUpdate({ shoePreference: 'suede_sensitive' })}
                className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  preferences.shoePreference === 'suede_sensitive'
                    ? 'border-accent-amber bg-accent-amber/10 font-semibold text-amber-400'
                    : 'border-border-hairline bg-bg-surface text-text-secondary hover:text-white'
                }`}
              >
                Süet Severim
                <span className="block text-xs text-text-secondary font-normal mt-0.5">Yağmurda süet giymem</span>
              </button>
            </div>
          </div>

          {/* Setting 3: Sweat Tendency */}
          <div className="flex flex-col gap-2 rounded-lg border border-border-hairline bg-bg-app p-4">
            <span className="text-xs font-semibold text-text-primary">
              Terleme Eğilimi
            </span>
            <p className="text-xs text-text-secondary leading-relaxed mb-1">
              Toplu taşımada veya yürüyüşte kolay terliyorsanız katmanları hafifletir.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={preferences.sweatTendency === 'normal'}
                onClick={() => onUpdate({ sweatTendency: 'normal' })}
                className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  preferences.sweatTendency === 'normal'
                    ? 'border-status-emerald bg-status-emerald/10 font-semibold text-emerald-400'
                    : 'border-border-hairline bg-bg-surface text-text-secondary hover:text-white'
                }`}
              >
                Normal
                <span className="block text-xs text-text-secondary font-normal mt-0.5">Standart termal denge</span>
              </button>

              <button
                type="button"
                aria-pressed={preferences.sweatTendency === 'sweats_easily'}
                onClick={() => onUpdate({ sweatTendency: 'sweats_easily' })}
                className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  preferences.sweatTendency === 'sweats_easily'
                    ? 'border-status-cobalt bg-status-cobalt/10 font-semibold text-blue-400'
                    : 'border-border-hairline bg-bg-surface text-text-secondary hover:text-white'
                }`}
              >
                Çabuk Terlerim
                <span className="block text-xs text-text-secondary font-normal mt-0.5">Mont yerine katman</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-hairline pt-4">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-text-secondary hover:text-zinc-300 transition-colors"
          >
            Varsayılana Sıfırla
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-200 px-4 py-2 font-sans text-xs font-semibold text-black hover:bg-white transition-colors  focus-visible:ring-2 focus-visible:ring-white"
          >
            Kaydet ve Kapat
          </button>
        </div>

      </div>
    </dialog>
  );
}
