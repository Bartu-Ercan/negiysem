# Görev 007: Canlı Atmosferik Gökyüzü ve Kesintisiz Zaman Çizelgesi (Continuous Timeline)

- **Atanan:** Antigravity (UI, Animasyon, Tasarım & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 006 (Calm Horizon ve Fluid Timeline)

---

## 1. Amaç ve Kullanıcı Geri Bildirimi Doğrultusunda Dönüşüm
Kullanıcı geri bildirimi:
> *"bu kocaman yazı ne alaka hıcbır ıse yaramıyo kocaman en ustte yazı var gun cızelgesı daha boyle tımelıne yani anımasyonlu gecıslı olsun ıstıyorum gercekten o anki hava curumuna göre böyle gunes ruzgar yagmur fln olsun mesela azalıp artarken gecısler olsun ıstıyorum gunun bolumlerı bagımsız degıl bırlesık boyle bol anımasyonlu kalıtelı gorsellıklı sıtenın ana amacı bıraz daha sey olsun yani orada yazan o hava durumunun gercekte nasıl gorunecegını kullanıcıya cok kalıtelı anımasyon ıle belli etmek gosterebılmek kendısı de buna gore karar verır ne yapacagına ne kadar tasarım skıll ı varsa kullanabılırsın anımasyon fln yardır."*

Bu görev ile:
1. Üstteki devasa, kuru ve rahatsız edici metin bloğu tamamen kaldırılacaktır.
2. Yerine sitenin ana odağı olan **Canlı Atmosferik Gökyüzü Tuvali (`AtmosphereCanvas.tsx`)** getirilecektir:
   - Günün saatine ve hava durumuna göre yumuşakça evrilen (lerp interpolation) gökyüzü gradyanı (gece derin lacivert, sabah altın rengi ışık, öğle berrak gök mavisi, fırtınada kurşuni gri).
   - Güneş & Hale (güneşli saatlerde nefes alan parıltı ve ışık huzmeleri).
   - Gece saatlerinde parıldayan yıldızlar ve ay hilali.
   - Dinamik rüzgar akımları ve rüzgar açısına göre savrulan yağmur damlaları + su sıçramaları (splashes).
   - Saati değiştirdikçe tüm atmosferik parametrelerin 60 FPS'te akıcı biçimde (lerp) yumuşak geçiş yapması.
3. Ayrık 5 buton yerine **Kesintisiz Birleşik Zaman Çizelgesi (`ContinuousTimeline.tsx`)**:
   - 24 saatlik kesintisiz zaman bandı, sıcaklık eğrisi grafiği ve hava durumu ikonları.
   - Kullanıcının sürükleyebileceği veya tıklayabileceği yumuşak imleç (scrubber thumb) ve üzerinde anlık saat/sıcaklık/ikon hapı.
4. Alt alanda seçili saate göre anında güncellenen **5 Kompakt Karar Kapsülü (`GlanceableCards.tsx`)**:
   - Dış giyim, üst giyim, ayakkabı, şemsiye ve terleme/rüzgar durumunu şık, tek bakışta anlaşılır rozetlerle sunar.

---

## 2. Zorunlu Skill'ler
- `animate`: Yumuşak geçişler, lerp enterpolasyonu, 60fps render döngüsü.
- `choreograph`: Zaman çizelgesi, gökyüzü geçişi ve kıyafet kartlarının senkronize akışı.
- `better-colors`: Atmosferik gökyüzü paleti (gece, şafak, gündüz, fırtına) ve kontrastlı tipografi.
- `better-interface`: Sürükle-bırak zaman rayı, erişilebilir scrubber, temiz hiyerarşi.
- `better-layout`: Merkezlenmiş, ferah ve mobil/masaüstü taşmasız duyarlı düzen.
- `playwright-cli`: Headless tarayıcıda zaman rayı sürükleme/tıklama, atmosferik değişim ve taşma testleri.

---

## 3. Kabul Kriterleri
1. **Büyük Metin Bloğunun Kaldırılması:** Üstteki devasa hantal başlık metni tamamen kaldırılmış; yerini şık, minimalist bir durum başlığı almalıdır.
2. **Canlı Atmosferik Sahne (`AtmosphereCanvas.tsx`):**
   - 60 FPS `requestAnimationFrame` döngüsü.
   - Güneş, bulut, rüzgar ve yağmur geçişleri anlık sıçramak yerine yumuşak `lerp` ile akmalıdır.
   - Gece saatlerinde yıldızlar/ay, gündüz saatlerinde güneş/gökyüzü ışığı belirmelidir.
3. **Kesintisiz Zaman Çizelgesi (`ContinuousTimeline.tsx`):**
   - 24 saatlik kesintisiz veri çizgisi.
   - Tıklama ve sürükleme ile saat seçilebilmelidir.
   - Seçilen saat değiştikçe hem gökyüzü tuvali hem de alttaki giysi kartları anında reaktif güncellenmelidir.
4. **Duyarlılık ve Performans:**
   - Mobil (390px) ve Masaüstü (1440px) ekranlarda sıfır yatay taşma (`scrollWidth <= innerWidth`).
   - `prefers-reduced-motion` desteği.
