import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { calculateDecisions } from '../lib/engine/decision-engine';
import { fetchHourlyWeather } from '../lib/weather/open-meteo';
import type { HourlyDataPoint } from '../types/weather';
import type { DecisionItem, FullDecisionResult, UserPreferences } from '../types/decision';

const preferences: UserPreferences = { temperatureSensitivity: 0, shoePreference: 'default', sweatTendency: 'normal' };
function point(hour = 8, overrides: Partial<HourlyDataPoint> = {}): HourlyDataPoint {
  return {
    time: `2026-11-16T${String(hour).padStart(2, '0')}:00+03:00`,
    temperature: 23, apparentTemperature: 23, precipitation: 0,
    precipitationProbability: 0, windSpeed: 0, windDirection: 28, weatherCode: 0,
    ...overrides,
  };
}
function item(result: FullDecisionResult, category: DecisionItem['category']) {
  return result.items.find(entry => entry.category === category)!;
}
function decide(overrides: Partial<HourlyDataPoint>, prefs?: UserPreferences) {
  return calculateDecisions([point(8, overrides)], prefs);
}

// Independent expected outputs at both sides of every SPEC temperature boundary.
for (const [temperature, topText, outerText, topSeverity, outerSeverity] of [
  [-8, 'Termal', 'Kaban', 'alert', 'alert'],
  [6.999, 'Termal', 'Kaban', 'alert', 'alert'],
  [7, 'Yün Kazak', 'dolgulu mont', 'warning', 'alert'],
  [11.999, 'Yün Kazak', 'dolgulu mont', 'warning', 'alert'],
  [12, 'Uzun Kol Tişört', 'trençkot', 'warning', 'warning'],
  [16.999, 'Uzun Kol Tişört', 'trençkot', 'warning', 'warning'],
  [17, 'Kısa Kol veya', 'rüzgârlık', 'caution', 'caution'],
  [21.999, 'Kısa Kol veya', 'rüzgârlık', 'caution', 'caution'],
  [22, 'Hafif Gömlek', 'Gerek yok', 'safe', 'safe'],
  [26.999, 'Hafif Gömlek', 'Gerek yok', 'safe', 'safe'],
  [27, 'Askılı', 'Gerek yok', 'safe', 'safe'],
  [40, 'Askılı', 'Gerek yok', 'safe', 'safe'],
] as const) {
  test(`temperature ${temperature}: clothing and severity`, () => {
    const result = decide({ apparentTemperature: temperature, temperature: 99 });
    assert.ok(item(result, 'top').verdict.includes(topText));
    assert.ok(item(result, 'outerwear').verdict.includes(outerText));
    assert.equal(item(result, 'top').severity, topSeverity);
    assert.equal(item(result, 'outerwear').severity, outerSeverity);
  });
}

for (const [rain, probability, umbrella, severity, shoe] of [
  [0, 0, 'Gerek Yok', 'safe', 'süet'],
  [0.099, 19.999, 'Gerek Yok', 'safe', 'süet'],
  [0, 20, 'İsteğe Bağlı', 'safe', 'açık renk'],
  [0, 30, 'İsteğe Bağlı', 'safe', 'açık renk'],
  [0, 49.999, 'İsteğe Bağlı', 'safe', 'açık renk'],
  [0, 50, 'Çantaya At', 'caution', 'Süet Giyme'],
  [0, 100, 'Çantaya At', 'caution', 'Koyu sneaker'],
  [0.1, 0, 'Yanına Al', 'caution', 'suya dayanıklı'],
  [1.499, 100, 'Yanına Al', 'caution', 'Süet Giyme'],
  [1.5, 0, 'Kesinlikle Al', 'warning', 'Su Geçirmez Sneaker'],
  [4.999, 100, 'Kesinlikle Al', 'warning', 'Deri'],
  [5, 0, 'Fırtına Tipi', 'alert', 'Bot'],
  [12, 100, 'Fırtına Tipi', 'alert', 'Outdoor'],
] as const) {
  test(`rain ${rain}, probability ${probability}: footwear and umbrella`, () => {
    const result = decide({ precipitation: rain, precipitationProbability: probability });
    assert.ok(item(result, 'umbrella').verdict.includes(umbrella));
    assert.ok(item(result, 'footwear').verdict.includes(shoe));
    assert.equal(item(result, 'umbrella').severity, severity);
    assert.equal(item(result, 'footwear').severity, severity);
  });
}

