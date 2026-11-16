import type { HourlyDataPoint } from '../../types/weather';
import { TIME_ZONE, WIND } from '../engine/constants';

const clockFormat = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export function weatherDate(time: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(time) ? `${time}+03:00` : time);
}
export function weatherClock(time: string): string { return clockFormat.format(weatherDate(time)); }
export function weatherDay(time: string): string { return dayFormat.format(weatherDate(time)); }
export function effectiveTemperature(point: HourlyDataPoint, offset = 0): number {
  return point.apparentTemperature + offset + (point.windSpeed >= WIND.strong ? WIND.strongOffset : point.windSpeed >= WIND.moderate ? WIND.moderateOffset : 0);
}
export function groupForecastDays(hourly: HourlyDataPoint[]): HourlyDataPoint[][] {
  const groups = new Map<string, HourlyDataPoint[]>();
  for (const point of [...hourly].sort((a, b) => weatherDate(a.time).getTime() - weatherDate(b.time).getTime())) {
    const key = weatherDay(point.time);
    const group = groups.get(key) ?? [];
    group.push(point);
    groups.set(key, group);
  }
  return [...groups.values()].slice(0, 7);
}
export function isHourlyWeather(value: unknown): value is HourlyDataPoint[] {
  return Array.isArray(value) && value.length > 0 && value.every(point =>
    point && typeof point === 'object' && typeof point.time === 'string' && Number.isFinite(weatherDate(point.time).getTime()) &&
    ['temperature', 'apparentTemperature', 'precipitation', 'precipitationProbability', 'windSpeed', 'windDirection', 'weatherCode'].every(key => typeof point[key] === 'number' && Number.isFinite(point[key])) &&
    point.precipitation >= 0 && point.precipitationProbability >= 0 && point.precipitationProbability <= 100 && point.windSpeed >= 0,
  );
}
