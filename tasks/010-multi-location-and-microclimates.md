# Görev 010: Çoklu Lokasyon, İstanbul Mikro-İklimleri ve GPS Konum Desteği

- **Atanan:** Antigravity (UI, Mimari, Tasarım & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 009 (Saf SVG İkonografi ve Dairesel Güneş)

---

## 1. Amaç ve Kapsam
SPEC 1.1 ve 2.0 ilkeleri doğrultusunda, İstanbul'un homojen olmayan mikro-iklimini (Boğaz poyrazı, Kadıköy lodosu, Sarıyer Karadeniz yağışları, Beylikdüzü yüksekliği) ve diğer büyük şehirleri destekleyen çoklu konum motoru inşa edilecektir:
1. `lib/weather/locations.ts`: Önceden tanımlı İstanbul ilçe/mikro-iklim noktaları ve ana şehirlerin koordinatları, mikro-iklim özellikleri.
2. `components/LocationSelector.tsx`: Arama yapılabilen, popüler semtleri hızlı seçtiren ve HTML5 GPS konumuyla en yakın noktayı bulan şık konum seçim çekmecesi/modalı.
3. `WeatherView.tsx` entegrasyonu: Seçilen konuma göre Open-Meteo'dan anında canlı telemetri çekilmesi, tüm kararların ve gökyüzü tuvalinin yeni konuma uyarlanması, son seçilen konumun `localStorage`'da saklanması.

---

## 2. Zorunlu Skill'ler
- `better-interface`: Hızlı arama, erişilebilir modal/dropdown, klavye yönetimi.
- `better-colors`: Atelier Utilitarian token sistemi.
- `playwright-cli`: Headless tarayıcıda konum değiştirme ve telemetri güncelleme testleri.

---

## 3. Kabul Kriterleri
1. En az 7 farklı İstanbul mikro-iklimi (Beşiktaş, Kadıköy, Sarıyer, Maslak, Bakırköy, Üsküdar, Beylikdüzü) ve büyük şehirlerin tanımlı olması.
2. Konum değiştirildiğinde sayfa yenilenmeden canlı verinin çekilmesi, başlık ve gökyüzü sahnesinin yeni konuma geçmesi.
3. Seçilen konumun `localStorage` ('negiysem_user_location') üzerinde kalıcı olması.
