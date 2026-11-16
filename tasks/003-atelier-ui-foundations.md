# Görev 003: Atelier Utilitarian UI İskeleti ve Karar Kartları

## 1. Amaç
`FullDecisionResult` çıktısını ekranda Atelier Utilitarian tasarım diliyle görselleştirmek; `DecisionHero`, `LayerTimelineGauge`, `DecisionCardStack` bileşenlerini oluşturmak ve ana sayfayı (`app/page.tsx`) mobil (390px) ile masaüstü (1440px) ekranlarında tam uyumlu hale getirmek.

---

## 2. Dokunulacak Dosyalar
- `components/DecisionHero.tsx`
- `components/LayerTimelineGauge.tsx`
- `components/DecisionCardStack.tsx`
- `components/DecisionCard.tsx`
- `app/page.tsx`
- `app/globals.css`

---

## 3. Dokunulmayacak Dosyalar
- `lib/engine/*`
- `docs/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)
- `handoff/*`
- `reviews/*`

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **Mobil Görünüm (390px):**
   - Yatay kaydırma çubuğu (`overflow-x`) kesinlikle çıkmamalıdır.
   - İlk ekran yüksekliğinde `DecisionHero` ve `LayerTimelineGauge` dikey kaydırma gerektirmeden odak noktasında yer almalıdır.
2. **Masaüstü Görünüm (1440px):**
   - İki sütunlu asimetrik editoryal ızgara kurulmalıdır (Sol: Başlık ve zaman cetveli; Sağ: Karar kartları destesi).
3. **Tipografi ve Renk Doğrulaması:**
   - Başlıklar `font-display` (`Space Grotesk`), veriler ve gövde metinleri `font-sans` (`Inter`) sınıflarını kullanmalıdır.
   - Sayısal ve saat verilerinde `tabular-nums` uygulanmalıdır.
   - Bileşenlerde hiçbir inline veya ham hex kodu bulunmamalı; `bg-app`, `bg-surface`, `border-hairline`, `accent-amber`, `status-cobalt`, `status-emerald` semantik sınıfları kullanılmalıdır.
4. **WCAG Kontrast:**
   - Tüm metin-arka plan ikilileri minimum 4.5:1 kontrast oranını sağlamalıdır.

---

## 5. Zorunlu Skill'ler
- Antigravity / UI Review: `better-typography`, `better-colors`, `better-layout`, `better-interface`, `playwright-cli` (headless görsel doğrulama için).

---

## 6. Kapsam Dışı
- Dinamik Canvas yağmur damlası animasyonu (sonraki görevde eklenecektir)
- Kişisel ayar çekmecesi (drawer)
- Supabase entegrasyonu
