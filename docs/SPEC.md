# Negiysem — Ürün ve Mimari Spesifikasyonu (SPEC)

> **Durum:** Onaylandı (Geliştirmeye Hazır)  
> **Seçilen Tasarım Yönü:** Yön 1 — Atelier Utilitarian  
> **Rol Dağılımı:** Antigravity (Planlama, SPEC, UI/Animasyon, Tasarım, Review) | Codex (Karar Motoru, API, Backend, Test)

---

## 1. Ürün Vizyonu ve Hedef

Negiysem bir "hava durumu uygulaması" değildir. Derece gösterip yorumu kullanıcıya bırakan klasik araçların aksine; **doğrudan giyim, konfor ve hareket kararı veren deterministik bir karar motorudur**.

### Temel İlke
- **Çıktı derece değil, eylemdir:**
  - *"Kısa kol: Evet (12:00–15:00 arası ideal)."*
  - *"Ceket: Akşam lazım (18:00 sonrası poyrazla hissedilen 11°C)."*
  - *"Spor ayakkabı: Olur, 15:00'ten sonra ıslanır (süet giyme)."*
  - *"Mont: Terlersin (toplu taşımada ve kapalı alanda fazla gelir)."*
- **Ana Senaryo:** İstanbul'un öngörülemez, değişken ve rüzgârlı mikro-iklimi (Boğaz poyrazı, ani sağanak geçişleri, metro ile dışarısı arasındaki 10°C+ fark).
- **Hedef:** Kullanıcının her sabah evden çıkmadan önce 5 saniyede baktığı ve sunduğu net fayda için para vermek isteyeceği bir referans araç.

---

## 2. Mimari ve Teknoloji Yığını

- **Frontend:** Next.js (App Router, TypeScript, React 19).
- **Stil & Token Sistemi:** Tailwind CSS (Atelier Utilitarian token seti).
- **Hava Durumu Veri Sağlayıcı:** Open-Meteo API (Anahtarsız, saatlik ve 15 dakikalık telemetri: sıcaklık, hissedilen sıcaklık, yağış mm/h, yağış olasılığı %, rüzgâr hızı km/s, rüzgâr yönü, bağıl nem).
- **Animasyon & Hareket:** CSS Keyframes / Web Animations API / Canvas (60fps, GPU hızlandırmalı, rüzgâr açısına ve yağış yoğunluğuna göre dinamik yağmur simülasyonu).
- **Kişisel Ayarlar (MVP):** Tarayıcı yerel depolaması (`localStorage`): Sıcak/soğuk hassasiyet çarpanı, ayakkabı hassasiyet tercihi.
- **Faz 2 Genişlemesi:** Supabase (Auth + PostgreSQL), kullanıcıya özel adaptif deterministik ofset motoru ("Üşüdüm/Terledim/Tam"), anlık bildirimler, çoklu lokasyon ve haftalık gardırop planı.

---

## 3. Karar Motoru Kuralları ve Eşik Tablosu

Karar motoru makine öğrenmesi veya belirsiz tahminler içermez; **tamamen deterministik, saf fonksiyonlardan (`pure functions`) oluşur ve test edilebilir.**
Tüm eşikler kayan noktalı sayılar (float) için boşluksuz, sol kapalı ve sağ açık aralıklar $[min, max)$ olarak tanımlanmıştır.

### 3.1. Hissedilen Sıcaklık ($T_{\text{feel}}$) ve Katman Eşikleri

Kullanıcının seçtiği kişisel hassasiyete ve rüzgâr ofsetine göre efektif hissedilen sıcaklık hesaplanır:
$$T_{\text{eff}} = T_{\text{feel}} + Ofset_{\text{wind}} + temperatureSensitivity$$

