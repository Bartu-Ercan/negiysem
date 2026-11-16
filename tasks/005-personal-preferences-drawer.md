# Görev 005: Kişisel Tercihler Çekmecesi ve Yerel Kayıt

## 1. Amaç
Kullanıcının soğuk/sıcak hassasiyetini (`temperatureSensitivity`), süet ayakkabı koruma tercihini (`shoePreference`) ve terleme eğilimini (`sweatTendency`) yönetebileceği; ayarları `localStorage` üzerinde saklayan ve tercihler değiştikçe kararları anında yeniden hesaplayan erişilebilir bir ayar çekmecesi (`components/PreferencesDrawer.tsx`) geliştirmek.

---

## 2. Dokunulacak Dosyalar
- `components/PreferencesDrawer.tsx`
- `components/WeatherView.tsx`
- `hooks/usePreferences.ts`

---

## 3. Dokunulmayacak Dosyalar
- `lib/engine/*`
- `lib/weather/*`
- `docs/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)
- `handoff/*`
- `reviews/*`

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **Yerel Depolama (Persistence):**
   - Ayarlar `localStorage` ('negiysem_user_preferences') anahtarında saklanmalı; sayfa yenilendiğinde kullanıcı tercihleri hatırlanmalıdır.
   - İlk açılışta varsayılan değerler (`temperatureSensitivity: 0`, `shoePreference: 'default'`, `sweatTendency: 'normal'`) yüklenmelidir.
2. **Anlık Yeniden Hesaplama:**
   - Kullanıcı hassasiyet sürgüsünü (örneğin -2 "Çabuk Üşürüm") değiştirdiğinde veya "Süet Hassas" seçtiğinde, `calculateDecisions` anında yeni tercihlerle çalışmalı ve ekrandaki karar kartları reaktif olarak güncellenmelidir.
3. **Erişilebilirlik ve Odak Yönetimi:**
   - Çekmece klavyeyle (ESC tuşu ile kapatma, Tab ile gezinme) tamamen kontrol edilebilmelidir.
   - Sürgü ve radyo butonları net erişilebilir etiketlere (`aria-label`) ve görünür odak çerçevelerine (`focus-visible`) sahip olmalıdır.
4. **Tarayıcı Doğrulaması:**
   - Headless tarayıcıda çekmecenin açıldığı, ayarın değiştirildiği ve yerel depolamaya yazıldığı test edilmelidir.

---

## 5. Zorunlu Skill'ler
- Antigravity / UI: `better-interface`, `better-colors`, `a11y-debugging`, `playwright-cli`.

---

## 6. Kapsam Dışı
- Faz 2 Supabase auth entegrasyonu (bulut kaydı sonraki fazda eklenecektir).
