# Görev 002 — Open-Meteo istemcisi ve karar motoru

Kullanılan skill'ler: yok

## Değiştirilen dosyalar

- `lib/weather/open-meteo.ts`: anahtarsız saatlik istemci; koordinat, HTTP, yanıt yapısı ve sayısal alan doğrulaması; 10 saniyelik istek zaman aşımı ve anlamlı hatalar.
- `lib/engine/constants.ts`: SPEC 3.1–3.6 sıcaklık, yağış, rüzgâr, süet, terleme ve timeline eşikleri.
- `lib/engine/decision-engine.ts`: saf `calculateDecisions(hourly, preferences?, referenceDate?)`; beş karar kategorisi, günlük indirgeme, kullanıcı tercihleri ve dört dilimli fallback.
- `__tests__/decision-engine.test.ts`: 85 test; karar motoru ve sahte fetch yanıtlarıyla API sözleşmesi/hataları.
- `package.json`: yalnızca `test` komutu eklendi. Mevcut TypeScript derleyicisi ve Node yerleşik `node:test` kullanıldı; bağımlılıklar değişmedi.
- `handoff/002-open-meteo-and-decision-engine.md`: bu rapor.

`docs/SPEC.md` ve `tasks/002-open-meteo-and-decision-engine.md` çalışma başında zaten değiştirilmişti; bu görev sırasında bu dosyalara yazılmadı. UI, mevcut tipler ve lockfile değiştirilmedi.

## Kabul kriterleri

| Kriter | Sonuç | Kanıt |
| --- | --- | --- |
| API uç noktası, yedi saatlik alan, parametrik koordinatlar, anahtarsız erişim ve HourlyDataPoint eşlemesi | GEÇTİ — sahte fetch ile | `npm test`: Open-Meteo alan/birim/koordinat ve eşleme testleri |
| API hata davranışı | GEÇTİ | Geçersiz koordinat, HTTP 503, ağ, zaman aşımı, bozuk JSON, eksik alan, uzunluk uyumsuzluğu, null/string sayı ve geçersiz zaman testleri |
| Saf fonksiyon ve referans zamanı | GEÇTİ | Donmuş girdiler, tekrarlanan çağrı eşitliği, Date/ISO referansları, girdinin ilk noktasından varsayılan referans ve gün filtresi testleri |
| SPEC 3.1 sıcaklık aralıkları | GEÇTİ | 7/12/17/22/27 sınırları ve hemen altları; giyim metinleri ve severity kontrolleri |
| SPEC 3.2 yağış/olasılık aralıkları | GEÇTİ | 0.1/1.5/5 mm/h ve %20/%50 sınırları, hemen altları; ayakkabı/şemsiye kararları |
| SPEC 3.3 rüzgâr | GEÇTİ | 15/30 km/h ve hemen altları; 0/-2/-4°C ofset, dış katman uyarısı ve sert rüzgârda yağmurluk |
| SPEC 3.4 günlük indirgeme ve fallback | GEÇTİ | 15:00 sağanağı, sıcak öğle/serin akşam, geçmiş/başka günün dışlanması, gün sonu, exact/aralık/son çare fallback testleri |
| SPEC 3.5 tercihler | GEÇTİ | -2/-1/0/+1/+2 hassasiyet; rüzgârla birleşik ofset; süet %30/0.05 eşikleri; terleme eşiklerinin -3°C kayması ve katman notu |
| SPEC 3.6 severity | GEÇTİ | Beş kategorinin sınır testleri; standart %20–49 safe, süet %30 caution, yüksek yağış önceliği, rüzgâr alert |
| Zorunlu İstanbul/yaz/kış/ofset senaryoları | GEÇTİ | 17°C + 28 km/h + 15:00 4.2 mm/h; 28°C güneşli; 4°C kuru; pozitif/negatif hassasiyet testleri |
| `npm test` %100 başarı | GEÇTİ | 85 test geçti, 0 başarısız/atlanan |

### Test komutu ve çıktısı

```sh
npm test
```

