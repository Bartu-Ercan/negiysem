import type { DecisionItem, DecisionSeverity, FullDecisionResult, UserPreferences } from '../../types/decision';
import type { DayTimeline, HourlyDataPoint } from '../../types/weather';
import { RAIN, SUEDE, SWEAT_THRESHOLD_SHIFT, TEMPERATURE as T, TIMELINE_HOURS, TIME_ZONE, WIND } from './constants';

const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureSensitivity: 0, shoePreference: 'default', sweatTendency: 'normal',
};
const SEVERITY_RANK: Record<DecisionSeverity, number> = { safe: 0, caution: 1, warning: 2, alert: 3 };
const LOCAL_TIME_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// Offset-free API timestamps denote Istanbul local time, never the host timezone.
function timestamp(value: string | Date): number {
  const result = value instanceof Date ? value.getTime() : Date.parse(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value) ? `${value}+03:00` : value,
  );
  if (!Number.isFinite(result)) throw new Error('Geçersiz telemetri veya referans zamanı');
  return result;
}

function localTime(value: number) {
  const parts = LOCAL_TIME_FORMAT.formatToParts(new Date(value));
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return { day: `${part('year')}-${part('month')}-${part('day')}`, hour: Number(part('hour')), minute: Number(part('minute')), clock: `${part('hour')}:${part('minute')}` };
}

function effectiveTemperature(point: HourlyDataPoint, preferences: UserPreferences): number {
  const windOffset = point.windSpeed >= WIND.strong ? WIND.strongOffset :
    point.windSpeed >= WIND.moderate ? WIND.moderateOffset : 0;
  return point.apparentTemperature + windOffset + preferences.temperatureSensitivity;
}

function clothing(temperature: number): { top: string; outerwear: string; badge: string; topSeverity: DecisionSeverity; outerSeverity: DecisionSeverity } {
  if (temperature >= T.hot) return { top: 'Askılı / İnce Kısa Kol / Keten', outerwear: 'Gerek yok', badge: 'Gerek yok', topSeverity: 'safe', outerSeverity: 'safe' };
  if (temperature >= T.mild) return { top: 'Kısa Kol Tişört / Hafif Gömlek', outerwear: 'Gerek yok (Gece için ince gömlek/hırka opsiyonel)', badge: 'Gerek yok', topSeverity: 'safe', outerSeverity: 'safe' };
  if (temperature >= T.jacket) return { top: 'Kısa Kol veya İnce Uzun Kol', outerwear: 'Hafif ceket, hırka veya rüzgârlık', badge: 'Yanına al', topSeverity: 'caution', outerSeverity: 'caution' };
  if (temperature >= T.winter) return { top: 'Uzun Kol Tişört / Hafif Sweatshirt', outerwear: 'Denim ceket, bomber, trençkot veya hafif mevsimlik ceket', badge: 'Şart', topSeverity: 'warning', outerSeverity: 'warning' };
  if (temperature >= T.thermal) return { top: 'Kalın Sweatshirt / Yün Kazak', outerwear: 'Kışlık ceket / Hafif dolgulu mont', badge: 'Şart', topSeverity: 'warning', outerSeverity: 'alert' };
  return { top: 'Termal İçlik + Kalın Kazak', outerwear: 'Kışlık kalın mont / Kaban / Parka', badge: 'Şart', topSeverity: 'alert', outerSeverity: 'alert' };
}

