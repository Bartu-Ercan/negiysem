# Görev 012: Adaptif Öğrenme Geri Bildirim Döngüsü ("Üşüdüm / Tam / Terledim")

- **Atanan:** Antigravity (UI, Karar Entegrasyonu & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 011 (7 Günlük Gardırop Planı)

---

## 1. Amaç ve Kapsam
SPEC Faz 2 ilkeleri doğrultusunda, deterministik karar motorunu kullanıcıya özel kalibre eden geri bildirim widget'ı:
1. `components/AdaptiveFeedbackWidget.tsx`:
   - "Bugünkü tavsiye senin için nasıldı?" başlığı altında 3 dokunsal buton:
     - `Üşüdüm (-1°C)`: Hissedilen sıcaklık ofsetini azaltarak daha kalın katman tavsiye eder.
     - `Tam Oldu`: Mevcut hassasiyeti doğrular ve pekiştirir.
     - `Terledim (+1°C)`: Hissedilen sıcaklık ofsetini artırarak daha hafif katman tavsiye eder.
2. `hooks/usePreferences.ts` ile doğrudan bağlı, `localStorage`'da kalıcı, reaktif ve geri bildirim logu tutan yapı.
3. Tıklama sonrası zarif onay rozeti ve anlık karar güncellemesi.

---

## 2. Zorunlu Skill'ler
- `better-interface`: Dokunsal butonlar, geri bildirim durumu, erişilebilirlik.
- `emil-design-eng`: Buton basış geri bildirimi ve mikro geçişler.
- `playwright-cli`: Headless tarayıcıda geri bildirim tıklama ve ofset kalibrasyon testi.

---

## 3. Kabul Kriterleri
1. "Üşüdüm" veya "Terledim" seçildiğinde `temperatureSensitivity` değerinin $\pm 1^\circ\text{C}$ adapte olması.
2. Karar motorunun anında yeni ofsetle kararları güncellemesi.
3. Durumun `localStorage`'da kalıcı olması.
