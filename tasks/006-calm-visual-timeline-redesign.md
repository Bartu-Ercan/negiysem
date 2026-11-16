# Görev 006: Calm Horizon & Fluid Timeline Yeniden Tasarımı

## 1. Amaç
Kullanıcı geri bildirimi doğrultusunda; sayfadaki 2 sütunlu metin kalabalığını ve duvar gibi duran 5 büyük kartı kaldırıp, tek odaklı (`max-w-3xl`), yüksek kaliteli, akıcı animasyonlu bir **"Gün Zaman Çizelgesi Rayı" (Fluid Timeline Scrubber)** ve 5 kompakt tek bakışta anlaşılır (glanceable) giyim kapsülü kurmak.

---

## 2. Dokunulacak Dosyalar
- `components/CalmHero.tsx`
- `components/FluidTimelineScrubber.tsx`
- `components/GlanceableCards.tsx`
- `components/WeatherView.tsx`
- `app/page.tsx`

---

## 3. Dokunulmayacak Dosyalar
- `lib/engine/*`
- `lib/weather/*`
- `types/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **Tek Odaklı Dingin Düzen (Single Focused Column):**
   - Sayfa rekabet eden 2 kolonlu yapıdan çıkıp merkezlenmiş (`max-w-3xl`), nefes alan sakin bir editoryal kompozisyona oturmalıdır.
2. **İnteraktif Akıcı Zaman Çizelgesi (Timeline Scrubber):**
   - Sabah (08:00), Öğle (12:00), İkindi (15:00), Akşam (18:00), Gece (22:00) saatlerini içeren yatay animasyonlu ray kurulmalıdır.
   - Her saat diliminde derece, giysi katmanı (Kazak/Tişört/Ceket) ve yağış/rüzgâr ikonu görünmelidir.
   - Tıklanan saate göre aktif seçim göstergesi yumuşak bir yay/geçiş animasyonuyla (`cubic-bezier(0.16, 1, 0.3, 1)`) kaymalıdır.
   - Seçilen saatteki yağış miktarına göre arka plandaki `RainCanvas` animasyonu anında güncellenmelidir (örn. 15:00 seçilirse sağanak yağmur başlar, 12:00 seçilirse durur).
3. **Kompakt Görsel Kapsüller (Glanceable Cards):**
   - Uzun paragraf metinleri yerine tek satırlık ana karar ve net durum rozetlerinden oluşan 5 minimalist kart kapsülü yer almalıdır.
4. **Mobil (390px) ve Masaüstü (1440px) Uyumu:**
   - 390px mobilde sıfır yatay kayma ile tüm ekran tek bakışta kavranabilir olmalıdır.
5. **Tarayıcı Doğrulaması:**
   - Headless `playwright-cli` ile test edilip ekran görüntüleri kaydedilmelidir.

---

## 5. Zorunlu Skill'ler
- Antigravity: `design-taste-frontend`, `interface-design`, `better-typography`, `better-layout`, `design-motion-principles`, `playwright-cli`.
