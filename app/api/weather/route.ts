import { NextRequest, NextResponse } from 'next/server';
import { fetchHourlyWeather } from '../../../lib/weather/open-meteo';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat')?.trim() || NaN);
  const lon = Number(searchParams.get('lon')?.trim() || NaN);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || searchParams.get('lat')?.trim() === '' || searchParams.get('lon')?.trim() === '') {
    return NextResponse.json(
      { error: 'Geçersiz koordinat (lat ve lon zorunludur).' },
      { status: 400 }
    );
  }

  try {
    const hourly = await fetchHourlyWeather(lat, lon);
    return NextResponse.json({ hourly }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Hava durumu API hatası:', error);
    return NextResponse.json(
      { error: 'Hava durumu verisi temin edilemedi.' },
      { status: 502 }
    );
  }
}