| Efektif Sıcaklık Aralığı ($T_{\text{eff}}$) | Üst Giyim Kararı | Dış Giyim Kararı | Terleme Riski ("Terler miyim?") |
|:---|:---|:---|:---|
| **$[27.0^\circ\text{C}, +\infty)$** | Askılı / İnce Kısa Kol / Keten | Gerek yok | **Yüksek:** Açık alanda dahi terletir, açık renk ve nefes alan kumaş seç. |
| **$[22.0^\circ\text{C}, 27.0^\circ\text{C})$** | Kısa Kol Tişört / Hafif Gömlek | Gerek yok (Gece için ince gömlek/hırka opsiyonel) | **Orta:** Hızlı tempoda veya metroda hafif terleme. |
| **$[17.0^\circ\text{C}, 22.0^\circ\text{C})$** | Kısa Kol veya İnce Uzun Kol | Yanına al: Hafif ceket, hırka veya rüzgârlık (18:00 sonrası şart) | **Düşük (Dışarıda) / Yüksek (Mont giyilirse):** Kalın giyinirsen toplu taşımada pişersin. Katmanlı çık. |
| **$[12.0^\circ\text{C}, 17.0^\circ\text{C})$** | Uzun Kol Tişört / Hafif Sweatshirt | Şart: Denim ceket, bomber, trençkot veya hafif mevsimlik ceket | **Tuzak Sıcaklık:** Kalın kışlık mont giyersen metro/ofiste terlersin; mont yerine tişört + ceket katmanı yap. |
| **$[7.0^\circ\text{C}, 12.0^\circ\text{C})$** | Kalın Sweatshirt / Yün Kazak | Şart: Kışlık ceket / Hafif dolgulu mont | **Düşük:** Dışarıda üşütür, tempolu yürüyüş hariç terletmez. |
| **$(-\infty, 7.0^\circ\text{C})$** | Termal İçlik + Kalın Kazak | Şart: Kışlık kalın mont / Kaban / Parka | **Yok:** Soğuk havada terleme riski minimum. |

---

### 3.2. Yağış Şiddeti ($P_{\text{mm}}$ mm/h), Olasılık ($P_{\%}$) ve Ayakkabı / Şemsiye Eşikleri

Her zaman aralığı için anlık yağış miktarı ($P_{\text{mm}}$) ve günün maksimum yağış olasılığı ($P_{\max\%}$) şu kesin aralıklarla değerlendirilir:

| Yağış Miktarı ($P_{\text{mm}}$) ve Olasılık ($P_{\%}$) | Şemsiye Kararı | Ayakkabı Kararı ve Zemin Durumu |
|:---|:---|:---|
| **$P_{\text{mm}} < 0.1 \text{ mm/h}$ VE $P_{\%} < 20\%$** | **Gerek Yok** | **Serbest:** Bez ayakkabı, süet veya açık sneaker tamamen güvenli. |
| **$P_{\text{mm}} < 0.1 \text{ mm/h}$ VE $20\% \le P_{\%} < 50\%$** | **İsteğe Bağlı:** Düşük yağmur olasılığı var. | **Güvenli:** Kumaş / açık renk sneaker giyilebilir. |
| **$P_{\text{mm}} < 0.1 \text{ mm/h}$ VE $P_{\%} \ge 50\%$** | **Çantaya At:** Gün içinde yağmur geçişi bekleniyor. | **Dikkat:** Süet veya beyaz kumaş sneaker tavsiye edilmez, koyu sneaker tercih et. |
| **$0.1 \text{ mm/h} \le P_{\text{mm}} < 1.5 \text{ mm/h}$ (Çisenti)** | **Yanına Al:** Hafif yağmur var; kapüşonlu ceket de kurtarabilir. | **Nemli Zemin:** Deri veya suya dayanıklı sneaker. Süet giyme. |
| **$1.5 \text{ mm/h} \le P_{\text{mm}} < 5.0 \text{ mm/h}$ (Sağanak)** | **Kesinlikle Al:** Kompakt katlanır şemsiye şart. | **Islak Zemin / Su Birikintisi:** Su geçirmez sneaker veya deri ayakkabı. Bez anında su çeker. |
| **$P_{\text{mm}} \ge 5.0 \text{ mm/h}$ (Şiddetli Sağanak)** | **Fırtına Tipi Şemsiye / Yağmurluk:** Rüzgârda tellere dikkat. | **Su Geçirmez Bot / Outdoor:** Derin su birikintileri oluşur, kalın taban şart. |

---

### 3.3. Rüzgâr Şiddeti ($W_{\text{km/h}}$) ve Boğaz Faktörü

