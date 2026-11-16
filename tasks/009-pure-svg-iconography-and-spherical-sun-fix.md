# Görev 009: Saf SVG İkonografi ve Mükemmel Dairesel Güneş/Ay Geometrisi

- **Atanan:** Antigravity (UI, Animasyon, Tasarım & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 008 (Özel Zanaat UI İyileştirmeleri, Scrubber Barı ve Atmosfer Cilası)

---

## 1. Kullanıcı Geri Bildirimi ve Hedefler
Kullanıcı geri bildirimi ve görsel kanıt:
> *"tamam guzel emojı kullanmanı ıstemıyorum emojılerı kaldır gereksız ıcon demıyorum hazır emojılerden bashedıyorum yagıs emojısı vesaıre kaldır bırde attıgım ss e bak gunes ay fln arka planda wide bıraz hata sanırım o onu duzelt normal yuvarlak olsunlar suan arka planda widelık var"*

### Hedefler:
1. **Tuval En-Boy Oranı Düzeltmesi (Spherical Aspect Ratio Fix):**
   - Kullanıcının ilettiği ekran görüntüsünde güneş ve ışık huzmeleri yatay olarak basık/oval (wide) görünmektedir.
   - Kök neden: `fixed inset-0` tuvalin tampon boyutunun `canvas.parentElement?.clientHeight` (sayfa dikey içeriği 1200-1400px) üzerinden hesaplanıp, tarayıcı ekran yüksekliğine (900px) sıkıştırılması ve `ctx.scale` kümülatif katlanması.
   - Çözüm: Görünüm alanı (viewport) en-boy oranını `window.innerWidth` ve `window.innerHeight` ile 1:1 sabitlemek, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` ile matris sıfırlaması yapmak; güneş ve ayın matematiksel olarak kusursuz birer daire (`arc(..., Math.PI * 2)`) olarak render edilmesini garanti etmek.
2. **Tüm Hazır Sistem Emojilerinin Kaldırılması (Zero Emojis, Pure Bespoke SVG):**
   - Başlık alanındaki hava durumu simgesi (`☀️`, `🌤️`, `🌧️` vb.) yerine özel tasarım büyük SVG hava durumu glifleri (`HeroWeatherIcon`) getirilmesi.
   - Rüzgâr ve yağış bilgi çiplerindeki emojilerin (`💨`, `🌧️`) yerine saf vektörel SVG simgeleri (rüzgar vektörü ve damla glifi) entegre edilmesi.
   - Üst bardaki ve çekmecedeki ayar simgesinin (`⚙️`, `✕`) yerine minimalist SVG ikonlar yerleştirilmesi.

---

## 2. Zorunlu Skill'ler
- `better-interface`: Saf SVG ikonografi, sıfır emoji kuralı ve tutarlı tasarım sistemi.
- `animate`: Tuval matris ve en-boy oranı geometrisi (DPR ve viewport normalizasyonu).
- `better-colors`: Özel SVG ikonlarında renk uyumu ve atmosferik kontrast.
- `playwright-cli`: Headless tarayıcıda güneşin 1:1 dairesel geometrisinin, SVG ikonların ve görsel çıktının doğrulanması.

---

## 3. Kabul Kriterleri
1. Projenin aktif arayüzünde hiçbir hazır Unicode sistem emojisi kalmamış olması; tüm simgelerin özel SVG vektörleriyle sunulması.
2. Tuvaldeki güneş ve ayın hiçbir çözünürlük veya pencere boyutunda yatay olarak basık/oval (wide) olmaması; 1:1 dairesel geometriye sahip olması.
3. Mobil (390px) ve Masaüstü (1440px) ekranlarda sıfır yatay taşma (`scrollWidth <= innerWidth`).
