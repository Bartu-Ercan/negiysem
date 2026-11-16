# Görev 014 — Kapsamlı denetim ve iyileştirme

Kullanılan skill'ler: playwright-cli, better-interface, better-layout, better-typography, better-colors, animate.

**Durum:** Kod iyileştirmeleri, derleme ve otomatik kaynak testleri tamamlandı. **390/1440 px headless tarayıcı kabulü doğrulanamadı; görev tüm kabul kriterleriyle onaylanmış sayılmamalı.** Playwright kullanımı, başlatma denemeleri ve tekrar çalıştırılabilir senaryonun hazırlanmasını kapsar; başarılı tarayıcı çalıştırması iddia edilmez.

Başlangıç commit'i: `077c640`. Çalışma başlangıcında git çalışma ağacı temizdi. Commit oluşturulmadı.

## Kapsam ve yöntem

Next.js 16 / React 19 / TypeScript / Tailwind 3 üzerinde `app/page.tsx → WeatherView` aktif akışı, bütün aktif bileşenler, iki API rotası, tercihler, hava istemcisi ve motor kaynakları incelendi. Referanslar: `AGENTS.md`, `docs/SPEC.md`, Görev 014. Başka bir framework veya animasyon paketi eklenmedi; karar eşikleri değiştirilmedi.

Eski `CalmHero`, `DecisionHero`, `DecisionCard`, `DecisionCardStack`, `FluidTimelineScrubber`, `LayerTimelineGauge`, `RainCanvas` kaynakları da okundu. Bunlar aktif sayfanın import grafiğinde yok. Eski bileşenleri topluca silmek yerine aktif akış düzeltildi. Eski bileşenlerdeki kesme kuralları/ayrı karar kopyaları bu nedenle aktif ekran için kullanılmamalı; bu dosyalar için yeni bir görsel uygunluk onayı verilmedi.

| Alan | İncelenen kanıt | Sonuç / sınır |
| --- | --- | --- |
| Interface | Aktif import grafiği, yüklenme/hata/çevrimdışı akışları, geri bildirim ve konum kodu | Kaynak denetimi ve uygulama tamamlandı; render denetimi engellendi |
| Layout | Timeline geometrisi, kart ızgaraları, haftalık butonlar, dialog ve drawer | Kaynak düzeltmeleri tamamlandı; 320/390/1440 px ve zoom **Not verified** |
| Typography | Aktif başlıklar, açıklamalar, arama girişi, sayısal alanlar; sunucu HTML metni | Kesme kaldırıldı; giriş 16px, açıklamalar 1.4+ satır aralığı; gerçek font yüklenmesi/ölçüsü **Not verified** |
| Colors | Semantik tokenlar, severity eşlemesi, opak yüzeylerin beyan edilmiş kontrast çiftleri | Kaynak/hesap kontrolü yapıldı; ekrandaki gerçek piksel çiftleri **Not verified** |
| Motion | AtmosphereCanvas render döngüsü ve timeline yüksek frekanslı etkileşimi | Yeni döngü ve anlık scrubber uygulandı; gerçek FPS, bellek profili ve gesture hissi **Not verified** |
| Accessibility | Native slider/dialog, erişilebilir adlar, focus-visible, durum metinleri | Kaynak düzeltmeleri yapıldı; `better-accessibility` bu görevin izinli skill listesinde olmadığı için bağımsız alan denetimi **Not reviewed** |
| Writing | Hatalarda yeniden deneme, çevrimdışı kaynak ve sınırda geri bildirim metinleri | İşlevsel metinler düzeltildi; bağımsız `better-writing` incelemesi **Not reviewed** |
| UI polish | Mat yüzey ve mevcut tasarım korunarak aktif bileşenler | Bağımsız `better-ui` incelemesi ve görsel değerlendirme **Not reviewed** |

## Birleştirilmiş bulgular ve uygulanan düzeltmeler

Konumlar yeni kaynak satırlarını gösterir; **Önce** hücreleri başlangıç commit'indeki uygulamaya aittir.

