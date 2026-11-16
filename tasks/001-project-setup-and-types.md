# Görev 001: Next.js Proje Kurulumu ve Tip Tanımları

## 1. Amaç
Next.js (App Router, TypeScript, Tailwind CSS) projesini kurmak; `docs/SPEC.md` belgesindeki veri modellerini ve sözleşmelerini (`types/weather.ts`, `types/decision.ts`) tanımlamak; Tailwind konfigürasyonunu Atelier Utilitarian semantik token'ları ve Google Fonts font tanımları ile hazırlamak.

---

## 2. Dokunulacak Dosyalar
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts` (veya `tailwind.config.js`)
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `types/weather.ts`
- `types/decision.ts`

---

## 3. Dokunulmayacak Dosyalar
- `docs/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)
- `handoff/*` (görev bitiminde oluşturulacak `handoff/001-project-setup-and-types.md` hariç)
- `reviews/*`

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **Derleme Başarısı:** `npm run build` komutu sıfır hata ve sıfır TypeScript uyarısıyla tamamlanmalı.
2. **Tip Bütünlüğü:**
   - `types/weather.ts` içinde `HourlyDataPoint`, `DayTimeline` arayüzleri SPEC.md Madde 5.1 ile birebir örtüşmeli.
   - `types/decision.ts` içinde `DecisionSeverity`, `DecisionItem`, `FullDecisionResult`, `UserPreferences` arayüzleri SPEC.md Madde 5.2 ile birebir örtüşmeli.
3. **Tailwind Token Kurulumu:** `tailwind.config.ts` içinde Atelier Utilitarian renkleri semantik olarak tanımlanmalı:
   - `colors.bg.app`: `#121316` (koyu zemin)
   - `colors.bg.surface`: `#181A1F`
   - `colors.bg.surfaceHover`: `#20232A`
   - `colors.border.hairline`: `#272A33`
   - `colors.accent.amber`: `#D97706`
   - `colors.status.cobalt`: `#2563EB`
   - `colors.status.emerald`: `#059669`
   - `colors.status.rose`: `#E11D48`
   - Font aileleri: `fontFamily.display: ['Space Grotesk', 'sans-serif']`, `fontFamily.sans: ['Inter', 'sans-serif']`.
4. **Temel Görünüm:** `app/page.tsx` sayfası açıldığında koyu zemin rengi (`#121316`) ve "NEGIYSEM" başlığı hatasız yüklenmeli.

---

## 5. Zorunlu Skill'ler
- Codex için: Görev dosyasında özel bir ek skill şartı yoktur; temiz TS/Next.js kurulum standartları esastır.

---

## 6. Kapsam Dışı
- Open-Meteo API çağrıları
- Karar motoru mantığı ve hesaplamalar
- Yağmur canvas animasyonu
