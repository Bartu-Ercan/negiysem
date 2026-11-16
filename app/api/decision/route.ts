import { NextRequest, NextResponse } from 'next/server';
import { fetchHourlyWeather } from '../../../lib/weather/open-meteo';
import { calculateDecisions } from '../../../lib/engine/decision-engine';
import type { UserPreferences } from '../../../types/decision';
import { DEFAULT_LOCATION } from '../../../lib/weather/locations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat') ?? DEFAULT_LOCATION.latitude);
  const lon = Number(searchParams.get('lon') ?? DEFAULT_LOCATION.longitude);
  const sensitivity = Number(searchParams.get('sensitivity') ?? '0');
  const shoe = searchParams.get('shoe') === 'suede_sensitive' ? 'suede_sensitive' : 'default';
  const sweat = searchParams.get('sweat') === 'sweats_easily' ? 'sweats_easily' : 'normal';

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || searchParams.get('lat')?.trim() === '' || searchParams.get('lon')?.trim() === '') {
    return NextResponse.json(
      { error: 'Geçersiz koordinat (lat ve lon zorunludur).' },
      { status: 400 }
    );
  }

  if (!Number.isInteger(sensitivity) || sensitivity < -2 || sensitivity > 2) return NextResponse.json({ error: 'Hassasiyet -2 ile +2 arasında tam sayı olmalı.' }, { status: 400 });

  const preferences: UserPreferences = {
    temperatureSensitivity: Math.max(-2, Math.min(2, sensitivity)) as UserPreferences['temperatureSensitivity'],
    shoePreference: shoe,
    sweatTendency: sweat,
  };

  try {
    const hourly = await fetchHourlyWeather(lat, lon);
    const decision = calculateDecisions(hourly, preferences, new Date());

    return NextResponse.json(
      {
        coordinates: { latitude: lat, longitude: lon },
        preferences,
        decision,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('Decision API Error:', error);
    return NextResponse.json(
      { error: 'Karar motoru çalıştırılamadı.' },
      { status: 502 }
    );
  }
}
