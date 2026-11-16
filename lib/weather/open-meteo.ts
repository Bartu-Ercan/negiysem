import type { HourlyDataPoint } from '../../types/weather';
import { TIME_ZONE } from '../engine/constants';

const FIELDS = {
  temperature: 'temperature_2m',
  apparentTemperature: 'apparent_temperature',
  precipitation: 'precipitation',
  precipitationProbability: 'precipitation_probability',
  windSpeed: 'wind_speed_10m',
  windDirection: 'wind_direction_10m',
  weatherCode: 'weather_code',
} as const;

export async function fetchHourlyWeather(latitude: number, longitude: number): Promise<HourlyDataPoint[]> {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
    throw new Error('Open-Meteo: geçersiz enlem veya boylam');
  }
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    hourly: Object.values(FIELDS).join(','), timezone: TIME_ZONE,
    temperature_unit: 'celsius', wind_speed_unit: 'kmh', precipitation_unit: 'mm',
  }).toString();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('hourly' in data) ||
        !data.hourly || typeof data.hourly !== 'object') {
      throw new Error('saatlik telemetri verisi eksik');
    }
    const hourly = data.hourly as Record<string, unknown>;
    if (!Array.isArray(hourly.time) || hourly.time.length === 0) {
      throw new Error('saatlik zaman dizisi boş veya geçersiz');
    }
    for (const field of Object.values(FIELDS)) {
      if (!Array.isArray(hourly[field]) || hourly[field].length !== hourly.time.length) {
        throw new Error(`eksik veya uyumsuz saatlik alan: ${field}`);
      }
    }
    return hourly.time.map((time: unknown, index: number) => {
      if (typeof time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(time) ||
          !Number.isFinite(Date.parse(`${time}+03:00`))) {
        throw new Error('geçersiz saatlik zaman değeri');
      }
      // Open-Meteo returns timezone-local ISO strings without an offset.
      const point = { time: `${time}+03:00` } as HourlyDataPoint;
      for (const [key, field] of Object.entries(FIELDS)) {
        const value: unknown = (hourly[field] as unknown[])[index];
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new Error(`geçersiz sayısal telemetri: ${field}`);
        }
        Object.assign(point, { [key]: value });
      }
      return point;
    });
  } catch (error) {
    throw new Error(`Open-Meteo hava verisi alınamadı: ${error instanceof Error ? error.message : String(error)}`);
  }
}