| Önem | Alan | Konum | Önce | Sonra | Etki |
| --- | --- | --- | --- | --- | --- |
| HIGH | Durum yönetimi | `components/WeatherView.tsx:41` | Konum adı fetch'ten önce değişiyor; eski yanıtın yeni seçimi ezmesini engelleyen kontrol yok | AbortController + istek kimliği + 15sn zaman aşımı; konum/veri/kaynak tek snapshot olarak yalnızca başarılı yanıtta commit edilir | Yanlış konumun verisinin gösterilmesini önler; hata eski snapshot'ı korur ve yeniden seçme yolu sunar |
| HIGH | Veri doğruluğu | `components/WeatherView.tsx:71` | localStorage yalnızca konum adını değiştiriyordu | Kayıtlı konum doğrulanır ve onun verisi çekilir | Kayıtlı konum ile İstanbul verisinin karışmasını önler |
| HIGH | Tek karar kaynağı | `components/WeeklyWardrobePlan.tsx:76`, `components/WeatherView.tsx:92` | Haftalık plan/hero farklı 9/23/28 gibi eşikler kullanıyordu; hissedilen gösterimi rüzgârı dışlıyordu | Özet ve haftalık öneri `calculateDecisions` üzerinden; gösterim SPEC rüzgâr ofsetleriyle hesaplanır | Aynı hava/tercihler için çelişkili tavsiyeler giderilir |
| HIGH | Dürüst kaynak durumu | `app/page.tsx`, `components/WeatherView.tsx` | SSR varsayılan koordinatı etiketle farklı; footer koşulsuz “Canlı” | Tek DEFAULT_LOCATION; dinamik güncel sayfa; çevrimdışı örnek açıkça etiketlenir | Bayat veya örnek telemetrinin canlı olarak sunulmasını önler |
| HIGH | Typography/layout | `components/WeeklyWardrobePlan.tsx`, `components/GlanceableCards.tsx` | Haftalık tavsiyede `truncate`, dar kart başlıklarında taşmaya açık sabit satır | Tam metin, min-width:0, doğal wrap ve sarılabilen başlıklar; ana 2 + tamamlayıcı 3 hiyerarşisi | Kritik tavsiyenin kesilmesini kaldırır; gerçek dar görünüm ölçümü bekliyor |
| HIGH | Etkileşim | `components/ContinuousTimeline.tsx:108`, `hooks/useModalDialog.ts:6` | Özel div slider'da pointercancel yok; thumb ve etiket rayları farklı; modal arka planı etkileşebilir | Native range ve native modal dialog; ortak endpoint geometrisi, isimli slider, odak iadesi ve inert arka plan | Klavye/pointer davranışı platforma bırakıldı; browser kanıtı bekliyor |
| HIGH | Motion | `components/AtmosphereCanvas.tsx:119` | Her frame sabit zaman artışı; görünmeyen sekmede/azaltılmış hareket tercihinde sürekli döngü | Gerçek delta time, 60Hz frame bütçesi, hidden durumda durdurma, reduced-motion için tek statik çizim | Hareket tercihi ve yüksek frekanslı ekranlarda gereksiz iş giderilir |
| MEDIUM | Bellek/çizim | `components/AtmosphereCanvas.tsx:107` | Sabit 2200/2400px parçacık uzayı, splash push/splice, frame başına çok sayıda gradient | Normalize koordinatlar; DPR≤2 ve 4M piksel bütçesi; sabit 380/75 parçacık havuzları; önceden çizilmiş güneşin 12 huzmesi ve cloud sprite; cache'li gökyüzü | Tahsis ve çizim işini sınırlar; gerçek GC profili ölçülmedi |
| MEDIUM | Hesap maliyeti | `lib/engine/decision-engine.ts:9` | Her localTime çağrısı yeni Intl.DateTimeFormat oluşturuyordu | Modül başına tek formatter | 30 çağrılık Node ölçümünde ortalama 19.338ms → 1.235ms |
| MEDIUM | GPS/search | `components/LocationSelector.tsx` | GPS 25km çevresindeki preset koordinatına sessizce yuvarlanıyordu; eski callback kapanmış modalı etkileyebilirdi | Gerçek koordinatlar korunur; request generation ile geç callback iptali; Türkçe/ASCII arama normalizasyonu, boş sonuç ve izin hatası yolu | Konum doğruluğu ve tekrar deneme akışı |
| MEDIUM | Tercih/paylaşım | `hooks/usePreferences.ts:44`, `components/AdaptiveFeedbackWidget.tsx`, `components/ShareDecisionButton.tsx` | React updater içinde depolama yan etkisi; sınırda yanlış ±1 kaydı; clipboard erişimi yokken bile başarı | Saf updater + yükleme sonrası persistence effect; gerçek sınır mesajı; bağlam değişiminde sıfırlanan ve yeniden değerlendirilebilen feedback; gerçek paylaşım/clipboard sonucu | Yanlış başarı mesajları ve stale geri bildirim azaltıldı |
| MEDIUM | API/colors | `app/api/weather/route.ts`, `app/api/decision/route.ts`, `components/GlanceableCards.tsx:56` | parseFloat/parseInt geçersiz son ekleri kabul ediyor; NaN ve koordinat sınırları eksik; warning badge amber | Katı sayısal/girdi sınırı kontrolü; geçersiz girdide 400; warning cobalt, caution amber | Tip güvenliği ve SPEC severity semantiği |

