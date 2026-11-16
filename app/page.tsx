import { fetchHourlyWeather } from '../lib/weather/open-meteo';
import { calculateDecisions } from '../lib/engine/decision-engine';
import { createDemoForecast } from '../lib/weather/demo';
import { DEFAULT_LOCATION } from '../lib/weather/locations';
import { WeatherView } from '../components/WeatherView';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === '1';
  const reference = new Date();
  let hourly = createDemoForecast(reference);
  let isLive = false;
  if (!demo) {
    try {
      hourly = await fetchHourlyWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      isLive = true;
    } catch {
      // The UI clearly distinguishes sample telemetry from the live forecast.
    }
  }
  return <WeatherView initialDecision={calculateDecisions(hourly, undefined, reference)} rawHourly={hourly} isLive={isLive} isDemo={demo} />;
}