| Rüzgâr Hızı ($W$) | Sıcaklık Ofseti ($Ofset_{\text{wind}}$) | Etki ve Karar Modifikasyonu |
|:---|:---|:---|
| **$W < 15.0 \text{ km/s}$** | $0^\circ\text{C}$ | Sakin hava; $T_{\text{eff}}$ üzerinde ek negatif etkisi yok. |
| **$15.0 \text{ km/s} \le W < 30.0 \text{ km/s}$** | $-2.0^\circ\text{C}$ | Hissedilen sıcaklığı $2^\circ\text{C}$ düşürür. Rüzgâr geçirmeyen dış katman önerilir. |
| **$W \ge 30.0 \text{ km/s}$ (Sert Poyraz/Lodos)** | $-4.0^\circ\text{C}$ | Hissedilen sıcaklığı $4^\circ\text{C}$ düşürür. Şemsiye telleri bükülebilir; kapüşonlu rüzgârlık/yağmurluk önceliklendirilir. |

---

### 3.4. Günün Zaman Çizelgesi ve Günlük Karar İndirgemesi (Rollup Mantığı)

Motor, saf fonksiyon determinizmini garanti altına almak için imzasında opsiyonel bir referans zamanı kabul eder:
```typescript
calculateDecisions(
  hourly: HourlyDataPoint[],
  preferences?: UserPreferences,
  referenceDate?: Date | string
): FullDecisionResult
```

#### A. Zaman Tabanı ve Kapsam Kuralları:
1. **Referans Zamanı:** `refTime = referenceDate ? new Date(referenceDate) : new Date(hourly[0].time)`.
2. **Hedef Gün:** `refTime`'ın yerel takvim günü (YYYY-MM-DD). `hourly` dizisinden bu güne ait veri noktaları filtrelenir. Eğer güne ait hiç veri yoksa `Error("Hedef güne ait telemetri verisi bulunamadı")` fırlatılır.
3. **Günün Kalan Saatleri:** `point.time >= refTime.toISOString()` olan saatler filtrelenir. Eğer gün sonuna gelindiyse (kalan saat yoksa), günün son veri noktası tek elemanlı dizi olarak kullanılır.
4. **4 Dilimli Zaman Çizelgesi (`timeline`) Fallback Kuralı:**
   - **`morning` (Sabah):** `08:00` $\to$ yoksa `07:00–09:00` aralığı $\to$ yoksa o günün ilk verisi.
   - **`noon` (Öğle):** `13:00` $\to$ yoksa `12:00–14:00` aralığı $\to$ yoksa o günün 12:00'ye en yakın verisi.
   - **`evening` (Akşam):** `18:00` $\to$ yoksa `17:00–19:00` aralığı $\to$ yoksa o günün 18:00'e en yakın verisi.
   - **`night` (Gece):** `22:00` $\to$ yoksa `21:00–23:00` aralığı $\to$ yoksa o günün son verisi.

#### B. Günlük Karar Özeti (`items` ve `heroSummary`) İndirgeme Kuralı:
Uygulama, sabah evden çıkan kullanıcının tüm gününü garanti altına alan **koruyucu (en kritik ihtiyacı öne çıkaran)** birleştirme kuralı işletir:
1. **Dış Giyim İndirgemesi:** Günün kalan saatlerindeki minimum $T_{\text{eff}}$ değeri esas alınır. Eğer gündüz $T \ge 22.0^\circ\text{C}$ ama akşam $T < 17.0^\circ\text{C}$ oluyorsa:
   - Dış Giyim: *"Hafif Ceket / Hırka (Akşam Şart)"*
   - Üst Giyim: *"Kısa Kol Tişört (Öğlen rahat, akşama katman yap)"*
2. **Ayakkabı ve Şemsiye İndirgemesi:** Günün kalan saatlerindeki maksimum yağış şiddeti ($P_{\max}$) ve maksimum olasılık ($P_{\max\%}$) esas alınır. Örneğin sabah yağış yokken 15:00'te $4.2 \text{ mm/h}$ yağış varsa:
   - Şemsiye: *"Kesinlikle Al (15:00'te sağanak var)"*
   - Ayakkabı: *"Su Geçirmez Sneaker / Deri (15:00 sonrası zemin ıslak)"*