function rainDecision(precipitation: number, probability: number, suede: boolean) {
  if (precipitation >= RAIN.heavy) return { severity: 'alert' as const, umbrella: 'Fırtına Tipi Şemsiye / Yağmurluk', footwear: 'Su Geçirmez Bot / Outdoor', ground: 'Derin su birikintileri oluşur, kalın taban şart.', badge: 'Şiddetli Sağanak' };
  if (precipitation >= RAIN.shower) return { severity: 'warning' as const, umbrella: 'Kesinlikle Al', footwear: 'Su Geçirmez Sneaker / Deri', ground: 'Islak zemin ve su birikintileri; bez ayakkabı anında su çeker.', badge: 'Sağanak' };
  if (precipitation >= (suede ? SUEDE.drizzle : RAIN.drizzle)) return { severity: 'caution' as const, umbrella: 'Yanına Al', footwear: 'Deri veya suya dayanıklı sneaker; Süet Giyme', ground: 'Nemli zemin. Hafif yağmurda kapüşonlu ceket de kurtarabilir.', badge: 'Çisenti' };
  if (probability >= (suede ? SUEDE.likelyProbability : RAIN.likelyProbability)) return { severity: 'caution' as const, umbrella: 'Çantaya At', footwear: 'Koyu sneaker; Süet Giyme', ground: 'Süet veya beyaz kumaş sneaker tavsiye edilmez.', badge: 'Dikkat' };
  if (probability >= RAIN.optionalProbability) return { severity: 'safe' as const, umbrella: 'İsteğe Bağlı', footwear: 'Kumaş / açık renk sneaker giyilebilir', ground: 'Düşük yağmur olasılığı var.', badge: 'Güvenli' };
  return { severity: 'safe' as const, umbrella: 'Gerek Yok', footwear: 'Bez ayakkabı, süet veya açık sneaker', ground: 'Kuru zemin; ayakkabı seçimi serbest.', badge: 'Serbest' };
}