for (const [wind, effective, severity] of [[14.999, 23, 'safe'], [15, 21, 'caution'], [29.999, 21, 'caution'], [30, 19, 'caution'], [80, 19, 'caution']] as const) {
  test(`wind ${wind}: effective temperature ${effective}`, () => {
    const result = decide({ apparentTemperature: 23, windSpeed: wind });
    assert.ok(result.heroSubtext.includes(`${effective}°C`));
    assert.equal(item(result, 'top').severity, severity);
    assert.equal(item(result, 'umbrella').severity, wind >= 30 ? 'alert' : 'safe');
    if (wind >= 15) assert.match(item(result, 'outerwear').description, /Rüzgâr geçirmeyen/);
    if (wind >= 30) assert.match(item(result, 'umbrella').verdict, /yağmurluk/);
  });
}

test('Istanbul: 17°C, 28 km/h, shower at 15:00 is included in daily rollup', () => {
  const hourly = [8, 13, 15, 18, 22].map(hour => point(hour, {
    apparentTemperature: 17, windSpeed: 28,
    precipitation: hour === 15 ? 4.2 : 0,
    precipitationProbability: hour === 15 ? 90 : 10,
  }));
  const result = calculateDecisions(hourly);
  assert.match(item(result, 'outerwear').verdict, /trençkot/);
  assert.match(result.heroSubtext, /15°C/);
  assert.match(item(result, 'umbrella').verdict, /Kesinlikle Al/);
  assert.match(item(result, 'footwear').verdict, /Su Geçirmez Sneaker/);
  assert.match(result.heroSummary, /15:00/);
  assert.match(result.heroSummary, /Dış Giyim/);
  assert.match(result.heroSummary, /Şemsiye/);
  assert.equal(result.timeline.noon.time, hourly[1].time);
});

test('28°C sunny summer: light top, no umbrella, high sweat', () => {
  const result = decide({ apparentTemperature: 28 });
  assert.match(item(result, 'top').verdict, /Askılı/);
  assert.equal(item(result, 'umbrella').verdict, 'Gerek Yok');
  assert.equal(item(result, 'sweat').severity, 'alert');
  assert.match(result.heroSummary, /Terler miyim/);
});

test('4°C dry winter: coat required and no sweat', () => {
  const result = decide({ apparentTemperature: 4 });
  assert.match(item(result, 'outerwear').verdict, /Kaban/);
  assert.equal(item(result, 'outerwear').badge, 'Şart');
  assert.equal(item(result, 'sweat').badge, 'Yok');
  assert.equal(item(result, 'sweat').severity, 'safe');
});

for (const [offset, expected] of [[-2, 'warning'], [-1, 'warning'], [0, 'caution'], [1, 'caution'], [2, 'caution']] as const) {
  test(`personal sensitivity ${offset} shifts the 17°C boundary`, () => {
    const result = decide({ apparentTemperature: 17 }, { ...preferences, temperatureSensitivity: offset });
    assert.equal(item(result, 'top').severity, expected);
    assert.match(result.heroSubtext, new RegExp(`${17 + offset}°C`));
  });
}
test('positive offset can cross into the no-jacket range', () => {
  const result = decide({ apparentTemperature: 20 }, { ...preferences, temperatureSensitivity: 2 });
  assert.equal(item(result, 'outerwear').severity, 'safe');
});
test('wind and sensitivity offsets are both added to apparent temperature', () => {
  const result = decide({ apparentTemperature: 22, windSpeed: 30 }, { ...preferences, temperatureSensitivity: -2 });
  assert.match(result.heroSubtext, /16°C/);
  assert.equal(item(result, 'outerwear').severity, 'warning');
});
test('hero ranks suede warning ahead of safe umbrella decision', () => {
  const result = decide({ apparentTemperature: 23, precipitationProbability: 35 }, { ...preferences, shoePreference: 'suede_sensitive' });
  assert.match(result.heroSummary, /Ayakkabı:.*Süet Giyme/);
  assert.doesNotMatch(result.heroSummary, /Şemsiye:/);
});