## Mimari kararlar

- **Karar motoru tek iş kuralı kaynağı:** UI'daki paralel eşik fonksiyonları kaldırıldı. Motorun karar dalları ve eşik sabitleri değişmedi. Motor değişikliği yalnızca Intl formatter yeniden kullanımıdır.
- **Paylaşılan sunum yardımcıları:** `lib/weather/presentation.ts`, İstanbul gün/saat normalizasyonunu, güne ayırmayı, efektif sıcaklık gösterimini ve gelen telemetri kontrolünü toplar. Geçersiz client yanıtı snapshot'a alınmaz. Yeni `isLocationPreset` kayıtlı veriyi doğrular.
- **Tek veri snapshot'ı:** Etiket ve telemetri birlikte değişir. Abort edilmiş/eski yanıtlar commit edilmez. Unmount'ta istek, completion'da timeout temizlenir. Hata kullanıcıya önceki konumun gösterildiğini söyler.
- **Platform kontrolleri:** Native range pointer/fare/dokunma ve Home/End/yön tuşlarını yönetir; ayrı mouse/touch state makineleri yok. Native dialog odak containment ve inert arka plan sağlar. `useModalDialog` scroll kilidi ve odak iadesini ortaklaştırır. Yeni modal/animasyon kütüphanesi yok.
- **Hareketin amacı:** Atmosfer, hava durumunun görsel durum göstergesidir. Canvas için rAF/delta-time gerekir; önceden belirlenmiş grafikler sprite'tır. Saat sürükleme yüksek frekanslı olduğundan thumb/konum geçişlerine gecikmeli animasyon eklenmedi. Reduced-motion'da etkileşim ve görünür durum korunur, sürekli dekoratif hareket durur.
- **Responsive düzen:** Desktop'ta ana 2 ve tamamlayıcı 3 kart, dar görünümde tam metni koruyan tek sütun. Haftalık plan 2/4/7 sütuna uyum sağlar; veri yalnızca bir günse başlık bir günlük plan der. `overflow-x-hidden` ile taşma gizlenmez.
- **Build uyumluluğu:** `npm run build` artık `next build --webpack` çalıştırır. Bu ortamda Turbopack dev süreci `unable to start FSEvent stream` ile kapanıyordu. Webpack üretim derlemesi başarılı; bağımlılık veya lockfile değişmedi. Dev script'i değiştirilmedi.
- **Kapsam disiplini:** Eski UI varyantları silinmedi. SPEC, görev ve karar tipleri değiştirilmedi. Yeni özellik/servis kurulmadı.