export function calculateDecisions(
  hourly: HourlyDataPoint[],
  preferences: UserPreferences = DEFAULT_PREFERENCES,
  referenceDate?: Date | string,
): FullDecisionResult {
  if (!hourly.length) throw new Error('Hedef güne ait telemetri verisi bulunamadı');
  const reference = timestamp(referenceDate ?? hourly[0].time);
  const targetDay = localTime(reference).day;
  const day = hourly.map(point => ({ point, time: timestamp(point.time) }))
    .filter(entry => localTime(entry.time).day === targetDay).sort((a, b) => a.time - b.time);
  if (!day.length) throw new Error('Hedef güne ait telemetri verisi bulunamadı');
  let remaining = day.filter(entry => entry.time >= reference);
  if (!remaining.length) remaining = [day[day.length - 1]];

  const timeline = {} as DayTimeline;
  for (const key of Object.keys(TIMELINE_HOURS) as (keyof DayTimeline)[]) {
    const rule = TIMELINE_HOURS[key];
    const exact = day.find(entry => { const time = localTime(entry.time); return time.hour === rule.exact && time.minute === 0; });
    const nearby = day.find(entry => { const time = localTime(entry.time); return time.hour >= rule.from && time.hour <= rule.to; });
    const fallback = rule.lastResort === 'first' ? day[0] : rule.lastResort === 'last' ? day[day.length - 1] :
      day.reduce((best, entry) => {
        const distance = (time: number) => { const local = localTime(time); return Math.abs(local.hour * 60 + local.minute - Number(rule.lastResort) * 60); };
        return distance(entry.time) < distance(best.time) ? entry : best;
      });
    timeline[key] = { ...(exact ?? nearby ?? fallback).point };
  }

  const temperatures = remaining.map(entry => ({ ...entry, effective: effectiveTemperature(entry.point, preferences) }));
  const coldest = temperatures.reduce((best, entry) => entry.effective < best.effective ? entry : best);
  const hottest = temperatures.reduce((best, entry) => entry.effective > best.effective ? entry : best);
  const wettest = remaining.reduce((best, entry) => entry.point.precipitation > best.point.precipitation ? entry : best);
  const probability = Math.max(...remaining.map(entry => entry.point.precipitationProbability));
  const wind = Math.max(...remaining.map(entry => entry.point.windSpeed));
  const layers = clothing(coldest.effective);
  const daytimeWarm = temperatures.some(entry => localTime(entry.time).hour < 16 && entry.effective >= T.mild);
  const eveningCold = temperatures.some(entry => localTime(entry.time).hour >= 16 && localTime(entry.time).hour < 21 && entry.effective < T.jacket);
  const eveningLayer = daytimeWarm && eveningCold;
  const coldTime = localTime(coldest.time).clock;
  const rainTime = localTime(wettest.time).clock;
  const layerDescription = `${coldTime} için en düşük efektif hissedilen sıcaklık ${coldest.effective}°C.` +
    (coldest.effective >= T.jacket && coldest.effective < T.mild ? ' 18:00 sonrası dış katman şart.' : '') +
    (wind >= WIND.moderate ? ' Rüzgâr geçirmeyen dış katman önerilir.' : '') +
    (preferences.sweatTendency === 'sweats_easily' ? ' Mont giyme, içine ince pamuklu seç.' : '');
  const top: DecisionItem = {
    category: 'top', label: 'Üst Giyim', badge: eveningLayer ? 'Öğlen rahat' : layers.badge,
    verdict: eveningLayer ? 'Kısa Kol Tişört (Öğlen rahat, akşama katman yap)' : layers.top,
    description: layerDescription, severity: eveningLayer ? 'safe' : layers.topSeverity,
  };
  const outerwear: DecisionItem = {
    category: 'outerwear', label: 'Dış Giyim', badge: eveningLayer ? 'Akşam Şart' : layers.badge,
    verdict: eveningLayer ? 'Hafif Ceket / Hırka (Akşam Şart)' : layers.outerwear,
    description: layerDescription, severity: layers.outerSeverity,
  };
  const shoeRain = rainDecision(wettest.point.precipitation, probability, preferences.shoePreference === 'suede_sensitive');
  const umbrellaRain = rainDecision(wettest.point.precipitation, probability, false);
  const rainDescription = wettest.point.precipitation >= RAIN.drizzle ?
    `${rainTime}'te ${wettest.point.precipitation} mm/h yağış; ${rainTime} sonrası zemin ıslak.` :
    `Günün kalanında en yüksek yağış olasılığı %${probability}.`;
  const footwear: DecisionItem = { category: 'footwear', label: 'Ayakkabı', badge: shoeRain.badge, verdict: shoeRain.footwear, description: `${rainDescription} ${shoeRain.ground}`, severity: shoeRain.severity };
  const umbrella: DecisionItem = {
    category: 'umbrella', label: 'Şemsiye', badge: wind >= WIND.strong ? 'Sert Rüzgâr' : umbrellaRain.badge,
    verdict: wind >= WIND.strong ? 'Şemsiye yerine kapüşonlu rüzgârlık / yağmurluk' : umbrellaRain.umbrella,
    description: rainDescription + (wind >= WIND.strong ? ' Şemsiye telleri bükülebilir; yağmurluk öncelikli.' : ''),
    severity: wind >= WIND.strong ? 'alert' : umbrellaRain.severity,
  };
  const sweatShift = preferences.sweatTendency === 'sweats_easily' ? SWEAT_THRESHOLD_SHIFT : 0;
  const sweatTemperature = hottest.effective;
  const sweatSeverity: DecisionSeverity = sweatTemperature >= T.hot - sweatShift ? 'alert' :
    sweatTemperature >= T.mild - sweatShift ? 'caution' :
      sweatTemperature >= T.winter && sweatTemperature < T.mild ? 'warning' : 'safe';
  const sweat: DecisionItem = {
    category: 'sweat', label: 'Terler miyim?', severity: sweatSeverity,
    badge: sweatSeverity === 'alert' ? 'Yüksek' : sweatSeverity === 'caution' ? 'Orta' : sweatSeverity === 'warning' ? 'Mont terletir' : sweatTemperature < T.thermal ? 'Yok' : 'Düşük',
    verdict: sweatSeverity === 'alert' ? 'Yoğun terleme riski; açık renk ve nefes alan kumaş seç' :
      sweatSeverity === 'caution' ? 'Hızlı tempoda veya metroda terletir' :
        sweatSeverity === 'warning' ? 'Tuzak sıcaklık: Kalın mont yerine katmanlı çık' : 'Terleme riski minimum',
    description: `${localTime(hottest.time).clock} için en yüksek efektif hissedilen sıcaklık ${sweatTemperature}°C.` +
      (sweatSeverity === 'warning' ? ' Dışarıda düşük; mont giyilirse metro/ofiste yüksek terleme riski.' : ''),
  };
  const items = [top, outerwear, footwear, umbrella, sweat];
  // Group rain as one event, so footwear and umbrella do not repeat the same event.
  const rainEvent = SEVERITY_RANK[footwear.severity] > SEVERITY_RANK[umbrella.severity] ? footwear : umbrella;
  const events = [outerwear, rainEvent, sweat].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  return {
    heroSummary: events.slice(0, 2).map(item => `${item.label}: ${item.verdict} (${item.category === 'umbrella' || item.category === 'footwear' ? rainDescription : item.category === 'outerwear' ? coldTime : localTime(hottest.time).clock})`).join('; ') + '.',
    heroSubtext: `En düşük hissedilen ${coldest.effective}°C; en yüksek yağış ${wettest.point.precipitation} mm/h.`,
    items, timeline,
  };
}
