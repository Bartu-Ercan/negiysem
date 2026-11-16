# Görev 011: 7 Günlük Gardırop Planı ve Haftalık Karar Projeksiyonu

- **Atanan:** Antigravity (UI, Mimari, Animasyon & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 010 (Çoklu Lokasyon ve Mikro-İklimler)

---

## 1. Amaç ve Kapsam
Open-Meteo'dan gelen 168 saatlik (7 günlük) veriyi kullanarak kullanıcıya tüm haftanın gardırop kararlarını sunan interaktif haftalık planlayıcı:
1. `components/WeeklyWardrobePlan.tsx`: 7 günü yatay veya ızgara olarak gösteren zarif kartlar.
   - Gün adı (Bugün, Salı, Çarşamba...), tarih, sıcaklık aralığı ($T_{\min} \dots T_{\max}$).
   - SVG hava durumu glifi ve yağış göstergesi.
   - Haftalık kıyafet özeti (örn: *"Çarşamba sağanak var, botlarını hazırla"*, *"Cuma güneşli, tişört günü"*).
2. Tıklanan güne göre ana 24 saatlik zaman rayının (`ContinuousTimeline`) ve canlı atmosfer sahnesinin (`AtmosphereCanvas`) o güne geçiş yapması.

---

## 2. Zorunlu Skill'ler
- `better-interface`: Gün seçimi, sekme yönetimi, odak ve erişilebilirlik.
- `better-colors`: Atelier Utilitarian token sistemi.
- `animate`: Günler arası geçiş akıcılığı.
- `playwright-cli`: Headless tarayıcıda gün değiştirme doğrulaması.

---

## 3. Kabul Kriterleri
1. 7 günün tamamının doğru tarih, sıcaklık ve karar özetiyle listelenmesi.
2. Herhangi bir güne tıklandığında üstteki 24h scrubber ve atmosfer tuvalinin o günün verilerine göre reaktif güncellenmesi.