## Değiştirilen ve eklenen dosyalar

- UI: `components/AtmosphereCanvas.tsx`, `ContinuousTimeline.tsx`, `CompactAtmosphereHero.tsx`, `GlanceableCards.tsx`, `WeatherView.tsx`, `LocationSelector.tsx`, `WeeklyWardrobePlan.tsx`, `AdaptiveFeedbackWidget.tsx`, `PreferencesDrawer.tsx`, `ShareDecisionButton.tsx`.
- Durum/yardımcılar: `hooks/usePreferences.ts`, yeni `hooks/useModalDialog.ts`, yeni `lib/weather/presentation.ts`, `lib/weather/locations.ts`.
- Backend/performans: `app/page.tsx`, `app/api/weather/route.ts`, `app/api/decision/route.ts`, `lib/engine/decision-engine.ts`.
- Stil/araçlar: `app/globals.css`, `tailwind.config.ts`, `package.json`.
- Kanıt/tekrar çalıştırma: yeni `__tests__/presentation.test.ts`, yeni `scripts/audit-014.js`, bu handoff.

## Kabul kriterleri ve komut kanıtları

### 1. Üretim derlemesi — GEÇTİ

```sh
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Son kaynak durumuyla çıkış kodu **0**:

```text
> next build --webpack
Next.js 16.4.6 (webpack)
Compiled successfully in 1411ms
Running TypeScript ...
Finished TypeScript in 1034ms ...
Generating static pages using 6 workers (4/4)
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/decision
└ ƒ /api/weather
```

Ortam kaynaklı Node `UNDICI-EHPA` experimental proxy uyarıları görüldü; TypeScript/derleme hatası yok.

### 2. Motor ve regresyon testleri — GEÇTİ

```sh
npm test
TZ=America/Los_Angeles npm test
npm run typecheck -- --incremental false
git diff --check
```

Normal ve alternatif saat dilimi çalıştırmalarında çıkış kodu **0**. Mevcut test dosyasındaki **85 test değiştirilmeden** korundu; 17 yeni sunum/girdi regresyon testi eklendi. Toplam:

```text
1..102
# tests 102
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Ek testler: UTC/İstanbul gün sınırı, offsetsiz ISO saati, sıralama/7 gün sınırı/girdi değişmezliği, efektif sıcaklığın motorla uyumu, bozuk telemetri ve kayıtlı konum doğrulaması. Typecheck ve diff kontrolü de çıkış kodu 0.

### 3. 390/1440 px headless Playwright — ENGELLENDİ / NOT VERIFIED

Komut:

```sh
PWTEST_DAEMON_SESSION_DIR="$PWD/.playwright/daemon" playwright-cli -s=audit014 open http://127.0.0.1:3014 --config=.playwright/audit-014.json
```

- Varsayılan Chromium headless executable bu makinede kurulu değildi.
- Kurulu sistem Chrome'u `headless:true` ile başlatma denemesi `TargetClosedError`, `SIGABRT`, `kill EPERM` ile sonlandı. Tek süreç denemesi de başarısız oldu.
- Genişletilmiş yetkiyle başlatma isteği izin politikası tarafından reddedildi: **`sandbox_approval: false`**.
- Masaüstünde pencere açılmadı; mevcut kullanıcı tarayıcısına bağlanılmadı.
- **scrollWidth/innerWidth ölçümü, screenshot, gerçek pointer/touch hissi, zoom/RTL, focus dönüşü, localStorage browser persistence, reduced-motion render ve FPS/memory kanıtı yok. Bunlar geçti diye işaretlenmedi.**