for (const [rain, probability, expected] of [[0, 29.999, 'safe'], [0, 30, 'caution'], [0.0499, 0, 'safe'], [0.05, 0, 'caution'], [1.5, 30, 'warning'], [5, 30, 'alert']] as const) {
  test(`suede sensitivity: rain ${rain}, probability ${probability}`, () => {
    const result = decide({ precipitation: rain, precipitationProbability: probability }, { ...preferences, shoePreference: 'suede_sensitive' });
    assert.equal(item(result, 'footwear').severity, expected);
    if (expected === 'caution') assert.match(item(result, 'footwear').verdict, /Süet Giyme/);
    if (rain < 0.1 && probability < 50) assert.equal(item(result, 'umbrella').severity, 'safe');
  });
}

for (const [temperature, expected] of [[4, 'safe'], [11.999, 'safe'], [12, 'warning'], [17, 'warning'], [21.999, 'warning'], [22, 'caution'], [26.999, 'caution'], [27, 'alert']] as const) {
  test(`normal sweat at ${temperature}`, () => {
    const result = decide({ apparentTemperature: temperature });
    assert.equal(item(result, 'sweat').severity, expected);
    if (expected === 'warning') assert.match(item(result, 'sweat').description, /mont giyilirse/);
  });
}
for (const [temperature, expected] of [[18.999, 'warning'], [19, 'caution'], [23.999, 'caution'], [24, 'alert']] as const) {
  test(`sweats easily shifts sweat thresholds at ${temperature}`, () => {
    const result = decide({ apparentTemperature: temperature }, { ...preferences, sweatTendency: 'sweats_easily' });
    assert.equal(item(result, 'sweat').severity, expected);
    assert.match(item(result, 'outerwear').description, /Mont giyme, içine ince pamuklu seç/);
  });
}

test('warm noon, cold evening produces an evening layer and daytime top', () => {
  const result = calculateDecisions([point(8), point(13, { apparentTemperature: 25 }), point(18, { apparentTemperature: 15 }), point(22, { apparentTemperature: 14 })]);
  assert.match(item(result, 'top').verdict, /Kısa Kol Tişört.*akşama katman/);
  assert.match(item(result, 'outerwear').verdict, /Hafif Ceket.*Akşam Şart/);
  assert.equal(item(result, 'outerwear').severity, 'warning');
});