3. **Hero Cümlesi (`heroSummary`):** Günün en kritik 2 olayını tek cümlede birleştirir (örn: Ceket ihtiyacı ve yağış saati).

---

### 3.5. Kullanıcı Tercihleri (`UserPreferences`) Etki Kuralları

- **`temperatureSensitivity` ($-2, -1, 0, +1, +2$):** Doğrudan $T_{\text{eff}}$ formülüne eklenir:
  $$T_{\text{eff}} = T_{\text{feel}} + Ofset_{\text{wind}} + temperatureSensitivity$$
  *(Negatif değer üşüyen kullanıcı içindir; sıcaklığı daha düşük algılatıp kalın giydirir).*
- **`shoePreference: 'suede_sensitive'`:**
  - Yağış olasılığı eşiği $\%50$'den $\%30$'a düşer. Günün kalanında $P_{\%} \ge 30\%$ olduğunda ayakkabı için *"Süet Giyme"* uyarısı üretilir ve severity `caution` olur.
  - Yağış miktarı eşiği $0.1 \text{ mm/h}$ yerine $0.05 \text{ mm/h}$ olarak kabul edilir ($P \ge 0.05 \text{ mm/h}$ olduğunda severity `caution` olur).
- **`sweatTendency: 'sweats_easily'`:**
  - Terleme riski sıcaklık eşiği $3.0^\circ\text{C}$ aşağı kaydırılır (normalde $22.0^\circ\text{C}$'de başlayan uyarı $19.0^\circ\text{C}$'de başlar).
  - Katman tavsiyesine *"Mont giyme, içine ince pamuklu seç"* notu eklenir.

---

### 3.6. Önem Derecesi (`DecisionSeverity`) Eşleme Matrisi

Her karar kartı için `severity` alanı şu deterministik matrise göre atanır:

| Kategori | `safe` (Yeşil / Adaçayı) | `caution` (Sarı / Kehribar) | `warning` (Mavi / Kobalt) | `alert` (Kırmızı / Gül) |
|:---|:---|:---|:---|:---|
| **`top`** | $T_{\text{eff}} \ge 22.0^\circ\text{C}$ | $17.0^\circ\text{C} \le T_{\text{eff}} < 22.0^\circ\text{C}$ | $7.0^\circ\text{C} \le T_{\text{eff}} < 17.0^\circ\text{C}$ | $T_{\text{eff}} < 7.0^\circ\text{C}$ |
| **`outerwear`**| Gerek yok ($T_{\text{eff}} \ge 22.0^\circ\text{C}$) | Akşam için yanına al ($17.0^\circ\text{C} \le T < 22.0^\circ\text{C}$) | Şart: Ceket/Trençkot ($12.0^\circ\text{C} \le T < 17.0^\circ\text{C}$) | Kalın Mont/Kaban ($T < 12.0^\circ\text{C}$) |
| **`footwear`** | **Standart:** $P < 0.1 \text{ mm/h}$ ve $P_{\%} < 50\%$<br>**Süet Hassas:** $P < 0.05 \text{ mm/h}$ ve $P_{\%} < 30\%$ | **Standart:** $P_{\%} \ge 50\%$ veya $0.1 \le P < 1.5$<br>**Süet Hassas:** $P_{\%} \ge 30\%$ veya $0.05 \le P < 1.5$ | Su geçirmez ayakkabı ($1.5 \le P < 5.0 \text{ mm/h}$) | Su geçirmez bot / çizme ($P \ge 5.0 \text{ mm/h}$) |
| **`umbrella`** | $P_{\%} < 50\%$ ve $P < 0.1 \text{ mm/h}$ | Çantaya at ($P_{\%} \ge 50\%$ veya $0.1 \le P < 1.5 \text{ mm/h}$) | Kesinlikle al ($1.5 \le P < 5.0 \text{ mm/h}$) | Fırtına tipi şemsiye ($P \ge 5.0 \text{ mm/h}$ veya $W \ge 30 \text{ km/s}$) |
| **`sweat`** | Risk minimum ($T_{\text{eff}} < 22.0^\circ\text{C}$, montsuz) | Hızlı tempoda terletir ($T \ge 22.0^\circ\text{C}$ veya sweats_easily için $T \ge 19.0^\circ\text{C}$) | Tuzak sıcaklık (Serin havada mont giyilirse) | Aşırı sıcaklıkta ($T \ge 27.0^\circ\text{C}$) yoğun terleme riski |

