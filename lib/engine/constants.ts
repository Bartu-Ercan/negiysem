// docs/SPEC.md 3.1–3.6: all thresholds are inclusive lower bounds.
export const TEMPERATURE = { thermal: 7, winter: 12, jacket: 17, mild: 22, hot: 27 } as const;
export const WIND = { moderate: 15, strong: 30, moderateOffset: -2, strongOffset: -4 } as const;
export const RAIN = { drizzle: 0.1, shower: 1.5, heavy: 5, optionalProbability: 20, likelyProbability: 50 } as const;
export const SUEDE = { drizzle: 0.05, likelyProbability: 30 } as const;
export const SWEAT_THRESHOLD_SHIFT = 3;
export const TIME_ZONE = 'Europe/Istanbul';
export const TIMELINE_HOURS = {
  morning: { exact: 8, from: 7, to: 9, lastResort: 'first' },
  noon: { exact: 13, from: 12, to: 14, lastResort: 12 },
  evening: { exact: 18, from: 17, to: 19, lastResort: 18 },
  night: { exact: 22, from: 21, to: 23, lastResort: 'last' },
} as const;
