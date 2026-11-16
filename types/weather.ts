export interface HourlyDataPoint {
  time: string; // ISO string
  temperature: number; // °C
  apparentTemperature: number; // °C (hissedilen)
  precipitation: number; // mm/h
  precipitationProbability: number; // 0-100 %
  windSpeed: number; // km/h
  windDirection: number; // derece (0-360)
  weatherCode: number; // WMO code
}

export interface DayTimeline {
  morning: HourlyDataPoint; // 08:00
  noon: HourlyDataPoint; // 13:00
  evening: HourlyDataPoint; // 18:00
  night: HourlyDataPoint; // 22:00
}
