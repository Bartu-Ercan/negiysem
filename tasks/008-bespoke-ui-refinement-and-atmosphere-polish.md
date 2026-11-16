# Görev 008: Özel Zanaat UI İyileştirmeleri, Kesintisiz Scrubber Barı ve Atmosfer Cilası

- **Atanan:** Antigravity (UI, Animasyon, Tasarım & Reviewer)
- **Tarih:** 2026-11-16
- **Önkoşul:** Görev 007 (Canlı Atmosferik Gökyüzü ve Kesintisiz Zaman Çizelgesi)

---

## 1. Kullanıcı Geri Bildirimi ve Hedefler
Kullanıcı geri bildirimi ve ekran görüntüleri:
> *"sankı burda sorun var asagıdan kesılmıs bu ıconlar tam gorunmuyo gibi orayı duzelt. bu asagıdakı kısımda da tasmalar var bırde ai slop duruyo bıraz o renklı kutucuklar falan oranın tasarımını da daha ozgun sade birşeye çevir.cok yazı var orda da gereksız abartı emoji kullanımından kaçın ve ya daha özgun emojı yerıne kendın tasarlayabılırsın ya da skıllerden alabılırsın cızımler vesaıre emoji yerıne. bu arka plandakı anımasyonu cok begendım onu daha da akıcı daha kalıtelı hale getır. kaydırma kısmı ıcın de belkı kaydırma alanı ekleyebılırız heryerden tutup kaydırma degıl de daha net kullanıcının bakınca onun kaydırma ıselvı oldugunu anlaması ıcın ayrı bir bar gibi birşey olabılır tasarımı gene muazzam"*

### Hedefler:
1. **Zaman Çizelgesi Alt Kırpılma Düzeltmesi & Belirgin Scrubber Barı (`ContinuousTimeline.tsx`):**
   - Alt kısımdaki hava durumu glifleri ve saat rakamlarının kesilmesi sorununu çözmek için dikey yükseklik ve iç boşlukları (`pb`, `min-h`) genişletmek.
   - Sadece grafiğe tıklama yerine, kullanıcının gördüğünde doğrudan "bu bir kaydırma barıdır" diyeceği belirgin, dokunsal ve zarif bir **Scrubber Track & Bar** rayı eklemek.
   - Saat simgelerini emojiler yerine net, şık SVG hava gliflerine dönüştürmek.
2. **"AI Slop" Renkli Kutucuklar & Metin Taşmalarının Çözümü (`GlanceableCards.tsx` / `AtelierVerdictBoard.tsx`):**
   - Sistem emojilerini (👕, 🧥, 👟, ☔, 💧) tamamen kaldırıp, yerine Atelier Utilitarian estetiğine uygun, özel çizim minimalist SVG ikonlar entegre etmek.
   - Dar `grid-cols-5` kutulardaki çirkin `...` metin kesilmelerini önlemek; geniş, ferah ve tipografik hiyerarşisi net bir yerleşim kurmak.
   - Tekrarlayan robotik kalıpları ("23:00 için en düşük efektif...") sadeleştirip, insan dilinde, net ve rafine mikro notlara dönüştürmek.
   - Aşırı renkli kutular yerine Atelier Utilitarian tasarım diline sadık, mat antrasit zeminli, ince çizgili ve zarif rozetler sunmak.
3. **Canlı Atmosfer Tuvalinin Derinleştirilmesi (`AtmosphereCanvas.tsx`):**
   - Ufuk çizgisi atmosferik sis gradyanı (horizon haze).
   - Çift katmanlı organik bulut süzülüşü (parallax cloud drift).
   - Güneş ışık huzmeleri ve korona nefes alışının daha pürüzsüz hale getirilmesi.
   - Yağmur su sıçramalarının ve rüzgar akımlarının daha gerçekçi simüle edilmesi.

---

## 2. Zorunlu Skill'ler
- `emil-design-eng`: Dokunsal scrubber tutamacı, mikro basış durumları, görünmez detayların uyumu.
- `better-interface`: Belirgin kaydırma çubuğu, metin kırpılmalarını önleyen düzen, SVG ikonografi.
- `better-colors`: AI slop neon renkler yerine Atelier mat antrasit, nötr zinc ve dengeli vurgu tonları.
- `better-typography`: Kırpılmasız, rahat okunan başlıklar ve tabular rakamlar.
- `animate`: 60fps akıcı enterpolasyon ve parçacık fizik optimizasyonu.
- `playwright-cli`: Headless tarayıcıda alt kırpılma denetimi, scrubber barı etkileşimi ve ekran görüntüleri.

---

## 3. Kabul Kriterleri
1. Zaman çizelgesinin altındaki ikon ve saatlerin hiçbir ekran boyutunda kırpılmaması veya taşmaması.
2. Kullanıcının doğrudan algılayacağı belirgin bir kaydırma barı/rayı (scrubber track with thumb) bulunması.
3. Karar kartlarında hiçbir metnin `...` ile kesilmemesi; sistem emojileri yerine özel minimalist SVG ikonlar kullanılması.
4. Atmosfer tuvalinin 60 FPS'te akıcı ve görsel olarak zenginleşmiş olması.
5. 390px ve 1440px görünümlerinde sıfır yatay taşma (`scrollWidth <= innerWidth`).
