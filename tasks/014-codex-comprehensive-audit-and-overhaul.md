# Görev 014: Codex Kapsamlı Proje Denetimi, Yeniden Yapılandırma ve Mükemmelleştirme

- **Atanan:** Codex (Ana Kodlayıcı / Primary Coder)
- **Tarih:** 2026-11-16
- **Talep Eden:** Kullanıcı & Antigravity (Mimar & Reviewer)
- **Önkoşul:** Görev 001-013 tamamlandı

---

## 1. Görev Özeti ve Kullanıcı Yönergesi
Kullanıcı yönergesi:
> *"ben önce codexin butun skılleri kullanarak suana kadar yaptıgın seyleri denetlemesini ve kendisi yapcak olsaydı nasıl daha iyi yapardı bunu dusunup tekrardan yapmasını istiyorum suanki halini projenin adam etsin önce bi sen yaptın her seyi kötü oldu o yapsın ustunden gece gece sonra yeni seylere geceriz"*

Codex, projenin mevcut tüm bileşenlerini, API rotalarını, durum yönetimini ve stillerini baştan sona inceleyecek; **"Ben ana kodlayıcı olarak bu projeyi sıfırdan inşa etseydim nasıl çok daha temiz, performanslı, sağlam, zanaat kalitesinde ve kusursuz yapardım?"** bakış açısıyla projeyi adam edecektir.

---

## 2. Zorunlu Skill'ler (Codex'in Kullanacağı Yetenekler)
- `playwright-cli` (Headless tarayıcı doğrulaması, görsel regresyon kontrolü)
- `better-interface` (Arayüz hiyerarşisi, semantik HTML, ARIA ve erişilebilirlik)
- `better-layout` (Duyarlı düzen, 390px mobil & 1440px masaüstü ızgara optimizasyonu)
- `better-typography` (Tipografik ölçek, okunabilirlik, tabular-nums)
- `better-colors` (Atelier Utilitarian token disiplini, kontrast ve mat yüzeyler)
- `animate` (Tuval döngüsü optimizasyonu, 60fps akıcılık, gereksiz GPU yükünün önlenmesi)

---

## 3. Denetim ve Yeniden Yapılandırma Alanları

### A. Canlı Atmosferik Sahne (`components/AtmosphereCanvas.tsx`)
- Viewport ve DPR normalizasyonunu gözden geçir.
- Güneş, ay, 12 ışık huzmesi, bulutlar, rüzgar akımları ve yağmur parçacıklarının render döngüsünü (`requestAnimationFrame`) optimize et.
- Gereksiz nesne tahsislerini (allocation) ve garbage collection tetiklemelerini önle.

### B. Kesintisiz Zaman Çizelgesi (`components/ContinuousTimeline.tsx`)
- 24 saatlik zaman rayı, SVG sıcaklık eğrisi, yağış barları ve dokunsal kaydırma rayı (`Scrubber Track & Bar`).
- Fare ve dokunmatik sürükleme (`pointerdown`, `pointermove`, `pointerup`) etkileşiminin kusursuz çalışması.
- Alttaki saat ve SVG gliflerinin hiçbir çözünürlükte kırpılmaması.

### C. Başlık ve Kıyafet Karar Alanları (`components/CompactAtmosphereHero.tsx` & `components/GlanceableCards.tsx`)
- Sıfır emoji kuralı: Tüm simgelerin saf, tutarlı SVG glifleri olması.
- Kırpılmasız metinler: Hiçbir kartta çirkin `...` (ellipsis) olmaması, doğal ve rahat okunması.
- 2 ana kıyafet sütunu (Dış Giyim, Üst Giyim) + 3 tamamlayıcı sütun (Ayakkabı, Şemsiye, Konfor) hiyerarşisinin korunması/geliştirilmesi.

### D. Çoklu Lokasyon, 7 Günlük Gardırop ve Geri Bildirim (`LocationSelector.tsx`, `WeeklyWardrobePlan.tsx`, `AdaptiveFeedbackWidget.tsx`)
- Konum arama, GPS tespiti ve dinamik veri çekimi akışını sağlamlaştır.
- 7 günlük gardırop planındaki gün geçişlerini ve reaktif güncellenmeyi gözden geçir.
- "Üşüdüm / Tam / Terledim" adaptif termal motorunun `localStorage` kalıcılığını doğrula.

### E. Sayfa Orkestrasyonu ve Performans (`components/WeatherView.tsx`)
- Durum yönetimi (`useState`, `useMemo`, `useCallback`) yapısını gereksiz render'ları önleyecek şekilde optimize et.
- Tip güvenliğini (`types/weather.ts`, `types/decision.ts`) %100 koru.

---

## 4. Kabul Kriterleri (Bitirme Şartları)
1. `npm run build` sıfır TypeScript ve derleme hatasıyla tamamlanmalı.
2. `npm test` ile 85 deterministik karar motoru testinin tamamı eksiksiz geçmeli.
3. Headless Playwright ile 390px mobil ve 1440px masaüstü ekranlarında sıfır yatay taşma (`scrollWidth <= innerWidth`) doğrulanmalı.
4. Codex, tamamlanan geliştirmeleri ve yaptığı mimari iyileştirmeleri `handoff/014-codex-comprehensive-audit-and-overhaul.md` dosyasına kaydetmeli ve içinde `Kullanılan skill'ler:` satırını belirtmelidir.