Tekrar çalıştırma senaryosu: `scripts/audit-014.js`. Bu dosyanın `node --check scripts/audit-014.js` kontrolü geçti; senaryo **çalıştırılmadı**. Çalışabilen bir ortamda:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3014
# Ayrı terminal; varsayılan headless oturum, kurulu Chrome:
PWTEST_DAEMON_SESSION_DIR="$PWD/.playwright/daemon" playwright-cli -s=audit014 open http://127.0.0.1:3014 --browser=chrome
PWTEST_DAEMON_SESSION_DIR="$PWD/.playwright/daemon" playwright-cli -s=audit014 run-code --filename=scripts/audit-014.js
PWTEST_DAEMON_SESSION_DIR="$PWD/.playwright/daemon" playwright-cli -s=audit014 close
```

Senaryo 7 günlük sahte hava yanıtıyla dış servisten bağımsız çalışır. 320/390/1440 px document ve child bounds, kesilmiş metin, klavye/drag, hafta seçimi, tercihin reload sonrası kalıcılığı, dialog odak iadesi, Türkçe arama, API hatasında eski snapshot'ın korunması, gerçek GPS koordinatı ve reduced-motion etkileşimini kontrol eder. Gerçek dokunmatik sürükleme, gecikmeli iki isteğin yarışması ve fiziksel cihaz performansı ayrıca doğrulanmalı; betik bunları ölçtüğünü iddia etmez.

### Ek HTTP/SSR kontrolleri — GEÇTİ

`npm run start -- --hostname 127.0.0.1 --port 3014` ile başlatılan üretim sunucusuna Node fetch ile:

```text
400 /api/weather?lat=91&lon=29
400 /api/weather?lat=41oops&lon=29
400 /api/weather?lat=&lon=29
400 /api/decision?lat=41&lon=29&sensitivity=NaN
200 /
```

HTMLParser ile script/style hariç sunucu metni kontrol edildi:

```text
PASS: server-rendered text contains no emoji or ellipsis
```

Bu, istemcinin hydration veya layout doğrulamasının yerine geçmez. Kontrol HTML'inde `...`, `…` ve U+1F300–U+1FAFF emoji aralığı yoktu.

### Ölçülen performans ve kontrast

Node mikro ölçümü: Aynı 168 saatlik sentetik dizide, 30 `calculateDecisions` çağrısı. Değişiklik öncesi derlenmiş kod **19.3379986 ms/çağrı**, formatter cache sonrası **1.2350153 ms/çağrı**. Sonuç bu makineye/iş yüküne aittir; tarayıcı FPS veya p95 ölçümü değildir.

Beyan edilen opak `#181A1F` yüzeyine karşı sRGB bağıl luminans hesabı:

| Metin rolü | Renk | Ölçülen oran |
| --- | --- | --- |
| Birincil | `#F4F4F5` | 15.84:1 |
| İkincil | `#A1A1AA` | 6.79:1 |
| Accent metin | `#FBBF24` | 10.43:1 |

Bunlar token çiftlerinin hesaplarıdır. Transparan yüzeyler ve atmosferin üzerindeki bütün gerçek piksel çiftleri ölçülmedi; uygulamanın tamamı için kontrast uygunluğu iddia edilmez.

## Antigravity'nin bilmesi gerekenler ve karar

- Yeni kaynaklar build/typecheck ve 102 test ile doğrulandı; kritik ekran akışlarının runtime kabulü bekliyor.
- `scripts/audit-014.js` çalıştırılmalı, 390/1440 px sıfır yatay taşma kanıtı ve ekran görüntüleri üretilmeli; ardından fiziksel touch ve FPS/GC ölçümü yapılmalı.
- Eski render edilmeyen UI varyantları korunuyor; eski eşik/ellipsis kodları aktif akışa geri bağlanmamalı.
- Native range/dialog standart davranışları kullanıldı; bunların desteklenen tarayıcılarda görsel/klavye doğrulaması henüz yok.
- **Verdict: Block — kabul kriteri 3 doğrulanamadı.** Bu, başarılı kaynak testlerini geçersiz kılmaz; görsel/runtime onayı olmadan görevin tümü için Approve verilemez. Bağımsız accessibility/writing/UI-polish alanları da yukarıdaki kapsam sınırlarıyla Not reviewed.