test('timeline prefers exact hours over earlier fallback candidates', () => {
  const hourly = [7, 8, 9, 12, 13, 14, 17, 18, 19, 21, 22, 23].map(hour => point(hour));
  const result = calculateDecisions(hourly);
  assert.deepEqual(Object.values(result.timeline).map(p => p.time.slice(11, 16)), ['08:00', '13:00', '18:00', '22:00']);
});
test('timeline takes first chronological point within each fallback window', () => {
  const hourly = [23, 19, 14, 9, 21, 17, 12, 7].map(hour => point(hour));
  const result = calculateDecisions(hourly, undefined, '2026-11-16T00:00+03:00');
  assert.deepEqual(Object.values(result.timeline).map(p => p.time.slice(11, 16)), ['07:00', '12:00', '17:00', '21:00']);
});
test('timeline last resorts use first, closest to 12, closest to 18, last', () => {
  const result = calculateDecisions([point(4), point(11), point(16), point(20)]);
  assert.deepEqual(Object.values(result.timeline).map(p => p.time.slice(11, 16)), ['04:00', '11:00', '16:00', '20:00']);
});
test('single point supplies all four timeline entries', () => {
  const only = point(15);
  assert.deepEqual(Object.values(calculateDecisions([only]).timeline), [only, only, only, only]);
});
test('reference excludes past hazards and other days while retaining full-day timeline', () => {
  const hourly = [point(8, { apparentTemperature: 4, precipitation: 10, windSpeed: 50 }), point(13), point(18), point(22), point(8, { time: '2026-11-17T08:00+03:00', precipitation: 30 })];
  const result = calculateDecisions(hourly, undefined, '2026-11-16T12:00+03:00');
  assert.equal(item(result, 'outerwear').severity, 'safe');
  assert.equal(item(result, 'umbrella').severity, 'safe');
  assert.equal(result.timeline.morning.precipitation, 10);
});
test('after last observation uses last observation for rollup', () => {
  const result = calculateDecisions([point(8, { precipitation: 8 }), point(18)], undefined, '2026-11-16T23:00+03:00');
  assert.equal(item(result, 'umbrella').severity, 'safe');
});
test('maximum probability can occur separately from maximum precipitation', () => {
  const result = calculateDecisions([point(8, { precipitation: 0.09 }), point(13, { precipitationProbability: 70 })]);
  assert.equal(item(result, 'umbrella').verdict, 'Çantaya At');
});
test('empty input and absent target day throw the specified error', () => {
  assert.throws(() => calculateDecisions([]), /^Error: Hedef güne ait telemetri verisi bulunamadı$/);
  assert.throws(() => calculateDecisions([point()], undefined, '2026-11-17T08:00+03:00'), /Hedef güne ait telemetri verisi bulunamadı/);
});
test('invalid date throws meaningful error', () => {
  assert.throws(() => calculateDecisions([point()], undefined, 'invalid'), /Geçersiz/);
});
test('reference defaults to first input point, without sorting it beforehand', () => {
  const result = calculateDecisions([point(18), point(8, { precipitation: 20 })]);
  assert.equal(item(result, 'umbrella').severity, 'safe');
});
test('Date, UTC ISO and local ISO references represent the same Istanbul instant', () => {
  const hourly = [point(8, { precipitation: 10 }), point(13), point(22)];
  const expected = calculateDecisions(hourly, undefined, '2026-11-16T12:00+03:00');
  assert.deepEqual(calculateDecisions(hourly, undefined, '2026-11-16T09:00:00Z'), expected);
  assert.deepEqual(calculateDecisions(hourly, undefined, '2026-11-16T12:00'), expected);
  assert.deepEqual(calculateDecisions(hourly, undefined, new Date('2026-11-16T09:00:00Z')), expected);
});
test('target local day remains correct when UTC date is previous day', () => {
  const result = calculateDecisions([point(0, { time: '2026-11-15T21:00:00Z' }), point(8)], undefined, '2026-11-16T00:00+03:00');
  assert.equal(result.timeline.morning.time, point(8).time);
});
test('frozen inputs are unchanged and repeated calls give identical results', () => {
  const hourly = [point(8), point(13), point(18), point(22)];
  const before = JSON.stringify(hourly);
  hourly.forEach(Object.freeze);
  Object.freeze(hourly);
  const prefs = Object.freeze({ ...preferences });
  const date = new Date('2026-11-16T08:00+03:00');
  const beforeDate = date.getTime();
  const first = calculateDecisions(hourly, prefs, date);
  assert.deepEqual(calculateDecisions(hourly, prefs, date), first);
  assert.equal(JSON.stringify(hourly), before);
  assert.equal(date.getTime(), beforeDate);
  assert.deepEqual(first.items.map(p => p.category), ['top', 'outerwear', 'footwear', 'umbrella', 'sweat']);
});

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
function apiResponse() {
  return { hourly: { time: ['2026-11-16T08:00'], temperature_2m: [17], apparent_temperature: [15], precipitation: [4.2], precipitation_probability: [90], wind_speed_10m: [28], wind_direction_10m: [40], weather_code: [61] } };
}
test('Open-Meteo: exact fields, explicit units, coordinates, no API key, mapped output', async () => {
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin + url.pathname, 'https://api.open-meteo.com/v1/forecast');
    assert.equal(url.searchParams.get('latitude'), '41.0082');
    assert.equal(url.searchParams.get('longitude'), '28.9784');
    assert.equal(url.searchParams.get('hourly'), 'temperature_2m,apparent_temperature,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code');
    assert.equal(url.searchParams.get('timezone'), 'Europe/Istanbul');
    assert.equal(url.searchParams.get('wind_speed_unit'), 'kmh');
    assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
    assert.equal(url.searchParams.get('precipitation_unit'), 'mm');
    assert.equal(url.searchParams.has('apikey'), false);
    assert.equal(init?.headers, undefined);
    assert.ok(init?.signal instanceof AbortSignal);
    return Response.json(apiResponse());
  };
  assert.deepEqual(await fetchHourlyWeather(41.0082, 28.9784), [point(8, { temperature: 17, apparentTemperature: 15, precipitation: 4.2, precipitationProbability: 90, windSpeed: 28, windDirection: 40, weatherCode: 61 })]);
});
test('Open-Meteo accepts parametrized coordinates', async () => {
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('latitude'), '-33.9');
    assert.equal(url.searchParams.get('longitude'), '151.2');
    return Response.json(apiResponse());
  };
  await fetchHourlyWeather(-33.9, 151.2);
});
test('Open-Meteo rejects invalid coordinates before fetching', async () => {
  globalThis.fetch = async () => { assert.fail('must not fetch'); };
  for (const [lat, lon] of [[91, 0], [0, 181], [NaN, 0], [0, Infinity]]) {
    await assert.rejects(fetchHourlyWeather(lat, lon), /geçersiz enlem veya boylam/);
  }
});
test('Open-Meteo reports HTTP, network, timeout and JSON failures', async () => {
  globalThis.fetch = async () => new Response('', { status: 503, statusText: 'Unavailable' });
  await assert.rejects(fetchHourlyWeather(41, 29), /Open-Meteo.*HTTP 503/);
  globalThis.fetch = async () => { throw new Error('network unavailable'); };
  await assert.rejects(fetchHourlyWeather(41, 29), /Open-Meteo.*network unavailable/);
  globalThis.fetch = async () => { throw new DOMException('request timed out', 'TimeoutError'); };
  await assert.rejects(fetchHourlyWeather(41, 29), /Open-Meteo.*timed out/);
  globalThis.fetch = async () => new Response('invalid json');
  await assert.rejects(fetchHourlyWeather(41, 29), /Open-Meteo hava verisi alınamadı/);
});
for (const [label, body] of [
  ['missing hourly', {}], ['null payload', null], ['empty times', { hourly: { time: [] } }],
  ['missing fields', { hourly: { time: ['2026-11-16T08:00'] } }],
  ['length mismatch', { hourly: { ...apiResponse().hourly, precipitation: [] } }],
  ['null number', { hourly: { ...apiResponse().hourly, precipitation: [null] } }],
  ['string number', { hourly: { ...apiResponse().hourly, temperature_2m: ['17'] } }],
  ['invalid time', { hourly: { ...apiResponse().hourly, time: ['bad-time'] } }],
] as const) {
  test(`Open-Meteo rejects malformed response: ${label}`, async () => {
    globalThis.fetch = async () => Response.json(body);
    await assert.rejects(fetchHourlyWeather(41, 29), /Open-Meteo hava verisi alınamadı/);
  });
}
