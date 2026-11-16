# Görev 002: Open-Meteo İstemcisi ve Deterministik Karar Motoru

## 1. Amaç
Open-Meteo API'sinden İstanbul koordinatları (veya parametrik lat/lon) ile saatlik telemetri verisini çeken istemciyi (`lib/weather/open-meteo.ts`) ve `docs/SPEC.md` Madde 3'teki karar eşik tablosunu %100 uygulayan saf karar motorunu (`lib/engine/decision-engine.ts`) geliştirmek; tüm eşik kurallarını kapsayan kapsamlı birim testlerini (`__tests__/decision-engine.test.ts`) yazmak.

---

## 2. Dokunulacak Dosyalar
- `lib/weather/open-meteo.ts`
- `lib/engine/decision-engine.ts`
- `lib/engine/constants.ts`
- `__tests__/decision-engine.test.ts`
- `package.json` (test kütüphanesi vitest veya jest eklenmesi gerekiyorsa)

---

## 3. Dokunulmayacak Dosyalar
- `app/*`
- `components/*`
- `docs/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)
- `handoff/*` (görev bitiminde oluşturulacak `handoff/002-open-meteo-and-decision-engine.md` hariç)
- `reviews/*`

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **API İstemcisi:**
   - `fetchHourlyWeather(latitude: number, longitude: number): Promise<HourlyDataPoint[]>` fonksiyonu Open-Meteo `https://api.open-meteo.com/v1/forecast` uç noktasından `temperature_2m`, `apparent_temperature`, `precipitation`, `precipitation_probability`, `wind_speed_10m`, `wind_direction_10m`, `weather_code` verilerini çekmeli ve `HourlyDataPoint[]` dizisine dönüştürmelidir.
   - Herhangi bir API anahtarı gerektirmemelidir.
   - Hata durumunda anlamlı bir hata mesajı fırlatmalı veya fallback değer döndürmelidir.
2. **Deterministik Karar Motoru:**
   - `calculateDecisions(hourly: HourlyDataPoint[], preferences?: UserPreferences, referenceDate?: Date | string): FullDecisionResult` imzalı saf (`pure`) fonksiyon olmalıdır. `referenceDate` verilmezse `hourly[0].time` başlangıç zamanı ve hedef gün olarak alınır.
   - `docs/SPEC.md` Madde 3.1'deki sıcaklık eşiklerini ($[27.0, \infty)$, $[22.0, 27.0)$, $[17.0, 22.0)$, $[12.0, 17.0)$, $[7.0, 12.0)$, $(-\infty, 7.0)$) sol kapalı, sağ açık aralık mantığıyla uygulamalıdır.
   - `docs/SPEC.md` Madde 3.2'deki yağış ve ayakkabı/şemsiye kurallarını ($P < 0.1$ ve $P_{\%} < 20$, $P < 0.1$ ve $20 \le P_{\%} < 50$, $P < 0.1$ ve $P_{\%} \ge 50$, $0.1 \le P < 1.5$, $1.5 \le P < 5.0$, $P \ge 5.0$) eksiksiz yansıtmalıdır.
   - `docs/SPEC.md` Madde 3.3'teki rüzgâr ofsetini ($<15 \to 0$, $15-30 \to -2$, $\ge 30 \to -4$) $T_{\text{eff}}$ formülüne katmalıdır.
   - `docs/SPEC.md` Madde 3.4'teki günlük özet indirgeme kurallarına göre günün en kritik giyim ve yağış durumunu `items` ve `heroSummary` olarak üretmelidir.
   - `docs/SPEC.md` Madde 3.5'teki `UserPreferences` kurallarını (`temperatureSensitivity`, `shoePreference: 'suede_sensitive'`, `sweatTendency: 'sweats_easily'`) uygulamalıdır.
   - `docs/SPEC.md` Madde 3.6'daki `DecisionSeverity` matrisine göre her kartın önem derecesini (`safe | caution | warning | alert`) belirlemelidir.
   - Günün 4 kritik dilimini (Sabah 08:00, Öğle 13:00, Akşam 18:00, Gece 22:00; eksikse fallback saat aralıklarıyla) `DayTimeline` olarak ayrıştırmalıdır.
3. **Birim Testleri:**
   - `npm test` komutu çalıştırıldığında testler %100 başarıyla geçmelidir.
   - Test senaryoları en azından şunları içermelidir:
     - 17°C, 15:00 sağanak (4.2 mm/h), 28 km/s poyraz İstanbul senaryosu.
     - 28°C güneşli yaz senaryosu (askılı/şort, şemsiye gerek yok, terleme yüksek).
     - 4°C yağışsız soğuk kış senaryosu (kaban/mont şart, terleme yok).
     - Kullanıcı hassasiyet ofseti (`offset: +2` veya `-2`) uygulandığında eşik kayması doğrulaması.

---

## 5. Zorunlu Skill'ler
- Codex için: Birim test yazımı ve saf fonksiyon determinizmi.

---

## 6. Kapsam Dışı
- UI bileşenleri ve stil dosyaları
- Canvas animasyonları
- `localStorage` browser API entegrasyonu (motor bağımsız olmalıdır)
