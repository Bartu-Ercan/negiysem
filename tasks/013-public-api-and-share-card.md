# Görev 013: Genel Karar API Endpoint'i ve Sosyal Paylaşım Entegrasyonu

- **Atanan:** Antigravity (API, Entegrasyon & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 012 (Adaptif Öğrenme Geri Bildirim Döngüsü)

---

## 1. Amaç ve Kapsam
1. `app/api/decision/route.ts`:
   - Dış servisler, Siri kısayolları ve Raycast için genel JSON API.
   - Parametreler: `lat`, `lon`, `sensitivity`, `shoePreference`, `sweatTendency`.
   - Çıktı: `FullDecisionResult` (heroSummary, items, timeline).
2. Paylaşım Butonu (`components/ShareDecisionButton.tsx`):
   - "Günün Kararını Paylaş" butonu; panoya temiz biçimlendirilmiş karar metni kopyalar veya mobil cihazlarda `navigator.share` çağırır.
3. PWA ve SEO Meta etiketleri (`app/manifest.ts` ve `app/layout.tsx`).

---

## 2. Zorunlu Skill'ler
- `better-interface`: Paylaşım butonu, panoya kopyalama geri bildirimi.
- `playwright-cli`: API yanıt doğrulaması ve UI paylaşım butonu testi.

---

## 3. Kabul Kriterleri
1. `GET /api/decision?lat=41.04&lon=29.00` çağrısının 200 OK ve geçerli JSON döndürmesi.
2. Paylaşım butonunun doğru metinle panoya kopyalama yapması.