---

## 4. Tasarım Dili (Atelier Utilitarian)

Stage B standartları (`better-typography`, `better-colors`, `better-layout`, `better-interface`) doğrultusunda belirlenen tasarım kuralları:

### 4.1. Tipografi Sistemi (`better-typography`)
- **Display & Başlık:** `Space Grotesk` (Google Fonts / Variable)
  - Manşet: `text-2xl sm:text-3xl font-bold tracking-tight leading-[1.15]` (`text-wrap: balance`).
  - Kart Başlıkları: `text-base sm:text-lg font-semibold tracking-tight leading-[1.25]`.
- **Veri & Metin:** `Inter` (Google Fonts / Variable)
  - Gövde Metinleri: `text-sm font-normal text-zinc-400 leading-relaxed` (`text-wrap: pretty`).
  - Rozet ve Üstbilgi (Overline): `text-[11px] font-semibold tracking-wider uppercase text-zinc-500`.
  - Sayısal Veriler (Sıcaklık, Rüzgâr, Saat): `tabular-nums tracking-normal font-medium text-zinc-200`.
- **Ölçü ve Ölçek:** Maksimum satır uzunluğu 65 karakter (`max-w-prose`). Mobilde inputlar minimum 16px.

### 4.2. Renk ve Token Mimarisi (`better-colors`)
Rampalar semantik rollere bağlanmıştır; bileşenlerde doğrudan ham hex kullanılmaz.

| Rol | Semantik Token | Koyu Mod Değeri | Açık Mod Değeri | Görev |
|:---|:---|:---|:---|:---|
| **Zemin** | `--bg-app` | `#101713` | `#F7F7F8` | Tüm uygulamanın arka planı |
| **Yüzey (Kart)** | `--bg-surface` | `#18211D` | `#FFFFFF` | Karar ve çizelge kartları |
| **Yüzey Hover** | `--bg-surface-hover` | `#243025` | `#F0F1F3` | İnteraktif kart/buton hover |
| **Sınır Çizgisi** | `--border-hairline` | `#314034` | `#E4E4E7` | 1px teknik ayırıcılar |
| **Vurgu (Isı/Dikkat)** | `--accent-amber` | `#D97706` / `#F59E0B` | `#D97706` | Katman uyarısı, rüzgâr ikazı |
| **Yağış (Kobalt)** | `--status-cobalt` | `#2563EB` / `#3B82F6` | `#2563EB` | Sağanak ve su riski |
| **Konfor (Adaçayı)** | `--status-emerald` | `#059669` / `#10B981` | `#059669` | Güvenli, uygun giyim durumu |
| **Aşırı Durum (Gül)** | `--status-rose` | `#E11D48` | `#BE123C` | Şiddetli fırtına / dondurucu soğuk |
| **Birincil Metin** | `--text-primary` | `#F1F2E9` | `#09090B` | Ana kararlar ve manşetler |
| **İkincil Metin** | `--text-secondary`| `#A5B1A8` | `#71717A` | Açıklama ve tavsiye detayları |

*Tüm metin ve zemin kontrastları WCAG AA (minimum 4.5:1, büyük metinlerde 3:1) gereksinimini tam karşılar.*

### 4.3. Düzen ve Boşluk Kuralları (`better-layout`)
- **Grup Hiyerarşisi:** Grup içi boşluk `8px` ise, gruplar arası boşluk en az `16px` – `24px` olmalıdır. Çizgi yerine boşlukla gruplama esastır.
- **Tek Ekran Prensibi:** 390px mobil görünümde, kullanıcı ilk ekranda ana kararı (`DecisionHero`) ve `LayerTimelineGauge`'i dikey kaydırma yapmadan görebilmelidir.
- **Masaüstü Adaptasyonu (1440px):** İki sütunlu asimetrik editoryal ızgara. Sol tarafta karar manşeti ve zaman çizelgesi sabit; sağ tarafta 4 karar kartı ve detay paneli akar.

