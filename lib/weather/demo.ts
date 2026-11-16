import type { HourlyDataPoint } from '../../types/weather';
import { weatherDay } from './presentation';

/** Explicit sample data, never presented as a live forecast. */
export function createDemoForecast(reference = new Date()): HourlyDataPoint[] {
  const start = Date.parse(`${weatherDay(reference.toISOString())}T00:00:00+03:00`);
  return Array.from({ length: 168 }, (_, index) => {
    const hour = index % 24;
    const day = Math.floor(index / 24);
    const temperature = Math.round((15 + Math.sin((hour - 7) * Math.PI / 12) * 4 + Math.sin(day * 1.3) * 2) * 10) / 10;
    const precipitation = day % 3 === 0 && hour >= 15 && hour <= 17 ? 2.4 : day % 3 === 1 && hour === 19 ? 0.4 : 0;
    return { time: new Date(start + index * 3600000).toISOString(), temperature, apparentTemperature: temperature - 1, precipitation, precipitationProbability: precipitation ? 80 : 15, windSpeed: 18 + day * 2, windDirection: 45, weatherCode: precipitation ? 63 : hour >= 11 && hour <= 15 ? 1 : 2 };
  });
}
