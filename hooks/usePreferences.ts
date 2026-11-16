'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences } from '../types/decision';

const STORAGE_KEY = 'negiysem_user_preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureSensitivity: 0,
  shoePreference: 'default',
  sweatTendency: 'normal',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          temperatureSensitivity: [-2, -1, 0, 1, 2].includes(parsed.temperatureSensitivity)
            ? parsed.temperatureSensitivity
            : 0,
          shoePreference: parsed.shoePreference === 'suede_sensitive' ? 'suede_sensitive' : 'default',
          sweatTendency: parsed.sweatTendency === 'sweats_easily' ? 'sweats_easily' : 'normal',
        });
      }
    } catch (e) {
      console.warn('Tercihler yüklenemedi:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      return { ...prev, ...newPreferences };
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Tercihler kaydedilemedi:', error);
    }
  }, [preferences, isLoaded]);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Tercihler sıfırlanamadı:', e);
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoaded,
  };
}