Komut önce testleri ve içe aktardıkları motor/API/tip dosyalarını strict TypeScript ile `.next/cache/decision-tests` altına derler, ardından Node test çalıştırıcısını başlatır. Harici test paketi veya ağ erişimi gerekmez.

Çıkış kodu: 0. Özet çıktı:

```text
1..85
# tests 85
# suites 0
# pass 85
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Sistem saat diliminden bağımsızlık için ayrıca:

```sh
TZ=America/Los_Angeles npm test
```

Çıkış kodu: 0; yine 85 test geçti, 0 başarısız, 0 atlanan.

### TypeScript ve diff kontrolü

```sh
npm run typecheck -- --incremental false
git diff --check
```

Her iki komut çıkış kodu: 0. TypeScript çıktısı:

```text
> negiysem@0.1.0 typecheck
> tsc --noEmit --incremental false
```

TypeScript hata/uyarısı yok; `git diff --check` çıktı üretmedi.

### Ek üretim derlemesi

```sh
NEXT_TELEMETRY_DISABLED=1 npm run build -- --webpack
```

Çıkış kodu: 0. İlgili çıktı:

```text
Next.js 16.4.6 (webpack)
Compiled successfully in 2.4s
Running TypeScript ...
Finished TypeScript in 800ms ...
Generating static pages using 4 workers (3/3)
Route (app)
┌ ○ /
└ ○ /_not-found
```

Varsayılan `NEXT_TELEMETRY_DISABLED=1 npm run build` ayrıca denendi; Turbopack ortamın süreç/port açma kısıtına takılarak kod 1 ile sonlandı:

```text
Failed to write app endpoint /page
Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- binding to a port
- Operation not permitted (os error 1)
```

Build script'i değiştirilmedi; Webpack yalnızca komut argümanıyla seçildi.

## Antigravity'nin bilmesi gerekenler

- Zaman tabanı İstanbul'dur (`Europe/Istanbul`). API bu zaman dilimiyle çağrılır; offsetsiz saatlik çıktıya `+03:00` eklenir. Motor offsetsiz ISO saatleri de İstanbul saati olarak yorumlar; açık UTC/ofsetli ISO ve Date girdileri İstanbul yerel gününe dönüştürülür. Sistem saati okunmaz.
- Referans verilmezse sıralama yapılmadan önce `hourly[0].time` kullanılır. Gün verisi kopya dizi üzerinde kronolojik sıralanır. Eşit uzaklıklı fallback adaylarında önceki saat seçilir. Timeline tüm hedef güne, kararlar yalnızca kalan saatlere dayanır.
- Dış giyim ve normal üst giyim minimum efektif sıcaklığa dayanır; SPEC 3.4.B'deki sıcak gündüz/soğuk akşam istisnası ayrıca uygulanır. Terleme en sıcak kalan saate göre değerlendirilir; mont koşullu risk, açıklamada koşullu olarak belirtilir. `sweats_easily`, orta/yüksek terleme eşiklerini 3°C aşağı kaydırır.
- Süet tercihi ayakkabıyı etkiler; şemsiyenin standart eşiklerini değiştirmez. Sağanak/şiddetli sağanak kararları düşük olasılık uyarısına göre önceliklidir.
- Hero, dış giyim, yağış ve terleme olaylarını severity'ye göre sıralayıp ilk ikisini birleştirir. Eşit severity durumunda sıra dış giyim → yağış → terlemedir. Ayakkabı/şemsiye aynı yağış olayında birleştirilir; süet uyarısı daha kritikse ayakkabı olayı öne çıkar.
- Canlı API çağrısı denenirken `api.open-meteo.com` DNS çözümlemesi `ENOTFOUND` ile başarısız oldu. Canlı servis doğrulaması yapılamadı; kabul kriterleri sahte fetch yanıtlarıyla doğrulandı. İstek alanları için başvurulan kaynak: https://open-meteo.com/en/docs.
- npm kayıt sunucusu da `ENOTFOUND` verdi. Yeni bağımlılık eklenmediği için bu durum testleri engellemedi.
- UI/tarayıcı testi bu görevin kapsamında değil; masaüstünde pencere açılmadı.
