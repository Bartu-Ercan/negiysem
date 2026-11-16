# Görev 004: Yağmur ve Rüzgâr Dinamik Canvas Animasyonu

## 1. Amaç
Havadaki yağış miktarına ($P_{\text{mm}}$ mm/h) ve rüzgâr şiddetine ($W_{\text{km/h}}$) göre damla yoğunluğunu, hızını ve eğim açısını dinamik olarak hesaplayan, 60fps/120Hz GPU hızlandırmalı, sıfır GC çöpü üreten hafif bir arka plan canvas animasyonu (`components/RainCanvas.tsx`) geliştirmek ve ana sayfaya entegre etmek.

---

## 2. Dokunulacak Dosyalar
- `components/RainCanvas.tsx`
- `app/page.tsx`

---

## 3. Dokunulmayacak Dosyalar
- `lib/engine/*`
- `types/*`
- `docs/*`
- `AGENTS.md`
- `tasks/*` (bu dosya hariç)
- `handoff/*`
- `reviews/*`

---

## 4. Kabul Kriterleri (Test Edilebilir)
1. **Dinamik Parametreler:**
   - $P_{\text{mm}} < 0.1 \text{ mm/h}$ olduğunda animasyon döngüsü durmalı veya canvas temiz kalmalıdır (gereksiz GPU/CPU harcaması yapılmaz).
   - $P_{\text{mm}} \ge 0.1 \text{ mm/h}$ olduğunda damla sayısı ve düşüş hızı yağış miktarıyla orantılı olarak artmalıdır (Çisenti: az ve ince damlalar; Sağanak: sık ve hızlı çizgiler).
   - Rüzgâr hızı ($W_{\text{km/h}}$), damlaların dikey eksenden sapma açısını (eğimini) belirlemelidir (Poyraz/Lodos yönüne göre $V_x$ bileşeni).
2. **Performans (Stage C Standartları):**
   - Sabit partikül havuzu (object pooling) kullanılmalı; `requestAnimationFrame` döngüsü içinde her karede yeni obje oluşturulmamalıdır (sıfır GC jank).
   - `prefers-reduced-motion: reduce` medya sorgusu desteklenmeli; hareket kısıtlaması olan kullanıcılarda animasyon durdurulmalıdır.
   - `pointer-events: none` ve `z-index` ile sayfa içi metin ve kartların okunabilirliği veya tıklanabilirliği kesinlikle engellenmemelidir.
3. **Atelier Utilitarian Görsel Uyumu:**
   - Damlalar çizgi film benzeri mavi su damlacıkları yerine, şık, ince ve yarı saydam teknik hız çizgileri (`rgba(96, 165, 250, 0.35)`) olarak çizilmelidir.
4. **Tarayıcı Doğrulaması:**
   - Headless tarayıcıda canvas bileşeninin hatasız mount edildiği ve render aldığı doğrulanmalıdır.

---

## 5. Zorunlu Skill'ler
- Antigravity / UI: `design-motion-principles`, `emil-design-eng`, `animate`, `animation-performance`, `playwright-cli`.

---

## 6. Kapsam Dışı
- Kişisel ayar çekmecesi (Task 005)
- Faz 2 Supabase auth entegrasyonu