---

## 5. Veri Modeli ve Sözleşmeler

### 5.1. Hava Durumu Modeli (`types/weather.ts`)
```typescript
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
  noon: HourlyDataPoint;    // 13:00
  evening: HourlyDataPoint; // 18:00
  night: HourlyDataPoint;   // 22:00
}
```

### 5.2. Karar Çıktı Modeli (`types/decision.ts`)
```typescript
export type DecisionSeverity = 'safe' | 'caution' | 'warning' | 'alert';

export interface DecisionItem {
  category: 'top' | 'outerwear' | 'footwear' | 'umbrella' | 'sweat';
  label: string;             // örn: "Dış Giyim"
  badge: string;             // örn: "Akşam Şart"
  verdict: string;           // örn: "Rüzgârlık veya Denim Ceket"
  description: string;       // örn: "18:00'den sonra Boğaz poyrazı hissedilen sıcaklığı 11°C'ye düşürecek."
  severity: DecisionSeverity;
}

export interface FullDecisionResult {
  heroSummary: string;       // örn: "Hafif ceketini yanına al, 15:00'ten sonra yağmur var."
  heroSubtext: string;
  items: DecisionItem[];
  timeline: DayTimeline;
}

export interface UserPreferences {
  temperatureSensitivity: -2 | -1 | 0 | 1 | 2; // °C cinsinden hissedilen sıcaklık ofseti
  shoePreference: 'default' | 'suede_sensitive'; // 'suede_sensitive' seçilirse yağış eşiği hassaslaşır
  sweatTendency: 'normal' | 'sweats_easily';     // 'sweats_easily' seçilirse katman tavsiyesi hafifler
}
```

---

## 6. Kabul Kriterleri (Doğrulama Çerçevesi)

1. Deterministik motor birim testleri: SPEC tablosundaki tüm aralıklar (sıcaklık, yağış, rüzgâr sınırları) için test yazılmış ve geçiyor olmalı.
2. Sıfır anahtar bağımlılığı: Open-Meteo veri çekimi ortam değişkeni gerektirmeden çalışabilmeli.
3. Tasarım sadakati: Atelier Utilitarian renk ve tipografi kuralları eksiksiz uygulanmalı; şablon/jenerik AI öğesi barındırmamalı.
4. Çift çözünürlük doğrulaması: Mobil (390px) ve Masaüstü (1440px) ekranlarında yatay taşma olmadan tam yanıt verebilmeli.

---

> **Kullanılan skill'ler:**
> - `better-typography`: Space Grotesk ve Inter font hiyerarşisi, line-height birimsiz oranları (1.15 - 1.5), tabular-nums kuralları belirlendi.
> - `better-colors`: OKLCH uyumlu token rolleri tanımlandı, ham hex kullanımı yasaklandı, WCAG 4.5:1 kontrast tabanı garanti edildi.
> - `better-layout`: Grup içi/dışı 2x boşluk kuralı, 390px tek ekran dikey sınırları ve 1440px iki sütunlu adaptasyon kurgulandı.
> - `better-interface`: Deterministik karar tabloları ve veri modelleri, açık ve test edilebilir sözleşmeler haline getirildi.

## 7. Tamamlanmış ürün — 1.0

Kullanıcının 16 Kasım 2026 tarihli doğrudan tamamlanma talebi, önceki görev kapsamlarını ürünün tamamlanması ve GitHub teslimi için genişletir. Karar eşikleri korunur. Görsel tema koyu orman/adaçayı yönüne güncellendi; marka ve odak metni `--color-accent-text: #D2E5A4` kullanır. Amber/cobalt/emerald/rose durum semantiği korunur. `?demo=1` yedi günlük açıkça etiketlenmiş örnek veriyi gösterir. Ürün; yüklenme, hata ve bulunamayan sayfa durumları, README, üretim komutları ve CI tarayıcı kontrolleriyle teslim edilir.
