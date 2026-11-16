import assert from 'node:assert/strict';
import { test } from 'node:test';
import { effectiveTemperature, groupForecastDays, isHourlyWeather, weatherClock, weatherDay } from '../lib/weather/presentation';
import { DEFAULT_LOCATION, isLocationPreset } from '../lib/weather/locations';
import { calculateDecisions } from '../lib/engine/decision-engine';
import type { HourlyDataPoint } from '../types/weather';

const point: HourlyDataPoint = { time: '2026-11-16T00:00+03:00', temperature: 20, apparentTemperature: 22, precipitation: 0, precipitationProbability: 0, windSpeed: 0, windDirection: 45, weatherCode: 0 };
test('UTC midnight boundary and offset-free clock use Istanbul consistently', () => {
  assert.equal(weatherDay('2026-11-15T21:00:00Z'), '2026-11-16');
  assert.equal(weatherClock('2026-11-15T21:00:00Z'), '00:00');
  assert.equal(weatherClock('2026-11-16T13:00'), '13:00');
});
test('forecast grouping sorts chronologically, limits to seven days and preserves input', () => {
  const points = Array.from({ length: 8 }, (_, index) => ({ ...point, time: `2026-11-${16 + index}T13:00+03:00` })).reverse();
  const before = JSON.stringify(points);
  const groups = groupForecastDays(points);
  assert.equal(groups.length, 7);
  assert.equal(groups[0][0].time, '2026-11-16T13:00+03:00');
  assert.equal(JSON.stringify(points), before);
  assert.deepEqual(groupForecastDays([]), []);
});
test('the same local day is grouped across UTC and offset timestamps', () => {
  assert.equal(groupForecastDays([{ ...point, time: '2026-11-15T21:00Z' }, { ...point, time: '2026-11-16T22:00+03:00' }]).length, 1);
});
for (const wind of [14.999, 15, 29.999, 30]) {
  for (const offset of [-2, 0, 2] as const) {
    test(`display and engine temperatures agree: wind ${wind}, offset ${offset}`, () => {
      const hourly = { ...point, windSpeed: wind };
      const result = calculateDecisions([hourly], { temperatureSensitivity: offset, shoePreference: 'default', sweatTendency: 'normal' });
      assert.match(result.heroSubtext, new RegExp(`${effectiveTemperature(hourly, offset)}°C`));
    });
  }
}
test('untrusted telemetry validation accepts complete data and rejects invalid fields', () => {
  assert.equal(isHourlyWeather([point]), true);
  for (const value of [null, [], [{}], [{ ...point, time: 'bad' }], [{ ...point, precipitation: -1 }], [{ ...point, windSpeed: NaN }], [{ ...point, precipitationProbability: 101 }], [{ ...point, temperature: '20' }]]) {
    assert.equal(isHourlyWeather(value), false);
  }
});
test('saved locations require complete valid coordinates and strings', () => {
  assert.equal(isLocationPreset(DEFAULT_LOCATION), true);
  for (const value of [null, { id: 'bad' }, { ...DEFAULT_LOCATION, latitude: 91 }, { ...DEFAULT_LOCATION, longitude: NaN }, { ...DEFAULT_LOCATION, name: 12 }]) assert.equal(isLocationPreset(value), false);
});

test('demo forecast contains seven complete local days and valid telemetry', async () => {
  const { createDemoForecast } = await import('../lib/weather/demo');
  const hourly = createDemoForecast(new Date('2026-11-16T12:00:00+03:00'));
  assert.equal(hourly.length, 168);
  assert.equal(isHourlyWeather(hourly), true);
  assert.deepEqual(groupForecastDays(hourly).map(day => day.length), [24, 24, 24, 24, 24, 24, 24]);
  assert.equal(weatherClock(hourly[0].time), '00:00');
  assert.equal(weatherClock(hourly[167].time), '23:00');
});
test('demo forecast repeats deterministically for the same reference date', async () => {
  const { createDemoForecast } = await import('../lib/weather/demo');
  const reference = new Date('2026-11-16T12:00:00+03:00');
  assert.deepEqual(createDemoForecast(reference), createDemoForecast(reference));
  assert.equal(reference.toISOString(), '2026-11-16T09:00:00.000Z');
});
